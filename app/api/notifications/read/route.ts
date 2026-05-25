import { handleApiError, json, requireRole } from "@/lib/api";
import { markDbNotificationsRead } from "@/lib/persistence";
import { notificationReadSchema } from "@/lib/validation";

export async function POST(request: Request): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const body = notificationReadSchema.parse(await request.json().catch(() => ({})));
    const result = await markDbNotificationsRead(user, body);

    return json(result);
  } catch (err) {
    return handleApiError(err);
  }
}
