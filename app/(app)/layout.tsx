// app/(app)/layout.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ResponsiveNav } from "@/components/bottom-nav"; // ou mude o nome do arquivo para responsive-nav.tsx

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="relative min-h-screen flex">
      <ResponsiveNav />
      {/* O main aqui delega a largura para o restante do app. A margem já foi tratada no padding-left do Dashboard, mas você pode tratar aqui globalmente também se preferir. */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
