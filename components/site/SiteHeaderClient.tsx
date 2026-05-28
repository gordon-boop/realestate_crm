"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { mainNavigation } from "@/lib/site-content";
import styles from "@/app/page.module.css";

export function MobileMenuOverlay() {
  const [open, setOpen] = useState(false);

  // Close on route change / resize
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 960) setOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <button
        className={styles.mobileMenuBtn}
        aria-label={open ? "Menü schließen" : "Menü öffnen"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <nav className={styles.mobileNav} aria-label="Mobile Navigation">
          {mainNavigation.map((item) =>
            "items" in item ? (
              <div key={item.label}>
                <Link href={item.href} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
                {item.items.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    style={{ paddingLeft: "28px", fontSize: "14px" }}
                    onClick={() => setOpen(false)}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ) : (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            )
          )}
          <div className={styles.mobileNavPhoneRow}>
            <a href="tel:0800000000" className={styles.headerPhone} style={{ fontSize: "14px" }}>
              Hotline: 0800 000 000
            </a>
          </div>
        </nav>
      )}
    </>
  );
}
