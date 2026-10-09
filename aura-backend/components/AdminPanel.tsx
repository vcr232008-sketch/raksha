"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* eslint-disable @typescript-eslint/no-explicit-any */
const api = async (url: string, init?: RequestInit) => (await fetch(url, init)).json();
const json = (method: string, body: unknown): RequestInit => ({ method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export default function AdminPanel() {
  const router = useRouter();
  const [stats, setStats] = useState<any>({});
  const [products, setProducts] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const [d, p, e, s, c] = await Promise.all(["/api/admin/dashboard", "/api/admin/products", "/api/admin/enquiries", "/api/admin/subscribers", "/api/categories"].map((u) => api(u)));
    if (d.error === "Authentication required") return router.push("/admin/login");
    setStats(d.data ?? {}); setProducts(p.data ?? []); setEnquiries(e.data ?? []); setSubs(s.data ?? []); setCategories(c.data ?? []);
  }, [router]);
  useEffect(() => { load(); }, [load]);

  async function addProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setMsg("Saving...");
    const f = new FormData(e.currentTarget);
    let images: string[] = [];
    const files = (f.getAll("files") as File[]).filter((x) => x.size > 0);
    if (files.length) {
      const up = new FormData(); files.forEach((x) => up.append("files", x));
      const r = await api("/api/admin/upload", { method: "POST", body: up });
      if (!r.success) return setMsg(r.error);
      images = r.data.urls;
    }
    const list = (k: string) => String(f.get(k) ?? "").split(",").map((x) => x.trim()).filter(Boolean);
    const r = await api("/api/admin/products", json("POST", {
      name: f.get("name"), description: f.get("description"), price: f.get("price"),
      salePrice: f.get("salePrice") ? f.get("salePrice") : null, sku: f.get("sku"), stock: f.get("stock") || 0,
      categoryId: f.get("categoryId"), sizes: list("sizes"), colours: list("colours"), featured: f.get("featured") === "on", images,
    }));
    setMsg(r.success ? "Product added" : `${r.error}${r.details ? ": " + JSON.stringify(r.details) : ""}`);
    if (r.success) { (e.target as HTMLFormElement).reset(); load(); }
  }

  const patch = async (url: string, body: unknown) => { await api(url, json("PATCH", body)); load(); };
  const logout = async () => { await api("/api/auth/logout", { method: "POST" }); router.push("/admin/login"); };

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 grid gap-12">
      <div className="flex justify-between items-center">
        <h1 className="font-serif-display text-4xl">Dashboard</h1>
        <button onClick={logout} className="text-xs uppercase tracking-widest underline">Log out</button>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[["Products", stats.totalProducts], ["Active", stats.activeProducts], ["Low stock", stats.lowStock], ["New enquiries", stats.pendingEnquiries], ["Subscribers", stats.subscribers]].map(([l, v]) => (
          <div key={l as string} className="border border-[var(--stone)] bg-white p-4"><p className="text-3xl font-serif-display">{v ?? "-"}</p><p className="text-xs uppercase tracking-widest opacity-60">{l}</p></div>
        ))}
      </section>

      <section>
        <h2 className="font-serif-display text-2xl mb-4">Add product</h2>
        <form onSubmit={addProduct} className="grid gap-3 md:grid-cols-3">
          <input name="name" required placeholder="Name" className="input" />
          <input name="sku" required placeholder="SKU" className="input" />
          <select name="categoryId" required className="input"><option value="">Category</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <input name="price" type="number" step="0.01" required placeholder="Price" className="input" />
          <input name="salePrice" type="number" step="0.01" placeholder="Sale price (optional)" className="input" />
          <input name="stock" type="number" min="0" placeholder="Stock" className="input" />
          <input name="sizes" placeholder="Sizes (S, M, L)" className="input" />
          <input name="colours" placeholder="Colours (Ivory, Black)" className="input" />
          <input name="files" type="file" accept="image/jpeg,image/png,image/webp" multiple className="input" />
          <textarea name="description" required placeholder="Description" rows={3} className="input md:col-span-3" />
          <label className="text-sm flex items-center gap-2"><input type="checkbox" name="featured" /> Featured</label>
          <button className="btn md:col-start-3">Add product</button>
        </form>
        {msg && <p className="text-sm mt-2">{msg}</p>}
      </section>

      <section>
        <h2 className="font-serif-display text-2xl mb-4">Products</h2>
        <div className="overflow-x-auto"><table className="w-full text-sm bg-white">
          <thead className="text-left text-xs uppercase tracking-widest"><tr><th className="p-2">Name</th><th>Price</th><th>Stock</th><th>Status</th></tr></thead>
          <tbody>{products.map((p) => (
            <tr key={p.id} className="border-t border-[var(--stone)]">
              <td className="p-2">{p.name}</td><td>₹{Number(p.price).toLocaleString("en-IN")}</td>
              <td><input type="number" min="0" defaultValue={p.stock} className="w-16 border p-1" onBlur={(e) => Number(e.target.value) !== p.stock && patch(`/api/admin/products/${p.id}`, { stock: Number(e.target.value) })} /></td>
              <td><button className="underline" onClick={() => patch(`/api/admin/products/${p.id}`, { active: !p.active })}>{p.active ? "Active · deactivate" : "Hidden · activate"}</button></td>
            </tr>))}</tbody>
        </table></div>
      </section>

      <section>
        <h2 className="font-serif-display text-2xl mb-4">Enquiries</h2>
        <div className="grid gap-3">{enquiries.length === 0 && <p className="opacity-60 text-sm">No enquiries yet.</p>}
          {enquiries.map((q) => (
            <article key={q.id} className="border border-[var(--stone)] bg-white p-4 text-sm">
              <div className="flex justify-between gap-3 flex-wrap">
                <b>{q.subject}</b>
                <select value={q.status} onChange={(e) => patch(`/api/admin/enquiries/${q.id}`, { status: e.target.value })} className="border p-1 text-xs">
                  <option value="NEW">New</option><option value="IN_PROGRESS">In progress</option><option value="RESOLVED">Resolved</option>
                </select>
              </div>
              <p className="opacity-60">{q.name} · <a href={`mailto:${q.email}`} className="underline">{q.email}</a>{q.phone && ` · ${q.phone}`}</p>
              <p className="mt-2 whitespace-pre-line">{q.message}</p>
            </article>))}
        </div>
      </section>

      <section>
        <h2 className="font-serif-display text-2xl mb-4">Subscribers ({subs.length})</h2>
        <p className="text-sm opacity-80">{subs.map((s) => s.email).join(", ") || "None yet."}</p>
      </section>
    </div>
  );
}
