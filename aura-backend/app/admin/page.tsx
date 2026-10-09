import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AdminPanel from "@/components/AdminPanel";

export const metadata = { title: "Admin | Aura Boutique", robots: { index: false } };

export default async function Admin() {
  const s = await getSession();
  if (!s || s.role !== "ADMIN") redirect("/admin/login");
  return <AdminPanel />;
}
