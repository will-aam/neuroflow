import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { Dashboard } from "@/components/dashboard";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // CORREÇÃO: Usar session.id ao invés de session.userId
  const users = await sql`
    SELECT id, name, email, energy_mode FROM users WHERE id = ${session.id}
  `;

  if (users.length === 0) {
    redirect("/login");
  }

  const user = users[0] as {
    id: string;
    name: string;
    email: string;
    energy_mode: "good" | "difficult" | "chaos";
  };

  return <Dashboard user={user} />;
}
