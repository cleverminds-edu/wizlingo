// Badge congratulatory and motivational messages
import { BadgeType } from '@/app/generated/prisma/client';

export interface BadgeMessages {
  congratulations: string;
  locked: string;
  inProgress: (progress: number) => string;
  shareTemplate: string;
  narrative: string;
}

export const BADGE_MESSAGES: Record<BadgeType, BadgeMessages> = {
  SPARK: {
    narrative: `The Spark is the ignition point of your wizard journey. By taking your first reading session, you've lit the flame within. You've proven you're ready to embark on this adventure to master language and speak with confidence. Every legend started with a spark.`,
    congratulations: `🎉 YOU EARNED THE SPARK BADGE! 🔥

Congratulations, Spark Starter!

You took the first step. You showed up. You read.
That takes courage, and we're proud of you! ✨

This spark is just the beginning. Your wizard powers are awakening...

🚀 Next Challenge:
Read 3 sessions with 80%+ accuracy to become a WORD WIZARD 📚`,
    locked: `🔓 Unlock SPARK
Take your first reading session!

The journey of a thousand miles begins with a single step.
You're ready. Click "Start Reading" and light your spark! ⚡

⏱️ Time to start: 5-10 minutes
💪 Effort: Just show up and read aloud
🎁 Reward: Your first badge + confidence boost`,
    inProgress: (progress: number) => {
      if (progress === 0) {
        return `🔥 Ready to earn SPARK?
Start your first reading session now!
It's just 5-10 minutes. You've got this! 💪`;
      }
      return `Almost there! Complete your first session to earn SPARK! 🔥`;
    },
    shareTemplate: `🔥 I just earned the SPARK badge on WizLingo!
I've started my reading adventure. 📚

Who wants to join me on this wizard journey? ✨

Join WizLingo: [LINK]
#WizLingo #Learning #ReadingChallenges`,
  },

  WORD_WIZARD: {
    narrative: `You've developed the ancient art of Word Wizardry. By achieving 80%+ accuracy, you've proven that you don't just read words—you understand them, absorb them, master them. Your comprehension is legendary. You're no longer a reader; you're a scholar. The WORD WIZARD power is now yours.`,
    congratulations: `🎉 YOU'RE A WORD WIZARD! 📚

Outstanding Reading Mastery!

You achieved 80%+ accuracy!
That's not just reading—that's comprehension mastery. 🌟

You understand every word. You grasp meaning. You're a scholar! 📖

Stats:
📊 Reading Accuracy: 80%+
🏆 Mastery Level: EXPERT
💡 You're now a Word Wizard!

🚀 Next Challenge:
Complete 10 sessions to become a LANGUAGE WIZARD 🧙`,
    locked: `📚 Unlock WORD WIZARD
Achieve 80%+ accuracy in reading sessions!

A true wizard understands every word.
It's not about reading fast—it's about reading *right*.

📈 Tips to improve:
✅ Read slowly and carefully
✅ Don't skip difficult words
✅ Understand before moving on
✅ Practice with harder passages

You're getting closer! Keep practicing! 💪`,
    inProgress: (accuracy: number) => {
      const needed = 80 - accuracy;
      if (accuracy < 50) {
        return `📚 Building comprehension skills...
Current accuracy: ${accuracy}%
Target: 80%+

Take your time. Understanding matters more than speed! 🐢→🔥`;
      } else if (accuracy < 75) {
        return `You're doing great! ${accuracy}% accuracy!
Just ${needed.toFixed(1)}% more to become a WORD WIZARD! 📚
You've almost got it! 💪`;
      } else {
        return `So close! ${accuracy}% accuracy!
Just ${needed.toFixed(1)}% more! One more session! 🎯`;
      }
    },
    shareTemplate: `📚 I just unlocked WORD WIZARD on WizLingo!
80%+ reading comprehension achieved! 🎉

I'm not just reading—I'm mastering every word.
Who's ready to join the wizard academy? ✨

Join WizLingo: [LINK]
#WordWizard #ReadingComprehension #WizLingo`,
  },

  VOICE_WIZARD: {
    narrative: `Your voice is powerful. By achieving 75%+ fluency in speaking, you've proven that you can express yourself with clarity and confidence. You're not just speaking—you're *communicating*. You're captivating. You're a VOICE WIZARD, and the world is listening.`,
    congratulations: `🎉 YOU'RE A VOICE WIZARD! 🎤

Your Voice Is Powerful!

You achieved 75%+ fluency!
You speak with clarity. You communicate with confidence.
Your voice matters! 🌟

Stats:
🗣️ Speaking Fluency: 75%+
🏆 Confidence Level: HIGH
💬 You're now a Voice Wizard!

🚀 Next Challenge:
Complete 10 sessions to become a LANGUAGE WIZARD 🧙`,
    locked: `🎤 Unlock VOICE WIZARD
Achieve 75%+ fluency in speaking!

Your voice is more powerful than you think.
Speaking with confidence is a superpower. 🌟

🗣️ Tips to improve:
✅ Speak slowly and clearly
✅ Don't rush your words
✅ Practice pronunciation
✅ Talk to our AI tutor regularly
✅ Believe in yourself!

Keep practicing! Your fluency is improving! 💪`,
    inProgress: (fluency: number) => {
      const needed = 75 - fluency;
      if (fluency < 50) {
        return `🎤 Building speaking confidence...
Current fluency: ${fluency}%
Target: 75%+

Your voice matters. Keep speaking! 🌟`;
      } else if (fluency < 70) {
        return `Great progress! ${fluency}% fluency!
Just ${needed.toFixed(1)}% more to become a VOICE WIZARD! 🎤
You're almost there! 💪`;
      } else {
        return `So close! ${fluency}% fluency!
Just ${needed.toFixed(1)}% more! One more session! 🎯`;
      }
    },
    shareTemplate: `🎤 I just unlocked VOICE WIZARD on WizLingo!
75%+ speaking fluency achieved! 🎉

I found my voice. I'm speaking with confidence now.
Who's ready to speak up? 🌟

Join WizLingo: [LINK]
#VoiceWizard #SpeakingConfidence #WizLingo`,
  },

  LANGUAGE_WIZARD: {
    narrative: `You've completed 10+ sessions. That's not luck—that's dedication. That's discipline. That's the mark of a true wizard. By showing up consistently, practicing regularly, and pushing through challenges, you've proven that you have what it takes to master language. The LANGUAGE WIZARD power recognizes your unwavering commitment.`,
    congratulations: `🎉 YOU'RE A LANGUAGE WIZARD! 🧙

Your Dedication Is Legendary!

You completed 10+ sessions!
That's consistency. That's discipline. That's a wizard's oath.
You've proven you're serious about mastering language. 🌟

Stats:
📊 Sessions Completed: 10+
⏱️ Learning Commitment: EXCEPTIONAL
🏆 You're now a Language Wizard!

🚀 Next Challenge:
Earn all 4 badges to become the ultimate GRAND WIZARD! 👑`,
    locked: `🧙 Unlock LANGUAGE WIZARD
Complete 10+ reading or speaking sessions!

Legends aren't born—they're built, one session at a time.

💡 Did you know?
• Every session = 1% closer to fluency
• Consistency beats intensity
• 10 sessions = habit for life

Keep showing up! Every session counts! 💪`,
    inProgress: (count: number) => {
      const needed = 10 - count;
      if (count < 5) {
        return `You're building a learning habit! 🚀
Sessions completed: ${count} / 10
Keep going! ${needed} more to go! 💪`;
      } else if (count < 9) {
        return `You're on fire! 🔥 ${count} / 10 sessions!
Just ${needed} more to become a LANGUAGE WIZARD! 🧙
Don't stop now! 💪`;
      } else {
        return `Almost there! ${count} / 10 sessions!
Just ${needed} more session(s) to become LEGENDARY! 👑`;
      }
    },
    shareTemplate: `🧙 I just unlocked LANGUAGE WIZARD on WizLingo!
10+ sessions completed! 📚🎤

I'm not just learning—I'm building a habit.
Consistency is my superpower. 💪

Who's ready to join the commitment?
Join WizLingo: [LINK]
#LanguageWizard #Consistency #WizLingo`,
  },

  GRAND_WIZARD: {
    narrative: `You've done it. You've become a GRAND WIZARD. You started with a SPARK of courage. You mastered words and became a WORD WIZARD. You found your voice and became a VOICE WIZARD. You showed up consistently and became a LANGUAGE WIZARD. Now you stand at the pinnacle of the WizLingo journey. You're no longer a learner—you're a legend.`,
    congratulations: `👑 YOU'RE A GRAND WIZARD! 👑

LEGENDARY. UNSTOPPABLE. EXTRAORDINARY.

You've earned ALL FOUR badges! 🎉
You've mastered reading. You've mastered speaking.
You've shown legendary dedication.

You are no longer a student learning language.
You are a GRAND WIZARD who speaks with confidence,
reads with precision, and learns with purpose. 🌟

YOUR LEGENDARY ACHIEVEMENT:
✨ SPARK Badge: EARNED
📚 WORD WIZARD Badge: EARNED
🎤 VOICE WIZARD Badge: EARNED
🧙 LANGUAGE WIZARD Badge: EARNED

🏆 YOU ARE A LANGUAGE LEGEND! 👑

WHAT THIS MEANS:
✅ You speak with confidence 🎤
✅ You read with comprehension 📚
✅ You learn with consistency 💪
✅ You inspire others ⭐

This is your moment. Share your achievement with the world! 🌍`,
    locked: `👑 Unlock GRAND WIZARD
Earn all 4 badges: SPARK, WORD WIZARD, VOICE WIZARD, LANGUAGE WIZARD

The ultimate achievement awaits!

Progress:
${['SPARK', 'WORD_WIZARD', 'VOICE_WIZARD', 'LANGUAGE_WIZARD']
  .map((badge) => `✅ ${badge}`)
  .join('\n')}

Remaining: See which badges you need to earn!

Keep pushing! Greatness is within reach! 💪`,
    inProgress: (completed: number) => {
      const earned = completed;
      const remaining = 4 - earned;
      return `You're on the path to GRAND WIZARD! 🚀
Badges earned: ${earned} / 4
Remaining: ${remaining} badge(s)

Keep going! You're almost at legend status! 👑`;
    },
    shareTemplate: `👑 I JUST BECAME A GRAND WIZARD ON WIZLINGO! 👑

LEGENDARY STATUS UNLOCKED! 🌟

I mastered:
✅ Reading Comprehension (80%+)
✅ Speaking Fluency (75%+)
✅ Dedication (10+ sessions)
✅ ALL 4 BADGES

From SPARK to GRAND WIZARD—the journey is complete!

Now I'm ready to take on ANY language challenge. 💪

Who's next? Join me on WizLingo!
[LINK]

#GrandWizard #LanguageMastery #WizLingo #LegendaryAchievement`,
  },
};

// Helper functions
export function getBadgeMessage(badgeType: BadgeType): BadgeMessages {
  return BADGE_MESSAGES[badgeType];
}

export function getCongratulationsMessage(
  badgeType: BadgeType,
  studentName?: string
): string {
  const msg = BADGE_MESSAGES[badgeType].congratulations;
  return studentName ? msg.replace('{StudentName}', studentName) : msg;
}

export function getMotivationalMessage(
  badgeType: BadgeType,
  progress: number,
  studentName?: string
): string {
  const msg = BADGE_MESSAGES[badgeType].inProgress(progress);
  return studentName ? msg.replace('{StudentName}', studentName) : msg;
}

export function getShareTemplate(
  badgeType: BadgeType,
  studentName?: string
): string {
  const msg = BADGE_MESSAGES[badgeType].shareTemplate;
  return studentName ? msg.replace('{StudentName}', studentName) : msg;
}
