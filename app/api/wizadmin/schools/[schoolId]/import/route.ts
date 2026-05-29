import { prisma } from "@/lib/prisma";
import { getWizAdminSession, unauthorized } from "@/lib/wizadmin-auth";
import { Gender } from "@/app/generated/prisma/client";

function generatePin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function parseGender(raw?: string): Gender | null {
  if (!raw) return null;
  const v = raw.trim().toUpperCase();
  if (v === "M" || v === "MALE" || v === "BOY") return Gender.MALE;
  if (v === "F" || v === "FEMALE" || v === "GIRL") return Gender.FEMALE;
  return null;
}

// Expected CSV: name,grade,section,rollNumber[,gender]
// gender is optional: M/F, Male/Female, Boy/Girl
// admissionNumber = {schoolCode}{grade}{section}{rollNumber}
export async function POST(
  request: Request,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  if (!(await getWizAdminSession())) return unauthorized();

  const { schoolId } = await params;
  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school) return Response.json({ error: "School not found" }, { status: 404 });

  const { rows } = await request.json() as {
    rows: { name: string; grade: number; section: string; rollNumber: string; gender?: string }[];
  };

  if (!Array.isArray(rows) || rows.length === 0) {
    return Response.json({ error: "No rows provided" }, { status: 400 });
  }

  const created: { name: string; admissionNumber: string; pin: string; grade: number; section: string }[] = [];
  const errors: { row: number; reason: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row.name || !row.grade || !row.section || !row.rollNumber) {
      errors.push({ row: i + 1, reason: "Missing name, grade, section, or rollNumber" });
      continue;
    }

    const admissionNumber = `${school.code}${row.grade}${row.section.toUpperCase()}${String(row.rollNumber).padStart(3, "0")}`;
    const pin = generatePin();
    const gender = parseGender(row.gender);

    try {
      const cls = await prisma.class.upsert({
        where: {
          id: (await prisma.class.findFirst({
            where: { schoolId, grade: Number(row.grade), section: row.section.toUpperCase() },
          }))?.id ?? "none",
        },
        update: {},
        create: { schoolId, grade: Number(row.grade), section: row.section.toUpperCase() },
      });

      await prisma.student.create({
        data: {
          name: row.name,
          admissionNumber,
          pin,
          classId: cls.id,
          accountType: "SCHOOL",
          ...(gender ? { gender } : {}),
        },
      });

      created.push({ name: row.name, admissionNumber, pin, grade: row.grade, section: row.section.toUpperCase() });
    } catch {
      errors.push({ row: i + 1, reason: `Admission number ${admissionNumber} already exists` });
    }
  }

  return Response.json({ created, errors, total: rows.length });
}
