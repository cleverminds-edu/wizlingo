import { GradeBand } from '@/app/generated/prisma/enums';
import { AgeBand } from './age-band';

/**
 * Maps age band to corresponding grade band for content filtering
 * Ensures age-appropriate reading passages and speaking topics
 */
export function ageBandToGradeBand(ageBand: AgeBand): GradeBand {
  switch (ageBand) {
    case '6-8':
      return 'GRADE_I_II';
    case '9-11':
      return 'GRADE_III_V';
    case '12-14':
      return 'GRADE_VI_VIII';
    case '15+':
      return 'GRADE_IX_PLUS';
    default:
      return 'GRADE_III_V'; // fallback
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
    '6-8': ['GRADE_I_II'],
    '9-11': ['GRADE_III_V'],
    '12-14': ['GRADE_VI_VIII'],
    '15+': ['GRADE_IX_PLUS'],
  };

  return validBands[ageBand]?.includes(gradeBand) ?? false;
}
