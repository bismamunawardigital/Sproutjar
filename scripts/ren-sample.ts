import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { REN_SAMPLE } from "../src/lib/ren-sample";

const API = "https://api.elevenlabs.io/v1";
const REN_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";
const LAYLA_VOICE_ID = "XB0fDUnXU5powFXDhCwa";
const STABILITY = 0.55;
const SIMILARITY_BOOST = 0.8;
const SILENCE_SECONDS = 0.5;
const SAMPLE_RATE = 44100;
const CACHE_DIR = join(homedir(), ".cache", "sproutjar-ren-sample");
const OUTPUT_AUDIO = join(process.cwd(), "public", "ren", "sample.mp3");
const OUTPUT_TIMINGS = join(process.cwd(), "src", "lib", "ren-sample-timings.json");
const execFileAsync = promisify(execFile);

type Voice = { voice_id: string; name: string; labels?: Record<string, string> | null };
type Timing = { startTime: number; duration: number };

const apiKey = process.env.ELEVENLABS_API_KEY;

if (!apiKey) throw new Error("ELEVENLABS_API_KEY is required.");

async function requestSpeech(text: string, voiceId: string): Promise<Response> {
  return fetch(`${API}/text-to-speech/${encodeURIComponent(voiceId)}`, {
    method: "POST",
    headers: { "xi-api-key": apiKey!, "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      model_id: "eleven_flash_v2",
      voice_settings: { stability: STABILITY, similarity_boost: SIMILARITY_BOOST },
    }),
  });
}

async function chooseFemaleVoice(): Promise<Voice> {
  const response = await fetch(`${API}/voices`, { headers: { "xi-api-key": apiKey! } });
  if (!response.ok) throw new Error(`Could not list ElevenLabs voices: ${response.status} ${await response.text()}`);
  const data = (await response.json()) as { voices?: Voice[] };
  const voice = data.voices?.find(
    (candidate) =>
      candidate.voice_id !== LAYLA_VOICE_ID &&
      !candidate.name.toLowerCase().includes("sarah") &&
      candidate.labels?.gender?.toLowerCase() === "female",
  );
  if (!voice) throw new Error("No non-Sarah female ElevenLabs voice was available for Layla.");
  return voice;
}

async function synthesize(line: (typeof REN_SAMPLE)[number], voice: Voice): Promise<{ audio: Buffer; voice: Voice }> {
  let response = await requestSpeech(line.text, voice.voice_id);
  if (response.ok) return { audio: Buffer.from(await response.arrayBuffer()), voice };

  const error = `${response.status} ${await response.text()}`;
  if (line.speaker !== "layla" || voice.voice_id !== LAYLA_VOICE_ID) {
    throw new Error(`ElevenLabs TTS failed for ${line.speaker}: ${error}`);
  }

  const fallback = await chooseFemaleVoice();
  response = await requestSpeech(line.text, fallback.voice_id);
  if (!response.ok) {
    throw new Error(`ElevenLabs TTS failed for Layla voice ${fallback.name} (${fallback.voice_id}): ${response.status} ${await response.text()}`);
  }
  console.log(`Layla fallback voice: ${fallback.name} (${fallback.voice_id})`);
  return { audio: Buffer.from(await response.arrayBuffer()), voice: fallback };
}

function cachePath(line: (typeof REN_SAMPLE)[number]): string {
  const requestedVoice = line.speaker === "ren" ? REN_VOICE_ID : LAYLA_VOICE_ID;
  const fingerprint = createHash("sha256")
    .update(JSON.stringify([line.speaker, line.text, requestedVoice, STABILITY, SIMILARITY_BOOST]))
    .digest("hex");
  return join(CACHE_DIR, `${fingerprint}.mp3`);
}

async function readCached(path: string): Promise<{ audio: Buffer; voice: Voice } | null> {
  try {
    const [audio, voiceJson] = await Promise.all([readFile(path), readFile(`${path}.json`, "utf8")]);
    const voice = JSON.parse(voiceJson) as Voice;
    return audio.length && voice.voice_id ? { audio, voice } : null;
  } catch {
    return null;
  }
}

async function getDuration(path: string): Promise<number> {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    path,
  ]);
  const duration = Number(stdout.trim());
  if (!Number.isFinite(duration) || duration <= 0) throw new Error(`Could not read clip duration for ${path}.`);
  return duration;
}

async function main() {
  await mkdir(CACHE_DIR, { recursive: true });
  const buildDir = await mkdtemp(join(tmpdir(), "ren-sample-"));
  const timings: Timing[] = [];
  const wavFiles: string[] = [];
  let startTime = 0;
  let laylaVoice: Voice = { voice_id: LAYLA_VOICE_ID, name: LAYLA_VOICE_ID };

  try {
    for (const [index, line] of REN_SAMPLE.entries()) {
      const cachedPath = cachePath(line);
      let cached = await readCached(cachedPath);
      if (!cached) {
        const voice = line.speaker === "ren" ? { voice_id: REN_VOICE_ID, name: REN_VOICE_ID } : laylaVoice;
        const result = await synthesize(line, voice);
        if (line.speaker === "layla") laylaVoice = result.voice;
        await writeFile(cachedPath, result.audio);
        await writeFile(`${cachedPath}.json`, JSON.stringify(result.voice));
        cached = result;
      } else if (line.speaker === "layla") {
        laylaVoice = cached.voice;
      }

      const wavPath = join(buildDir, `line-${index}.wav`);
      await execFileAsync("ffmpeg", [
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-i",
        cachedPath,
        "-ac",
        "1",
        "-ar",
        String(SAMPLE_RATE),
        "-c:a",
        "pcm_s16le",
        wavPath,
      ]);
      const duration = await getDuration(wavPath);
      timings.push({
        startTime: Number(startTime.toFixed(3)),
        duration: Number(duration.toFixed(3)),
      });
      startTime += duration + (index < REN_SAMPLE.length - 1 ? SILENCE_SECONDS : 0);
      wavFiles.push(wavPath);
    }

    const silencePath = join(buildDir, "silence.wav");
    await execFileAsync("ffmpeg", [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-f",
      "lavfi",
      "-i",
      `anullsrc=r=${SAMPLE_RATE}:cl=mono`,
      "-t",
      String(SILENCE_SECONDS),
      "-ac",
      "1",
      "-ar",
      String(SAMPLE_RATE),
      "-c:a",
      "pcm_s16le",
      silencePath,
    ]);

    const concatList = wavFiles.flatMap((wav, index) =>
      index < wavFiles.length - 1 ? [wav, silencePath] : [wav],
    );
    const concatPath = join(buildDir, "concat.txt");
    await writeFile(
      concatPath,
      concatList.map((path) => `file '${path.replace(/'/g, "'\\''")}'`).join("\n") + "\n",
    );

    await mkdir(join(process.cwd(), "public", "ren"), { recursive: true });
    await execFileAsync("ffmpeg", [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      concatPath,
      "-map",
      "0:a:0",
      "-ac",
      "1",
      "-ar",
      String(SAMPLE_RATE),
      "-codec:a",
      "libmp3lame",
      "-b:a",
      "64k",
      OUTPUT_AUDIO,
    ]);
    await writeFile(OUTPUT_TIMINGS, `${JSON.stringify(timings, null, 2)}\n`);
    console.log(`Wrote ${OUTPUT_AUDIO}`);
    console.log(`Wrote ${OUTPUT_TIMINGS}`);
    console.log(`Layla voice used: ${laylaVoice.name} (${laylaVoice.voice_id})`);
  } finally {
    await rm(buildDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
