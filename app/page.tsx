import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();
  if (session?.role === "student") redirect("/student/dashboard");
  if (session?.role === "teacher") redirect("/teacher/dashboard");
  if (session?.role === "admin") redirect("/admin/dashboard");
  redirect("/login");
}
