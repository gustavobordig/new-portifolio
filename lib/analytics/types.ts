/**
 * Shared shapes for the analytics dashboard. Kept free of server-only imports
 * so client components can use them without pulling libSQL into the bundle.
 */
export const RANGES = {
  "24h": { label: "24 horas", ms: 24 * 60 * 60 * 1000 },
  "7d": { label: "7 dias", ms: 7 * 24 * 60 * 60 * 1000 },
  "30d": { label: "30 dias", ms: 30 * 24 * 60 * 60 * 1000 },
  "90d": { label: "90 dias", ms: 90 * 24 * 60 * 60 * 1000 },
  all: { label: "Tudo", ms: null },
} as const;

export type RangeKey = keyof typeof RANGES;

export const isRangeKey = (value: string): value is RangeKey => value in RANGES;

export type Slice = { label: string; value: number };
export type Point = { bucket: string; views: number; visitors: number };

export type Totals = {
  views: number;
  visitors: number;
  sessions: number;
  avgDurationMs: number;
};

export type Stats = {
  range: RangeKey;
  granularity: "hour" | "day";
  totals: Totals;
  previous: Totals | null;
  series: Point[];
  referrers: Slice[];
  countries: Slice[];
  devices: Slice[];
  browsers: Slice[];
  events: Slice[];
  recent: {
    ts: number;
    path: string;
    country: string | null;
    city: string | null;
    device: string | null;
    browser: string | null;
    referrer: string | null;
  }[];
};
