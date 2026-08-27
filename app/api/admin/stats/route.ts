import { NextResponse } from "next/server";

import { readSession } from "@/lib/analytics/auth";
import { getStats, isRangeKey } from "@/lib/analytics/stats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await readSession())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const requested = new URL(request.url).searchParams.get("range") ?? "7d";
  const range = isRangeKey(requested) ? requested : "7d";

  try {
    return NextResponse.json(await getStats(range));
  } catch (error) {
    console.error("[stats]", error);
    return NextResponse.json(
      { error: "Não foi possível carregar as métricas." },
      { status: 500 }
    );
  }
}
