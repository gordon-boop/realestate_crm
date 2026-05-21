import { json } from "@/lib/api";

export function GET(): Response {
  return json({
    ok: true,
    service: "partnerportal-angebots-crm",
    timestamp: new Date().toISOString()
  });
}
