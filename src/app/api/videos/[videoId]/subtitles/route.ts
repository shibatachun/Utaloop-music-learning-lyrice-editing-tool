import { NextResponse } from "next/server";
import { fetchTranscript } from "youtube-transcript";
import { transcriptToLyrics } from "@/lib/subtitles";
import { listYouTubeCaptionLanguages } from "@/lib/youtube-captions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await params;
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") ?? undefined;
  const list = searchParams.get("list");

  if (list === "1") {
    try {
      const languages = await listYouTubeCaptionLanguages(videoId);
      return NextResponse.json({ languages });
    } catch (error) {
      return NextResponse.json(
        {
          languages: [],
          message:
            error instanceof Error
              ? error.message
              : "Unable to list YouTube caption languages."
        },
        { status: 200 }
      );
    }
  }

  try {
    let transcript;
    try {
      transcript = await fetchTranscript(videoId, lang ? { lang } : undefined);
    } catch (languageError) {
      if (!lang) {
        throw languageError;
      }

      transcript = await fetchTranscript(videoId);
    }

    const lyrics = transcriptToLyrics(transcript);

    if (lyrics.lines.length === 0) {
      return NextResponse.json(
        { message: "No transcript lines were returned for this video." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...lyrics,
      source: "youtube"
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to fetch YouTube subtitles for this video."
      },
      { status: 404 }
    );
  }
}
