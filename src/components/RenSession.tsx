"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import type { Agenda } from "@/lib/agendas";
import { appendRenLine, type RenLine, type RenTalkRecord } from "@/lib/ren";
import { RenCall, type GlanceCard } from "@/components/RenCall";
import { RenRoom } from "@/components/RenRoom";
import { RenSample } from "@/components/RenSample";

type SessionConfig = {
  configured: boolean;
  conversationToken?: string;
  dynamicVariables?: Record<string, string>;
  message?: string;
};

function asGlanceCard(input: unknown): GlanceCard | null {
  if (typeof input !== "object" || input === null) return null;
  const raw = input as Record<string, unknown>;
  const text = (key: string) => typeof raw[key] === "string" ? raw[key] as string : undefined;
  const title = text("title"), left_label = text("left_label"), left_value = text("left_value");
  const right_label = text("right_label"), right_value = text("right_value");
  return title && left_label && left_value && right_label && right_value
    ? { title, left_label, left_value, right_label, right_value, left_note: text("left_note"), right_note: text("right_note"), takeaway: text("takeaway") } : null;
}

type Props = {
  userName: string;
  agenda?: Agenda | null;
  agendas?: Agenda[];
  onAgenda?: (agenda: Agenda) => void;
  minutes?: number;
  onEnded?: (saidByYou: string[], talk: RenTalkRecord | null) => void;
  guest?: boolean;
};

