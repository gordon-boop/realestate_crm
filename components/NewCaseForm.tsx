"use client";

import { useState } from "react";
import { getRequiredDocumentsForPropertyType } from "@/lib/document-requirements";

const residentialRightYears = Array.from({ length: 11 }, (_, index) => index + 5);

const modernizationFields = [
  ["heating", "Heizung"],
  ["roof", "Dach"],
  ["facade", "Fassade"],
  ["windows", "Fenster"],
  ["lines", "Leitungen"],
  ["bathrooms", "Bäder"]
] as const;

function numberValue(value: FormDataEntryValue | null): number | undefined {
  if (value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function stringValue(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function NewCaseForm() {
  const [error, setError] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [desiredModel, setDesiredModel] = useState("fixed_residential_right");
  const [additionalOfferRequested, setAdditionalOfferRequested] = useState(false);
  const [additionalOfferModel, setAdditionalOfferModel] = useState("sale_and_leaseback");
  const [propertyType, setPropertyType] = useState("single_family");
  const [energyCertificateAvailable, setEnergyCertificateAvailable] = useState("no");
  const [parkingType, setParkingType] = useState("");
  const [heatingEnergySource, setHeatingEnergySource] = useState("");
  const [remainingDebtKnown, setRemainingDebtKnown] = useState("no");

  const requiredDocuments = getRequiredDocumentsForPropertyType(propertyType);

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

    const isMarried = form.get("maritalStatus") === "married";
    const hasParking = Boolean(stringValue(form.get("parkingType")));
    const debtKnown = form.get("remainingDebtKnown") === "yes";
    const energyAvailable = form.get("energyCertificateAvailable") === "yes";

    const customerPayload = {
      firstName: form.get("firstName"),
      lastName: form.get("lastName"),
      displayName: `${form.get("firstName") ?? ""} ${form.get("lastName") ?? ""}`.trim(),
      ageAtSubmission: currentAge(),
      gender: form.get("gender"),
      dateOfBirth: form.get("dateOfBirth"),
      maritalStatus: form.get("maritalStatus"),
      spouseFirstName: isMarried ? form.get("spouseFirstName") : undefined,
      spouseLastName: isMarried ? form.get("spouseLastName") : undefined,
      spouseGender: isMarried ? form.get("spouseGender") : undefined,
      spouseDateOfBirth: isMarried ? form.get("spouseDateOfBirth") : undefined,
      propertyOwnership: isMarried ? form.get("propertyOwnership") : "customer_1",
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
      livingAreaSqm: numberValue(form.get("livingAreaSqm")),
      plotAreaSqm: numberValue(form.get("plotAreaSqm")),
      usableAreaSqm: numberValue(form.get("usableAreaSqm")),
      yearBuilt: numberValue(form.get("yearBuilt")),
      condition: "average",
      desiredModel: form.get("desiredModel"),
      residentialRightRecipients: form.get("residentialRightRecipients"),
      desiredResidentialRightYears: desiredModel === "fixed_residential_right" ? numberValue(form.get("desiredResidentialRightYears")) : undefined,
      fixedTermReason: desiredModel === "fixed_residential_right" ? form.get("fixedTermReason") : undefined,
      modelReason: form.get("modelReason"),
      rentalModelDisclosureAccepted: desiredModel === "sale_and_leaseback" ? form.get("rentalModelDisclosureAccepted") === "on" : false,
      rentalOptionDeselected: form.get("rentalOptionDeselected") === "on",
      secondResidentialRightWanted: false,
      additionalOfferRequested: form.get("additionalOfferRequested") === "on",
      additionalOfferModel: form.get("additionalOfferRequested") === "on" ? form.get("additionalOfferModel") : undefined,
      additionalOfferResidentialRightYears: form.get("additionalOfferModel") === "fixed_residential_right" ? numberValue(form.get("additionalOfferResidentialRightYears")) : undefined,
      additionalOfferReason: form.get("additionalOfferRequested") === "on" ? form.get("additionalOfferReason") : undefined,
      coOwnershipShares: propertyType === "apartment" ? form.get("coOwnershipShares") : undefined,
      parkingAvailable: hasParking,
      parkingType: hasParking ? form.get("parkingType") : undefined,
      parkingCount: hasParking ? numberValue(form.get("parkingCount")) : undefined,
      basementType: form.get("basementType"),
      heatingType: form.get("heatingType"),
      heatingEnergySource: form.get("heatingEnergySource"),
      heatingEnergySourceOther: form.get("heatingEnergySource") === "other" ? form.get("heatingEnergySourceOther") : undefined,
      heatingYear: numberValue(form.get("heatingYear")),
      energyCarriers: ["photovoltaik", "solarthermie", "batteriespeicher"].filter((name) => form.get(name) === "on"),
      windowMaterial: form.get("windowMaterial"),
      windowInstallationYear: numberValue(form.get("windowInstallationYear")),
      asbestosRoofKnown: form.get("asbestosRoofKnown") === "yes",
      energyCertificateAvailable: energyAvailable,
      energyCertificateType: energyAvailable ? form.get("energyCertificateType") : undefined,
      energyClass: energyAvailable ? form.get("energyClass") : undefined,
      visualConditionRating: form.get("visualConditionRating"),
      leasehold: form.get("leasehold") === "on",
      monumentProtection: form.get("monumentProtection") === "on",
      leaseholdOrMonument: form.get("leasehold") === "on" || form.get("monumentProtection") === "on",
      knownDefects: form.get("knownDefects"),
      remainingDebtKnown: debtKnown,
      remainingDebtAmount: debtKnown ? numberValue(form.get("remainingDebtAmount")) : undefined,
      modernization: Object.fromEntries(
        modernizationFields.map(([key]) => [
          key,
          {
            scope: form.get(`modernization${key}`),
            year: stringValue(form.get(`modernization${key}Year`)),
            note: stringValue(form.get(`modernization${key}Note`))
          }
        ])
      ),
      buildingCondition: {
        roof: form.get("conditionRoof"),
        facade: form.get("conditionFacade"),
        masonry: form.get("conditionMasonry"),
        bathrooms: form.get("conditionBathrooms"),
        windows: form.get("conditionWindows"),
        electric: form.get("conditionElectric"),
        outdoor: form.get("conditionOutdoor")
      },
      generalPropertyNotes: form.get("generalPropertyNotes"),
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

    const documentFile = form.get("documentFile");
    if (documentFile instanceof File && documentFile.name) {
      const documentForm = new FormData();
      documentForm.append("file", documentFile);
      documentForm.append("category", String(form.get("documentCategory") || "other"));
      documentForm.append("requirementLevel", String(form.get("documentRequirementLevel") || "optional"));
      documentForm.append("status", "pending");
      await fetch(`/api/properties/${propertyResult.property.id}/documents`, {
        method: "POST",
        body: documentForm
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
        <label className="field"><span>Familienstand</span><select name="maritalStatus" value={maritalStatus} onChange={(event) => setMaritalStatus(event.target.value)}><option value="">Bitte wählen</option><option value="single">Ledig</option><option value="married">Verheiratet</option><option value="divorced">Geschieden</option><option value="widowed">Verwitwet</option><option value="other">Sonstiges</option></select></label>
        <label className="field"><span>E-Mail</span><input name="email" type="email" /></label>
        <label className="field"><span>Telefon</span><input name="phone" /></label>
        <label className="field"><span>Mobil</span><input name="mobile" /></label>

        {maritalStatus === "married" ? (
          <div className="panel panel-pad grid two" style={{ gridColumn: "1 / -1" }}>
            <h3 style={{ margin: 0, gridColumn: "1 / -1" }}>Ehepartner / Kunde 2</h3>
            <label className="field"><span>Vorname</span><input name="spouseFirstName" /></label>
            <label className="field"><span>Nachname</span><input name="spouseLastName" /></label>
            <label className="field"><span>Geschlecht</span><select name="spouseGender"><option value="not_specified">Keine Angabe</option><option value="female">Weiblich</option><option value="male">Männlich</option><option value="diverse">Divers</option></select></label>
            <label className="field"><span>Geburtsdatum</span><input name="spouseDateOfBirth" type="date" /></label>
          </div>
        ) : null}

        <label className="field"><span>Monatliche Einkünfte</span><select name="monthlyIncomeRange"><option value="">Bitte wählen</option><option value="under_1000">Unter 1.000 EUR</option><option value="from_1000_to_2000">1.000 - 2.000 EUR</option><option value="from_2000_to_3000">2.000 - 3.000 EUR</option><option value="over_3000">Mehr als 3.000 EUR</option></select></label>
        {maritalStatus === "married" ? (
          <label className="field"><span>Wer ist Eigentümer?</span><select name="propertyOwnership"><option value="customer_1">Kunde 1</option><option value="customer_2">Kunde 2</option><option value="both">Beide</option></select></label>
        ) : null}
        <label className="field"><span>Straße</span><input name="customerStreet" /></label>
        <label className="field"><span>PLZ</span><input name="customerPostalCode" /></label>
        <label className="field"><span>Ort</span><input name="customerCity" /></label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}><input name="consentDataProcessing" type="checkbox" required /> DSGVO-Einwilligung liegt vor</label>
      </section>

      <section className="panel panel-pad grid two">
        <h2 style={{ margin: 0, gridColumn: "1 / -1" }}>2. Schritt - Wunschmodell</h2>
        <label className="field"><span>Modell</span><select name="desiredModel" value={desiredModel} onChange={(event) => setDesiredModel(event.target.value)}><option value="fixed_residential_right">Befristetes Wohnrecht</option><option value="sale_and_leaseback">Rückmiete</option></select></label>
        <label className="field"><span>Wer soll das Wohnrecht bekommen?</span><select name="residentialRightRecipients"><option value="one_person">Eine Person</option><option value="both">Beide Personen</option></select></label>

        {desiredModel === "fixed_residential_right" ? (
          <>
            <label className="field"><span>Dauer des Wohnrechts</span><select name="desiredResidentialRightYears" defaultValue="10">{residentialRightYears.map((year) => <option key={year} value={year}>{year} Jahre</option>)}</select></label>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}><input name="rentalOptionDeselected" type="checkbox" /> Spätere Anmietoption abwählen</label>
            <label className="field" style={{ gridColumn: "1 / -1" }}><span>Grund der Befristung</span><textarea name="fixedTermReason" rows={3} /></label>
          </>
        ) : (
          <div className="panel panel-pad" style={{ gridColumn: "1 / -1", borderColor: "var(--accent)" }}>
            <p style={{ marginTop: 0 }}><strong>Hinweis Rückmiete:</strong> Dem Kunden muss klar sein, dass ab Tag 1 eine Miete zu zahlen ist.</p>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}><input name="rentalModelDisclosureAccepted" type="checkbox" required /> Belehrung wurde mit dem Kunden besprochen</label>
          </div>
        )}

        <label className="field" style={{ gridColumn: "1 / -1" }}><span>Grund für das gewünschte Modell</span><textarea name="modelReason" rows={3} placeholder="z.B. konkrete Umzugsplanung, finanzielle Situation, gewünschte Flexibilität" /></label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, gridColumn: "1 / -1" }}><input name="additionalOfferRequested" type="checkbox" checked={additionalOfferRequested} onChange={(event) => setAdditionalOfferRequested(event.target.checked)} /> Kunde wünscht ein zweites Angebot</label>
        {additionalOfferRequested ? (
          <div className="panel panel-pad grid two" style={{ gridColumn: "1 / -1" }}>
            <h3 style={{ margin: 0, gridColumn: "1 / -1" }}>Zweites Angebotsmodell</h3>
            <label className="field"><span>Modell</span><select name="additionalOfferModel" value={additionalOfferModel} onChange={(event) => setAdditionalOfferModel(event.target.value)}><option value="fixed_residential_right">Befristetes Wohnrecht</option><option value="sale_and_leaseback">Rückmiete</option></select></label>
            {additionalOfferModel === "fixed_residential_right" ? (
              <label className="field"><span>Dauer Wohnrecht</span><select name="additionalOfferResidentialRightYears" defaultValue="10">{residentialRightYears.map((year) => <option key={year} value={year}>{year} Jahre</option>)}</select></label>
            ) : null}
            <label className="field" style={{ gridColumn: "1 / -1" }}><span>Grund / Hinweise zum zweiten Angebot</span><textarea name="additionalOfferReason" rows={3} /></label>
          </div>
        ) : null}
      </section>

      <section className="panel panel-pad grid two">
        <h2 style={{ margin: 0, gridColumn: "1 / -1" }}>3. Schritt - Immobiliendaten</h2>
        <label className="field"><span>Objekttyp</span><select name="propertyType" value={propertyType} onChange={(event) => setPropertyType(event.target.value)}><option value="single_family">Einfamilienhaus</option><option value="semi_detached">Doppelhaushälfte</option><option value="row_house">Reihenhaus</option><option value="apartment">Eigentumswohnung</option></select></label>
        <label className="field"><span>Straße</span><input name="propertyStreet" required /></label>
        <label className="field"><span>PLZ</span><input name="propertyPostalCode" required /></label>
        <label className="field"><span>Ort</span><input name="propertyCity" required /></label>
        <label className="field"><span>Wohnfläche qm</span><input name="livingAreaSqm" type="number" min="1" required /></label>
        <label className="field"><span>Grundstück qm</span><input name="plotAreaSqm" type="number" min="0" required /></label>
        <label className="field"><span>Nutzfläche qm</span><input name="usableAreaSqm" type="number" min="0" /></label>
        <label className="field"><span>Baujahr</span><input name="yearBuilt" type="number" min="1800" max="2026" /></label>
        {propertyType === "apartment" ? (
          <label className="field"><span>Miteigentumsanteile</span><input name="coOwnershipShares" placeholder="z.B. 124/1000" /></label>
        ) : null}
        <label className="field"><span>Optik</span><select name="visualConditionRating" required><option value="">Bitte wählen</option><option value="very_bad">Sehr schlecht</option><option value="bad">Schlecht</option><option value="moderate">Mäßig</option><option value="medium">Mittel</option><option value="good">Gut</option><option value="very_good">Sehr gut</option></select></label>
        <label className="field"><span>Keller</span><select name="basementType"><option value="none">Nein</option><option value="partial">Teilunterkellert</option><option value="full">Vollunterkellert</option></select></label>
        <label className="field"><span>Heizungsart</span><select name="heatingType"><option value="">Bitte wählen</option><option value="central">Zentralheizung</option><option value="floor">Etagenheizung</option><option value="electric">Elektroheizung</option><option value="single_stove">Einzelofen</option><option value="none">Keine</option></select></label>
        <label className="field"><span>Energieträger / Wärmeerzeuger</span><select name="heatingEnergySource" value={heatingEnergySource} onChange={(event) => setHeatingEnergySource(event.target.value)}><option value="">Bitte wählen</option><option value="gas">Gas</option><option value="oil">Öl</option><option value="district_heating">Fernwärme</option><option value="heat_pump">Wärmepumpe</option><option value="electricity">Strom</option><option value="wood_pellets">Holz/Pellets</option><option value="hybrid">Hybrid</option><option value="other">Sonstige</option></select></label>
        {heatingEnergySource === "other" ? <label className="field"><span>Beschreibung Energieträger</span><input name="heatingEnergySourceOther" /></label> : null}
        <label className="field"><span>Baujahr / Modernisierung Heizung</span><input name="heatingYear" type="number" min="1900" max="2026" /></label>
        <div style={{ gridColumn: "1 / -1", display: "flex", gap: 16, flexWrap: "wrap" }}>
          <label><input name="photovoltaik" type="checkbox" /> Photovoltaik</label>
          <label><input name="solarthermie" type="checkbox" /> Solarthermie</label>
          <label><input name="batteriespeicher" type="checkbox" /> Batteriespeicher</label>
        </div>
        <label className="field"><span>Fenstermaterial</span><select name="windowMaterial"><option value="">Bitte wählen</option><option value="wood">Holz</option><option value="aluminium">Aluminium</option><option value="plastic">Kunststoff</option></select></label>
        <label className="field"><span>Installationsjahr Fenster</span><input name="windowInstallationYear" type="number" min="1900" max="2026" /></label>
        <label className="field"><span>Asbest im Dach bekannt?</span><select name="asbestosRoofKnown"><option value="no">Nein</option><option value="yes">Ja</option></select></label>
        <label className="field"><span>Energieausweis vorhanden?</span><select name="energyCertificateAvailable" value={energyCertificateAvailable} onChange={(event) => setEnergyCertificateAvailable(event.target.value)}><option value="no">Nein</option><option value="yes">Ja</option></select></label>
        {energyCertificateAvailable === "yes" ? (
          <>
            <label className="field"><span>Typ Energieausweis</span><select name="energyCertificateType" required><option value="">Bitte wählen</option><option value="demand">Bedarfsausweis</option><option value="consumption">Verbrauchsausweis</option></select></label>
            <label className="field"><span>Energieklasse</span><input name="energyClass" required /></label>
          </>
        ) : null}
        <label className="field"><span>Parkplatz</span><select name="parkingType" value={parkingType} onChange={(event) => setParkingType(event.target.value)}><option value="">Kein Parkplatz</option><option value="garage">Garage</option><option value="carport">Carport</option><option value="outdoor_space">Stellplatz</option><option value="duplex">Doppelparker</option></select></label>
        {parkingType ? <label className="field"><span>Anzahl Parkplätze</span><input name="parkingCount" type="number" min="1" defaultValue="1" /></label> : null}
        <div style={{ gridColumn: "1 / -1", display: "flex", gap: 16, flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}><input name="leasehold" type="checkbox" /> Erbbaurecht vorhanden</label>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}><input name="monumentProtection" type="checkbox" /> Denkmalschutz vorhanden</label>
        </div>
        <label className="field" style={{ gridColumn: "1 / -1" }}><span>Mängel / Sanierungsdiskussionen / Reparaturen</span><textarea name="knownDefects" rows={3} /></label>
        <label className="field" style={{ gridColumn: "1 / -1" }}><span>Allgemeine Hinweise zur Immobilie oder zum Kunden</span><textarea name="generalPropertyNotes" rows={3} /></label>
      </section>

      <section className="panel panel-pad grid">
        <h2 style={{ margin: 0 }}>4. Schritt - Modernisierungen und Bauteile</h2>
        <div className="grid" style={{ gap: 10 }}>
          {modernizationFields.map(([key, label]) => (
            <div key={key} className="grid" style={{ gridTemplateColumns: "1.1fr 0.7fr 1fr", gap: 12 }}>
              <label className="field"><span>{label}</span><select name={`modernization${key}`}><option value="none">Keine</option><option value="partial">Teilweise</option><option value="complete">Vollständig</option></select></label>
              <label className="field"><span>Jahr</span><input name={`modernization${key}Year`} placeholder="z.B. 2018" /></label>
              <label className="field"><span>Hinweis</span><input name={`modernization${key}Note`} placeholder="Maßnahme / Besonderheit" /></label>
            </div>
          ))}
        </div>
        <div className="grid two">
          {["Roof", "Facade", "Masonry", "Bathrooms", "Windows", "Electric", "Outdoor"].map((item) => (
            <label className="field" key={item}><span>Zustand {item}</span><select name={`condition${item}`}><option value="medium">Mittel</option><option value="very_bad">Marode</option><option value="bad">Schlecht</option><option value="moderate">Mäßig</option><option value="good">Gut</option><option value="very_good">Sehr gut</option></select></label>
          ))}
        </div>
      </section>

      <section className="panel panel-pad grid two">
        <h2 style={{ margin: 0, gridColumn: "1 / -1" }}>5. Schritt - weitere Angaben und Dokumente</h2>
        <div className="panel panel-pad grid two" style={{ gridColumn: "1 / -1" }}>
          <h3 style={{ margin: 0, gridColumn: "1 / -1" }}>Restschuld</h3>
          <label className="field"><span>Gibt es eine Restschuld?</span><select name="remainingDebtKnown" value={remainingDebtKnown} onChange={(event) => setRemainingDebtKnown(event.target.value)}><option value="no">Nein</option><option value="yes">Ja</option></select></label>
          {remainingDebtKnown === "yes" ? <label className="field"><span>Höhe der Restschuld</span><input name="remainingDebtAmount" type="number" min="0" step="1000" required /></label> : null}
        </div>
        <div className="panel panel-pad" style={{ gridColumn: "1 / -1" }}>
          <h3 style={{ marginTop: 0 }}>Benötigte Unterlagen</h3>
          {requiredDocuments.map((item) => (
            <p key={item.category}>
              <strong>{item.label}</strong><br />
              <span className="muted">{item.note ?? "Bitte hochladen, sobald vorhanden."}</span>
            </p>
          ))}
        </div>
        <label className="field"><span>Unterlage hochladen</span><input name="documentFile" type="file" accept=".pdf,.jpg,.jpeg,.png,.heic,.doc,.docx" /></label>
        <label className="field"><span>Kategorie</span><select name="documentCategory">{requiredDocuments.map((item) => <option key={item.category} value={item.category}>{item.label}</option>)}<option value="power_of_attorney">Vollmacht Grundbuch</option><option value="repair_offer">Reparaturangebot</option><option value="other">Sonstiges</option></select></label>
        <label className="field"><span>Pflichtstatus</span><select name="documentRequirementLevel"><option value="required">Pflicht</option><option value="recommended">Empfohlen</option><option value="optional">Optional</option></select></label>
        <label className="field" style={{ gridColumn: "1 / -1" }}><span>Notizen</span><textarea name="notes" rows={4} /></label>
      </section>

      {error ? <p className="btn-danger">{error}</p> : null}
      <div><button className="btn btn-primary" type="submit">Fall anlegen</button></div>
    </form>
  );
}
