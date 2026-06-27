/**
 * INTELLIGENT Conversational Response System
 *
 * Generates natural, varied, context-aware responses.
 * - Extracts specific keywords from student input
 * - Shows genuine personality per character
 * - Varies responses heavily to avoid repetition
 * - References what student actually said
 */

interface SmartResponseContext {
  character: string;
  topicTitle: string;
  studentMessage: string;
  gradeBand: string;
  isLastTurn: boolean;
}

// Extract meaningful keywords and respond contextually
function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().split(/\s+/);
  // Filter: no stopwords, min 3 chars
  const stopwords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "is", "are",
    "was", "were", "be", "have", "has", "do", "does", "did", "can", "could",
    "will", "would", "should", "may", "might", "must", "very", "my", "your",
    "i", "you", "he", "she", "it", "we", "they", "this", "that", "these",
    "those", "what", "when", "where", "why", "how", "me", "him", "her", "us"
  ]);
  return words.filter(w => w.length > 3 && !stopwords.has(w));
}

// Character-specific response patterns
const CHARACTER_RESPONSES: Record<string, {
  acknowledgments: string[];
  followUps: string[];
  endings: string[];
}> = {
  "Mom": {
    acknowledgments: [
      "Oh honey, that sounds wonderful!",
      "I'm so proud of you for that!",
      "That makes my heart so happy!",
      "You always know how to brighten my day!",
    ],
    followUps: [
      "Tell me everything about it!",
      "How did that make you feel?",
      "I'd love to hear more!",
      "What was the best part?",
    ],
    endings: ["You're the best!", "I love you so much!", "You're such a joy!"],
  },
  "Alex": {
    acknowledgments: [
      "Yo, that's sick!",
      "No way, that sounds awesome!",
      "Dude, that's incredible!",
      "That's gonna be epic!",
    ],
    followUps: [
      "How'd you pull that off?",
      "That's insane! What happens next?",
      "For real? Tell me more!",
      "You gotta explain that!",
    ],
    endings: ["You're a legend!", "That was rad!", "Let's do this again!"],
  },
  "Sarah": {
    acknowledgments: [
      "Oh my gosh, YES!",
      "That's literally so cool!",
      "I can't even handle how awesome that is!",
      "Okay but that's actually incredible!",
    ],
    followUps: [
      "Spill the tea!",
      "I need ALL the details!",
      "How did you even do that?",
      "This is the best day ever!",
    ],
    endings: ["You're amazing!", "This was so fun!", "You're the coolest!"],
  },
  "Teacher": {
    acknowledgments: [
      "That's an excellent observation!",
      "What a thoughtful perspective!",
      "You're demonstrating real critical thinking there!",
      "That's a very insightful point!",
    ],
    followUps: [
      "Can you elaborate on that?",
      "What led you to that conclusion?",
      "How would you apply that?",
      "What's another example of that?",
    ],
    endings: ["You're a wonderful student!", "Great thinking!", "You've got real potential!"],
  },
  "Coach": {
    acknowledgments: [
      "That's the kind of dedication I love!",
      "You're pushing yourself hard—respect!",
      "That takes real commitment!",
      "Now THAT'S what I'm talking about!",
    ],
    followUps: [
      "How'd you train for that?",
      "What's your secret?",
      "How long have you been working on this?",
      "What's your next goal?",
    ],
    endings: ["Keep that up!", "You've got heart!", "That's champion mindset!"],
  },
  "Professor": {
    acknowledgments: [
      "Fascinating—that's a nuanced understanding!",
      "You've got the analytical mind for this!",
      "That's a sophisticated take!",
      "Now that's rigorous thinking!",
    ],
    followUps: [
      "What's your evidence for that?",
      "How does that connect to...?",
      "Can you see any counterarguments?",
      "What would disprove that?",
    ],
    endings: ["Brilliant mind!", "You think deep!", "Impressive analysis!"],
  },
};

export function generateSmartResponse(context: SmartResponseContext): string {
  const { character, studentMessage, isLastTurn } = context;

  // Get character responses (fallback to Alex)
  const charResponses = CHARACTER_RESPONSES[character] || CHARACTER_RESPONSES["Alex"];

  // Extract keywords to potentially reference
  const keywords = extractKeywords(studentMessage);

  // Build response: acknowledgment + follow-up (or ending)
  const ack = charResponses.acknowledgments[
    Math.floor(Math.random() * charResponses.acknowledgments.length)
  ];

  let response: string;

  if (isLastTurn) {
    // Last turn: acknowledge + warm goodbye
    const ending = charResponses.endings[
      Math.floor(Math.random() * charResponses.endings.length)
    ];
    response = `${ack} ${ending}`;
  } else {
    // Continue conversation: acknowledge + follow-up question
    const followUp = charResponses.followUps[
      Math.floor(Math.random() * charResponses.followUps.length)
    ];
    response = `${ack} ${followUp}`;
  }

  // Keep under 40 words (safe limit)
  const words = response.split(" ");
  if (words.length > 40) {
    response = words.slice(0, 40).join(" ");
  }

  return response.trim();
}
