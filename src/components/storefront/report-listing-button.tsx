"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function ReportListingButton({
  productId,
  productSlug,
}: {
  productId: number | string;
  productSlug: string;
}) {
  const t = useTranslations("reports");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("misleading_listing");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<"success" | "error" | "">("");

  async function submitReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "product",
          targetProduct: productId,
          reason,
          description: description.trim(),
        }),
      });
      if (response.status === 401) {
        router.push(`/account/login?next=${encodeURIComponent(`/product/${productSlug}`)}`);
        return;
      }
      if (!response.ok) throw new Error("report_failed");
      setMessage("success");
      setDescription("");
      setOpen(false);
    } catch {
      setMessage("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-white/10 bg-[#0c1420] p-4 text-white">
      <button type="button" onClick={() => { setOpen((value) => !value); setMessage(""); }} className="text-xs font-semibold text-white/55 underline decoration-white/20 underline-offset-4 hover:text-cyan-100">
        {t("button")}
      </button>
      {message === "success" ? <p role="status" className="mt-3 text-xs text-emerald-200">{t("success")}</p> : null}
      {message === "error" ? <p role="alert" className="mt-3 text-xs text-amber-200">{t("error")}</p> : null}
      {open ? (
        <form onSubmit={submitReport} className="mt-4 space-y-3">
          <div>
            <h3 className="text-sm font-semibold">{t("title")}</h3>
            <p className="mt-1 text-xs leading-5 text-white/45">{t("description")}</p>
          </div>
          <label className="block text-xs text-white/65">
            {t("reason")}
            <select value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-[#101a28] px-3 py-3 text-xs text-white">
              <option value="misleading_listing">{t("misleading")}</option>
              <option value="counterfeit_concern">{t("counterfeit")}</option>
              <option value="unsafe_content">{t("unsafe")}</option>
              <option value="seller_conduct">{t("seller")}</option>
              <option value="review_abuse">{t("review")}</option>
              <option value="other">{t("other")}</option>
            </select>
          </label>
          <label className="block text-xs text-white/65">
            {t("details")}
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={2000} required rows={4} placeholder={t("detailsPlaceholder")} className="mt-2 w-full resize-y rounded-xl border border-white/15 bg-[#101a28] px-3 py-3 text-xs text-white placeholder:text-white/30" />
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={submitting || !description.trim()} className="rounded-full bg-cyan-200 px-4 py-2.5 text-[10px] font-bold text-[#07111a] disabled:opacity-50">{submitting ? "…" : t("submit")}</button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-white/15 px-4 py-2.5 text-[10px] font-semibold text-white/65">{t("cancel")}</button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
