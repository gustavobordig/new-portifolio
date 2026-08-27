"use client";

import Image from "next/image";
import Link from "next/link";

import type { ProjectDownload } from "@/i18n/types";
import { trackEvent } from "@/lib/analytics/client";

type ProjectCardProps = {
  src: string;
  title: string;
  description: string;
  downloads: ProjectDownload[];
  downloadIosLabel: string;
  downloadMacosLabel: string;
};

const AppleIcon = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    className="h-4 w-4 shrink-0 fill-current"
  >
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

export const ProjectCard = ({
  src,
  title,
  description,
  downloads,
  downloadIosLabel,
  downloadMacosLabel,
}: ProjectCardProps) => {
  return (
    <div className="group relative flex h-full w-full flex-col items-center overflow-hidden rounded-xl border border-[#2A0E61] bg-[#0c0420]/60 px-6 pb-6 pt-8 text-center shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#7042f88b]">
      <Image
        src={src}
        alt={title}
        width={112}
        height={112}
        className="h-28 w-28 rounded-3xl object-cover shadow-lg shadow-purple-900/40 ring-1 ring-white/10"
      />

      <h1 className="mt-6 text-xl font-semibold tracking-tight text-white">
        {title}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-gray-400">
        {description}
      </p>

      <div className="mt-auto flex flex-wrap justify-center gap-2.5 pt-6">
        {downloads.map((download) => {
          const label =
            download.platform === "ios"
              ? downloadIosLabel
              : downloadMacosLabel;

          return (
            <Link
              key={download.url}
              href={download.url}
              target="_blank"
              rel="noreferrer noopener"
              onClick={() =>
                trackEvent("download_click", `${title} · ${download.platform}`)
              }
              className="button-primary inline-flex items-center gap-2 rounded-lg border border-[#7042f88b] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <AppleIcon />
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
