"use server";

import { requireAuth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateAvatar(seed: string) {
  try {
    // 1. Garante que o usuário está logado e pega os dados dele
    const user = await requireAuth();

    // 2. Atualiza no banco de dados a nova semente (nome da foto)
    await sql`
      UPDATE users 
      SET avatar_seed = ${seed} 
      WHERE id = ${user.id}
    `;

    // 3. Força o Next.js a recarregar o layout para mostrar a nova foto na Sidebar na mesma hora!
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar avatar:", error);
    return {
      success: false,
      error: "Não foi possível salvar a sua foto de perfil.",
    };
  }
}
