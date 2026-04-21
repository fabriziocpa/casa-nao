import "server-only";

import { unstable_cache } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type PublicSettings = {
  whatsapp: string;
  contact_email: string;
  attention_hours: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  checkin_time: string;
  checkout_time: string;
  address_line: string;
  latitude: string | null;
  longitude: string | null;
};

const FALLBACK: PublicSettings = {
  whatsapp: "+51916021799",
  contact_email: "casanaoperu@gmail.com",
  attention_hours: "7am - 11pm",
  instagram: "casanao.peru",
  facebook: "profile.php?id=61585307518613",
  tiktok: "naohouse",
  checkin_time: "14:00",
  checkout_time: "11:00",
  address_line:
    "Carretera Panamericana Km 1145, Condominio NORD, El Ñuro, Piura",
  latitude: null,
  longitude: null,
};

export const getPublicSettings = unstable_cache(
  async (): Promise<PublicSettings> => {
    try {
      const supabase = createSupabaseAdminClient();
      const { data, error } = await supabase
        .from("public_settings")
        .select("*")
        .limit(1)
        .single();
      if (error || !data) return FALLBACK;
      return data as PublicSettings;
    } catch {
      return FALLBACK;
    }
  },
  ["public_settings"],
  { revalidate: 120, tags: ["settings"] },
);
