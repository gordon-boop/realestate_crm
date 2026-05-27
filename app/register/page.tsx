import { AppShell } from "@/components/layout/AppShell";
import { RegisterForm } from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <AppShell>
      <div className="login-scene">
        <section className="register-panel">
          <div className="login-brand-block">
            <img className="login-logo" src="/brand/wohnkapital-logo.svg" alt="WohnKapital" />
            <span>Maklerportal</span>
          </div>
          <RegisterForm />
        </section>
      </div>
    </AppShell>
  );
}
