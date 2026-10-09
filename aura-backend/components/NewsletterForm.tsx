"use client";
import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    const res = await fetch("/api/newsletter", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }),
    });
    const json = await res.json();
    if (json.success) { setState("done"); setMsg("Thank you for joining us."); setEmail(""); }
    else { setState("error"); setMsg(json.error ?? "Something went wrong"); }
  }

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2 max-w-md">
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email" className="input" aria-label="Email" />
      <button className="btn" disabled={state === "loading"}>{state === "loading" ? "..." : "Subscribe"}</button>
      {msg && <p role="status" className={`text-sm sm:hidden ${state === "error" ? "text-red-700" : "text-[var(--gold)]"}`}>{msg}</p>}
      {msg && <p role="status" className={`text-sm hidden sm:block self-center ${state === "error" ? "text-red-700" : "text-[var(--gold)]"}`}>{msg}</p>}
    </form>
  );
}
