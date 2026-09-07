import { NextResponse } from "next/server";

const defaultDialogue =
  "Hello Shaurya. JARVIS systems are online. Arc reactor synchronization is complete. How may I assist you?";
const defaultFemaleVoiceId = "21m00Tcm4TlvDq8ikWAM";

export async function POST(request: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || defaultFemaleVoiceId;

  if (!apiKey) {
    return NextResponse.json(
      { error: "ElevenLabs credentials are not configured." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const text =
    typeof body.text === "string" && body.text.trim()
      ? body.text.trim().slice(0, 2000)
      : defaultDialogue;

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
      {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          model_id: "eleven_multilingual_v2",
          output_format: "mp3_44100_128",
          text,
          voice_settings: {
            stability: 0.72,
            similarity_boost: 0.88,
            style: 0.16,
            use_speaker_boost: true,
          },
        }),
      },
    );

    if (!response.ok || !response.body) {
      console.error("ElevenLabs voice request failed", response.status);
      return NextResponse.json(
        { error: "ElevenLabs voice generation failed." },
        { status: 502 },
      );
    }

    return new NextResponse(response.body, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("ElevenLabs voice request failed", error);
    return NextResponse.json(
      { error: "ElevenLabs voice generation failed." },
      { status: 502 },
    );
  }
}
