import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { currentCaller } from "@/lib/caller";

export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Pulls the text layer out of a statement PDF so the same reader that handles
 * pasted text can work on it. Nothing is stored: the file is read once and
 * only the words come back. Scanned PDFs have no text layer and are reported as such.
 */
export async function POST(request: Request) {
  await currentCaller();
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Attach a PDF as 'file'." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "That PDF is over 8 MB." }, { status: 413 });

  const parser = new PDFParse({ data: new Uint8Array(await file.arrayBuffer()) });
  try {
    const result = await parser.getText();
    const text = result.text.replace(/[ \t]+\n/g, "\n").trim();
    return NextResponse.json({ text, pages: result.total, scanned: text.length < 40 });
  } catch (error) {
    return NextResponse.json({ error: `Could not open that PDF: ${(error as Error).message}` }, { status: 422 });
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}
