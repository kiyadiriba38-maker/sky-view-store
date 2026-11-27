"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

type ApplicationState = "idle" | "submitting" | "pending" | "approved" | "error";

export default function SellerApplication() {
  const [storeName, setStoreName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState<ApplicationState>("idle");
  const [message, setMessage] = useState("");
  const [authStatus, setAuthStatus] = useState<"loading" | "signed-in" | "signed-out">("loading");

  useEffect(() => {
    let active = true;
    fetch("/api/users/me", { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        const data = response.ok ? await response.json().catch(() => null) : null;
        if (active) setAuthStatus(data?.user ? "signed-in" : "signed-out");
      })
      .catch(() => { if (active) setAuthStatus("signed-out"); });
    return () => { active = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setMessage("");
    try {
      const response = await fetch("/api/sellers", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: storeName.trim(),
          slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
          description: description.trim(),
          country: "Ethiopia",
          city: city.trim(),
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setState("error");
        setMessage(result?.errors?.[0]?.message || result?.message || "We could not submit your application. Sign in and try again.");
        return;
      }
      setState("pending");
      setMessage("Your seller application has been submitted. An administrator must approve your store before you can list products.");
    } catch {
      setState("error");
      setMessage("A connection error occurred. Please try again.");
    }
  }

  return (
    <main className="sv-page min-h-[70vh] bg-[#070b12] px-4 py-12 text-white sm:px-8">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-[#101a28] p-6 sm:p-10">
        <Link href="/account" className="text-xs text-cyan-200 hover:text-white">← Customer account</Link>
        <p className="mt-8 text-[10px] font-bold uppercase tracking-[.25em] text-cyan-200">Seller Center / Application</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Open your store.</h1>
        <p className="mt-4 text-sm leading-7 text-white/55">Apply to become a Sky View Store seller. Your store remains pending until an administrator reviews and approves the application.</p>
        {authStatus === "loading" ? (
          <p className="mt-8 text-sm text-white/50">Checking your customer account…</p>
        ) : authStatus === "signed-out" ? (
          <div className="mt-8 rounded-2xl border border-cyan-200/20 bg-cyan-200/5 p-6">
            <p className="text-sm font-semibold">Sign in before applying.</p>
            <p className="mt-2 text-xs leading-6 text-white/55">Seller applications are linked to a verified customer account. An administrator must approve your application before you can publish listings.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/account/login?next=%2Fseller%2Fapply" className="rounded-full bg-cyan-200 px-5 py-3 text-xs font-bold text-[#07111a]">Sign in</Link>
              <Link href="/account/register?next=%2Fseller%2Fapply" className="rounded-full border border-white/20 px-5 py-3 text-xs font-bold">Create account</Link>
            </div>
          </div>
        ) : (
        <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block text-xs font-medium text-white/75">Store name
            <input required maxLength={80} value={storeName} onChange={(event) => { setStoreName(event.target.value); if (!slug) setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")); }} className="mt-2 w-full rounded-xl border border-white/15 bg-white/[.04] px-4 py-3 text-sm outline-none focus:border-cyan-200" />
          </label>
          <label className="block text-xs font-medium text-white/75">Store address / URL name
            <input required pattern="[a-z0-9-]+" value={slug} onChange={(event) => setSlug(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-white/[.04] px-4 py-3 text-sm outline-none focus:border-cyan-200" />
          </label>
          <label className="block text-xs font-medium text-white/75">City in Ethiopia
            <input required value={city} onChange={(event) => setCity(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-white/[.04] px-4 py-3 text-sm outline-none focus:border-cyan-200" placeholder="Addis Ababa" />
          </label>
          <label className="block text-xs font-medium text-white/75">What will your store sell?
            <textarea required minLength={20} rows={4} value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-white/[.04] px-4 py-3 text-sm outline-none focus:border-cyan-200" />
          </label>
          <button disabled={state === "submitting" || state === "pending"} className="w-full rounded-full bg-cyan-200 px-5 py-3.5 text-sm font-bold text-[#07111a] transition hover:bg-white disabled:opacity-50">{state === "submitting" ? "Submitting..." : state === "pending" ? "Application submitted" : "Submit seller application"}</button>
          {message ? <p role="status" className={`rounded-xl border p-4 text-sm ${state === "error" ? "border-rose-400/30 bg-rose-400/10 text-rose-200" : "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"}`}>{message}</p> : null}
        </form>
        )}
      </div>
    </main>
  );
}
