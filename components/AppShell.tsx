import Link from "next/link";
import type { User } from "@/lib/domain";
import { LogoutBox } from "./LogoutBox";

export function AppShell({ user, children }: { user?: User; children: React.ReactNode }) {
  const home = user?.role === "admin" ? "/admin" : "/partner";

  return (
    <main className="shell">
      <header className="topbar">
        <Link className="brand" href={home}>
          <img className="brand-logo" src="/brand/wohnkapital-logo.svg" alt="WohnKapital" />
        </Link>
        <nav className="topnav">
          {user ? (
            <>
              <span className="user-pill">{user.name} | {user.role}</span>
              <Link className="nav-link" href={home}>Home</Link>
              {user.role === "admin" ? <Link className="nav-link" href="/admin">Leads</Link> : null}
              <Link className="nav-link" href={`${home}?status=DRAFT`}>Zwischengespeichert</Link>
              <Link className="nav-link" href={`${home}?status=INTERNAL_REVIEW`}>In Bearbeitung</Link>
              <Link className="nav-link" href={`${home}?status=WON`}>Bestand</Link>
              {user.role === "admin" ? <Link className="nav-link" href={`${home}?status=SOLD`}>Verkauft</Link> : null}
              <Link className="nav-link" href={home}>Sonstiges</Link>
              <Link className="nav-link" href={home}>Broschüre</Link>
              <Link className="nav-link" href={home}>Postbank Atlas</Link>
              <Link className="nav-link" href={home}>Leitfaden</Link>
              <Link className="nav-link" href={home}>FAQs</Link>
              <LogoutBox />
            </>
          ) : null}
        </nav>
      </header>
      <section className="page">{children}</section>
    </main>
  );
}
