"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { Loader2, Mic, MicOff, PhoneOff } from "lucide-react";

type SessionConfig =
  | {
      configured: true;
      conversationToken: string;
      agentId: string;
      dynamicVariables: Record<string, string>;
    }
  | { configured: false; message: string; dynamicVariables: Record<string, string> };

type Line = { role: "ren" | "you"; text: string };

function RenSessionInner({ userName }: { userName: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "connecting" | "live" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const conversation = useConversation({
    onConnect: () => setStatus("live"),
    onDisconnect: () => {
      setStatus("idle");
      // Ren may have logged a commitment or a jar deposit mid-call.
      router.refresh();
    },
    onError: (message) => {
      setError(typeof message === "string" ? message : "Something went wrong on the call.");
      setStatus("error");
    },
    onMessage: ({ message, source }) => {
      setLines((prev) => [...prev, { role: source === "user" ? "you" : "ren", text: message }]);
    },
    // Ren calls this after writing a commitment or a deposit so the dashboard updates live.
    clientTools: {
      refresh_dashboard: () => {
        router.refresh();
        return "Dashboard refreshed.";
      },
    },
  });

  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
  }, [lines]);

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
      setLines([]);
      conversation.startSession({
        conversationToken: config.conversationToken,
        connectionType: "webrtc",
        dynamicVariables: config.dynamicVariables,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not start the session.");
      setStatus("error");
    }
  }, [conversation]);

  const stop = useCallback(() => {
    conversation.endSession();
    setStatus("idle");
  }, [conversation]);

  const speaking = conversation.isSpeaking;

  return (
    <section className="overflow-hidden rounded-3xl border border-moss/25 bg-gradient-to-br from-moss/10 via-cream to-cream">
      <div className="flex flex-col gap-8 p-8 lg:flex-row lg:items-center">
        <div className="flex shrink-0 items-center justify-center lg:w-56">
          <div className="relative flex h-36 w-36 items-center justify-center">
            {status === "live" ? (
              <span className="pulse-ring absolute inset-0 rounded-full bg-sprout/40" />
            ) : null}
            <span
              className={`absolute inset-3 rounded-full bg-gradient-to-br from-sprout to-moss ${
                status === "live" && speaking ? "breathe" : ""
              }`}
            />
            <span className="relative font-display text-2xl font-semibold text-white">Ren</span>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-moss">
            {status === "live"
              ? speaking
                ? "Ren is speaking"
                : "Ren is listening"
              : status === "connecting"
                ? "Connecting"
                : "Voice session"}
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
            {status === "live" ? `You're with Ren, ${userName}.` : `Ready when you are, ${userName}.`}
          </h2>
          <p className="mt-2 max-w-xl leading-relaxed text-ink-soft">
            Ren opens the call already knowing your balances, your surplus and your debt-free date.
            No re-explaining. Speak normally — interrupting is fine.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {status === "live" ? (
              <>
                <button
                  onClick={stop}
                  className="inline-flex items-center gap-2 rounded-full bg-clay px-6 py-3 font-medium text-white transition hover:bg-bark"
                >
                  <PhoneOff size={18} /> End session
                </button>
                <button
                  onClick={() => conversation.setMuted(!conversation.isMuted)}
                  className="inline-flex items-center gap-2 rounded-full border border-bark/15 px-5 py-3 font-medium transition hover:border-bark/40"
                >
                  {conversation.isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                  {conversation.isMuted ? "Unmute" : "Mute"}
                </button>
              </>
            ) : (
              <button
                onClick={start}
                disabled={status === "connecting"}
                className="inline-flex items-center gap-2 rounded-full bg-moss px-6 py-3 font-medium text-white transition hover:bg-bark disabled:opacity-60"
              >
                {status === "connecting" ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Mic size={18} />
                )}
                {status === "connecting" ? "Connecting…" : "Start voice session"}
              </button>
            )}
            {error ? <p className="text-sm text-clay">{error}</p> : null}
          </div>
        </div>
      </div>

      {lines.length > 0 ? (
        <div
          ref={transcriptRef}
          className="max-h-64 space-y-3 overflow-y-auto border-t border-moss/15 bg-white/50 px-8 py-6"
        >
          {lines.map((line, index) => (
            <p key={index} className="text-sm leading-relaxed">
              <span
                className={`mr-2 font-medium ${line.role === "ren" ? "text-moss" : "text-clay"}`}
              >
                {line.role === "ren" ? "Ren" : "You"}
              </span>
              <span className="text-bark">{line.text}</span>
            </p>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function RenSession({ userName }: { userName: string }) {
  return (
    <ConversationProvider>
      <RenSessionInner userName={userName} />
    </ConversationProvider>
  );
}
