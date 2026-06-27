/**
 * Smart Fallback Response System
 *
 * Generates conversational, context-aware responses when real AI is unavailable.
 * References student input, shows personality, varies responses.
 */

interface SmartResponseContext {
  character: string;
  topicTitle: string;
  studentMessage: string;
  gradeBand: string;
  isLastTurn: boolean;
}

// Keywords to detect what student is talking about
const KEYWORD_RESPONSES: Record<string, string[]> = {
  "like|love|enjoy|fun": [
    "That's awesome! I love that too!",
    "Oh, that sounds so cool!",
    "Yeah, that's the best!",
  ],
  "play|game|sport": [
    "Oh, you play? That's so cool!",
    "I love that! Do you play on a team?",
    "That's amazing! How long have you been doing that?",
  ],
  "think|believe|feel": [
    "That's such a cool perspective!",
    "I never thought about it that way!",
    "Yeah, I totally agree with that!",
  ],
  "try|practice|learn": [
    "That's so awesome that you're practicing!",
    "The fact that you're learning is amazing!",
    "You're doing something really cool!",
  ],
  "friend|family|people": [
    "That's so awesome!",
    "They sound really cool!",
    "You're lucky to have them!",
  ],
  "help|teach|show": [
    "That's so nice of you!",
    "You sound like a great friend!",
    "That's really kind of you!",
  ],
  "want|dream|hope": [
    "That sounds amazing!",
    "I hope you achieve that!",
    "That would be so cool!",
  ],
  "never|first|new": [
    "Wow, that's so exciting!",
    "That must have been interesting!",
    "I bet that was amazing!",
  ],
  "best|favorite|amazing": [
    "Right? It's the best!",
    "I agree, that's incredible!",
    "You have great taste!",
  ],
  "bad|difficult|hard": [
    "That sounds challenging!",
    "I understand, that's tough!",
    "But you're working on it!",
  ],
  "why|how|what": [
    "That's such a great question!",
    "I love that you think about that!",
    "That's exactly what I wondered too!",
  ],
};

// Character-specific personalities
const CHARACTER_PERSONALITIES: Record<string, { interest: string[]; filler: string[] }> = {
  "Mom": {
    interest: ["How wonderful!", "That makes me so proud!", "Tell me everything!"],
    filler: ["Oh sweetie", "I'm so glad", "That's just perfect"],
  },
  "Alex": {
    interest: ["That's so cool!", "No way!", "That's epic!"],
    filler: ["Dude", "For real", "That's awesome"],
  },
  "Sarah": {
    interest: ["Oh my gosh, really?!", "That's incredible!", "I love it!"],
    filler: ["Omg", "No way", "That's so cool"],
  },
  "Teacher": {
    interest: ["What a thoughtful perspective!", "That's an excellent point!", "You're thinking deeply!"],
    filler: ["I see", "That's very interesting", "Great observation"],
  },
  "Coach": {
    interest: ["That takes dedication!", "You're pushing yourself!", "I love the effort!"],
    filler: ["That's the spirit!", "Keep it up", "That's the way!"],
  },
  "Professor": {
    interest: ["Fascinating perspective!", "You've got critical thinking!", "Insightful!"],
    filler: ["Interesting point", "I see your reasoning", "Quite right"],
  },
};

export function generateSmartResponse(context: SmartResponseContext): string {
  const { character, studentMessage, topicTitle, isLastTurn } = context;

  // Get character personality (fallback to Alex if not found)
  const personality = CHARACTER_PERSONALITIES[character] || CHARACTER_PERSONALITIES["Alex"];

  // Find matching keyword pattern
  let baseResponse = personality.interest[Math.floor(Math.random() * personality.interest.length)];

  // Check if student message matches any keyword pattern
  const studentLower = studentMessage.toLowerCase();
  for (const [pattern, responses] of Object.entries(KEYWORD_RESPONSES)) {
    const keywords = pattern.split("|");
    if (keywords.some((kw) => studentLower.includes(kw))) {
      baseResponse = responses[Math.floor(Math.random() * responses.length)];
      break;
    }
  }

  // Extract key words from student message (max 2) to reference back
  const words = studentMessage.split(" ").filter((w) => w.length > 4);
  let reference = "";
  if (words.length > 0) {
    const randomWord = words[Math.floor(Math.random() * Math.min(words.length, 3))];
    reference = `About the ${randomWord}... `;
  }

  // Build final response
  let response = baseResponse;

  // If not last turn, add follow-up question
  if (!isLastTurn) {
    const followUpQuestions = [
      "What's your favorite part about that?",
      "How did you get into that?",
      "Why do you love that so much?",
      "Tell me more about that!",
      "How does that make you feel?",
      "What's the best thing about it?",
      "Have you done that for long?",
      "Would you recommend it to others?",
    ];

    const question = followUpQuestions[Math.floor(Math.random() * followUpQuestions.length)];
    response = `${response} ${question}`;
  } else {
    // Last turn - end warmly
    const endingPhrases = [
      "That was so cool talking with you!",
      "You're awesome!",
      "Thanks for the great conversation!",
      "You're really interesting!",
    ];
    response = `${response} ${endingPhrases[Math.floor(Math.random() * endingPhrases.length)]}`;
  }

  // Keep under 40 words
  const words_array = response.split(" ");
  if (words_array.length > 40) {
    response = words_array.slice(0, 40).join(" ");
  }

  return response.trim();
}

/**
 * Fallback responses by character (when nothing else matches)
 */
export const CHARACTER_FALLBACKS: Record<string, string[]> = {
  "Mom": [
    "Oh honey, that's wonderful! Tell me more!",
    "I'm so proud of you!",
    "You're such a smart kid!",
  ],
  "Alex": ["That's so cool!", "No way, that's epic!", "I totally get it!"],
  "Sarah": [
    "Oh my gosh, really?!",
    "That's so amazing!",
    "I love talking with you!",
  ],
  "Jamie": ["That's awesome!", "That's so cool!", "Yeah, I love that!"],
  "Ravi": [
    "That's incredible!",
    "You're amazing!",
    "That's so awesome!",
  ],
  "Teacher": [
    "That's a great observation!",
    "You're thinking really deeply!",
    "Excellent point!",
  ],
  "Professor": [
    "Fascinating perspective!",
    "You have critical thinking skills!",
    "That's insightful!",
  ],
  "Chef": [
    "That sounds delicious!",
    "You have great taste!",
    "That's wonderful!",
  ],
  "Coach": [
    "That takes real dedication!",
    "Keep pushing yourself!",
    "You've got this!",
  ],
};
