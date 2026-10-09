"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError("");
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))) });
    const json = await res.json();
    if (json.success) { router.push("/admin"); router.refresh(); } else setError(json.error);
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-sm px-5 py-24 grid gap-4">
      <h1 className="font-serif-display text-4xl text-center">Admin</h1>
      <input name="email" type="email" required placeholder="Email" className="input" />
      <input name="password" type="password" required placeholder="Password" className="input" />
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button className="btn">Sign in</button>
    </form>
  );
}
