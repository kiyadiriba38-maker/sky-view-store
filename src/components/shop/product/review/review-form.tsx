"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import type { Review } from "@/payload-types";

import GenericForm from "@/components/shared/generic-form";
import { Button } from "@/components/ui";
import { reviewFormConfig, type ReviewFormData } from "@/lib/core/types/form";
import { postJson } from "@/lib/core/util";

export default function ReviewFormClient({ productId }: { productId: number }) {
  const router = useRouter();
  const t = useTranslations("review_form");
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
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

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const submitReview = useCallback(
    async (data: ReviewFormData) => {
      await postJson<Review>("reviews?depth=0", {
        ...data,
        product: productId,
      });
    },
    [productId],
  );

  return (
    <>
      <div className="flex justify-center">
        {authStatus === "signed-in" ? (
          <Button
            eventName="open_review_dialog"
            type="button"
            onClick={() => setIsOpen(true)}
          >
            {t("open_button")}
          </Button>
        ) : authStatus === "loading" ? (
          <Button type="button" disabled>{t("open_button")}</Button>
        ) : (
          <Link
            href={`/account/login?next=${encodeURIComponent(pathname)}`}
            className="inline-flex items-center justify-center rounded-full border border-amber-300/35 px-5 py-3 text-xs font-semibold text-amber-100 transition hover:bg-amber-300/10"
          >
            Sign in to write a review
          </Link>
        )}
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label={t("close_aria")}
            onClick={close}
          />

          <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-background text-foreground shadow-2xl max-h-[calc(100dvh-2rem)] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <div className="text-lg font-semibold">{t("title")}</div>
                <div className="text-sm text-foreground/70">
                  {t("subtitle")}
                </div>
              </div>

              <Button
                variant="secondary"
                onClick={close}
                aria-label={t("close_aria")}
              >
                {t("close_button")}
              </Button>
            </div>

            <GenericForm
              config={reviewFormConfig}
              onSubmit={submitReview}
              onSuccess={() => {
                close();
                setTimeout(() => router.refresh(), 500);
              }}
              onCancel={close}
              disabled={!productId}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
