'use client';
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { LanguageSwitcher } from "@/components/sub/language-switcher";
import { NAV_LINKS, SOCIALS } from "@/constants";
import { useLanguage } from "@/i18n/language-context";

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="w-full h-[65px] fixed top-0 shadow-lg shadow-[#2A0E61]/50 bg-[#03001427] backdrop-blur-md z-50 px-10">
      <div className="relative w-full h-full flex items-center justify-between m-auto px-[10px]">
        <Link
          href="#about-me"
          className="flex items-center z-10"
        >
          <Image
            src="/profile.png"
            alt="Gustavo Bordignon"
            width={48}
            height={48}
            draggable={false}
            className="cursor-pointer rounded-full object-cover"
          />
          <div className="hidden md:flex font-bold ml-[10px] text-gray-300">
            Gustavo Bordignon
          </div>
        </Link>

        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center justify-center gap-6 border-[rgba(112,66,248,0.38)] bg-[rgba(3,0,20,0.37)] px-[24px] py-[10px] rounded-full text-gray-200 whitespace-nowrap">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.titleKey}
                href={link.link}
                className="cursor-pointer hover:text-[rgb(112,66,248)] transition"
              >
                {t.nav[link.titleKey]}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden md:flex flex-row items-center gap-5 z-10">
          <LanguageSwitcher />
          {SOCIALS.map(({ link, name, icon: Icon }) => (
            <Link
              href={link}
              target="_blank"
              rel="noreferrer noopener"
              key={name}
            >
              <Icon className="h-6 w-6 text-white" />
            </Link>
          ))}
        </div>

        <div className="flex md:hidden items-center gap-4">
          <LanguageSwitcher />
          <button
            className="text-white focus:outline-none text-4xl"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            ☰
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-[65px] left-0 w-full bg-[#030014] p-5 flex flex-col items-center text-gray-300 md:hidden">
          <div className="flex flex-col items-center gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.titleKey}
                href={link.link}
                className="cursor-pointer hover:text-[rgb(112,66,248)] transition text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t.nav[link.titleKey]}
              </Link>
            ))}
          </div>

          <div className="flex justify-center gap-6 mt-6">
            {SOCIALS.map(({ link, name, icon: Icon }) => (
              <Link
                href={link}
                target="_blank"
                rel="noreferrer noopener"
                key={name}
              >
                <Icon className="h-8 w-8 text-white" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
