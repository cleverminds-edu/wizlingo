import { synthesizeWithGoogle, isGoogleTTSEnabled } from "@/lib/google-tts";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "student") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text, character } = await request.json() as {
      text?: string;
      character?: string;
    };

    if (!text || !character) {
      return Response.json(
        { error: "text and character are required" },
        { status: 400 }
      );
    }

    console.log('🎵 TTS request:', {
      textLen: text.length,
      character,
      googleTTSEnabled: isGoogleTTSEnabled(),
    });

    // If Google TTS is enabled, use it
    if (isGoogleTTSEnabled()) {
      const audioBuffer = await synthesizeWithGoogle(text, character);
      if (audioBuffer) {
        console.log('✅ Audio generated via Google Cloud TTS');
        return new Response(audioBuffer, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=86400", // Cache for 24h
          },
        });
      }
    }

    // Fallback: Return empty response, client will use Web Speech API
    console.log('⚠️ Google TTS not available, client will use Web Speech API');
    return Response.json({
      success: false,
      message: "Google TTS not available, using browser TTS fallback",
      googleTTSEnabled: isGoogleTTSEnabled(),
    });
  } catch (error) {
    console.error('❌ TTS endpoint error:', error);
    return Response.json(
      { error: "Text-to-speech synthesis failed" },
      { status: 500 }
    );
  }
}
