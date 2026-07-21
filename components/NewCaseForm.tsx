"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { getRequiredDocumentsForPropertyType } from "@/lib/document-requirements";
import { formatAddress } from "@/lib/address";

const residentialRightYears = Array.from({ length: 11 }, (_, index) => index + 5);

const modernizationFields = [
  "heating",
  "roof",
  "facade",
  "windows",
  "lines",
  "bathrooms"
] as const;

const buildingConditionFields = [
  ["Roof", "roof"],
  ["Facade", "facade"],
  ["Masonry", "masonry"],
  ["Windows", "windows"],
  ["Basement", "basement"],
  ["Electric", "electric"],
  ["Sanitary", "sanitary"],
  ["Interior", "interior"],
  ["Outdoor", "outdoor"],
  ["Other", "other"]
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
  const t = useTranslations("customers.intake");
  const [error, setError] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [desiredModel, setDesiredModel] = useState("");
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
      setError(t("messages.exclusionBlocked"));
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
      houseNumber: form.get("customerHouseNumber"),
      postalCode: form.get("customerPostalCode"),
      city: form.get("customerCity"),
      addressText: formatAddress({
        street: stringValue(form.get("customerStreet")),
        houseNumber: stringValue(form.get("customerHouseNumber")),
        postalCode: stringValue(form.get("customerPostalCode")),
        city: stringValue(form.get("customerCity"))
      }),
      consentDataProcessing: form.get("consentDataProcessing") === "on"
    };
    const customerResponse = await fetch("/api/customers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(customerPayload)
    });
    const customerResult = await customerResponse.json();
    if (!customerResponse.ok) {
      setError(t("messages.customerCreateFailed"));
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
        modernizationFields.map((key) => [
          key,
          {
            scope: form.get(`modernization${key}`),
            year: stringValue(form.get(`modernization${key}Year`)),
            note: stringValue(form.get(`modernization${key}Note`))
          }
        ])
      ),
      buildingCondition: {
        roof: { rating: form.get("conditionRoof"), description: stringValue(form.get("conditionRoofNote")) },
        facade: { rating: form.get("conditionFacade"), description: stringValue(form.get("conditionFacadeNote")) },
        masonry: { rating: form.get("conditionMasonry"), description: stringValue(form.get("conditionMasonryNote")) },
        windows: { rating: form.get("conditionWindows"), description: stringValue(form.get("conditionWindowsNote")) },
        basement: { rating: form.get("conditionBasement"), description: stringValue(form.get("conditionBasementNote")) },
        electric: { rating: form.get("conditionElectric"), description: stringValue(form.get("conditionElectricNote")) },
        sanitary: { rating: form.get("conditionSanitary"), description: stringValue(form.get("conditionSanitaryNote")) },
        interior: { rating: form.get("conditionInterior"), description: stringValue(form.get("conditionInteriorNote")) },
        outdoor: { rating: form.get("conditionOutdoor"), description: stringValue(form.get("conditionOutdoorNote")) },
        other: { rating: stringValue(form.get("conditionOther")), description: stringValue(form.get("conditionOtherNote")) }
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
      setError(t("messages.propertyCreateFailed"));
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

    window.location.href = `/partner?case=${encodeURIComponent(propertyResult.property.id)}&tab=kunde`;
  }

  return (
    <form className="grid" onSubmit={submit}>
      <section className="panel panel-pad grid two">
        <h2 style={{ margin: 0, gridColumn: "1 / -1" }}>{t("standalone.stepTitle", { step: 1, title: t("steps.personal") })}</h2>
        <label className="field"><span>{t("personal.firstName")}</span><input name="firstName" required /></label>
        <label className="field"><span>{t("personal.lastName")}</span><input name="lastName" required /></label>
        <label className="field"><span>{t("personal.gender")}</span><select name="gender"><option value="not_specified">{t("personal.noAnswer")}</option><option value="female">{t("personal.female")}</option><option value="male">{t("personal.male")}</option><option value="diverse">{t("personal.diverse")}</option></select></label>
        <label className="field"><span>{t("personal.dateOfBirth")}</span><input name="dateOfBirth" value={dateOfBirth} onChange={(event) => setDateOfBirth(event.target.value)} type="date" /></label>
        <div className="field"><label>{t("standalone.currentAge")}</label><div className="panel panel-pad">{currentAge() ?? "-"}</div></div>
        <label className="field"><span>{t("personal.maritalStatus")}</span><select name="maritalStatus" value={maritalStatus} onChange={(event) => setMaritalStatus(event.target.value)}><option value="">{t("common.select")}</option><option value="single">{t("personal.single")}</option><option value="married">{t("personal.married")}</option><option value="divorced">{t("personal.divorced")}</option><option value="widowed">{t("personal.widowed")}</option><option value="other">{t("property.other")}</option></select></label>
        <label className="field"><span>{t("personal.email")}</span><input name="email" type="email" /></label>
        <label className="field"><span>{t("personal.telephone")}</span><input name="phone" /></label>
        <label className="field"><span>{t("personal.mobile")}</span><input name="mobile" /></label>

        {maritalStatus === "married" ? (
          <div className="panel panel-pad grid two" style={{ gridColumn: "1 / -1" }}>
            <h3 style={{ margin: 0, gridColumn: "1 / -1" }}>{t("personal.spouse")}</h3>
            <label className="field"><span>{t("personal.firstName")}</span><input name="spouseFirstName" /></label>
            <label className="field"><span>{t("personal.lastName")}</span><input name="spouseLastName" /></label>
            <label className="field"><span>{t("personal.gender")}</span><select name="spouseGender"><option value="not_specified">{t("personal.noAnswer")}</option><option value="female">{t("personal.female")}</option><option value="male">{t("personal.male")}</option><option value="diverse">{t("personal.diverse")}</option></select></label>
            <label className="field"><span>{t("personal.dateOfBirth")}</span><input name="spouseDateOfBirth" type="date" /></label>
          </div>
        ) : null}

        <label className="field"><span>{t("personal.monthlyIncome")}</span><select name="monthlyIncomeRange"><option value="">{t("common.select")}</option><option value="under_1000">{t("personal.incomeUnder")}</option><option value="from_1000_to_2000">{t("personal.income1000To2000")}</option><option value="from_2000_to_3000">{t("personal.income2000To3000")}</option><option value="over_3000">{t("personal.incomeOver")}</option></select></label>
        {maritalStatus === "married" ? (
          <label className="field"><span>{t("standalone.ownerQuestion")}</span><select name="propertyOwnership"><option value="customer_1">{t("personal.customer1")}</option><option value="customer_2">{t("personal.customer2")}</option><option value="both">{t("personal.both")}</option></select></label>
        ) : null}
        <div className="customer-address-grid" style={{ display: "grid", gap: 16, gridColumn: "1 / -1" }}>
          <label className="field"><span>{t("personal.street")}</span><input name="customerStreet" autoComplete="address-line1" required /></label>
          <label className="field"><span>{t("personal.houseNumber")}</span><input name="customerHouseNumber" type="text" autoComplete="address-line2" required /></label>
          <label className="field"><span>{t("personal.postalCode")}</span><input name="customerPostalCode" inputMode="numeric" autoComplete="postal-code" required /></label>
          <label className="field"><span>{t("personal.city")}</span><input name="customerCity" autoComplete="address-level2" required /></label>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}><input name="consentDataProcessing" type="checkbox" required /> {t("standalone.consentConfirmed")}</label>
      </section>

      <section className="panel panel-pad grid two">
        <h2 style={{ margin: 0, gridColumn: "1 / -1" }}>{t("standalone.stepTitle", { step: 2, title: t("steps.model") })}</h2>
        <label className="field"><span>{t("standalone.model")}</span><select name="desiredModel" value={desiredModel} onChange={(event) => setDesiredModel(event.target.value)} required><option value="">{t("common.select")}</option><option value="fixed_residential_right">{t("model.residentialRight")}</option><option value="sale_and_leaseback">{t("model.rentBackSale")}</option></select></label>
        <label className="field"><span>{t("model.recipients")}</span><select name="residentialRightRecipients"><option value="one_person">{t("model.onePerson")}</option><option value="both">{t("model.bothPeople")}</option></select></label>

        {desiredModel === "fixed_residential_right" ? (
          <>
            <label className="field"><span>{t("model.duration")}</span><select name="desiredResidentialRightYears" defaultValue="10">{residentialRightYears.map((year) => <option key={year} value={year}>{year} {t("model.years")}</option>)}</select></label>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}><input name="rentalOptionDeselected" type="checkbox" /> {t("standalone.declineLaterRental")}</label>
            <label className="field" style={{ gridColumn: "1 / -1" }}><span>{t("model.fixedTermReason")}</span><textarea name="fixedTermReason" rows={3} /></label>
          </>
        ) : (
          <div className="panel panel-pad" style={{ gridColumn: "1 / -1", borderColor: "var(--accent)" }}>
            <p style={{ marginTop: 0 }}><strong>{t("model.rentBackDisclosure")}</strong> {t("model.rentBackDisclosureText")}</p>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}><input name="rentalModelDisclosureAccepted" type="checkbox" required /> {t("standalone.disclosureDiscussed")}</label>
          </div>
        )}

        <label className="field" style={{ gridColumn: "1 / -1" }}><span>{t("standalone.modelReason")}</span><textarea name="modelReason" rows={3} placeholder={t("standalone.modelReasonPlaceholder")} /></label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, gridColumn: "1 / -1" }}><input name="additionalOfferRequested" type="checkbox" checked={additionalOfferRequested} onChange={(event) => setAdditionalOfferRequested(event.target.checked)} /> {t("standalone.secondOfferRequested")}</label>
        {additionalOfferRequested ? (
          <div className="panel panel-pad grid two" style={{ gridColumn: "1 / -1" }}>
            <h3 style={{ margin: 0, gridColumn: "1 / -1" }}>{t("standalone.secondOfferModel")}</h3>
            <label className="field"><span>{t("standalone.model")}</span><select name="additionalOfferModel" value={additionalOfferModel} onChange={(event) => setAdditionalOfferModel(event.target.value)}><option value="fixed_residential_right">{t("model.residentialRight")}</option><option value="sale_and_leaseback">{t("model.rentBackSale")}</option></select></label>
            {additionalOfferModel === "fixed_residential_right" ? (
              <label className="field"><span>{t("model.duration")}</span><select name="additionalOfferResidentialRightYears" defaultValue="10">{residentialRightYears.map((year) => <option key={year} value={year}>{year} {t("model.years")}</option>)}</select></label>
            ) : null}
            <label className="field" style={{ gridColumn: "1 / -1" }}><span>{t("standalone.secondOfferReason")}</span><textarea name="additionalOfferReason" rows={3} /></label>
          </div>
        ) : null}
      </section>

      <section className="panel panel-pad grid two">
        <h2 style={{ margin: 0, gridColumn: "1 / -1" }}>{t("standalone.stepTitle", { step: 3, title: t("steps.property") })}</h2>
        <label className="field"><span>{t("property.type")}</span><select name="propertyType" value={propertyType} onChange={(event) => setPropertyType(event.target.value)}><option value="single_family">{t("property.singleFamily")}</option><option value="semi_detached">{t("property.semiDetached")}</option><option value="row_house">{t("property.terraced")}</option><option value="apartment">{t("property.apartment")}</option></select></label>
        <label className="field"><span>{t("personal.street")}</span><input name="propertyStreet" required /></label>
        <label className="field"><span>{t("personal.postalCode")}</span><input name="propertyPostalCode" required /></label>
        <label className="field"><span>{t("personal.city")}</span><input name="propertyCity" required /></label>
        <label className="field"><span>{t("property.livingArea")}</span><input name="livingAreaSqm" type="number" min="1" required /></label>
        <label className="field"><span>{t("property.plotArea")}</span><input name="plotAreaSqm" type="number" min="0" required /></label>
        <label className="field"><span>{t("property.usableArea")}</span><input name="usableAreaSqm" type="number" min="0" /></label>
        <label className="field"><span>{t("property.yearBuilt")}</span><input name="yearBuilt" type="number" min="1800" max="2026" /></label>
        {propertyType === "apartment" ? (
          <label className="field"><span>{t("property.coOwnership")}</span><input name="coOwnershipShares" placeholder={t("standalone.coOwnershipPlaceholder")} /></label>
        ) : null}
        <label className="field"><span>{t("property.appearance")}</span><select name="visualConditionRating" required><option value="">{t("common.select")}</option><option value="very_bad">{t("property.veryPoor")}</option><option value="bad">{t("property.poor")}</option><option value="moderate">{t("property.fair")}</option><option value="medium">{t("property.average")}</option><option value="good">{t("property.good")}</option><option value="very_good">{t("property.veryGood")}</option></select></label>
        <label className="field"><span>{t("property.basement")}</span><select name="basementType"><option value="none">{t("property.noBasement")}</option><option value="partial">{t("property.partialBasement")}</option><option value="full">{t("property.fullBasement")}</option></select></label>
        <label className="field"><span>{t("property.heatingType")}</span><select name="heatingType"><option value="">{t("common.select")}</option><option value="central">{t("property.centralHeating")}</option><option value="floor">{t("property.floorHeating")}</option><option value="electric">{t("property.electricHeating")}</option><option value="single_stove">{t("property.singleStove")}</option><option value="none">{t("common.none")}</option></select></label>
        <label className="field"><span>{t("property.energySource")}</span><select name="heatingEnergySource" value={heatingEnergySource} onChange={(event) => setHeatingEnergySource(event.target.value)}><option value="">{t("common.select")}</option><option value="gas">{t("property.gas")}</option><option value="oil">{t("property.oil")}</option><option value="district_heating">{t("property.districtHeating")}</option><option value="heat_pump">{t("property.heatPump")}</option><option value="electricity">{t("property.electricity")}</option><option value="wood_pellets">{t("property.woodPellets")}</option><option value="hybrid">{t("property.hybrid")}</option><option value="other">{t("property.other")}</option></select></label>
        {heatingEnergySource === "other" ? <label className="field"><span>{t("property.energySourceDescription")}</span><input name="heatingEnergySourceOther" /></label> : null}
        <label className="field"><span>{t("standalone.heatingYear")}</span><input name="heatingYear" type="number" min="1900" max="2026" /></label>
        <div style={{ gridColumn: "1 / -1", display: "flex", gap: 16, flexWrap: "wrap" }}>
          <label><input name="photovoltaik" type="checkbox" /> {t("property.photovoltaics")}</label>
          <label><input name="solarthermie" type="checkbox" /> {t("property.solarThermal")}</label>
          <label><input name="batteriespeicher" type="checkbox" /> {t("property.batteryStorage")}</label>
        </div>
        <label className="field"><span>{t("property.windowMaterial")}</span><select name="windowMaterial"><option value="">{t("common.select")}</option><option value="wood">{t("property.wood")}</option><option value="aluminium">{t("property.aluminium")}</option><option value="plastic">{t("property.plastic")}</option></select></label>
        <label className="field"><span>{t("property.windowYear")}</span><input name="windowInstallationYear" type="number" min="1900" max="2026" /></label>
        <label className="field"><span>{t("property.asbestos")}</span><select name="asbestosRoofKnown"><option value="no">{t("common.no")}</option><option value="yes">{t("common.yes")}</option></select></label>
        <label className="field"><span>{t("standalone.energyCertificateAvailable")}</span><select name="energyCertificateAvailable" value={energyCertificateAvailable} onChange={(event) => setEnergyCertificateAvailable(event.target.value)}><option value="no">{t("common.no")}</option><option value="yes">{t("common.yes")}</option></select></label>
        {energyCertificateAvailable === "yes" ? (
          <>
            <label className="field"><span>{t("property.certificateType")}</span><select name="energyCertificateType" required><option value="">{t("common.select")}</option><option value="demand">{t("property.demandCertificate")}</option><option value="consumption">{t("property.consumptionCertificate")}</option></select></label>
            <label className="field"><span>{t("property.energyClass")}</span><select name="energyClass" required><option value="">{t("common.select")}</option><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option><option value="E">E</option><option value="F">F</option><option value="G">G</option><option value="H">H</option></select></label>
          </>
        ) : null}
        <label className="field"><span>{t("standalone.parking")}</span><select name="parkingType" value={parkingType} onChange={(event) => setParkingType(event.target.value)}><option value="">{t("standalone.noParking")}</option><option value="garage">{t("property.garage")}</option><option value="carport">{t("property.carport")}</option><option value="outdoor_space">{t("property.outdoorParking")}</option><option value="duplex">{t("property.undergroundParking")}</option></select></label>
        {parkingType ? <label className="field"><span>{t("standalone.parkingCount")}</span><input name="parkingCount" type="number" min="1" defaultValue="1" /></label> : null}
        <div style={{ gridColumn: "1 / -1", display: "flex", gap: 16, flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}><input name="leasehold" type="checkbox" /> {t("standalone.leaseholdPresent")}</label>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}><input name="monumentProtection" type="checkbox" /> {t("standalone.listedPresent")}</label>
        </div>
        <label className="field" style={{ gridColumn: "1 / -1" }}><span>{t("standalone.defects")}</span><textarea name="knownDefects" rows={3} /></label>
        <label className="field" style={{ gridColumn: "1 / -1" }}><span>{t("standalone.generalNotes")}</span><textarea name="generalPropertyNotes" rows={3} /></label>
      </section>

      <section className="panel panel-pad grid">
        <h2 style={{ margin: 0 }}>{t("standalone.stepTitle", { step: 4, title: t("steps.modernisations") })}</h2>
        <div className="grid" style={{ gap: 10 }}>
          {modernizationFields.map((key) => (
            <div key={key} className="grid" style={{ gridTemplateColumns: "1.1fr 0.7fr 1fr", gap: 12 }}>
              <label className="field"><span>{t(`modernisations.components.${key}`)}</span><select name={`modernization${key}`}><option value="none">{t("modernisations.none")}</option><option value="partial">{t("modernisations.partial")}</option><option value="complete">{t("modernisations.complete")}</option></select></label>
              <label className="field"><span>{t("modernisations.year")}</span><input name={`modernization${key}Year`} placeholder={t("standalone.yearPlaceholder")} /></label>
              <label className="field"><span>{t("modernisations.note")}</span><input name={`modernization${key}Note`} placeholder={t("standalone.modernisationNotePlaceholder")} /></label>
            </div>
          ))}
        </div>
        <h3 style={{ margin: "12px 0 0" }}>{t("modernisations.condition")}</h3>
        <div className="grid">
          {buildingConditionFields.map(([item, key]) => (
            <div className="grid two" key={item}>
              <label className="field"><span>{t("standalone.conditionRating", { component: t(`modernisations.components.${key}`) })}</span><select name={`condition${item}`}><option value="">{t("common.select")}</option><option value="medium">{t("property.average")}</option><option value="very_bad">{t("standalone.derelict")}</option><option value="bad">{t("property.poor")}</option><option value="moderate">{t("property.fair")}</option><option value="good">{t("property.good")}</option><option value="very_good">{t("property.veryGood")}</option><option value="unknown">{t("common.unknown")}</option></select></label>
              <label className="field"><span>{t("standalone.conditionDescription", { component: t(`modernisations.components.${key}`) })}</span><input name={`condition${item}Note`} placeholder={t("modernisations.conditionPlaceholder")} /></label>
            </div>
          ))}
        </div>
      </section>

      <section className="panel panel-pad grid two">
        <h2 style={{ margin: 0, gridColumn: "1 / -1" }}>{t("standalone.stepTitle", { step: 5, title: t("standalone.additionalDetailsDocuments") })}</h2>
        <div className="panel panel-pad grid two" style={{ gridColumn: "1 / -1" }}>
          <h3 style={{ margin: 0, gridColumn: "1 / -1" }}>{t("property.remainingDebt")}</h3>
          <label className="field"><span>{t("standalone.remainingDebtQuestion")}</span><select name="remainingDebtKnown" value={remainingDebtKnown} onChange={(event) => setRemainingDebtKnown(event.target.value)}><option value="no">{t("common.no")}</option><option value="yes">{t("common.yes")}</option></select></label>
          {remainingDebtKnown === "yes" ? <label className="field"><span>{t("standalone.remainingDebtAmount")}</span><input name="remainingDebtAmount" type="number" min="0" step="1000" required /></label> : null}
        </div>
        <div className="panel panel-pad" style={{ gridColumn: "1 / -1" }}>
          <h3 style={{ marginTop: 0 }}>{t("standalone.requiredDocuments")}</h3>
          {requiredDocuments.map((item) => (
            <p key={item.category}>
              <strong>{t.has(`documents.categories.${item.category}`) ? t(`documents.categories.${item.category}`) : item.label}</strong><br />
              <span className="muted">{t.has(`documents.notes.${item.category}`) ? t(`documents.notes.${item.category}`) : t("standalone.uploadWhenAvailable")}</span>
            </p>
          ))}
        </div>
        <label className="field"><span>{t("standalone.uploadDocument")}</span><input name="documentFile" type="file" accept=".pdf,.jpg,.jpeg,.png,.heic,.doc,.docx" /></label>
        <label className="field"><span>{t("standalone.category")}</span><select name="documentCategory">{requiredDocuments.map((item) => <option key={item.category} value={item.category}>{t.has(`documents.categories.${item.category}`) ? t(`documents.categories.${item.category}`) : item.label}</option>)}<option value="power_of_attorney">{t("documents.categories.power_of_attorney")}</option><option value="repair_offer">{t("documents.categories.repair_offer")}</option><option value="other">{t("documents.categories.other")}</option></select></label>
        <label className="field"><span>{t("standalone.requirementLevel")}</span><select name="documentRequirementLevel"><option value="required">{t("common.required")}</option><option value="recommended">{t("standalone.recommended")}</option><option value="optional">{t("common.optional")}</option></select></label>
        <label className="field" style={{ gridColumn: "1 / -1" }}><span>{t("standalone.notes")}</span><textarea name="notes" rows={4} /></label>
      </section>

      {error ? <p className="btn-danger">{error}</p> : null}
      <div><button className="btn btn-primary" type="submit">{t("standalone.createCase")}</button></div>
    </form>
  );
}
