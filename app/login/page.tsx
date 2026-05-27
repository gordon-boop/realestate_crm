import { AppShell } from "@/components/layout/AppShell";
import { LoginForm } from "@/components/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <AppShell>
      <div className="login-scene">
        <section className="login-panel">
          <div className="login-brand-block">
            <img className="login-logo" src="/brand/wohnkapital-logo.svg" alt="WohnKapital" />
            <span>Maklerportal</span>
          </div>
          <LoginForm />
          <Link className="register-cta" href="/register">Als Partner registrieren</Link>
        </section>
      </div>
    </AppShell>
  );
}
