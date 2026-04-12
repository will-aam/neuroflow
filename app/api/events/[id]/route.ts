import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }, // Definimos como Promise
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    // No Next.js 16, precisamos dar await no params
    const { id } = await params;

    await sql`DELETE FROM events WHERE id = ${id} AND user_id = ${session.id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir evento:", error);
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
  }
}
