import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export async function checkPageAccess(pageKey: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/admin/login");

  const user = session.user as { isSuperAdmin?: boolean; allowedPages?: string[] };
  if (user.isSuperAdmin) return;

  const allowed = (user.allowedPages ?? []) as string[];
  if (!allowed.includes(pageKey)) {
    redirect("/admin/dashboard?denied=1");
  }
}
