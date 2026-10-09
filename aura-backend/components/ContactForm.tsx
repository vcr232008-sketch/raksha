"use client";
import { useState } from "react";

export default function ContactForm({ defaultSubject = "" }: { defaultSubject?: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading"); setError(""); setFieldErrors({});
    const form = e.currentTarget;
    const body = Object.fromEntries(new FormData(form));
    const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json();
    if (json.success) { setState("done"); form.reset(); return; }
    setState("error"); setError(json.error ?? "Something went wrong"); setFieldErrors(json.details ?? {});
  }

  if (state === "done")
    return <p className="text-center py-10 font-serif-display text-2xl text-[var(--gold)]">Thank you. We'll be in touch shortly.</p>;

  const err = (k: string) => fieldErrors[k]?.[0] && <p className="text-xs text-red-700 mt-1">{fieldErrors[k][0]}</p>;
  return (
    <form onSubmit={submit} className="grid gap-4">
      <div><input name="name" required placeholder="Full name" className="input" />{err("name")}</div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><input name="email" type="email" required placeholder="Email" className="input" />{err("email")}</div>
        <div><input name="phone" placeholder="Phone (optional)" className="input" />{err("phone")}</div>
      </div>
      <div><input name="subject" required defaultValue={defaultSubject} placeholder="Subject" className="input" />{err("subject")}</div>
      <div><textarea name="message" required rows={6} placeholder="How can we help?" className="input" />{err("message")}</div>
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state === "error" && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button className="btn justify-self-start" disabled={state === "loading"}>{state === "loading" ? "Sending..." : "Send message"}</button>
    </form>
  );
}
