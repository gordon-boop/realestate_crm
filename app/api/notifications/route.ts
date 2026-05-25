import { handleApiError, json, requireRole } from "@/lib/api";
import { getDbCaseNotifications } from "@/lib/persistence";

export async function GET(): Promise<Response> {
  try {
    const user = requireRole("admin", "partner");
    const notifications = await getDbCaseNotifications(user);
    const unreadCount = notifications.filter((notification) => !notification.readByCurrentUser).length;
    const unreadChatCount = notifications.filter((notification) => !notification.readByCurrentUser && notification.entityType === "chat").length;
    const unreadProcessCount = notifications.filter((notification) => !notification.readByCurrentUser && notification.entityType !== "chat").length;

    return json({ notifications, unreadCount, unreadChatCount, unreadProcessCount });
  } catch (err) {
    return handleApiError(err);
  }
}
