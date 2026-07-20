import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { User } from "@/lib/domain";
import { LogoutBox } from "../LogoutBox";

export async function AppShell({ user, children }: { user?: User; children: React.ReactNode }) {
  const t = await getTranslations("navigation");
  const home = user?.role === "admin" ? "/admin" : "/partner";

  return (
    <main className="shell">
      <header className="topbar">
        <Link className="brand brand-neutral" href={home} aria-label={t("home")}>
          CRM
        </Link>
        <nav className="topnav">
          {user ? (
            <>
              <span className="user-pill">{user.name} | {user.role}</span>
              <Link className="nav-link" href={home}>{t("home")}</Link>
              {user.role === "admin" ? <Link className="nav-link" href="/admin">{t("leads")}</Link> : null}
              <Link className="nav-link" href={`${home}?status=DRAFT`}>{t("drafts")}</Link>
              <Link className="nav-link" href={`${home}?status=INTERNAL_REVIEW`}>{t("inProgress")}</Link>
              <Link className="nav-link" href={`${home}?status=IN_PORTFOLIO`}>{t("portfolio")}</Link>
              {user.role === "admin" ? <Link className="nav-link" href={`${home}?status=SOLD`}>{t("sold")}</Link> : null}
              <Link className="nav-link" href={home}>{t("other")}</Link>
              <Link className="nav-link" href={home}>{t("brochure")}</Link>
              <Link className="nav-link" href={home}>{t("postbankAtlas")}</Link>
              <Link className="nav-link" href={home}>{t("faqs")}</Link>
              <LogoutBox />
            </>
          ) : null}
        </nav>
      </header>
      <section className="page">{children}</section>
    </main>
  );
}
