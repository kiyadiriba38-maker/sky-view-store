"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CurrentUser = { email?: string; roles?: string[] } | null;

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/users/me", { credentials: "include", cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Sign in required");
        const data = await response.json();
        if (active) setUser(data?.user ?? null);
      })
      .catch(() => {
        if (active) router.replace("/account/login");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [router]);

  async function signOut() {
    await fetch("/api/users/logout", { method: "POST", credentials: "include" });
    router.replace("/");
    router.refresh();
  }

  return (
    <main className="sv-page min-h-[70vh] bg-[#070b12] px-4 py-14 text-white sm:px-6">
      <div className="mx-auto max-w-4xl rounded-[28px] border border-white/10 bg-[#0d1724] p-7 sm:p-12">
        <p className="text-[9px] font-bold uppercase tracking-[.25em] text-cyan-200">Sky View / My account</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-.05em]">Your account.</h1>
        {loading ? <p className="mt-8 text-sm text-white/50">Loading your account…</p> : user ? (
          <>
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[.035] p-6">
              <p className="text-[9px] uppercase tracking-[.2em] text-white/35">Signed in as</p>
              <p className="mt-2 break-all text-lg font-semibold">{user.email}</p>
              <p className="mt-2 text-xs text-white/40">Customer account</p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link href="/seller/apply" className="rounded-xl border border-cyan-200/30 bg-cyan-200/10 p-5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-200/15">Continue shopping ↗</Link>
              <Link href="/cart" className="rounded-xl border border-white/10 bg-white/[.03] p-5 text-sm font-semibold text-white/80 transition hover:border-cyan-200/30">View your cart ↗</Link>
            </div>
            <button onClick={signOut} className="mt-8 rounded-full border border-white/15 px-5 py-3 text-[10px] font-bold uppercase tracking-[.17em] text-white/60 transition hover:border-rose-200/40 hover:text-rose-100">Sign out</button>
          </>
        ) : <p className="mt-8 text-sm text-white/50">Redirecting to sign in…</p>}
      </div>
    </main>
  );
}
