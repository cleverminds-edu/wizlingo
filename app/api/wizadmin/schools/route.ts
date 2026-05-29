import { prisma } from "@/lib/prisma";
import { getWizAdminSession, unauthorized } from "@/lib/wizadmin-auth";

export async function GET() {
  if (!(await getWizAdminSession())) return unauthorized();

  const schools = await prisma.school.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { classes: true } },
      classes: {
        include: { _count: { select: { students: true } } },
      },
    },
  });

  const result = schools.map((s) => ({
    id: s.id,
    name: s.name,
    code: s.code,
    logoUrl: s.logoUrl,
    createdAt: s.createdAt,
    totalStudents: s.classes.reduce((sum, c) => sum + c._count.students, 0),
    totalClasses: s._count.classes,
  }));

  return Response.json({ schools: result });
}

export async function POST(request: Request) {
  if (!(await getWizAdminSession())) return unauthorized();

  const { name, code, logoUrl } = await request.json();
  if (!name || !code) {
    return Response.json({ error: "name and code are required" }, { status: 400 });
  }

  const exists = await prisma.school.findUnique({ where: { code } });
  if (exists) {
    return Response.json({ error: "School code already exists" }, { status: 409 });
  }

  const school = await prisma.school.create({
    data: { name, code: code.toUpperCase(), logoUrl: logoUrl || null },
  });

  return Response.json({ school }, { status: 201 });
}
