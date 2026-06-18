import { GradeBand } from '@/app/generated/prisma/enums';
import { AgeBand } from './age-band';

/**
 * Maps age band to corresponding grade band for content filtering
 * Ensures age-appropriate reading passages and speaking topics
 */
export function ageBandToGradeBand(ageBand: AgeBand): GradeBand {
  switch (ageBand) {
    case '6-8':
      return 'BAND_1_2';
    case '9-11':
      return 'BAND_3_5';
    case '12-14':
      return 'BAND_6_8';
    case '15+':
      return 'BAND_9_10';
    default:
      return 'BAND_3_5'; // fallback
  }
}

/**
 * Get description of age band with grade info
 */
export function getAgeBandDescription(ageBand: AgeBand): string {
  const descriptions = {
    '6-8': 'Ages 6-8 (Grade I-II)',
    '9-11': 'Ages 9-11 (Grade III-V)',
    '12-14': 'Ages 12-14 (Grade VI-VIII)',
    '15+': 'Ages 15+ (Grade IX+)',
  };
  return descriptions[ageBand];
}

/**
 * Validates if a gradeBand is appropriate for an ageBand
 * Used for content filtering and validation
 */
export function isValidGradeBandForAgeBand(ageBand: AgeBand, gradeBand: GradeBand): boolean {
  const validBands = {
    '6-8': ['BAND_1_2'],
    '9-11': ['BAND_3_5'],
    '12-14': ['BAND_6_8'],
    '15+': ['BAND_9_10'],
  };

  return validBands[ageBand]?.includes(gradeBand) ?? false;
}
