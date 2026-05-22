import { AppShell } from "@/components/AppShell";
import { LoginForm } from "@/components/LoginForm";

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
        </section>
      </div>
    </AppShell>
  );
}
