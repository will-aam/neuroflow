import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { AvatarClient } from "./avatar-client";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Busca os dados mais atualizados do usuário, incluindo o avatar_seed
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

  return <AvatarClient user={user} />;
}
