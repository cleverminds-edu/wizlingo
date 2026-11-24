/**
 * Only SME-approved content reaches students (owner decision 2026-11-19,
 * docs/plans/PHASE_1_PILOT_BUILD_PLAN.md task 1.12). Planted control items used to
 * monitor SMEs (task 1.13) are never served, whatever their status.
 *
 * Spread these into every student-facing content query.
 */
import type { Prisma } from '@/app/generated/prisma/client';

export const SERVABLE_PASSAGE = {
  status: 'APPROVED',
  isControl: false,
} satisfies Prisma.ReadingPassageWhereInput;

export const SERVABLE_TOPIC = {
  status: 'APPROVED',
} satisfies Prisma.SpeakingTopicWhereInput;
