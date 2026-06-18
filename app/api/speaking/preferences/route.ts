import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  getSpeakingPreference,
  updateCharacterPreference,
  updatePronouns,
  getSpeakingPreferenceSummary,
  getCharacterDiversityStats,
} from '@/lib/speaking-preference';

export const dynamic = 'force-dynamic';

/**
 * GET /api/speaking/preferences
 * Get current student's speaking preferences
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const summary = await getSpeakingPreferenceSummary(session.id);
    const diversity = await getCharacterDiversityStats(session.id);

    return NextResponse.json({
      preference: summary,
      diversity,
    });
  } catch (error) {
    console.error('[Speaking Preferences API Error]', error);
    return NextResponse.json(
      { error: 'Failed to fetch speaking preferences' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/speaking/preferences
 * Update speaking preferences (character gender preference, pronouns)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { characterGenderPref, pronouns } = body;

    // Update character preference if provided
    if (characterGenderPref) {
      const validPrefs = ['ANY', 'SAME', 'DIFFERENT', 'MALE', 'FEMALE', 'NEUTRAL'];
      if (!validPrefs.includes(characterGenderPref)) {
        return NextResponse.json(
          { error: 'Invalid character gender preference' },
          { status: 400 }
        );
      }
      await updateCharacterPreference(session.id, characterGenderPref);
    }

    // Update pronouns if provided
    if (pronouns) {
      const validPronouns = ['he/him', 'she/her', 'they/them', 'ask me'];
      if (!validPronouns.includes(pronouns) && pronouns.length > 50) {
        return NextResponse.json(
          { error: 'Invalid pronouns' },
          { status: 400 }
        );
      }
      await updatePronouns(session.id, pronouns);
    }

    // Return updated preference
    const updated = await getSpeakingPreference(session.id);
    const diversity = await getCharacterDiversityStats(session.id);

    return NextResponse.json({
      message: 'Preferences updated',
      preference: updated,
      diversity,
    });
  } catch (error) {
    console.error('[Speaking Preferences Update Error]', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
