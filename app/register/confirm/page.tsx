import { AppShell } from "@/components/AppShell";
import { ConfirmRegistration } from "@/components/ConfirmRegistration";

export default function ConfirmRegistrationPage({ searchParams }: { searchParams: { token?: string } }) {
  return (
    <AppShell>
      <div className="login-scene">
        <section className="register-panel">
          <div className="login-brand-block">
            <img className="login-logo" src="/brand/wohnkapital-logo.svg" alt="WohnKapital" />
            <span>Maklerportal</span>
          </div>
          <ConfirmRegistration token={searchParams.token} />
        </section>
      </div>
    </AppShell>
  );
}
