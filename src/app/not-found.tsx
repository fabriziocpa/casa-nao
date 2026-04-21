import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-4">
        <p className="tracking-label text-xs text-deep-ocean/70">404</p>
        <h1 className="text-4xl font-display">Página no encontrada</h1>
        <p className="text-ink/70">La ruta que buscas no existe o fue movida.</p>
        <Link href="/" className="tracking-label text-sm underline underline-offset-4">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
