import { AppShell } from "@/components/AppShell";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <AppShell>
      <div className="login-scene">
        <section className="login-intro">
          <div>
            <img className="login-logo" src="/brand/wohnkapital-logo.svg" alt="WohnKapital" />
            <span className="section-label">Partnerportal und Angebots-CRM</span>
            <h1>WohnKapital Maklerportal</h1>
            <p>WohnKapital bündelt Erfassung, Bewertung, Rückfragen, Angebotskalkulation und interne Freigabe in einer ruhigen Arbeitsoberfläche.</p>
          </div>
        </section>
        <LoginForm />
      </div>
    </AppShell>
  );
}
