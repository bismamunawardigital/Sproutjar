"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import type { Agenda } from "@/lib/agendas";

type SessionConfig =
  | {
      configured: true;
      conversationToken: string;
      agentId: string;
      dynamicVariables: Record<string, string>;
    }
  | {
      configured: false;
      message: string;
      dynamicVariables: Record<string, string>;
    };

type Line = { role: "ren" | "you"; text: string };

type GlanceCard = {
  title: string;
  left_label: string;
  left_value: string;
  left_note?: string;
  right_label: string;
  right_value: string;
  right_note?: string;
  takeaway?: string;
};

function asGlanceCard(input: unknown): GlanceCard | null {
  if (typeof input !== "object" || input === null) return null;
  const raw = input as Record<string, unknown>;
  const text = (key: string) =>
    typeof raw[key] === "string" ? (raw[key] as string) : undefined;
  const title = text("title");
  const leftLabel = text("left_label");
  const leftValue = text("left_value");
  const rightLabel = text("right_label");
  const rightValue = text("right_value");
  if (!title || !leftLabel || !leftValue || !rightLabel || !rightValue)
    return null;
  return {
    title,
    left_label: leftLabel,
    left_value: leftValue,
    left_note: text("left_note"),
    right_label: rightLabel,
    right_value: rightValue,
    right_note: text("right_note"),
    takeaway: text("takeaway"),
  };
}

const CONTRACTS = [
  { key: "clarity", label: "Clarity" },
  { key: "decision", label: "A decision" },
  { key: "plan", label: "A plan" },
  { key: "space", label: "Space to think" },
] as const;

type Contract = (typeof CONTRACTS)[number]["key"];

const WAVE_BARS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

