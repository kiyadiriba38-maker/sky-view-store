"use client";

import { NextIntlClientProvider } from "next-intl";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import type { ReactNode } from "react";

import en from "@/lib/intl/en.json";
import am from "@/lib/intl/am.json";
import om from "@/lib/intl/om.json";

export type StoreLocale = "en" | "am" | "om";
type LocaleContextValue = { locale: StoreLocale; setLocale: (locale: StoreLocale) => void };
const LocaleContext = createContext<LocaleContextValue | null>(null);

const mergeMessages = (base: Record<string, unknown>, additions: Record<string, unknown>): Record<string, unknown> => {
  const result = { ...base };
  for (const [key, value] of Object.entries(additions)) {
    const current = result[key];
    result[key] = value && typeof value === "object" && !Array.isArray(value) && current && typeof current === "object" && !Array.isArray(current)
      ? mergeMessages(current as Record<string, unknown>, value as Record<string, unknown>)
      : value;
  }
  return result;
};

export const useStoreLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useStoreLocale must be used inside IntlProvider");
  return context;
};

export const IntlProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<StoreLocale>("en");
  const [ready, setReady] = useState(false);
  const setLocale = (next: StoreLocale) => setLocaleState(next);

  useEffect(() => {
    const saved = window.localStorage.getItem("sv-language");
    if (saved === "en" || saved === "am" || saved === "om") setLocaleState(saved);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem("sv-language", locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = "ltr";
  }, [locale, ready]);

  const messages = useMemo(() => mergeMessages(en as Record<string, unknown>, locale === "am" ? am as Record<string, unknown> : locale === "om" ? om as Record<string, unknown> : {}), [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages as never}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
};
