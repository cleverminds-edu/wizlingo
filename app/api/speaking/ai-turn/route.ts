import { getSession } from "@/lib/auth";
import { getCharacterResponse, ConversationTurn } from "@/lib/ai-conversation";
import { generateSmartResponse } from "@/lib/smart-responses";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "student") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { character, topicTitle, gradeBand, history, isLastTurn } = await request.json() as {
      character: string;
      topicTitle: string;
      gradeBand: string;
      history: ConversationTurn[];
      isLastTurn: boolean;
    };

    if (!character || !topicTitle || !gradeBand || !Array.isArray(history)) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Sanitise: cap history at last 10 turns and truncate student text to 300 chars
    const safeHistory: ConversationTurn[] = history.slice(-10).map((h) => ({
      role: h.role,
      text: String(h.text).slice(0, 300),
    }));

    console.log('🤖 AI turn request:', { character, topicTitle, gradeBand, historyLen: safeHistory.length, isLastTurn });

    let text: string;
    let source = "smart-response";

    // Try Anthropic API first (if configured)
    try {
      text = await getCharacterResponse({
        character,
        topicTitle,
        gradeBand,
        history: safeHistory,
        isLastTurn: !!isLastTurn,
      });
      source = "anthropic-api";
      console.log('✅ AI response from Anthropic:', { responseLen: text.length });
    } catch (apiError: any) {
      console.warn('⚠️ Anthropic API unavailable, using smart response:', apiError?.message);

      // Get the last student message for context
      const lastStudentMsg = safeHistory.reverse().find(h => h.role === "student")?.text || "";

      text = generateSmartResponse({
        character,
        topicTitle,
        studentMessage: lastStudentMsg,
        gradeBand,
        isLastTurn: !!isLastTurn,
      });
      console.log('✅ AI response from smart-response system:', { responseLen: text.length });
    }

    return Response.json({ text, source });
  } catch (error: any) {
    console.error('❌ /api/speaking/ai-turn error:', error?.message ?? error);
    // Should not reach here, but safety fallback
    return Response.json({
      text: "That's interesting! Tell me more about that.",
      error: error?.message ?? "API error - using fallback",
      source: "fallback"
    });
  }
}