function RenSessionInner({
  userName,
  agenda,
  minutes,
  onEnded,
}: {
  userName: string;
  agenda: Agenda | null;
  minutes: number;
  onEnded?: (saidByYou: string[]) => void;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<
    "idle" | "connecting" | "live" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [contract, setContract] = useState<Contract | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [glance, setGlance] = useState<GlanceCard | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const saidByYou = useRef<string[]>([]);

  const conversation = useConversation({
    onConnect: () => setStatus("live"),
    onDisconnect: () => {
      setStatus("idle");
      onEnded?.(saidByYou.current);
      // Ren may have logged a commitment or a jar deposit mid-call.
      router.refresh();
    },
    onError: (message) => {
      setError(
        typeof message === "string"
          ? message
          : "Something went wrong on the call.",
      );
      setStatus("error");
    },
    onMessage: ({ message, source }) => {
      if (source === "user") saidByYou.current = [...saidByYou.current, message];
      setLines((prev) => [
        ...prev,
        { role: source === "user" ? "you" : "ren", text: message },
      ]);
    },
    // Ren calls this after writing a commitment or a deposit so the dashboard updates live.
    clientTools: {
      refresh_dashboard: () => {
        router.refresh();
        return "Dashboard refreshed.";
      },
      // Ren pushes a side-by-side card up while it talks through an offer.
      show_glance_card: (parameters: unknown) => {
        const card = asGlanceCard(parameters);
        if (!card) return "Card not shown: missing fields.";
        setGlance(card);
        return "Card is on their screen.";
      },
    },
  });

  useEffect(() => {
    transcriptRef.current?.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [lines]);

  useEffect(() => {
    if (status !== "live") return;
    const timer = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [status]);

  const start = useCallback(async () => {
    setError(null);
    setElapsed(0);
    setStatus("connecting");
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const response = await fetch("/api/agent/session", { cache: "no-store" });
      const config = (await response.json()) as SessionConfig;
      if (!config.configured) {
        setError(config.message);
        setStatus("error");
        return;
      }
      setLines([]);
      setGlance(null);
      saidByYou.current = [];
      conversation.startSession({
        conversationToken: config.conversationToken,
        connectionType: "webrtc",
        dynamicVariables: {
          ...config.dynamicVariables,
          agenda_title: agenda?.title ?? "Open",
          agenda_reason:
            agenda?.reason ??
            "They haven't picked an agenda. Ask where to start.",
          agenda_technique: agenda?.technique ?? "Open",
          planned_minutes: String(minutes),
          contract_choice: contract ?? "unstated",
        },
      });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not start the session.",
      );
      setStatus("error");
    }
  }, [agenda, contract, conversation, minutes]);

  const stop = useCallback(() => {
    conversation.endSession();
    setStatus("idle");
    onEnded?.(saidByYou.current);
  }, [conversation, onEnded]);

  const speaking = conversation.isSpeaking;
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  if (status === "live" || status === "connecting") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-ink-800 text-cream">
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-[13px] font-bold text-cream/60">
            {agenda ? agenda.title : "Open conversation"}
          </span>
          <span className="n rounded-full bg-white/10 px-3 py-1 text-[13px]">
            {mm}:{ss}
          </span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
          <div className="relative flex h-44 w-44 items-center justify-center">
            <span
              className={`ren-orb absolute inset-0 rounded-full ${
                status === "live"
                  ? speaking
                    ? "orb-speaking"
                    : "orb-listening"
                  : ""
              }`}
            />
            <span className="relative text-[20px] font-bold text-white">
              Ren
            </span>
          </div>

          <p className="text-[17px] font-bold">
            {status === "connecting"
              ? "Connecting…"
              : speaking
                ? "Ren is speaking"
                : conversation.isMuted
                  ? "Your mic is off"
                  : "Ren is listening"}
          </p>

          {glance ? (
            <div className="w-full max-w-md rounded-card bg-cream p-4 text-left text-ink-800 shadow-sh-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-ink-400">
                  {glance.title}
                </p>
                <button
                  onClick={() => setGlance(null)}
                  className="text-[11px] font-bold text-ink-300 transition hover:text-ink-800"
                >
                  Hide
                </button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {[
                  {
                    label: glance.left_label,
                    value: glance.left_value,
                    note: glance.left_note,
                  },
                  {
                    label: glance.right_label,
                    value: glance.right_value,
                    note: glance.right_note,
                  },
                ].map((side) => (
                  <div
                    key={side.label}
                    className="rounded-card border border-rule bg-card px-3 py-3"
                  >
                    <p className="text-[11px] font-bold text-ink-400">
                      {side.label}
                    </p>
                    <p className="n mt-1 text-[19px] font-bold text-stem-700">
                      {side.value}
                    </p>
                    {side.note ? (
                      <p className="mt-1 text-[12px] leading-snug text-ink-400">
                        {side.note}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
              {glance.takeaway ? (
                <p className="mt-3 text-[13px] leading-relaxed text-ink-600">
                  {glance.takeaway}
                </p>
              ) : null}
            </div>
          ) : null}

          {showTranscript && lines.length > 0 ? (
            <div
              ref={transcriptRef}
              className="max-h-56 w-full max-w-md space-y-3 overflow-y-auto rounded-card bg-black/20 p-4 text-left"
            >
              {lines.map((line, index) => (
                <p key={index} className="text-[14px] leading-relaxed">
                  <span
                    className={`mr-2 font-bold ${
                      line.role === "ren" ? "text-leaf-300" : "text-cream/60"
                    }`}
                  >
                    {line.role === "ren" ? "Ren" : "You"}
                  </span>
                  <span className="text-cream/90">{line.text}</span>
                </p>
              ))}
            </div>
          ) : null}

          {error ? <p className="text-[13px] text-amber">{error}</p> : null}
        </div>

        <div className="flex items-center justify-center gap-4 pb-12 pt-4">
          <button
            onClick={() => conversation.setMuted(!conversation.isMuted)}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 text-[12px] font-bold text-cream transition hover:border-white/50"
          >
            {conversation.isMuted ? "Unmute" : "Mute"}
          </button>
          <button
            onClick={stop}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-danger text-[13px] font-bold text-white transition hover:opacity-90"
          >
            End
          </button>
          <button
            onClick={() => setShowTranscript((value) => !value)}
            aria-pressed={showTranscript}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 text-[12px] font-bold text-cream transition hover:border-white/50"
          >
            {showTranscript ? "Hide" : "Words"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-card bg-ink-800 text-cream shadow-sh-3">
      <div className="flex flex-col items-center px-6 py-9 text-center sm:py-11">
        <div className="relative flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32">
          <span
            className="ren-orb orb-listening absolute inset-0 rounded-full"
            aria-hidden
          />
          <span className="relative text-[17px] font-bold text-white">Ren</span>
        </div>

        <div className="mt-6 flex h-7 items-end gap-[3px]" aria-hidden>
          {WAVE_BARS.map((bar) => (
            <span
              key={bar}
              className="wave-bar w-[3px] rounded-full bg-leaf-300/70"
              style={{ animationDelay: `${bar * 110}ms` }}
            />
          ))}
        </div>

        <p className="mt-6 text-[11px] font-extrabold uppercase tracking-[0.14em] text-leaf-300">
          {agenda ? `${minutes} min · ${agenda.technique}` : `${minutes} minutes · your call`}
        </p>
        <h2 className="mt-2 max-w-sm text-[26px] font-bold leading-tight sm:text-[30px]">
          {agenda ? agenda.title : `Say it out loud, ${userName}.`}
        </h2>
        <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-cream/70">
          {agenda
            ? agenda.reason
            : "Ren has your three balances, what you paid last month and what you said last time. You don't have to explain yourself twice."}
        </p>

        <p className="mt-7 text-[12px] text-cream/50">
          What would make this twenty minutes worth it?
        </p>
        <div className="mt-2.5 flex flex-wrap justify-center gap-2">
          {CONTRACTS.map((option) => (
            <button
              key={option.key}
              onClick={() => setContract(option.key)}
              aria-pressed={contract === option.key}
              className={`rounded-full px-3.5 py-1.5 text-[12px] font-bold transition ${
                contract === option.key
                  ? "bg-leaf-300 text-ink-900"
                  : "border border-white/20 text-cream/70 hover:border-white/50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="mt-2.5 h-4 text-[12px] text-cream/45">
          {contract
            ? "Ren will open there, and hold to it."
            : "Optional. Ren will ask if you skip it."}
        </p>

        <button
          onClick={start}
          className="mt-4 w-full max-w-xs rounded-full bg-leaf-300 px-8 py-4 text-[17px] font-bold text-ink-900 transition hover:bg-leaf-400"
        >
          {lines.length > 0 ? "Call Ren again" : "Call Ren"}
        </button>
      </div>
      {error ? (
        <p className="px-6 pb-5 text-center text-[13px] text-amber">{error}</p>
      ) : null}

      {lines.length > 0 ? (
        <div className="max-h-64 space-y-3 overflow-y-auto border-t border-white/10 bg-black/15 px-5 py-5 sm:px-7">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-leaf-300">
            What you talked about
          </p>
          {lines.map((line, index) => (
            <p key={index} className="text-[14px] leading-relaxed">
              <span
                className={`mr-2 font-bold ${line.role === "ren" ? "text-leaf-300" : "text-cream/60"}`}
              >
                {line.role === "ren" ? "Ren" : "You"}
              </span>
              <span className="text-cream/90">{line.text}</span>
            </p>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function RenSession({
  userName,
  agenda = null,
  minutes = 20,
  onEnded,
}: {
  userName: string;
  agenda?: Agenda | null;
  minutes?: number;
  onEnded?: (saidByYou: string[]) => void;
}) {
  return (
    <ConversationProvider>
      <RenSessionInner
        userName={userName}
        agenda={agenda}
        minutes={minutes}
        onEnded={onEnded}
      />
    </ConversationProvider>
  );
}
