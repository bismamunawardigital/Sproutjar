import { NextResponse } from "next/server";
import { currentCaller } from "@/lib/caller";

export const dynamic = "force-dynamic";

// Vercel functions allow 4.5 MB request bodies; stay under it so the error is ours, not an HTML page.
const MAX_BYTES = 4 * 1024 * 1024;

/**
 * pdf.js creates a DOMMatrix when its module loads. On a server it borrows one
 * from @napi-rs/canvas, which Vercel's bundler does not ship because pdf.js
 * requires it dynamically. Text extraction never draws anything, so an inert
 * matrix is enough to let the module load.
 */
class InertMatrix {
  a = 1;
  b = 0;
  c = 0;
  d = 1;
  e = 0;
  f = 0;
  invertSelf() {
    return this;
  }
  multiplySelf() {
    return this;
  }
  preMultiplySelf() {
    return this;
  }
  translate() {
    return this;
  }
  scale() {
    return this;
  }
}

async function loadParser() {
  const g = globalThis as { DOMMatrix?: unknown };
  if (!g.DOMMatrix) g.DOMMatrix = InertMatrix;
  const { PDFParse } = await import("pdf-parse");
  return PDFParse;
}

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
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "That PDF is over 4 MB. Try the statement for one month." }, { status: 413 });

  let parser: InstanceType<Awaited<ReturnType<typeof loadParser>>>;
  try {
    const PDFParse = await loadParser();
    parser = new PDFParse({ data: new Uint8Array(await file.arrayBuffer()) });
  } catch (error) {
    console.error("pdf-parse failed to load", error);
    return NextResponse.json({ error: "The PDF reader is not available right now. Paste the statement text instead." }, { status: 500 });
  }
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
