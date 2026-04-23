const colorMap: Record<string, string> = {
  pending: "bg-sand text-ink",
  confirmed: "bg-teal text-white",
  rejected: "bg-rose/70 text-ink",
  cancelled: "bg-ink/80 text-bg",
};

const labelMap: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  rejected: "Rechazada",
  cancelled: "Cancelada",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={
        "inline-flex items-center tracking-label text-[10px] px-2 py-0.5 rounded-full " +
        (colorMap[status] ?? "bg-sand text-ink")
      }
    >
      {labelMap[status] ?? status}
    </span>
  );
}
