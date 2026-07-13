"use client";

import { useLanguage } from "@/i18n/language-context";
import type { Locale } from "@/i18n/types";
import { cn } from "@/lib/utils";

const FLAGS: { locale: Locale; label: string; flag: string }[] = [
  { locale: "en", label: "English", flag: "🇺🇸" },
  { locale: "pt", label: "Português (Brasil)", flag: "🇧🇷" },
];

export const LanguageSwitcher = () => {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className="flex items-center gap-2"
      role="group"
      aria-label="Language"
    >
      {FLAGS.map(({ locale: flagLocale, label, flag }) => {
        const isActive = locale === flagLocale;

        return (
          <button
            key={flagLocale}
            type="button"
            onClick={() => setLocale(flagLocale)}
            aria-label={label}
            aria-pressed={isActive}
            title={label}
            className={cn(
              "text-xl leading-none transition opacity-50 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-sm",
              isActive && "opacity-100 scale-110"
            )}
          >
            <span aria-hidden>{flag}</span>
          </button>
        );
      })}
    </div>
  );
};
