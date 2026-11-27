"use client";

import { useStoreLocale, type StoreLocale } from "@/lib/providers/intl";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useStoreLocale();
  return (
    <label className="inline-flex items-center gap-2 rounded-full border border-current/15 px-3 py-2 text-[10px] font-semibold">
      <span className="sr-only">Language</span>
      <select
        aria-label="Choose language"
        value={locale}
        onChange={(event) => setLocale(event.target.value as StoreLocale)}
        className="max-w-[7rem] bg-transparent outline-none"
      >
        <option value="en">English</option>
        <option value="am">አማርኛ</option>
        <option value="om">Afaan Oromo</option>
      </select>
    </label>
  );
}
