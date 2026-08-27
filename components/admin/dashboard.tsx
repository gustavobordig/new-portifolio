"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  BarList,
  Panel,
  StatTile,
  TrendChart,
  formatCount,
  formatDuration,
} from "@/components/admin/charts";
import { RANGES, type RangeKey, type Stats } from "@/lib/analytics/types";

const RANGE_KEYS = Object.keys(RANGES) as RangeKey[];

const regionNames = new Intl.DisplayNames(["pt-BR"], { type: "region" });

const countryLabel = (code: string) => {
  const flag = /^[A-Z]{2}$/.test(code)
    ? String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0)))
    : "";

  try {
    return `${flag} ${regionNames.of(code) ?? code}`.trim();
  } catch {
    return code;
  }
};

const DEVICE_LABELS: Record<string, string> = {
  desktop: "Desktop",
  mobile: "Celular",
  tablet: "Tablet",
};

const delta = (current: number, previous: number | undefined) => {
  if (previous == null) return null;
  if (previous === 0) return current === 0 ? 0 : null;
  return (current - previous) / previous;
};

export const Dashboard = () => {
  const router = useRouter();
  const [range, setRange] = useState<RangeKey>("7d");
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTable, setShowTable] = useState(false);

  const load = useCallback(
    async (key: RangeKey) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/admin/stats?range=${key}`, {
          cache: "no-store",
        });

        if (response.status === 401) {
          router.replace("/admin");
          return;
        }

        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "Erro ao carregar.");

        setStats(body as Stats);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Erro ao carregar.");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    void load(range);
  }, [load, range]);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin");
    router.refresh();
  };

  const totals = stats?.totals;
  const previous = stats?.previous ?? undefined;

  return (
    <div className="admin-root min-h-screen bg-[var(--admin-bg)]">
      <div className="mx-auto w-full max-w-6xl px-5 py-10">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Área de adm
          </h1>

          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-[var(--border-1)] px-4 py-2 text-xs text-[var(--text-secondary)] transition hover:border-[var(--series-1)] hover:text-[var(--text-primary)]"
          >
            Sair
          </button>
        </header>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          {RANGE_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setRange(key)}
              aria-pressed={range === key}
              className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                range === key
                  ? "border-[var(--series-1)] bg-[var(--series-1)]/15 text-[var(--text-primary)]"
                  : "border-[var(--border-1)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
              }`}
            >
              {RANGES[key].label}
            </button>
          ))}

          {loading ? (
            <span className="ml-2 text-xs text-[var(--text-muted)]">carregando…</span>
          ) : null}
        </div>

        {error ? (
          <p
            role="alert"
            className="mb-6 rounded-xl border border-[var(--critical)]/40 bg-[var(--critical)]/10 px-4 py-3 text-sm text-[var(--text-primary)]"
          >
            {error}
          </p>
        ) : null}

        {totals ? (
          <>
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatTile
                hero
                label="Visualizações"
                value={formatCount(totals.views)}
                delta={delta(totals.views, previous?.views)}
              />
              <StatTile
                label="Visitantes únicos"
                value={formatCount(totals.visitors)}
                delta={delta(totals.visitors, previous?.visitors)}
              />
              <StatTile
                label="Tempo médio na página"
                value={formatDuration(totals.avgDurationMs)}
                delta={delta(totals.avgDurationMs, previous?.avgDurationMs)}
              />
            </div>

            <div className="mb-6">
              <Panel
                title="Tráfego no período"
                subtitle={
                  stats?.granularity === "hour" ? "Por hora (UTC)" : "Por dia (UTC)"
                }
                action={
                  <button
                    type="button"
                    onClick={() => setShowTable((value) => !value)}
                    className="rounded-lg border border-[var(--border-1)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                  >
                    {showTable ? "Ver gráfico" : "Ver tabela"}
                  </button>
                }
              >
                {showTable ? (
                  <div className="max-h-72 overflow-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0 bg-[var(--surface-1)] text-[var(--text-muted)]">
                        <tr>
                          <th className="py-2 pr-4 font-medium">Período</th>
                          <th className="py-2 pr-4 font-medium">Visualizações</th>
                          <th className="py-2 font-medium">Visitantes</th>
                        </tr>
                      </thead>
                      <tbody
                        className="text-[var(--text-secondary)]"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {stats!.series.map((point) => (
                          <tr key={point.bucket} className="border-t border-[var(--border-1)]">
                            <td className="py-2 pr-4">{point.bucket}</td>
                            <td className="py-2 pr-4">{point.views}</td>
                            <td className="py-2">{point.visitors}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <TrendChart
                    points={stats!.series}
                    granularity={stats!.granularity}
                  />
                )}
              </Panel>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Panel title="Origem do tráfego" subtitle="Sites que levaram até você">
                <BarList
                  data={stats!.referrers}
                  empty="Todo o tráfego chegou direto (sem referenciador)."
                />
              </Panel>

              <Panel title="Países">
                <BarList
                  data={stats!.countries}
                  empty="Sem dados de país (a geolocalização só aparece em produção na Vercel)."
                  renderLabel={countryLabel}
                />
              </Panel>

              <Panel title="Dispositivos">
                <BarList
                  data={stats!.devices}
                  empty="Sem dados."
                  renderLabel={(label) => DEVICE_LABELS[label] ?? label}
                />
              </Panel>

              <Panel title="Navegadores">
                <BarList data={stats!.browsers} empty="Sem dados." />
              </Panel>

              <Panel
                title="Cliques"
                subtitle="Projetos e links em que clicaram"
                className="lg:col-span-2"
              >
                <BarList
                  data={stats!.events}
                  empty="Nenhum clique registrado ainda."
                />
              </Panel>
            </div>

            <Panel title="Visitas recentes" subtitle="Últimas 15, independente do período">
              {stats!.recent.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-xs">
                    <thead className="text-[var(--text-muted)]">
                      <tr>
                        <th className="py-2 pr-4 font-medium">Quando</th>
                        <th className="py-2 pr-4 font-medium">Página</th>
                        <th className="py-2 pr-4 font-medium">Local</th>
                        <th className="py-2 pr-4 font-medium">Dispositivo</th>
                        <th className="py-2 font-medium">Origem</th>
                      </tr>
                    </thead>
                    <tbody className="text-[var(--text-secondary)]">
                      {stats!.recent.map((visit, index) => (
                        <tr
                          key={`${visit.ts}-${index}`}
                          className="border-t border-[var(--border-1)]"
                        >
                          <td className="whitespace-nowrap py-2 pr-4">
                            {new Intl.DateTimeFormat("pt-BR", {
                              dateStyle: "short",
                              timeStyle: "short",
                            }).format(new Date(visit.ts))}
                          </td>
                          <td className="py-2 pr-4">{visit.path}</td>
                          <td className="py-2 pr-4">
                            {[visit.city, visit.country].filter(Boolean).join(", ") || "—"}
                          </td>
                          <td className="py-2 pr-4">
                            {[DEVICE_LABELS[visit.device ?? ""] ?? visit.device, visit.browser]
                              .filter(Boolean)
                              .join(" · ") || "—"}
                          </td>
                          <td className="py-2">{visit.referrer ?? "direto"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="py-6 text-center text-xs text-[var(--text-muted)]">
                  Nenhuma visita registrada ainda.
                </p>
              )}
            </Panel>
          </>
        ) : !loading && !error ? (
          <p className="text-sm text-[var(--text-secondary)]">Sem dados no período.</p>
        ) : null}
      </div>
    </div>
  );
};
