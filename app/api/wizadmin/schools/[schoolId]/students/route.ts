import { prisma } from "@/lib/prisma";
import { getWizAdminSession, unauthorized } from "@/lib/wizadmin-auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  if (!(await getWizAdminSession())) return unauthorized();

  const { schoolId } = await params;

  const classes = await prisma.class.findMany({
    where: { schoolId },
    include: {
      enrollments: {
        orderBy: { student: { name: "asc" } },
        select: {
          student: {
            select: {
              id: true,
              name: true,
              admissionNumber: true,
              pin: true,
              createdAt: true,
            },
          },
        },
      },
    },
    orderBy: [{ grade: "asc" }, { section: "asc" }],
  });

  // Same response shape as before: each student with `class: { grade, section }`,
  // ordered by grade (classes are already ordered) then name.
  const students = classes.flatMap((c) =>
    c.enrollments.map((e) => ({ ...e.student, class: { grade: c.grade, section: c.section } }))
  );
  return Response.json({ students });
}
