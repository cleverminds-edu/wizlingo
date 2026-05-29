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
      students: {
        orderBy: [{ class: { grade: "asc" } }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          admissionNumber: true,
          pin: true,
          createdAt: true,
          class: { select: { grade: true, section: true } },
        },
      },
    },
    orderBy: [{ grade: "asc" }, { section: "asc" }],
  });

  const students = classes.flatMap((c) => c.students);
  return Response.json({ students });
}
