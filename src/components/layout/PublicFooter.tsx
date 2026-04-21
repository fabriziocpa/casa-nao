import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export function PublicFooter({
  whatsapp,
  email,
  hours,
  instagram,
  facebook,
  tiktok,
  address,
}: {
  whatsapp: string;
  email: string;
  hours: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  address: string;
}) {
  return (
    <footer className="border-t border-bg/20 bg-ink text-bg">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-4">
        <div className="space-y-4">
          <Image
            src="/logos/logo-white.svg"
            alt="CASA NAO"
            width={180}
            height={60}
          />
          <p className="text-sm text-bg/75 max-w-xs">{address}</p>
        </div>
        <div className="space-y-3">
          <p className="tracking-label text-xs text-bg/60">Contacto</p>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp {whatsapp}
              </a>
            </li>
            <li>
              <a href={`mailto:${email}`}>{email}</a>
            </li>
            <li className="text-bg/70">Atención {hours}</li>
          </ul>
        </div>
        <div className="space-y-3">
          <p className="tracking-label text-xs text-bg/60">Síguenos</p>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href={`https://instagram.com/${instagram}`}
                target="_blank"
                rel="noreferrer"
              >
                Instagram @{instagram}
              </a>
            </li>
            <li>
              <a
                href={`https://facebook.com/${facebook}`}
                target="_blank"
                rel="noreferrer"
              >
                Facebook NAO HOUSE
              </a>
            </li>
            <li>
              <a
                href={`https://tiktok.com/@${tiktok}`}
                target="_blank"
                rel="noreferrer"
              >
                TikTok @{tiktok}
              </a>
            </li>
          </ul>
        </div>
        <div className="space-y-3">
          <p className="tracking-label text-xs text-bg/60">
            {siteConfig.name}
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/galeria">Galería</Link>
            </li>
            <li>
              <Link href="/tour-virtual">Tour virtual 360°</Link>
            </li>
            <li>
              <Link href="/politicas">Políticas</Link>
            </li>
            <li>
              <Link href="/auth/login" className="text-bg/60 text-xs">
                Acceso administrador
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-bg/20">
        <div className="mx-auto max-w-7xl px-6 py-6 text-xs text-bg/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <p>
            © {new Date().getFullYear()} CASA NAO. Todos los derechos
            reservados.
          </p>
          <p className="tracking-label">LUXURY LIVING · EL ÑURO · PERÚ</p>
        </div>
      </div>
    </footer>
  );
}
