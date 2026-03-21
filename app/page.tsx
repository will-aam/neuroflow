// app/page.tsx
import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/dashboard"); // ou até outro público, se desejar!
}
