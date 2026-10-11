import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/*
 * The preview image for Facebook, Messenger, WhatsApp, LinkedIn and X.
 * Generated at build time, so it always matches the current copy.
 * Fonts: Poppins (OFL), latin + latin-ext merged so Polish letters render.
 */
export const runtime = "nodejs";
export const alt = "Dochodowe Studio: zbuduj studio treningowe, które zarabia bez Ciebie na sali";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const [extraBold, medium] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Poppins-800.ttf")),
    readFile(join(process.cwd(), "assets/fonts/Poppins-500.ttf")),
  ]);

  const stat = (value: string, label: string) => (
    <div style={{ display: "flex", flexDirection: "column", marginRight: 64 }}>
      <div style={{ fontSize: 46, fontWeight: 800, color: "#111111", lineHeight: 1.05 }}>{value}</div>
      <div style={{ fontSize: 22, fontWeight: 500, color: "#555555", marginTop: 6 }}>{label}</div>
    </div>
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          fontFamily: "Poppins",
          borderTop: "18px solid #ea580c",
          padding: "52px 72px 56px 72px",
        }}
      >
        <div style={{ display: "flex", fontSize: 24, fontWeight: 800, letterSpacing: 4, color: "#111111" }}>
          DOCHODOWE STUDIO
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.12,
            color: "#111111",
            maxWidth: 1060,
          }}
        >
          Zbuduj studio treningowe, które zarabia bez Ciebie na sali
        </div>
        <div style={{ display: "flex", marginTop: "auto" }}>
          {stat("20–50 tys. zł", "zysku miesięcznie")}
          {stat("50–80%", "marży")}
          {stat("ok. 50", "wdrożonych studiów")}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Poppins", data: extraBold, weight: 800, style: "normal" },
        { name: "Poppins", data: medium, weight: 500, style: "normal" },
      ],
    }
  );
}
