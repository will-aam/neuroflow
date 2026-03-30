import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { ResponsiveNav } from "@/components/bottom-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Busca os dados do usuário para preencher a Navbar
  const users = await sql`
    SELECT id, name, email, avatar_seed FROM users WHERE id = ${session.id}
  `;

  if (users.length === 0) {
    redirect("/login");
  }

  const user = users[0] as {
    id: string;
    name: string | null;
    email: string;
    avatar_seed: string | null;
  };

  return (
    <div className="relative min-h-screen flex">
      {/* Passamos o user.name E a user.avatar_seed para a navegação */}
      <ResponsiveNav
        userName={user.name || "Usuário"}
        avatarSeed={user.avatar_seed}
      />
      <div className="flex-1 w-full overflow-x-hidden">{children}</div>
    </div>
  );
}
