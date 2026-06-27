/**
 * INTELLIGENT Conversational Response System
 *
 * Generates highly varied, context-aware, personality-driven responses.
 * - Acknowledges what student said
 * - Shows genuine personality per character
 * - Asks follow-up questions based on their input
 * - Varies heavily across many response templates
 */

interface SmartResponseContext {
  character: string;
  topicTitle: string;
  studentMessage: string;
  gradeBand: string;
  isLastTurn: boolean;
}

// Extract meaningful keywords from student message
function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().split(/\s+/);
  const stopwords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "is", "are",
    "was", "were", "be", "have", "has", "do", "does", "did", "can", "could",
    "will", "would", "should", "may", "might", "must", "very", "my", "your",
    "i", "you", "he", "she", "it", "we", "they", "this", "that", "these",
    "those", "what", "when", "where", "why", "how", "me", "him", "her", "us",
    "just", "so", "like", "well", "about", "from", "with", "as", "by", "of"
  ]);
  return words.filter(w => w.length > 3 && !stopwords.has(w)).slice(0, 3);
}

// Reaction patterns - recognize what student is talking about
const REACTION_PATTERNS: Record<string, string[]> = {
  "enjoy|love|like|awesome|amazing|cool|great": [
    "That sounds amazing!",
    "I love that about you!",
    "That's so cool!",
    "You sound really excited!",
    "That's awesome!",
  ],
  "hard|difficult|tough|struggle|challenge": [
    "That's challenging!",
    "But you're working through it!",
    "You're pushing yourself!",
    "That takes guts!",
    "You're brave!",
  ],
  "friend|family|people|together|group": [
    "That's so wholesome!",
    "You sound like a great friend!",
    "They're lucky to have you!",
    "That relationship sounds special!",
    "You really care!",
  ],
  "first|new|never|haven't": [
    "Wow, that's exciting!",
    "That must be thrilling!",
    "New experiences are great!",
    "You're so brave!",
    "How did that feel?",
  ],
};

