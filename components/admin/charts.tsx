"use client";

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { Point, Slice } from "@/lib/analytics/types";

const nf = new Intl.NumberFormat("pt-BR");

export const formatCount = (value: number) =>
  value >= 10_000 ? `${nf.format(Math.round(value / 100) / 10)}K` : nf.format(value);

export const formatDuration = (ms: number) => {
  if (!ms) return "—";
  const total = Math.round(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return minutes ? `${minutes}m ${seconds}s` : `${seconds}s`;
};

/** Measures the rendered width so the chart can use real pixels, not a scaled viewBox. */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width)
    );
    observer.observe(node);
    setWidth(node.getBoundingClientRect().width);

    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

export const Panel = ({
  title,
  subtitle,
  action,
  className = "",
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) => (
  <section
    className={`rounded-2xl border border-[var(--border-1)] bg-[var(--surface-1)] p-5 ${className}`}
  >
    <header className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-xs text-[var(--text-muted)]">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </header>
    {children}
  </section>
);

export const StatTile = ({
  label,
  value,
  delta,
  hero = false,
}: {
  label: string;
  value: string;
  delta?: number | null;
  hero?: boolean;
}) => {
  const showDelta = delta != null && Number.isFinite(delta);
  const up = showDelta && delta > 0;
  const flat = showDelta && Math.abs(delta) < 0.005;

  return (
    <div className="rounded-2xl border border-[var(--border-1)] bg-[var(--surface-1)] p-5">
      <p className="text-xs text-[var(--text-secondary)]">{label}</p>
      <p
        className={`mt-2 font-semibold text-[var(--text-primary)] ${
          hero ? "text-5xl" : "text-3xl"
        }`}
      >
        {value}
      </p>
      {showDelta ? (
        <p
          className="mt-2 text-xs"
          style={{
            color: flat
              ? "var(--text-muted)"
              : up
                ? "var(--good)"
                : "var(--critical)",
          }}
        >
          {flat ? "≈ estável" : `${up ? "▲" : "▼"} ${Math.abs(delta * 100).toFixed(0)}%`}
          <span className="text-[var(--text-muted)]"> vs. período anterior</span>
        </p>
      ) : (
        <p className="mt-2 text-xs text-[var(--text-muted)]">sem base de comparação</p>
      )}
    </div>
  );
};

const SERIES = [
  { key: "views" as const, name: "Visualizações", color: "var(--series-1)" },
  { key: "visitors" as const, name: "Visitantes", color: "var(--series-2)" },
];

export const TrendChart = ({
  points,
  granularity,
}: {
  points: Point[];
  granularity: "hour" | "day";
}) => {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);

  const height = 260;
  const narrow = width < 520;
  const pad = { top: 16, right: narrow ? 40 : 64, bottom: 28, left: narrow ? 34 : 44 };
  const plotW = Math.max(width - pad.left - pad.right, 10);
  const plotH = height - pad.top - pad.bottom;

  const formatBucket = useCallback(
    (bucket: string, long = false) => {
      const date = new Date(granularity === "hour" ? `${bucket}:00Z` : `${bucket}T00:00:00Z`);
      return granularity === "hour"
        ? new Intl.DateTimeFormat("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "UTC",
          }).format(date)
        : new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: long ? "long" : "2-digit",
            timeZone: "UTC",
          }).format(date);
    },
    [granularity]
  );

  const { max, ticks } = useMemo(() => {
    const peak = Math.max(1, ...points.map((p) => Math.max(p.views, p.visitors)));
    const step = Math.max(1, Math.ceil(peak / 4));
    const rounded = step * 4;
    return {
      max: rounded,
      ticks: [0, 1, 2, 3, 4].map((i) => i * step),
    };
  }, [points]);

  const x = (index: number) =>
    pad.left + (points.length <= 1 ? plotW / 2 : (index / (points.length - 1)) * plotW);
  const y = (value: number) => pad.top + plotH - (value / max) * plotH;

  const path = (key: "views" | "visitors") =>
    points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p[key])}`).join(" ");

  const areaPath = (key: "views" | "visitors") =>
    points.length
      ? `${path(key)} L${x(points.length - 1)},${pad.top + plotH} L${x(0)},${pad.top + plotH} Z`
      : "";

  // Pointer events so a touch drag reads the same as a mouse hover.
  const onMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!points.length) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left - pad.left) / plotW;
    const index = Math.round(ratio * (points.length - 1));
    setActive(Math.min(Math.max(index, 0), points.length - 1));
  };

  // Space the printed labels by available width so they never collide.
  const labelEvery = Math.max(
    1,
    Math.ceil(points.length / Math.max(2, Math.floor(plotW / 72)))
  );
  // Quando os dois valores finais quase coincidem, os rótulos são afastados até
  // uma folga mínima e ganham uma linha-guia até o próprio ponto — empilhá-los
  // sem guia os desconectaria das linhas.
  const endLabels = (() => {
    if (!points.length) return [];

    const last = points[points.length - 1];
    const cx = x(points.length - 1);
    const base = SERIES.map((series) => ({
      key: series.key,
      color: series.color,
      value: last[series.key],
      cx,
      cy: y(last[series.key]),
    }));

    const [a, b] = [...base].sort((one, two) => one.cy - two.cy);
    const gap = b.cy - a.cy;
    const MIN_GAP = 18; // altura do texto (15px) + folga
    const shift = gap < MIN_GAP ? (MIN_GAP - gap) / 2 : 0;

    return [
      { ...a, labelY: a.cy - shift + 4, nudged: shift > 0 },
      { ...b, labelY: b.cy + shift + 4, nudged: shift > 0 },
    ];
  })();

  const hovered = active != null ? points[active] : null;
  const tooltipRight = active != null && x(active) > pad.left + plotW * 0.6;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-4">
        {SERIES.map((series) => (
          <span
            key={series.key}
            className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"
          >
            <span
              aria-hidden
              className="h-[3px] w-4 rounded-full"
              style={{ background: series.color }}
            />
            {series.name}
          </span>
        ))}
      </div>

      <div ref={ref} className="relative">
        {width > 0 ? (
          <svg
            width={width}
            height={height}
            role="img"
            aria-label="Visualizações e visitantes ao longo do período"
            onPointerMove={onMove}
            onPointerDown={onMove}
            onPointerLeave={() => setActive(null)}
            style={{ touchAction: "pan-y" }}
          >
            {ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={pad.left}
                  x2={pad.left + plotW}
                  y1={y(tick)}
                  y2={y(tick)}
                  stroke="var(--grid)"
                  strokeWidth={1}
                />
                <text
                  x={pad.left - (narrow ? 6 : 10)}
                  y={y(tick) + 4}
                  textAnchor="end"
                  fontSize={11}
                  fill="var(--text-muted)"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {nf.format(tick)}
                </text>
              </g>
            ))}

            {points.map((point, index) =>
              index % labelEvery === 0 ? (
                <text
                  key={point.bucket}
                  x={x(index)}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize={11}
                  fill="var(--text-muted)"
                >
                  {formatBucket(point.bucket)}
                </text>
              ) : null
            )}

            {SERIES.map((series) => (
              <path
                key={`area-${series.key}`}
                d={areaPath(series.key)}
                fill={series.color}
                opacity={0.1}
              />
            ))}

            {SERIES.map((series) => (
              <path
                key={series.key}
                d={path(series.key)}
                fill="none"
                stroke={series.color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {endLabels.map((end) => (
              <g key={`end-${end.key}`}>
                <circle
                  cx={end.cx}
                  cy={end.cy}
                  r={4}
                  fill={end.color}
                  stroke="var(--surface-1)"
                  strokeWidth={2}
                />
                {end.nudged ? (
                  <line
                    x1={end.cx + 5}
                    y1={end.cy}
                    x2={end.cx + 9}
                    y2={end.labelY - 4}
                    stroke="var(--grid)"
                    strokeWidth={1}
                  />
                ) : null}
                <text
                  x={end.cx + 10}
                  y={end.labelY}
                  fontSize={12}
                  fill="var(--text-secondary)"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {nf.format(end.value)}
                </text>
              </g>
            ))}

            {active != null ? (
              <g>
                <line
                  x1={x(active)}
                  x2={x(active)}
                  y1={pad.top}
                  y2={pad.top + plotH}
                  stroke="var(--text-muted)"
                  strokeWidth={1}
                />
                {SERIES.map((series) => (
                  <circle
                    key={`hover-${series.key}`}
                    cx={x(active)}
                    cy={y(points[active][series.key])}
                    r={4}
                    fill={series.color}
                    stroke="var(--surface-1)"
                    strokeWidth={2}
                  />
                ))}
              </g>
            ) : null}
          </svg>
        ) : (
          <div style={{ height }} />
        )}

        {hovered ? (
          <div
            className="pointer-events-none absolute top-2 rounded-lg border border-[var(--border-1)] bg-[var(--surface-2)] px-3 py-2 text-xs shadow-lg"
            style={{
              left: tooltipRight ? undefined : x(active!) + 12,
              right: tooltipRight ? width - x(active!) + 12 : undefined,
            }}
          >
            <p className="mb-1 font-medium text-[var(--text-primary)]">
              {formatBucket(hovered.bucket, true)}
            </p>
            {SERIES.map((series) => (
              <p
                key={series.key}
                className="flex items-center gap-2 text-[var(--text-secondary)]"
              >
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-full"
                  style={{ background: series.color }}
                />
                {series.name}:{" "}
                <span
                  className="text-[var(--text-primary)]"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {nf.format(hovered[series.key])}
                </span>
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export const BarList = ({
  data,
  empty,
  renderLabel,
}: {
  data: Slice[];
  empty: string;
  renderLabel?: (label: string) => React.ReactNode;
}) => {
  if (!data.length) {
    return <p className="py-6 text-center text-xs text-[var(--text-muted)]">{empty}</p>;
  }

  const max = Math.max(...data.map((item) => item.value));
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <ul className="flex flex-col gap-3">
      {data.map((item) => (
        <li key={item.label} className="group">
          <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
            <span className="truncate text-[var(--text-secondary)]">
              {renderLabel ? renderLabel(item.label) : item.label}
            </span>
            <span
              className="shrink-0 text-[var(--text-primary)]"
              style={{ fontVariantNumeric: "tabular-nums" }}
              title={`${item.value} de ${total} (${((item.value / total) * 100).toFixed(1)}%)`}
            >
              {nf.format(item.value)}
            </span>
          </div>
          <div className="h-2 w-full rounded-sm bg-[var(--surface-2)]">
            <div
              className="h-2 transition-[width] duration-300"
              style={{
                width: `${Math.max((item.value / max) * 100, 2)}%`,
                background: "var(--series-1)",
                borderRadius: "0 4px 4px 0",
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
};
