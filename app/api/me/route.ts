import { getCurrentUser } from "@/lib/auth";
import { json } from "@/lib/api";

export function GET(): Response {
  const user = getCurrentUser();

  if (!user) {
    return json({ user: null }, { status: 401 });
  }

  return json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, partnerId: user.partnerId } });
}
