/**
 * Student ↔ class helpers.
 *
 * Since the schema replacement (docs/plans/SCHEMA_REPLACEMENT_PLAN.md, row 2) a student's class
 * is stored in `Enrollment` instead of `Student.classId`. A student normally has one enrollment
 * (their section); these helpers keep call sites short and consistent.
 */
import type { GradeCategory, Prisma } from '@/app/generated/prisma/client';

/** Prisma `include` fragment: the student's class with its school. */
export const classWithSchoolInclude = {
  enrollments: {
    include: { class: { include: { school: true } } },
    orderBy: { enrolledAt: 'asc' },
    take: 1,
  },
} satisfies Prisma.StudentInclude;

/** Prisma `include` fragment: the student's class only. */
export const classInclude = {
  enrollments: {
    include: { class: true },
    orderBy: { enrolledAt: 'asc' },
    take: 1,
  },
} satisfies Prisma.StudentInclude;

/** The student's primary class (first enrollment), or null for B2C students. */
export function primaryClass<C>(student: { enrollments?: { class: C }[] } | null | undefined): C | null {
  return student?.enrollments?.[0]?.class ?? null;
}

/** The student's primary class id, or null. */
export function primaryClassId(student: { enrollments?: { classId: string }[] } | null | undefined): string | null {
  return student?.enrollments?.[0]?.classId ?? null;
}

/** Where-filter: students enrolled in a given class. */
export function inClass(classId: string): Prisma.StudentWhereInput {
  return { enrollments: { some: { classId } } };
}

/** Where-filter: students enrolled in any class of a given school. */
export function inSchool(schoolId: string): Prisma.StudentWhereInput {
  return { enrollments: { some: { class: { schoolId } } } };
}

/** Nested create for a new student joining a class: `data: { ..., ...enrollIn(classId) }`. */
export function enrollIn(classId: string | null | undefined): Pick<Prisma.StudentCreateInput, 'enrollments'> {
  return classId ? { enrollments: { create: { classId } } } : {};
}

/** School grade (0 = UKG/pre-primary, 1–12) → GradeCategory. */
export function gradeToCategory(grade: number): GradeCategory {
  if (!Number.isFinite(grade) || grade < 1) return 'PREPRIMARY';
  if (grade <= 3) return 'GR_1_3';
  if (grade <= 7) return 'GR_4_7';
  if (grade <= 10) return 'GR_8_10';
  return 'GR_11_12';
}
