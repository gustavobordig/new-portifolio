"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(body.error ?? "Não foi possível entrar.");
        return;
      }

      router.replace("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setPending(false);
    }
  };

  const field =
    "w-full rounded-lg border border-[var(--border-1)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--series-1)]";

  return (
    <main className="admin-root flex min-h-screen items-center justify-center bg-[var(--admin-bg)] px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-2xl font-semibold text-[var(--text-primary)]">
          Área de adm
        </h1>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-[var(--border-1)] bg-[var(--surface-1)] p-6"
        >
          <label className="mb-4 block">
            <span className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">
              E-mail
            </span>
            <input
              type="email"
              name="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@exemplo.com"
              className={field}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">
              Senha
            </span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className={field}
            />
          </label>

          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-[var(--critical)]/40 bg-[var(--critical)]/10 px-3 py-2 text-sm text-[var(--text-primary)]"
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="button-primary mt-6 w-full rounded-lg border border-[#7042f861] py-3 text-sm font-medium text-[var(--text-primary)] transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
};
