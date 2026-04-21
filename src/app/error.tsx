"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-4">
        <p className="tracking-label text-xs text-deep-ocean/70">Error</p>
        <h1 className="text-4xl font-display">Algo salió mal</h1>
        <p className="text-ink/70">
          Ocurrió un problema inesperado. Intenta nuevamente en unos segundos.
        </p>
        <button
          onClick={reset}
          className="tracking-label text-sm underline underline-offset-4"
        >
          Reintentar
        </button>
      </div>
    </main>
  );
}
