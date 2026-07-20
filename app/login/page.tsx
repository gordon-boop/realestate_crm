import { AppShell } from "@/components/layout/AppShell";
import { LoginForm } from "@/components/LoginForm";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function LoginPage() {
  const t = await getTranslations("common.login");
  return (
    <AppShell>
      <div className="login-scene">
        <section className="login-panel">
          <div className="login-brand-block">
            <img className="login-logo" src="/brand/wohnkapital-logo.svg" alt="WohnKapital" />
            <span>{t("brokerPortal")}</span>
          </div>
          <LoginForm />
          <Link className="register-cta" href="/register">{t("registerPartner")}</Link>
        </section>
      </div>
    </AppShell>
  );
}
