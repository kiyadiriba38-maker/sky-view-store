"use client";

import Link from "next/link";
import GoogleSignInButton from "@/components/account/google-sign-in-button";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

type Mode = "login" | "register";

export default function AccountAccess({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedNext = searchParams.get("next");
  const redirectTo = requestedNext?.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (mode === "register" && password !== confirm) {
      setMessage("Your passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(mode === "login" ? "/api/users/login" : "/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(result?.errors?.[0]?.message || result?.message || "We could not complete that request. Check your details and try again.");
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } catch {
      setMessage("A connection problem occurred. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="sv-page min-h-[75vh] bg-[#070b12] px-4 py-14 text-white sm:px-6 sm:py-20">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-[#0d1724] shadow-[0_30px_100px_rgba(0,0,0,.35)] md:grid-cols-[.9fr_1.1fr]">
        <section className="relative hidden min-h-[580px] flex-col justify-between overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,.25),transparent_38%),linear-gradient(145deg,#14283b,#0b1020_70%)] p-10 md:flex">
          <div className="absolute -right-20 top-20 size-72 rounded-full border border-cyan-100/10 shadow-[0_0_100px_rgba(34,211,238,.12)]" />
          <Link href="/" className="relative text-xs font-black uppercase tracking-[.24em]">SKY VIEW <span className="font-light text-white/45">STORE</span></Link>
          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-[.28em] text-cyan-200">Your world, in one place</p>
            <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-[-.06em]">A smarter way<br />to shop.</h1>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/50">Sign in to manage your account and keep your shopping journey connected.</p>
          </div>
          <p className="relative text-[9px] uppercase tracking-[.2em] text-white/30">SKY VIEW STORE / CUSTOMER ACCESS</p>
        </section>
        <section className="p-6 sm:p-10 md:p-12">
          <Link href="/" className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-200 md:hidden">← Sky View Store</Link>
          <p className="mt-7 text-[9px] font-bold uppercase tracking-[.25em] text-cyan-200 md:mt-2">Customer account</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-.045em]">{mode === "login" ? "Welcome back." : "Create your account."}</h2>
          <p className="mt-3 text-sm leading-6 text-white/45">{mode === "login" ? "Sign in with your email and password to continue." : "Join Sky View Store with a secure customer account."}</p>
          <form onSubmit={submit} className="mt-9 space-y-5">
            <label className="block text-xs font-medium text-white/70">Email address
              <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-white/[.04] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-200/70 focus:ring-2 focus:ring-cyan-200/10" placeholder="you@example.com" />
            </label>
            <label className="block text-xs font-medium text-white/70">Password
              <input required minLength={8} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-white/[.04] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-200/70 focus:ring-2 focus:ring-cyan-200/10" placeholder="At least 8 characters" />
            </label>
            {mode === "register" ? <label className="block text-xs font-medium text-white/70">Confirm password
              <input required minLength={8} type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-white/[.04] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-200/70 focus:ring-2 focus:ring-cyan-200/10" placeholder="Enter your password again" />
            </label> : null}
            {message ? <p role="alert" className="rounded-xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-xs leading-5 text-rose-100">{message}</p> : null}
            <button disabled={busy} type="submit" className="flex w-full items-center justify-center rounded-xl bg-cyan-200 px-5 py-4 text-xs font-extrabold uppercase tracking-[.17em] text-[#07111a] transition hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"} <span className="ml-2">↗</span></button>
          </form>
          <div className="mt-7">
            <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[.2em] text-white/25">
              <span className="h-px flex-1 bg-white/10" />
              or continue with
              <span className="h-px flex-1 bg-white/10" />
            </div>
            {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
              <GoogleSignInButton
                clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
                redirectTo={redirectTo}
              />
            ) : (
              <p className="mt-4 text-center text-[10px] leading-5 text-white/35">
                Google sign-in will appear once the store's Google client ID is configured.
              </p>
            )}
          </div>
          <p className="mt-7 text-center text-xs text-white/45">{mode === "login" ? "New to Sky View Store?" : "Already have an account?"} <Link className="font-semibold text-cyan-200 hover:text-white" href={`${mode === "login" ? "/account/register" : "/account/login"}${requestedNext ? `?next=${encodeURIComponent(redirectTo)}` : ""}`}>{mode === "login" ? "Create account" : "Sign in"}</Link></p>
          <p className="mt-8 text-center text-[10px] leading-5 text-white/25">Your account is for customer shopping features. Payments on this site remain demo-only.</p>
        </section>
      </div>
    </main>
  );
}
