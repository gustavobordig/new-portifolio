"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { trackDuration, trackPageView } from "@/lib/analytics/client";

/**
 * Records one page view per route and reports how long the visitor stayed.
 * Time spent hidden (another tab) is not counted.
 */
export const AnalyticsTracker = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    trackPageView(pathname);

    let visibleSince = document.visibilityState === "visible" ? Date.now() : 0;
    let elapsed = 0;
    let reported = false;

    const accumulate = () => {
      if (!visibleSince) return;
      elapsed += Date.now() - visibleSince;
      visibleSince = 0;
    };

    const report = () => {
      accumulate();
      if (reported || elapsed < 1_000) return;
      reported = true;
      trackDuration(pathname, elapsed);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        visibleSince = Date.now();
      } else {
        report();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", report);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", report);
      report();
    };
  }, [pathname]);

  return null;
};
