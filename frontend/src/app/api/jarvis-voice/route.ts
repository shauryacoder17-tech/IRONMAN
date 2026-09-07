import {
  GoogleGenAI,
  LiveServerMessage,
  MediaResolution,
  Modality,
} from "@google/genai";
import { NextResponse } from "next/server";

const MODEL = "models/gemini-3.5-live-translate-preview";
const DIALOGUE =
  "Hello Shaurya. JARVIS systems are online. Arc reactor synchronization is complete. All core systems are ready. How may I assist you?";

function pcmToWav(chunks: Buffer[], sampleRate = 24000) {
  const pcm = Buffer.concat(chunks);
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * 2;

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);

  return Buffer.concat([header, pcm]);
}

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured." },
      { status: 503 },
    );
  }

  const audioChunks: Buffer[] = [];
  let settled = false;
  let resolveTurn: () => void = () => undefined;
  let rejectTurn: (error: Error) => void = () => undefined;

  const turnComplete = new Promise<void>((resolve, reject) => {
    resolveTurn = resolve;
    rejectTurn = reject;
  });

  const finish = () => {
    if (!settled) {
      settled = true;
      resolveTurn();
    }
  };

  try {
    const ai = new GoogleGenAI({ apiKey });
    const session = await ai.live.connect({
      model: MODEL,
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          const parts = message.serverContent?.modelTurn?.parts ?? [];

          for (const part of parts) {
            const encodedAudio = part.inlineData?.data;
            if (encodedAudio) {
              audioChunks.push(Buffer.from(encodedAudio, "base64"));
            }
          }

          if (message.serverContent?.turnComplete) {
            finish();
          }
        },
        onerror: (event: ErrorEvent) => {
          if (!settled) {
            settled = true;
            rejectTurn(
              new Error(event.message || "Gemini Live connection failed."),
            );
          }
        },
        onclose: () => finish(),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Aoede",
            },
          },
        },
        translationConfig: {
          targetLanguageCode: "en",
        },
      },
    });

    session.sendClientContent({
      turns: [{ role: "user", parts: [{ text: DIALOGUE }] }],
      turnComplete: true,
    });

    await Promise.race([
      turnComplete,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini Live timed out.")), 15000),
      ),
    ]);

    session.close();

    if (audioChunks.length === 0) {
      return NextResponse.json(
        { error: "Gemini returned no audio." },
        { status: 502 },
      );
    }

    return new NextResponse(pcmToWav(audioChunks), {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "audio/wav",
      },
    });
  } catch (error) {
    console.error("Gemini Live voice failed", error);
    return NextResponse.json(
      { error: "Gemini Live voice generation failed." },
      { status: 502 },
    );
  }
}
