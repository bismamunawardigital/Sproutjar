"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";

type SessionConfig =
  | { configured: true; conversationToken: string; agentId: string; dynamicVariables: Record<string, string> }
  | { configured: false; message: string; dynamicVariables: Record<string, string> };

const WAVE_BARS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const HARD_STOP_SECONDS = 40;

/**
 * Ren's first hello: one short exchange, out loud, so the person hears who
 * they will be talking to before they see a single number. Ren is told what
 * they answered on the screens before and is asked to keep it to one line and
 * one question. The call ends on its own after Ren's second turn.
 */
function RenHelloInner({ onDone, answers }: { onDone: () => void; answers: Record<string, string> }) {
  const [status, setStatus] = useState<"idle" | "connecting" | "live" | "ended" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [said, setSaid] = useState<string>("");
  const renTurns = useRef(0);
  const closing = useRef(false);

  const conversation = useConversation({
    onConnect: () => {
      setStatus("live");
      conversation.sendContextualUpdate(
        `This is a first hello, not a session. ${answers.first_name || "They"} just signed up and answered four screens: why they opened Sproutjar: "${answers.why}". What usually happens with money: "${answers.pattern}". What they want to stop carrying: "${answers.carrying}". What would help most: "${answers.help}". Do not call any tools. Do not ask about numbers or cards. After they answer your opening question, say one warm line that shows you heard them and shows you read what they wrote, then say you will talk properly whenever they are ready, and say goodbye. Two short turns in total, under twenty seconds of talking.`,
      );
    },
    onDisconnect: () => setStatus("ended"),
    onError: (message) => {
      setError(typeof message === "string" ? message : "The hello did not connect.");
      setStatus("error");
    },
    onMessage: ({ message, source }) => {
      if (source !== "user") setSaid(message);
    },
    onModeChange: ({ mode }) => {
      // Each time Ren stops speaking is one finished turn. The second one is the goodbye.
      if (mode === "listening") {
        renTurns.current += 1;
        if (renTurns.current >= 2 && !closing.current) {
          closing.current = true;
          setTimeout(() => void conversation.endSession(), 600);
        }
      }
    },
  });

  const start = useCallback(async () => {
    setError(null);
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
      await conversation.startSession({
        conversationToken: config.conversationToken,
        connectionType: "webrtc",
        dynamicVariables: {
          ...config.dynamicVariables,
          agenda_title: "First hello",
          agenda_reason: "They just signed up. Say hello, show you read their answers, and let them go.",
          agenda_technique: "Hello only",
          planned_minutes: "1",
          contract_choice: "space",
          quiet_mode: "false",
        },
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not start the hello.");
      setStatus("error");
    }
  }, [conversation]);

  useEffect(() => {
    if (status !== "live") return;
    const stop = setTimeout(() => void conversation.endSession(), HARD_STOP_SECONDS * 1000);
    return () => clearTimeout(stop);
  }, [status, conversation]);

  const speaking = conversation.isSpeaking;

  if (status === "ended") {
    return (
      <div className="space-y-4 text-center">
        <p className="text-[21px] font-bold leading-snug text-ink-900">That was Ren.</p>
        {said ? <p className="text-[15px] leading-relaxed text-ink-500">&ldquo;{said}&rdquo;</p> : null}
        <button onClick={onDone} className="w-full rounded-full bg-ink-800 px-5 py-3.5 text-[16px] font-bold text-cream transition hover:bg-ink-700">
          See my plant
        </button>
      </div>
    );
  }

  if (status === "live" || status === "connecting") {
    return (
      <div className="flex flex-col items-center gap-6 py-6">
        <div className="flex h-16 items-end gap-1" aria-hidden>
          {WAVE_BARS.map((bar) => (
            <span
              key={bar}
              className={`w-1.5 rounded-full bg-stem transition-all ${speaking ? "animate-pulse" : ""}`}
              style={{ height: speaking ? `${20 + ((bar * 37) % 44)}px` : "8px", animationDelay: `${bar * 80}ms` }}
            />
          ))}
        </div>
        <p className="text-[15px] text-ink-500">{status === "connecting" ? "Connecting" : speaking ? "Ren is talking" : "Your turn, just answer"}</p>
        {said ? <p className="max-w-xs text-center text-[14px] leading-relaxed text-ink-400">{said}</p> : null}
        <button onClick={() => void conversation.endSession()} className="text-[13px] font-bold text-ink-300 underline underline-offset-2">
          End it here
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? <p className="rounded-sm border border-root/30 bg-root/5 px-3 py-2 text-[13px] text-root">{error}</p> : null}
      <button onClick={start} className="w-full rounded-full bg-stem-600 px-5 py-3.5 text-[16px] font-bold text-white transition hover:bg-stem-700">
        Say hello to Ren
      </button>
      <button onClick={onDone} className="w-full text-[13px] font-bold text-ink-300 underline underline-offset-2">
        Not now, take me in
      </button>
    </div>
  );
}

export function RenHello(props: { onDone: () => void; answers: Record<string, string> }) {
  return (
    <ConversationProvider>
      <RenHelloInner {...props} />
    </ConversationProvider>
  );
}
