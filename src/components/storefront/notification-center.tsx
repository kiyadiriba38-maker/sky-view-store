"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { useStoreLocale } from "@/lib/providers/intl";

type NotificationItem = {
  id: number | string;
  type: string;
  title: string;
  message?: string | null;
  href?: string | null;
  read?: boolean;
  createdAt?: string;
};

export default function NotificationCenter() {
  const t = useTranslations("notifications");
  const { locale } = useStoreLocale();
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/notifications/mine", {
        credentials: "include",
        cache: "no-store",
      });
      if (response.status === 401) {
        router.replace("/account/login?next=%2Faccount%2Fnotifications");
        return;
      }
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.message || t("error"));
      setItems(Array.isArray(result?.docs) ? result.docs : []);
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }, [router, t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function markRead(id: number | string) {
    const response = await fetch(`/api/notifications/${encodeURIComponent(String(id))}/read`, {
      method: "POST",
      credentials: "include",
    });
    if (response.ok) {
      setItems((current) => current.map((item) => String(item.id) === String(id) ? { ...item, read: true } : item));
    }
  }

  async function markAllRead() {
    const response = await fetch("/api/notifications/read-all", {
      method: "POST",
      credentials: "include",
    });
    if (response.ok) setItems((current) => current.map((item) => ({ ...item, read: true })));
  }

  const dateLocale = locale === "am" ? "am-ET" : locale === "om" ? "om-ET" : "en-ET";

  return (
    <main className="sv-page min-h-[75vh] bg-[#070b12] px-4 py-12 text-white sm:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/account" className="text-xs text-cyan-200 hover:text-white">← {t("back")}</Link>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.25em] text-cyan-200">Sky View / Account</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">{t("title")}</h1>
            <p className="mt-3 text-sm text-white/50">{t("description")}</p>
          </div>
          {items.some((item) => !item.read) ? (
            <button type="button" onClick={() => void markAllRead()} className="rounded-full border border-cyan-200/30 px-4 py-2.5 text-xs font-semibold text-cyan-100 hover:bg-cyan-200/10">{t("markAll")}</button>
          ) : null}
        </div>
        {loading ? <p className="mt-8 text-sm text-white/50">{t("loading")}</p> : error ? (
          <p role="alert" className="mt-8 rounded-xl border border-amber-300/20 bg-amber-300/5 p-5 text-sm text-amber-100">{error}</p>
        ) : items.length ? (
          <div className="mt-8 space-y-3">
            {items.map((item) => {
              const href = item.href && item.href.startsWith("/") && !item.href.startsWith("//") ? item.href : "/account";
              return (
                <article key={item.id} className={`rounded-2xl border p-5 transition ${item.read ? "border-white/10 bg-[#101a28]" : "border-cyan-200/30 bg-cyan-200/[.06]"}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold">{item.title}</h2>
                        <span className={`rounded-full px-2 py-1 text-[8px] font-bold uppercase tracking-wider ${item.read ? "bg-white/10 text-white/45" : "bg-cyan-200/15 text-cyan-100"}`}>{item.read ? t("read") : t("unread")}</span>
                      </div>
                      {item.message ? <p className="mt-2 text-xs leading-6 text-white/55">{item.message}</p> : null}
                      {item.createdAt ? <time className="mt-3 block text-[10px] text-white/35">{new Intl.DateTimeFormat(dateLocale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}</time> : null}
                    </div>
                    <div className="flex items-center gap-2">
                      {!item.read ? <button type="button" onClick={() => void markRead(item.id)} className="rounded-full border border-white/15 px-3 py-2 text-[9px] font-semibold text-white/65 hover:border-cyan-200/40">{t("read")}</button> : null}
                      <button type="button" onClick={async () => { if (!item.read) await markRead(item.id); router.push(href); }} className="rounded-full bg-cyan-200 px-4 py-2 text-[9px] font-bold text-[#07111a]">{t("open")}</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : <div className="mt-8 rounded-2xl border border-dashed border-white/15 p-12 text-center text-sm text-white/50">{t("empty")}</div>}
      </div>
    </main>
  );
}
