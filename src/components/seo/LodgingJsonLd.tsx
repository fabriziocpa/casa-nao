import { siteConfig } from "@/config/site";
import { getPublicSettings } from "@/features/settings/public-settings";

const AMENITIES = [
  "Piscina con borde infinito",
  "Parrilla con caja china",
  "Kamado",
  "Internet satelital",
  "Aire acondicionado en cuartos principales",
  'TVs 65" y 70" en habitaciones',
  'TV 86" en sala familiar',
  "Netflix y YouTube Premium",
  "Lavadora",
  "Estacionamiento",
  "Vista al mar",
  "Acceso directo a playa",
  "Grupo electrógeno de respaldo",
  "Agua tratada en toda la casa",
  "Ósmosis inversa en cocina",
  "Limpieza diaria 8am-4pm",
];

export async function LodgingJsonLd() {
  const settings = await getPublicSettings();

  const data = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: siteConfig.name,
    description:
      "CASA NAO se encuentra detrás del majestuoso Cerro del Encanto, un refugio frente al mar en El Ñuro, Piura.",
    url: siteConfig.url,
    image: `${siteConfig.url}/opengraph-image`,
    priceRange: "$500-$700",
    currenciesAccepted: "USD, PEN",
    telephone: settings.whatsapp,
    email: settings.contact_email,
    checkinTime: settings.checkin_time,
    checkoutTime: settings.checkout_time,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address_line,
      addressLocality: "El Ñuro",
      addressRegion: "Piura",
      addressCountry: "PE",
    },
    geo:
      settings.latitude && settings.longitude
        ? {
            "@type": "GeoCoordinates",
            latitude: settings.latitude,
            longitude: settings.longitude,
          }
        : undefined,
    numberOfRooms: 5,
    maximumAttendeeCapacity: siteConfig.maxGuests,
    amenityFeature: AMENITIES.map((a) => ({
      "@type": "LocationFeatureSpecification",
      name: a,
    })),
    sameAs: [
      `https://instagram.com/${settings.instagram}`,
      `https://facebook.com/${settings.facebook}`,
      `https://tiktok.com/@${settings.tiktok}`,
    ],
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
