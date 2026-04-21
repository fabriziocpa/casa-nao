import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CASA NAO — Luxury Living en El Ñuro";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #0f2a36 0%, #111111 100%)",
          color: "#faf7f2",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 24,
            letterSpacing: "0.4em",
            opacity: 0.8,
            marginBottom: 24,
          }}
        >
          LUXURY LIVING
        </div>
        <div style={{ fontSize: 144, lineHeight: 1, letterSpacing: "0.1em" }}>
          CASA NAO
        </div>
        <div
          style={{
            fontSize: 28,
            marginTop: 40,
            opacity: 0.8,
            maxWidth: 800,
            textAlign: "center",
          }}
        >
          El Ñuro · Piura · Perú
        </div>
      </div>
    ),
    size,
  );
}
