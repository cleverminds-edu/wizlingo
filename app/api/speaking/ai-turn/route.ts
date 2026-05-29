import { getSession } from "@/lib/auth";
import { getCharacterResponse, ConversationTurn } from "@/lib/ai-conversation";

export async function POST(request: Request) {
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

  const text = await getCharacterResponse({
    character,
    topicTitle,
    gradeBand,
    history: safeHistory,
    isLastTurn: !!isLastTurn,
  });

  return Response.json({ text });
}
