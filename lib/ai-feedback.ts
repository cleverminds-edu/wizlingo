import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type ReadingFeedbackInput = {
  studentName: string;
  grade: number;
  level: number;
  wpm: number;
  targetWpm: number;
  accuracy: number;
  minAccuracy: number;
  missedWords: string[];
  passed: boolean;
  leveledUp: boolean;
};

export type SpeakingFeedbackInput = {
  studentName: string;
  grade: number;
  level: number;
  wpm: number;
  fluencyScore: number;
  fillerCount?: number;
  passed: boolean;
  leveledUp: boolean;
};

export async function getReadingFeedback(input: ReadingFeedbackInput): Promise<string> {
  const firstName = input.studentName.split(" ")[0];
  const missed = input.missedWords.slice(0, 5).join(", ");

  const prompt = `You are WizLingo's friendly reading coach for Grade ${input.grade} students.

Student: ${firstName}
Reading level: ${input.level}/3
WPM: ${input.wpm} (target: ${input.targetWpm})
Accuracy: ${input.accuracy}% (minimum: ${input.minAccuracy}%)
Missed words: ${missed || "none"}
Result: ${input.passed ? "PASSED" : "NOT PASSED"}${input.leveledUp ? " — LEVELLED UP!" : ""}

Give ONE short, warm, specific tip (2-3 sentences max).
- If passed: celebrate and give a tip to improve further
- If not passed: be encouraging and give the most important thing to work on
- Use simple language appropriate for Grade ${input.grade}
- Never use asterisks or bullet points — just plain warm text
- Address the student by first name`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 120,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  return content.type === "text" ? content.text.trim() : "";
}

export async function getSpeakingFeedback(input: SpeakingFeedbackInput): Promise<string> {
  const firstName = input.studentName.split(" ")[0];

  const prompt = `You are WizLingo's friendly speaking coach for Grade ${input.grade} students.

Student: ${firstName}
Speaking level: ${input.level}/3
WPM: ${input.wpm}
Fluency score: ${input.fluencyScore}/100
Filler words used: ${input.fillerCount ?? 0}
Result: ${input.passed ? "PASSED" : "NOT PASSED"}${input.leveledUp ? " — LEVELLED UP!" : ""}

Give ONE short, warm, specific tip (2-3 sentences max).
- If passed: celebrate and suggest how to sound even more confident
- If not passed: be encouraging and focus on the most impactful improvement
- If filler count > 3: mention pausing instead of filler words
- Use simple language appropriate for Grade ${input.grade}
- Never use asterisks or bullet points — just plain warm text
- Address the student by first name`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 120,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  return content.type === "text" ? content.text.trim() : "";
}
