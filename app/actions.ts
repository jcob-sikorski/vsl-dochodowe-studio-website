"use server";

import crypto from "crypto";
import { headers, cookies } from "next/headers";
import { buildFbcFromClickId } from "@/lib/attribution";

const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN!;
const PIXEL_ID = "965293539900334";

// const TEST_CODE = process.env.META_CAPI_TEST_EVENT_CODE;

function hashData(data?: string) {
  if (!data) return "";
  return crypto.createHash("sha256").update(data.toLowerCase().trim()).digest("hex");
}

export async function sendToMetaCAPI(formData: {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  clientCategory?: string;
  sourceUrl: string;
  eventId: string;
  eventName?: string;
  attribution?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    fbclid?: string;
    captured_at?: string;
  };
}) {
  const headersList = headers();
  const cookieStore = cookies();

  // Oczyszczenie adresu IP - bierzemy wyłacznie pierwszy IP przed przecinkiem
  const rawIp = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "";
  const clientIp = rawIp.split(",")[0].trim();
  const clientUserAgent = headersList.get("user-agent") || "";

  // Pobranie ciasteczka _fbp dla maksymalnego Event Quality Score
  const fbp = cookieStore.get("_fbp")?.value;

  const attr = formData.attribution || {};
  const fbc = attr.fbclid
    ? buildFbcFromClickId(attr.fbclid, attr.captured_at)
    : cookieStore.get("_fbc")?.value;

  // Base parameters for every event (including cold PageViews)
  const userData: Record<string, any> = {
    client_ip_address: clientIp,
    client_user_agent: clientUserAgent,
    ...(fbp ? { fbp } : {}),
    ...(fbc ? { fbc } : {}),
  };

  // Conditionally append hashed PII if the user is submitting a Lead form
  if (formData.email) {
    userData.em = [hashData(formData.email)];
    userData.external_id = [hashData(formData.email)];
    userData.country = [hashData("pl")];
  }

  if (formData.phone) {
    let cleanPhone = formData.phone.replace(/\D/g, "");
    if (cleanPhone.length === 9) {
      cleanPhone = `48${cleanPhone}`;
    }
    userData.ph = [hashData(cleanPhone)];
  }

  if (formData.firstName) userData.fn = [hashData(formData.firstName)];
  if (formData.lastName) userData.ln = [hashData(formData.lastName)];

  const customData: Record<string, any> = {
    ...(formData.eventName === "Lead" ? { content_name: "Warsztat: Zloty Model Biznesowy" } : {}),
    ...(formData.clientCategory ? { content_category: formData.clientCategory } : {}),
    ...(attr.utm_source ? { utm_source: attr.utm_source } : {}),
    ...(attr.utm_medium ? { utm_medium: attr.utm_medium } : {}),
    ...(attr.utm_campaign ? { utm_campaign: attr.utm_campaign } : {}),
    ...(attr.utm_content ? { utm_content: attr.utm_content } : {}),
    ...(attr.utm_term ? { utm_term: attr.utm_term } : {}),
  };

  const payload = {
    data: [
      {
        event_name: formData.eventName || "Lead",
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        event_source_url: formData.sourceUrl,
        event_id: formData.eventId,
        user_data: userData,
        ...(Object.keys(customData).length > 0 ? { custom_data: customData } : {}),
      },
    ],
  };

  // Zakomentowane dla środowiska produkcyjnego:
  // if (TEST_CODE) payload.test_event_code = TEST_CODE;

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    console.error("CAPI Error:", error);
    return { success: false, error };
  }
}