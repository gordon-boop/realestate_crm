"use client";

import { useState } from "react";

export function NewCaseForm() {
  const [error, setError] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  function currentAge(): number | undefined {
    if (!dateOfBirth) return undefined;
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const beforeBirthday = today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
    if (beforeBirthday) age -= 1;
    return Number.isFinite(age) ? age : undefined;
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    if (form.get("leasehold") === "on" || form.get("monumentProtection") === "on") {
      setError("Erbbaurecht oder Denkmalschutz ist laut Struktur ein Ausschlusskriterium. Der Fall kann so nicht fortgesetzt werden.");
      return;
    }

    const customerPayload = {
      firstName: form.get("firstName"),
      lastName: form.get("lastName"),
      displayName: `${form.get("firstName") ?? ""} ${form.get("lastName") ?? ""}`.trim(),
      ageAtSubmission: currentAge(),
      gender: form.get("gender"),
      dateOfBirth: form.get("dateOfBirth"),
      maritalStatus: form.get("maritalStatus"),
      monthlyIncomeRange: form.get("monthlyIncomeRange"),
      email: form.get("email"),
      phone: form.get("phone"),
      mobile: form.get("mobile"),
      street: form.get("customerStreet"),
      postalCode: form.get("customerPostalCode"),
      city: form.get("customerCity"),
      addressText: `${form.get("customerStreet") ?? ""}, ${form.get("customerPostalCode") ?? ""} ${form.get("customerCity") ?? ""}`.trim(),
      consentDataProcessing: form.get("consentDataProcessing") === "on"
    };
    const customerResponse = await fetch("/api/customers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(customerPayload)
    });
    const customerResult = await customerResponse.json();
    if (!customerResponse.ok) {
      setError(customerResult.error ?? "Kunde konnte nicht angelegt werden");
      return;
    }

    const propertyPayload = {
      customerId: customerResult.customer.id,
      objectTitle: `${form.get("propertyType")} ${form.get("propertyCity")}`.trim(),
      propertyType: form.get("propertyType"),
      street: form.get("propertyStreet"),
      postalCode: form.get("propertyPostalCode"),
      city: form.get("propertyCity"),
      livingAreaSqm: Number(form.get("livingAreaSqm")),
      plotAreaSqm: Number(form.get("plotAreaSqm")),
      yearBuilt: Number(form.get("yearBuilt")),
      condition: form.get("condition"),
      occupancyStatus: form.get("occupancyStatus"),
      desiredModel: form.get("desiredModel"),
      residentialRightRecipients: form.get("residentialRightRecipients"),
      desiredResidentialRightYears: Number(form.get("desiredResidentialRightYears")),
      secondResidentialRightWanted: form.get("secondResidentialRightWanted") === "on",
      secondResidentialRightYears: Number(form.get("secondResidentialRightYears")),
      fixedTermReason: form.get("fixedTermReason"),
      rentalOptionDeselected: form.get("rentalOptionDeselected") === "on",
      usableAreaSqm: Number(form.get("usableAreaSqm")),
      coOwnershipShares: form.get("coOwnershipShares"),
      parkingAvailable: form.get("parkingAvailable") === "yes",
      parkingType: form.get("parkingType"),
      parkingCount: Number(form.get("parkingCount")),
      basementType: form.get("basementType"),
      heatingType: form.get("heatingType"),
      heatingYear: Number(form.get("heatingYear")),
      energyCarriers: ["photovoltaik", "solarthermie", "batteriespeicher"].filter((name) => form.get(name) === "on"),
      windowMaterial: form.get("windowMaterial"),
      windowInstallationYear: Number(form.get("windowInstallationYear")),
      asbestosRoofKnown: form.get("asbestosRoofKnown") === "yes",
      energyCertificateAvailable: form.get("energyCertificateAvailable") === "yes",
      energyCertificateType: form.get("energyCertificateType"),
      energyClass: form.get("energyClass"),
      visualConditionRating: form.get("visualConditionRating"),
      leasehold: form.get("leasehold") === "on",
      monumentProtection: form.get("monumentProtection") === "on",
      leaseholdOrMonument: form.get("leasehold") === "on" || form.get("monumentProtection") === "on",
      knownDefects: form.get("knownDefects"),
      remainingDebtAmount: Number(form.get("remainingDebtAmount")),
      modernization: {
        heating: { scope: form.get("modernizationHeating"), year: form.get("modernizationHeatingYear") },
        roof: { scope: form.get("modernizationRoof"), year: form.get("modernizationRoofYear") },
        facade: { scope: form.get("modernizationFacade"), year: form.get("modernizationFacadeYear") },
        windows: { scope: form.get("modernizationWindows"), year: form.get("modernizationWindowsYear") },
        lines: { scope: form.get("modernizationLines"), year: form.get("modernizationLinesYear") },
        bathrooms: { scope: form.get("modernizationBathrooms"), year: form.get("modernizationBathroomsYear") }
      },
      buildingCondition: {
        roof: form.get("conditionRoof"),
        facade: form.get("conditionFacade"),
        masonry: form.get("conditionMasonry"),
        bathrooms: form.get("conditionBathrooms"),
        windows: form.get("conditionWindows"),
        electric: form.get("conditionElectric"),
        outdoor: form.get("conditionOutdoor")
      },
      notes: form.get("notes")
    };
    const propertyResponse = await fetch("/api/properties", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(propertyPayload)
    });
    const propertyResult = await propertyResponse.json();
    if (!propertyResponse.ok) {
      setError(propertyResult.error ?? "Objekt konnte nicht angelegt werden");
      return;
    }

    const fileName = String(form.get("documentFileName") || "");
    if (fileName) {
      await fetch(`/api/properties/${propertyResult.property.id}/documents`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fileName, category: form.get("documentCategory"), status: "pending", requirementLevel: "optional" })
      });
    }

    window.location.href = `/partner/cases/${propertyResult.property.id}`;
  }

  return (
    <form className="grid" onSubmit={submit}>
      <section className="panel panel-pad grid two">
        <h2 style={{ margin: 0, gridColumn: "1 / -1" }}>1. Schritt - persönliche Daten</h2>
        <label className="field"><span>Vorname</span><input name="firstName" required /></label>
        <label className="field"><span>Nachname</span><input name="lastName" required /></label>
        <label className="field"><span>Geschlecht</span><select name="gender"><option value="not_specified">Keine Angabe</option><option value="female">Weiblich</option><option value="male">Männlich</option><option value="diverse">Divers</option></select></label>
        <label className="field"><span>Geburtsdatum</span><input name="dateOfBirth" value={dateOfBirth} onChange={(event) => setDateOfBirth(event.target.value)} type="date" /></label>
        <div className="field"><label>Aktuelles Alter</label><div className="panel panel-pad">{currentAge() ?? "-"}</div></div>
        <label className="field"><span>Familienstand</span><select name="maritalStatus"><option value="">Bitte wählen</option><option value="single">Ledig</option><option value="married">Verheiratet</option><option value="divorced">Geschieden</option><option value="widowed">Verwitwet</option><option value="other">Sonstiges</option></select></label>
        <label className="field"><span>E-Mail</span><input name="email" type="email" /></label>
        <label className="field"><span>Telefon</span><input name="phone" /></label>
        <label className="field"><span>Mobil</span><input name="mobile" /></label>
        <label className="field"><span>Monatliche Einkünfte</span><select name="monthlyIncomeRange"><option value="">Bitte wählen</option><option value="under_1000">Unter 1000</option><option value="from_1000_to_2000">1000-2000</option><option value="from_2000_to_3000">2000-3000</option><option value="over_3000">Mehr als 3000</option></select></label>
        <label className="field"><span>Straße</span><input name="customerStreet" /></label>
        <label className="field"><span>PLZ</span><input name="customerPostalCode" /></label>
        <label className="field"><span>Ort</span><input name="customerCity" /></label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}><input name="consentDataProcessing" type="checkbox" required /> DSGVO-Einwilligung liegt vor</label>
      </section>

      <section className="panel panel-pad grid two">
        <h2 style={{ margin: 0, gridColumn: "1 / -1" }}>2. Schritt - Wunschmodell</h2>
        <label className="field"><span>Modell</span><select name="desiredModel"><option value="fixed_residential_right">Wohnrecht</option><option value="sale_and_leaseback">Sale and leaseback</option><option value="other">Sonstiges</option></select></label>
        <label className="field"><span>Wer soll Wohnrecht bekommen?</span><select name="residentialRightRecipients"><option value="one_person">Nur eine Person</option><option value="both">Beide</option></select></label>
        <label className="field"><span>Dauer des Wohnrechts</span><select name="desiredResidentialRightYears">{Array.from({ length: 11 }, (_, index) => index + 5).map((year) => <option key={year} value={year}>{year} Jahre</option>)}</select></label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}><input name="secondResidentialRightWanted" type="checkbox" /> Zweite Laufzeit gewünscht</label>
        <label className="field"><span>Zweite Laufzeit</span><select name="secondResidentialRightYears"><option value="">Keine</option>{Array.from({ length: 11 }, (_, index) => index + 5).map((year) => <option key={year} value={year}>{year} Jahre</option>)}</select></label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}><input name="rentalOptionDeselected" type="checkbox" /> Spätere Anmietoption abwählen</label>
        <label className="field" style={{ gridColumn: "1 / -1" }}><span>Grund der Befristung</span><textarea name="fixedTermReason" rows={3} /></label>
      </section>

      <section className="panel panel-pad grid two">
        <h2 style={{ margin: 0, gridColumn: "1 / -1" }}>3. Schritt - Immobiliendaten</h2>
        <label className="field"><span>Objekttyp</span><select name="propertyType"><option value="single_family">Einfamilienhaus</option><option value="semi_detached">Doppelhaushälfte</option><option value="row_house">Reihenhaus</option><option value="apartment">Eigentumswohnung</option><option value="multi_family">Mehrfamilienhaus</option><option value="other">Sonstiges</option></select></label>
        <label className="field"><span>Zustand</span><select name="condition"><option value="very_good">Sehr gut</option><option value="good">Gut</option><option value="average">Durchschnittlich</option><option value="renovation_needed">Renovierungsbedürftig</option></select></label>
        <label className="field"><span>Straße</span><input name="propertyStreet" required /></label>
        <label className="field"><span>PLZ</span><input name="propertyPostalCode" required /></label>
        <label className="field"><span>Ort</span><input name="propertyCity" required /></label>
        <label className="field"><span>Wohnfläche qm</span><input name="livingAreaSqm" type="number" min="1" required /></label>
        <label className="field"><span>Grundstück qm</span><input name="plotAreaSqm" type="number" min="0" /></label>
        <label className="field"><span>Nutzfläche qm</span><input name="usableAreaSqm" type="number" min="0" /></label>
        <label className="field"><span>Baujahr</span><input name="yearBuilt" type="number" min="1800" max="2026" /></label>
        <label className="field"><span>Miteigentumsanteile</span><input name="coOwnershipShares" /></label>
        <label className="field"><span>Parkplatz vorhanden?</span><select name="parkingAvailable"><option value="no">Nein</option><option value="yes">Ja</option></select></label>
        <label className="field"><span>Parkplatztyp</span><select name="parkingType"><option value="">Keine Angabe</option><option value="garage">Garage</option><option value="carport">Carport</option><option value="outdoor_space">Stellplatz</option><option value="duplex">Doppelparker</option></select></label>
        <label className="field"><span>Anzahl Parkplätze</span><input name="parkingCount" type="number" min="0" /></label>
        <label className="field"><span>Keller</span><select name="basementType"><option value="none">Nein</option><option value="partial">Teilunterkellert</option><option value="full">Vollunterkellert</option></select></label>
        <label className="field"><span>Heizungsart</span><input name="heatingType" /></label>
        <label className="field"><span>Baujahr/Modernisierung Heizung</span><input name="heatingYear" type="number" min="1900" max="2026" /></label>
        <label className="field"><span>Fenstermaterial</span><select name="windowMaterial"><option value="">Bitte wählen</option><option value="wood">Holz</option><option value="aluminium">Aluminium</option><option value="plastic">Kunststoff</option></select></label>
        <label className="field"><span>Installationsjahr Fenster</span><input name="windowInstallationYear" type="number" min="1900" max="2026" /></label>
        <label className="field"><span>Asbest im Dach bekannt?</span><select name="asbestosRoofKnown"><option value="no">Nein</option><option value="yes">Ja</option></select></label>
        <label className="field"><span>Energieausweis vorhanden?</span><select name="energyCertificateAvailable"><option value="no">Nein</option><option value="yes">Ja</option></select></label>
        <label className="field"><span>Typ Energieausweis</span><select name="energyCertificateType"><option value="">Keine Angabe</option><option value="demand">Bedarfsausweis</option><option value="consumption">Verbrauchsausweis</option></select></label>
        <label className="field"><span>Energieklasse</span><input name="energyClass" /></label>
        <label className="field"><span>Optik</span><select name="visualConditionRating"><option value="medium">Mittel</option><option value="very_bad">Sehr schlecht</option><option value="bad">Schlecht</option><option value="moderate">Mäßig</option><option value="good">Gut</option><option value="very_good">Sehr gut</option></select></label>
        <label className="field"><span>Nutzung</span><input name="occupancyStatus" placeholder="owner_occupied" /></label>
        <div style={{ gridColumn: "1 / -1", display: "flex", gap: 16, flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}><input name="leasehold" type="checkbox" /> Erbbaurecht vorhanden</label>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}><input name="monumentProtection" type="checkbox" /> Denkmalschutz vorhanden</label>
        </div>
        <div style={{ gridColumn: "1 / -1", display: "flex", gap: 16, flexWrap: "wrap" }}>
          <label><input name="photovoltaik" type="checkbox" /> Photovoltaik</label>
          <label><input name="solarthermie" type="checkbox" /> Solarthermie</label>
          <label><input name="batteriespeicher" type="checkbox" /> Batteriespeicher</label>
        </div>
        <label className="field" style={{ gridColumn: "1 / -1" }}><span>Mängel / Sanierungsdiskussionen / Reparaturen</span><textarea name="knownDefects" rows={3} /></label>
      </section>

      <section className="panel panel-pad grid two">
        <h2 style={{ margin: 0, gridColumn: "1 / -1" }}>3. Schritt - Modernisierungen und Bauteile</h2>
        {["Heating", "Roof", "Facade", "Windows", "Lines", "Bathrooms"].map((item) => (
          <label className="field" key={item}><span>Modernisierung {item}</span><select name={`modernization${item}`}><option value="none">Keine</option><option value="partial">Teilweise</option><option value="complete">Vollständig</option></select><input name={`modernization${item}Year`} placeholder="Jahr / Maßnahme" /></label>
        ))}
        {["Roof", "Facade", "Masonry", "Bathrooms", "Windows", "Electric", "Outdoor"].map((item) => (
          <label className="field" key={item}><span>Zustand {item}</span><select name={`condition${item}`}><option value="medium">Mittel</option><option value="very_bad">Marode</option><option value="bad">Schlecht</option><option value="moderate">Mäßig</option><option value="good">Gut</option><option value="very_good">Sehr gut</option></select></label>
        ))}
      </section>

      <section className="panel panel-pad grid two">
        <h2 style={{ margin: 0, gridColumn: "1 / -1" }}>4. Schritt - weitere Angaben und Dokumente</h2>
        <label className="field"><span>Bestehende Restschulden</span><input name="remainingDebtAmount" type="number" min="0" step="1000" /></label>
        <label className="field"><span>Dateiname</span><input name="documentFileName" placeholder="grundbuch.pdf" /></label>
        <label className="field"><span>Kategorie</span><select name="documentCategory"><option value="land_register">Grundbuchauszug</option><option value="photos">Fotos</option><option value="floorplan">Bemaßter Grundriss</option><option value="section">Schnitt</option><option value="living_area_calculation">Wohnflächenberechnung</option><option value="energy_certificate">Energieausweis</option><option value="declaration_of_division">Teilungserklärung</option><option value="service_charge_statement">Hausgeldabrechnung</option><option value="owners_meeting_minutes">Eigentümerprotokoll</option><option value="maintenance_reserve">Instandhaltungsrücklage</option><option value="power_of_attorney">Vollmacht Grundbuch</option><option value="repair_offer">Reparaturangebot</option><option value="other">Sonstiges</option></select></label>
        <label className="field" style={{ gridColumn: "1 / -1" }}><span>Notizen</span><textarea name="notes" rows={4} /></label>
      </section>

      {error ? <p className="btn-danger">{error}</p> : null}
      <div><button className="btn btn-primary" type="submit">Fall anlegen</button></div>
    </form>
  );
}
