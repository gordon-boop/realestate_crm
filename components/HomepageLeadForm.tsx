"use client";

import { FormEvent, useState } from "react";
import styles from "@/app/page.module.css";

type SubmitState = "idle" | "submitting" | "success" | "error";

export function HomepageLeadForm() {
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") || "").trim();
    const phone = String(data.get("phone") || "").trim();

    if (!email && !phone) {
      setState("error");
      setMessage("Bitte geben Sie mindestens E-Mail oder Telefon an.");
      return;
    }

    setState("submitting");
    setMessage("");

    const payload = {
      source: "homepage",
      firstName: String(data.get("firstName") || "").trim() || undefined,
      lastName: String(data.get("lastName") || "").trim() || undefined,
      email: email || undefined,
      phone: phone || undefined,
      postalCode: String(data.get("postalCode") || "").trim() || undefined,
      city: String(data.get("city") || "").trim() || undefined,
      productInterest: String(data.get("productInterest") || "") || undefined,
      message: String(data.get("message") || "").trim() || undefined,
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "Die Anfrage konnte nicht gesendet werden.");
      }

      form.reset();
      setState("success");
      setMessage("Vielen Dank. Ihre Anfrage wurde übermittelt. Wir melden uns zeitnah bei Ihnen.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Die Anfrage konnte nicht gesendet werden.");
    }
  }

  return (
    <form className={styles.leadForm} onSubmit={handleSubmit}>
      <div className={styles.leadFormGrid}>
        <label className={styles.leadField}>
          <span>Vorname</span>
          <input name="firstName" autoComplete="given-name" />
        </label>
        <label className={styles.leadField}>
          <span>Nachname</span>
          <input name="lastName" autoComplete="family-name" />
        </label>
        <label className={styles.leadField}>
          <span>E-Mail</span>
          <input name="email" type="email" autoComplete="email" />
        </label>
        <label className={styles.leadField}>
          <span>Telefon</span>
          <input name="phone" type="tel" autoComplete="tel" />
        </label>
        <label className={styles.leadField}>
          <span>PLZ</span>
          <input name="postalCode" inputMode="numeric" autoComplete="postal-code" />
        </label>
        <label className={styles.leadField}>
          <span>Ort</span>
          <input name="city" autoComplete="address-level2" />
        </label>
      </div>

      <label className={styles.leadField}>
        <span>Interesse</span>
        <select name="productInterest" defaultValue="">
          <option value="">Bitte wählen</option>
          <option value="fixed_residential_right">Zwei-Phasen-Wohnrecht</option>
          <option value="sale_and_leaseback">Verkauf mit Rückmiete</option>
          <option value="other">Noch offen</option>
        </select>
      </label>

      <label className={styles.leadField}>
        <span>Ihre Nachricht</span>
        <textarea name="message" rows={4} placeholder="Worum geht es bei Ihrer Immobilie?" />
      </label>

      <button className={styles.btnPrimaryLg} type="submit" disabled={state === "submitting"}>
        {state === "submitting" ? "Anfrage wird gesendet..." : "Unverbindliche Anfrage starten"}
      </button>

      {message ? (
        <p className={state === "success" ? styles.leadFormSuccess : styles.leadFormError}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
