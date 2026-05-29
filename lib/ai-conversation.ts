import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CHARACTER_PERSONA: Record<string, { trait: string; style: string }> = {
  Meera:  { trait: "storyteller from Mumbai who loves creative stories and imaginative ideas", style: "warm, expressive, loves asking about feelings and experiences" },
  Arjun:  { trait: "cricket-crazy boy from Delhi who relates everything to sports", style: "energetic, uses sports comparisons, enthusiastic and competitive in a fun way" },
  Priya:  { trait: "science geek from Bangalore who always asks why and how things work", style: "curious, analytical but friendly, loves surprising facts" },
  Rohan:  { trait: "tech-curious boy from Chennai who knows all the latest apps and gadgets", style: "cool and casual, uses modern references, laid-back but engaged" },
};

export type ConversationTurn = {
  role: "ai" | "student";
  text: string;
};

export async function getCharacterResponse({
  character,
  topicTitle,
  gradeBand,
  history,
  isLastTurn,
}: {
  character: string;
  topicTitle: string;
  gradeBand: string;
  history: ConversationTurn[];
  isLastTurn: boolean;
}): Promise<string> {
  const persona = CHARACTER_PERSONA[character] ?? {
    trait: "friendly student who loves learning",
    style: "warm and encouraging",
  };

  const gradeLabel: Record<string, string> = {
    BAND_1_2: "Grade 1-2 (age 6-8)",
    BAND_3_5: "Grade 3-5 (age 8-11)",
    BAND_6_8: "Grade 6-8 (age 11-14)",
    BAND_9_10: "Grade 9-10 (age 14-16)",
  };

  const systemPrompt = `You are ${character}, a ${persona.trait}.
You're chatting with a classmate in ${gradeLabel[gradeBand] ?? "school"} about "${topicTitle}".

Your personality: ${persona.style}.

STRICT RULES:
- You are a FRIEND, not a teacher. Never say "Great answer!", "Well done!", "Excellent!" or any teacher phrases.
- React naturally to what your friend just said — reference something specific they mentioned.
- Keep your response SHORT: 2-3 sentences only.
${isLastTurn
    ? "- This is your last message. End the conversation warmly and naturally — like saying bye to a friend after a fun chat. No question needed."
    : "- End with ONE natural question to keep the conversation going."}
- Use simple language appropriate for ${gradeLabel[gradeBand] ?? "school"}.
- Speak naturally — like texting a friend out loud.
- Never use asterisks, bullet points, or any formatting.
- Never use more than 40 words total.`;

  const messages: Anthropic.MessageParam[] = history.map((h) => ({
    role: h.role === "ai" ? "assistant" : "user",
    content: h.text,
  }));

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 100,
    system: systemPrompt,
    messages,
  });

  const content = response.content[0];
  return content.type === "text" ? content.text.trim() : "That's interesting! Tell me more.";
}
