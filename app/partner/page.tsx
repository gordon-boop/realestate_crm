import { FrontendPrototypeClient } from "@/components/prototype/FrontendPrototypeClient";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default function Page() {
  const user = getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/admin");

  return <FrontendPrototypeClient />;
}
