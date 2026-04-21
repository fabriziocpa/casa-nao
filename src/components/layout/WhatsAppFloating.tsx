import { whatsappLink } from "@/lib/whatsapp";

export function WhatsAppFloating({ phone }: { phone: string }) {
  return (
    <a
      href={whatsappLink(
        phone,
        "Hola, me gustaría consultar la disponibilidad de CASA NAO.",
      )}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-40 rounded-full bg-[#25D366] text-white shadow-lg px-5 py-3 tracking-label text-xs hover:scale-105 transition"
      aria-label="Escríbenos por WhatsApp"
    >
      WhatsApp
    </a>
  );
}
