import { FrontendPrototypeClient } from "@/components/prototype/FrontendPrototypeClient";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function NewAdminLeadPage() {
  const user = getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/partner");

  return (
    <FrontendPrototypeClient
      initialRole="admin"
      initialUser={user}
      initialScreen="leads"
      initialLeadCreate
    />
  );
}
