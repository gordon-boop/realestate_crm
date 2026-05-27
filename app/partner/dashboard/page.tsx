import { FrontendPrototypeClient } from "@/components/prototype/FrontendPrototypeClient";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function searchParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function Page({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const user = getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/admin");

  return (
    <FrontendPrototypeClient
      initialUser={user}
      initialCaseId={searchParam(searchParams?.case) ?? searchParam(searchParams?.caseId)}
      initialTab={searchParam(searchParams?.tab)}
      initialReturnTab={searchParam(searchParams?.returnTab)}
      initialScreen={searchParam(searchParams?.screen) ?? searchParam(searchParams?.view)}
    />
  );
}