function RenSessionInner({ userName, agenda = null, agendas = [], onAgenda = () => {}, minutes = 20, onEnded }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "connecting" | "live" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<RenLine[]>([]);
  const [intent, setIntent] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [words, setWords] = useState(false);
  const [glance, setGlance] = useState<GlanceCard | null>(null);
  const [quiet, setQuiet] = useState(false);
  const [typed, setTyped] = useState(false);
  const [draft, setDraft] = useState("");
  const [level, setLevel] = useState(0);
  const [hadCall, setHadCall] = useState(false);
  const ended = useRef(true);
  const connected = useRef(false);
  const attempt = useRef(0);
  const pending = useRef<AbortController | null>(null);
  const spoken = useRef<RenLine[]>([]);
  const talk = useRef<Omit<RenTalkRecord, "durationMs"> | null>(null);
  const connectedAt = useRef(0);

  const finish = useCallback(() => {
    if (ended.current) return;
    ended.current = true;
    setStatus("idle");
    if (connected.current) onEnded?.(spoken.current.filter((line) => line.role === "you").map((line) => line.text), talk.current ? { ...talk.current, durationMs: Math.max(0, performance.now() - connectedAt.current) } : null);
    router.refresh();
  }, [onEnded, router]);

  const conversation = useConversation({
    onConnect: ({ conversationId }) => {
      if (ended.current) return;
      connectedAt.current = performance.now();
      talk.current = { conversationId, agenda: agenda?.title ?? "Open conversation", agendaReason: agenda?.reason ?? "", technique: agenda?.technique ?? "Open", plannedMinutes: minutes, contractChoice: intent ?? "unstated", mode: typed ? "text" : "voice" };
      connected.current = true;
      setHadCall(true);
      setStatus("live");
    },
    onStatusChange: ({ status: next }) => {
      if (next === "connected" && !ended.current) {
        connected.current = true;
        setHadCall(true);
        setStatus("live");
      }
    },
    onDisconnect: (details) => {
      if (ended.current) return;
      if (details.reason === "agent") { finish(); return; }
      ended.current = true;
      setStatus("error");
      setError("The call ended. You can call back, try writing, or keep something from your own words below.");
      router.refresh();
    },
    onError: () => {
      ended.current = true;
      void conversation.endSession();
      setError("Ren couldn't connect. Check your connection and try again, or try writing instead.");
      setStatus("error");
    },
    onMessage: ({ message, source }) => {
      if (ended.current) return;
      connected.current = true;
      setHadCall(true);
      setStatus("live");
      spoken.current = appendRenLine(spoken.current, { role: source === "user" ? "you" : "ren", text: message });
      setLines(spoken.current);
    },
    clientTools: {
      refresh_dashboard: () => { router.refresh(); return "Dashboard refreshed."; },
      show_glance_card: (parameters: unknown) => {
        const card = asGlanceCard(parameters);
        if (!card) return "Card not shown: missing fields.";
        setGlance(card);
        return "Card is on their screen.";
      },
    },
  });

  const live = status === "live";
  useEffect(() => {
    if (!live) return;
    connected.current = true;
    const timer = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [live]);
  useEffect(() => {
    if (!live || typed) return;
    conversation.setVolume({ volume: quiet ? 0 : 1 });
    const timer = setInterval(() => setLevel(conversation.isSpeaking ? conversation.getOutputVolume() : conversation.getInputVolume()), 100);
    return () => clearInterval(timer);
  }, [conversation, live, quiet, typed]);
  useEffect(() => {
    if (status !== "connecting") return;
    const timer = setTimeout(() => {
      attempt.current++;
      ended.current = true;
      pending.current?.abort();
      void conversation.endSession();
      setStatus("error");
      setError("Connecting is taking too long. Try again, or choose Type instead.");
    }, 20000);
    return () => clearTimeout(timer);
  }, [conversation, status]);
  useEffect(() => () => { pending.current?.abort(); attempt.current++; }, []);

  const toggleQuiet = () => {
    const next = !quiet;
    setQuiet(next);
    if (!live) setTyped(false);
    if (live) conversation.sendContextualUpdate(next
      ? "Quiet mode is on: they read your words on screen and answer in a whisper. Keep each turn short and don't ask them to read numbers aloud."
      : "Quiet mode is off. They can hear you again.");
  };

  const start = async () => {
    const id = ++attempt.current;
    ended.current = false;
    connected.current = false;
    setHadCall(false);
    setError(null);
    setElapsed(0);
    setStatus("connecting");
    spoken.current = [];
    talk.current = null;
    setLines([]);
    setGlance(null);
    pending.current = new AbortController();
    try {
      if (!typed) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      }
      if (id !== attempt.current) return;
      const response = await fetch("/api/agent/session", { cache: "no-store", signal: pending.current.signal });
      if (!response.ok) throw new Error("Ren can't take calls right now. Try again later, or try writing instead.");
      const config = await response.json() as SessionConfig;
      if (!config.configured || !config.conversationToken) throw new Error("Ren can't take calls right now. Try again later, or try writing instead.");
      if (id !== attempt.current) return;
      await conversation.startSession({
        conversationToken: config.conversationToken,
        connectionType: "webrtc",
        textOnly: typed,
        dynamicVariables: {
          ...config.dynamicVariables,
          agenda_title: agenda?.title ?? "Open",
          agenda_reason: agenda?.reason ?? "They haven't picked an agenda. Ask where to start.",
          agenda_technique: agenda?.technique ?? "Open",
          planned_minutes: String(minutes),
          contract_choice: intent ?? "unstated",
          quiet_mode: quiet || typed ? "true" : "false",
        },
      });
    } catch (caught) {
      if (id !== attempt.current) return;
      ended.current = true;
      setError(caught instanceof DOMException && ["NotAllowedError", "NotFoundError"].includes(caught.name)
        ? "Your microphone is off or unavailable. Allow it in your browser's microphone permissions, or choose Type instead."
        : caught instanceof Error ? caught.message : "Ren couldn't connect. Try again.");
      setStatus("error");
    }
  };

  const stop = () => {
    attempt.current++;
    pending.current?.abort();
    finish();
    void conversation.endSession();
  };
  const send = () => {
    const text = draft.trim();
    if (!text || !live) return;
    try {
      conversation.sendUserMessage(text);
      spoken.current = appendRenLine(spoken.current, { role: "you", text });
      setLines(spoken.current);
      setDraft("");
    } catch {
      ended.current = true;
      void conversation.endSession();
      setError("Your message didn't send. Try again.");
      setStatus("error");
    }
  };

  if (live || status === "connecting") return <RenCall agenda={agenda} minutes={minutes} elapsed={elapsed} connecting={!live} speaking={conversation.isSpeaking} muted={conversation.isMuted} quiet={quiet} typed={typed} words={words} lines={lines} level={level} glance={glance} draft={draft} onDraft={setDraft} onSend={send} onStop={stop} onMute={() => conversation.setMuted(!conversation.isMuted)} onQuiet={toggleQuiet} onWords={() => setWords((value) => !value)} onHideGlance={() => setGlance(null)} />;
  return <div className="space-y-4"><RenRoom userName={userName} agenda={agenda} agendas={agendas} onAgenda={onAgenda} intent={intent} onIntent={(value) => setIntent((current) => current === value ? null : value)} quiet={quiet} onQuiet={toggleQuiet} typed={typed} onTyped={() => { setTyped((value) => !value); setQuiet(false); }} onStart={() => void start()} error={error} />{hadCall && status === "error" ? <button onClick={() => { ended.current = false; finish(); void conversation.endSession(); }} className="min-h-12 w-full rounded-full border border-rule text-[14px] font-bold text-ink-600">End it here</button> : null}</div>;
}

export function RenSession(props: Props) {
  if (props.guest) return <div className="space-y-4"><RenRoom userName={props.userName} agenda={props.agenda ?? null} agendas={props.agendas ?? []} onAgenda={props.onAgenda ?? (() => {})} intent={null} onIntent={() => {}} quiet={false} onQuiet={() => {}} typed={false} onTyped={() => {}} onStart={() => {}} guest /><div className="rounded-card bg-ink-800 p-5 text-cream"><p className="mb-3 text-[12px] text-cream/65">Ren is an AI voice coach. This is a recorded sample, not a live call.</p><RenSample /></div></div>;
  return <ConversationProvider><RenSessionInner {...props} /></ConversationProvider>;
}
