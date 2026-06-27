import Anthropic from "@anthropic-ai/sdk";

// Verify API key on startup
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.warn('⚠️ ANTHROPIC_API_KEY not set in environment!');
  console.warn('   AI conversations will use fallback responses');
  console.warn('   Set ANTHROPIC_API_KEY in Railway variables to enable real AI');
}

const client = new Anthropic({
  apiKey: apiKey || "sk-placeholder-no-key-set"
});

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

🎯 CONVERSATIONAL GOALS (VERY IMPORTANT):
- Be GENUINELY interested in what they say. Show it!
- Reference SPECIFIC things they mentioned in their last message
- Build on their ideas, don't just ask random questions
- Show your own opinions, preferences, experiences related to the topic
- Sound like YOU, not a generic chatbot

📚 TOPIC FOCUS - STAY ON TRACK:
- ONLY discuss "${topicTitle}" and directly related ideas
- Every response must relate to the topic or respond to what they said about it
- If they go off-topic, gently redirect: "Yeah, but what about..." then bring it back

💬 TONE & STYLE - SOUND NATURAL:
- You are a FRIEND having a real conversation, not a teacher
- Never use: "Great answer!", "Well done!", "Excellent!", "Good job!" (too teacher-like)
- DO use: Natural reactions like "Wait, really?", "That's so cool!", "I didn't know that!", "Yeah, same!"
- Use contractions: "I'm", "you're", "don't", "that's" (sounds more natural)
- Show genuine emotion: excitement, surprise, interest, curiosity

✍️ FORMAT RULES:
- Keep it SHORT: 2-3 sentences only
- NO asterisks, NO bullet points, NO emojis in speech
${isLastTurn
    ? "- This is your FINAL message. End warmly but naturally — like ending a fun chat with a friend. No question needed."
    : "- End with ONE natural question that shows genuine interest in their thoughts"}
- Use age-appropriate language for ${gradeLabel[gradeBand] ?? "school"}
- Sound like you're speaking out loud (conversational, not formal)
- NEVER exceed 40 words total

🎭 CHARACTER PERSONALITY - STAY TRUE:
${persona.style}

EXAMPLE GOOD RESPONSE: "Oh wow, I never thought about it that way! Do you actually think that could work?"
EXAMPLE BAD RESPONSE: "Great observation! Well done! Could you explain more?"

Remember: You're having a REAL conversation with a friend, not being tested. Be genuine and interested!`;

  const messages: Anthropic.MessageParam[] = history.map((h) => ({
    role: h.role === "ai" ? "assistant" : "user",
    content: h.text,
  }));

  console.log('🔑 ANTHROPIC_API_KEY set:', !!process.env.ANTHROPIC_API_KEY);
  console.log('📝 System prompt length:', systemPrompt.length);
  console.log('💬 Message history length:', messages.length);

  try {
    // Check if API key is available
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured. Set it in Railway variables.');
    }

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 100,
      system: systemPrompt,
      messages,
    });

    const content = response.content[0];
    const result = content.type === "text" ? content.text.trim() : "That's interesting! Tell me more.";
    console.log('✅ Real AI response generated:', result.substring(0, 50) + '...');
    return result;
  } catch (error: any) {
    const errorInfo = {
      message: error?.message ?? 'Unknown error',
      status: error?.status,
      code: error?.error?.error?.code,
      type: error?.error?.error?.type,
      apiKeySet: !!apiKey,
      apiKeyValid: apiKey?.startsWith('sk-'),
    };

    console.error('❌ Anthropic API call failed:', errorInfo);

    // Log specific error types
    if (!apiKey) {
      console.error('   → ANTHROPIC_API_KEY is not set in environment');
    } else if (!apiKey.startsWith('sk-')) {
      console.error('   → API key format invalid (should start with sk-)');
    } else if (error?.status === 401) {
      console.error('   → Authentication failed (invalid API key)');
    } else if (error?.status === 429) {
      console.error('   → Rate limited (too many requests)');
    } else if (error?.status === 500) {
      console.error('   → Anthropic API server error');
    }

    throw error;
  }
}
