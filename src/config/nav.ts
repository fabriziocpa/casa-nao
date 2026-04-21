export const publicNav = [
  { href: "/", label: "Inicio" },
  { href: "/galeria", label: "Galería" },
  { href: "/tour-virtual", label: "Tour 360°" },
  { href: "/politicas", label: "Políticas" },
  { href: "/#reserva", label: "Reservar" },
] as const;

export const adminNav = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/reservas", label: "Reservas" },
  { href: "/admin/calendario", label: "Calendario" },
  { href: "/admin/precios", label: "Precios" },
] as const;
