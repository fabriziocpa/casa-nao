import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { WhatsAppFloating } from "@/components/layout/WhatsAppFloating";
import { LenisProvider } from "@/components/motion/LenisProvider";
import { getPublicSettings } from "@/features/settings/public-settings";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const s = await getPublicSettings();
  return (
    <LenisProvider>
      <PublicHeader />
      <main>{children}</main>
      <PublicFooter
        whatsapp={s.whatsapp}
        email={s.contact_email}
        hours={s.attention_hours}
        instagram={s.instagram}
        facebook={s.facebook}
        tiktok={s.tiktok}
        address={s.address_line}
      />
      <WhatsAppFloating phone={s.whatsapp} />
    </LenisProvider>
  );
}