// Character-specific response templates with high variety
const CHARACTER_RESPONSES: Record<string, {
  acknowledgments: string[];
  contextual: (keyword: string) => string[];
  followUps: string[];
  endings: string[];
}> = {
  "Mom": {
    acknowledgments: [
      "Oh honey, that's wonderful!",
      "I'm so proud of you!",
      "That makes me so happy!",
      "You're such a smart kid!",
      "Tell me everything!",
      "That's my child!",
    ],
    contextual: (kw) => [
      `The fact that you ${kw} shows who you are!`,
      `Your ${kw} is something special!`,
      `I love how you think about ${kw}!`,
    ],
    followUps: [
      "How did that make you feel?",
      "What happened after?",
      "Do you want to do that again?",
      "What was the best part?",
      "I'd love to hear more!",
      "Tell me about that!",
    ],
    endings: ["You're the best!", "I love you so much!", "You make me proud!"],
  },
  "Alex": {
    acknowledgments: [
      "Yo, that's sick!",
      "No way, that's fire!",
      "Bro, that's so cool!",
      "That's incredible!",
      "Dude, for real?",
      "That's insane!",
    ],
    contextual: (kw) => [
      `The ${kw} thing is so cool!`,
      `That ${kw} energy is amazing!`,
      `How you handle ${kw} is awesome!`,
    ],
    followUps: [
      "What happened next?",
      "How'd you pull that off?",
      "Did you actually do that?",
      "Tell me more!",
      "That's wild, right?",
      "You gotta tell the full story!",
    ],
    endings: ["You're a legend!", "That was epic!", "You're amazing!"],
  },
  "Sarah": {
    acknowledgments: [
      "Oh my gosh, YES!",
      "That's literally so good!",
      "I can't even—amazing!",
      "OMG that's incredible!",
      "No way, really?",
      "That's the best!",
    ],
    contextual: (kw) => [
      `The way you talk about ${kw} is so genuine!`,
      `Your ${kw} perspective is cool!`,
      `I love how passionate you are about ${kw}!`,
    ],
    followUps: [
      "Like, tell me everything!",
      "What else happened?",
      "How did you even do that?",
      "What was that like?",
      "Spill the details!",
      "I need the full story!",
    ],
    endings: ["You're awesome!", "This is the best!", "I love chatting with you!"],
  },
  "Teacher": {
    acknowledgments: [
      "That's an excellent observation!",
      "Very insightful thinking!",
      "I really like that perspective!",
      "That shows real understanding!",
      "Thoughtful answer!",
      "That's quite sophisticated!",
    ],
    contextual: (kw) => [
      `Your understanding of ${kw} is strong!`,
      `That's a mature perspective on ${kw}!`,
      `Your critical thinking about ${kw} is impressive!`,
    ],
    followUps: [
      "Can you expand on that?",
      "What led you to that conclusion?",
      "How would you apply that?",
      "Can you give an example?",
      "What else comes to mind?",
      "How does that connect?",
    ],
    endings: ["Excellent work!", "You're doing great!", "Keep thinking like that!"],
  },
  "Coach": {
    acknowledgments: [
      "That's the dedication I love!",
      "You're pushing hard!",
      "That takes real commitment!",
      "Now THAT'S the spirit!",
      "I respect that effort!",
      "You've got drive!",
    ],
    contextual: (kw) => [
      `The way you tackle ${kw} shows heart!`,
      `Your ${kw} mentality is champion-level!`,
      `You're seriously dedicated to ${kw}!`,
    ],
    followUps: [
      "How's that training going?",
      "What's your secret?",
      "What's next on your list?",
      "How long you been at that?",
      "What drives you?",
      "What's the goal?",
    ],
    endings: ["Keep pushing!", "You've got this!", "That's a champ!"],
  },
  "Professor": {
    acknowledgments: [
      "Fascinating perspective!",
      "That's quite insightful!",
      "Rigorous thinking!",
      "Intellectually interesting!",
      "That shows critical analysis!",
      "Excellent reasoning!",
    ],
    contextual: (kw) => [
      `Your analytical approach to ${kw} is strong!`,
      `The logic behind your ${kw} argument works!`,
      `Your nuanced view of ${kw} is compelling!`,
    ],
    followUps: [
      "What's your evidence?",
      "How does that connect to...?",
      "What counter-arguments exist?",
      "Can you elaborate?",
      "How would you test that?",
      "What's the deeper implication?",
    ],
    endings: ["Brilliant analysis!", "You've got a sharp mind!", "Impressive reasoning!"],
  },
};

export function generateSmartResponse(context: SmartResponseContext): string {
  const { character, studentMessage, isLastTurn } = context;

  // Get character responses (fallback to Alex)
  const charData = CHARACTER_RESPONSES[character] || CHARACTER_RESPONSES["Alex"];

  // Extract keywords and patterns from student message
  const keywords = extractKeywords(studentMessage);
  const messageL = studentMessage.toLowerCase();

  // Check for emotion/reaction patterns
  let reactionAck = null;
  for (const [pattern, responses] of Object.entries(REACTION_PATTERNS)) {
    const patternRegex = new RegExp(pattern);
    if (patternRegex.test(messageL)) {
      reactionAck = responses[Math.floor(Math.random() * responses.length)];
      break;
    }
  }

  // Build response
  let response: string;

  if (isLastTurn) {
    // Last turn: warm goodbye
    const ack = reactionAck || charData.acknowledgments[Math.floor(Math.random() * charData.acknowledgments.length)];
    const ending = charData.endings[Math.floor(Math.random() * charData.endings.length)];
    response = `${ack} ${ending}`;
  } else {
    // Continue conversation
    const ack = reactionAck || charData.acknowledgments[Math.floor(Math.random() * charData.acknowledgments.length)];

    // Sometimes reference the keyword
    let contextLine = "";
    if (keywords.length > 0 && Math.random() > 0.5) {
      const contextualResponses = charData.contextual(keywords[0]);
      contextLine = contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
    }

    const followUp = charData.followUps[Math.floor(Math.random() * charData.followUps.length)];

    response = contextLine ? `${ack} ${contextLine} ${followUp}` : `${ack} ${followUp}`;
  }

  // Keep under 50 words
  const words = response.split(" ");
  if (words.length > 50) {
    response = words.slice(0, 50).join(" ");
  }

  return response.trim();
}
