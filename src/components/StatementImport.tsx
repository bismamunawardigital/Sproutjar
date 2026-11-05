"use client";

import { useState } from "react";
import { readStatement, type StatementReading } from "@/lib/statement";
import { formatMoney } from "@/lib/money";

export type { StatementReading };

/**
 * The honest version of "connect your bank": live linking through CBUAE open
 * finance needs a licensed provider we do not have yet, so the statement itself
 * is the source. Paste its text or drop the file; every figure it finds is shown
 * back before anything is saved.
 */
export function StatementImport({
  currency,
  onRead,
  onClose,
  title = "Read a statement",
}: {
  currency: string;
  onRead: (reading: StatementReading) => void;
  onClose: () => void;
  title?: string;
}) {
  const [text, setText] = useState("");
  const [reading, setReading] = useState<StatementReading | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [reading_, setReadingFile] = useState(false);

  function read(source: string) {
    const result = readStatement(source);
    setReading(result);
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setFileError(null);
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      setReadingFile(true);
      try {
        const body = new FormData();
        body.append("file", file);
        const response = await fetch("/api/statement/pdf", { method: "POST", body });
        const data = (await response.json()) as { text?: string; scanned?: boolean; error?: string };
        if (!response.ok || data.error) {
          setFileError(data.error ?? "Could not read that PDF.");
          return;
        }
        if (data.scanned || !data.text) {
          setFileError("That PDF is a scan with no text in it. Open it in your bank app, select all, copy and paste the text here instead.");
          return;
        }
        setText(data.text);
        read(data.text);
      } finally {
        setReadingFile(false);
      }
      return;
    }
    const content = await file.text();
    setText(content);
    read(content);
  }

  const lines: { label: string; value: string | null }[] = reading
    ? [
        { label: "Bank", value: reading.issuer },
        { label: "Balance", value: reading.balance !== null ? formatMoney(reading.balance, currency) : null },
        { label: "Minimum", value: reading.minimumPayment !== null ? formatMoney(reading.minimumPayment, currency) : null },
        { label: "Interest charged", value: reading.interestCharged !== null ? formatMoney(reading.interestCharged, currency) : null },
        { label: "New on the card", value: reading.newBorrowing !== null ? formatMoney(reading.newBorrowing, currency) : null },
        { label: "Payments received", value: reading.paymentsReceived !== null ? formatMoney(reading.paymentsReceived, currency) : null },
        { label: "Monthly rate", value: reading.monthlyRatePct !== null ? `${reading.monthlyRatePct.toFixed(2)}%` : null },
        { label: "Due on the", value: reading.dueDay !== null ? String(reading.dueDay) : null },
        { label: "Statement on the", value: reading.statementDay !== null ? String(reading.statementDay) : null },
      ]
    : [];

  return (
    <div className="mt-4 rounded-sm border border-rule bg-cream p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-bold text-ink-900">{title}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-500">
            Paste the statement text or upload the PDF your bank emails you. Sproutjar reads the
            balance, the minimum, the interest and the dates off it, shows them back, and saves
            nothing until you confirm.
          </p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 text-[13px] font-bold text-ink-300 transition hover:text-ink-500"
        >
          Close
        </button>
      </div>

      <label className="mt-3 block text-[12px] font-bold text-ink-500">
        Statement text
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="Total Amount Due AED 12,400.00  ·  Minimum Amount Due AED 620.00  ·  Finance Charges AED 398.12  ·  Payment Due Date 10 Sep 2026"
          className="mt-1 w-full rounded-sm border border-rule bg-card px-3 py-2 font-mono text-[13px] text-ink-800 outline-none placeholder:text-ink-300 focus:border-stem"
        />
      </label>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={text.trim().length === 0}
          onClick={() => read(text)}
          className="rounded-full bg-ink-800 px-4 py-2 text-[13px] font-bold text-cream transition hover:bg-ink-700 disabled:opacity-60"
        >
          Read it
        </button>
        <label className="cursor-pointer text-[13px] font-bold text-stem-700 underline decoration-stem/40 underline-offset-2 hover:decoration-stem">
          {reading_ ? "Reading the PDF" : "or upload the PDF"}
          <input
            type="file"
            accept=".pdf,.txt,.csv,application/pdf,text/plain,text/csv"
            disabled={reading_}
            className="sr-only"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </label>
      </div>
      {fileError ? <p className="mt-2 text-[13px] text-root">{fileError}</p> : null}

      {reading ? (
        <div className="mt-4 border-t border-rule pt-4">
          {reading.found.length === 0 ? (
            <p className="text-[13px] leading-relaxed text-ink-500">
              Nothing recognisable in that text. Statements usually say &ldquo;Total Amount
              Due&rdquo;, &ldquo;Minimum Amount Due&rdquo;, &ldquo;Finance Charges&rdquo; and
              &ldquo;Payment Due Date&rdquo;; if yours words them differently, type the figures in
              by hand.
            </p>
          ) : (
            <>
              <p className="label">What it found</p>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                {lines.map((line) => (
                  <div key={line.label}>
                    <dt className="text-[12px] text-ink-400">{line.label}</dt>
                    <dd className={`n text-[14px] ${line.value ? "text-ink-900" : "text-ink-300"}`}>
                      {line.value ?? "not found"}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-[12px] leading-relaxed text-ink-400">
                Check these against the page. Anything wrong or missing you can fix on the next step.
              </p>
              <button
                type="button"
                onClick={() => onRead(reading)}
                className="mt-3 rounded-full bg-stem-600 px-4 py-2 text-[13px] font-bold text-white transition hover:bg-stem-700"
              >
                Use these figures
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
