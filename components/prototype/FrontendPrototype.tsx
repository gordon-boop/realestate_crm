// @ts-nocheck
"use client";
import React, { useEffect, useState } from 'react';
import {
  Home, FileText, Building2, Archive, CheckCircle2, FolderOpen, BookOpen,
  MapPin, HelpCircle, Search, Bell, MessageSquare, LogOut, ChevronRight,
  Plus, Clock, AlertCircle, TrendingUp, Users, Briefcase, Settings,
  ArrowLeft, Upload, Calendar, Phone, Mail, Smartphone, User as UserIcon,
  Save, Send, CheckCircle, AlertTriangle, Activity, X, ChevronDown
} from 'lucide-react';
import { getRequiredDocumentsForPropertyType } from '@/lib/document-requirements';

// =====================================================================
// THEME — WohnKapital Mint-Welt
// =====================================================================
const theme = {
  aubergine: '#44005C',
  aubergineSoft: '#5C1077',
  aubergineHover: '#380049',
  gold: '#FFAC00',
  goldSoft: '#FFF7E5',
  oliv: '#A8A443',
  mint: '#E8F5E0',
  mintLight: '#F2F8EC',
  mintLighter: '#F8FBF4',
  ink: '#2A1A35',
  inkSoft: '#5C4A66',
  white: '#FFFFFF',
  border: 'rgba(68, 0, 92, 0.13)',
  borderSoft: 'rgba(68, 0, 92, 0.08)',
};

// Status-Farbsystem
const statusConfig = {
  DRAFT:               { label: 'Entwurf',              color: '#7A6B5C' },
  SUBMITTED:           { label: 'Eingereicht',          color: theme.aubergineSoft },
  DATA_INCOMPLETE:     { label: 'Daten unvollständig',  color: theme.gold },
  VALUATION_PENDING:   { label: 'Bewertung läuft',      color: '#7B61C7' },
  VALUATED:            { label: 'Bewertung fertig',     color: '#7B61C7' },
  OFFER_CALCULATED:    { label: 'Angebot berechnet',    color: '#5B8C2B' },
  OFFER_DRAFTED:       { label: 'Angebotsentwurf',      color: '#5B8C2B' },
  INTERNAL_REVIEW:     { label: 'Interne Prüfung',      color: theme.oliv },
  APPROVED:            { label: 'Freigegeben',          color: '#5B8C2B' },
  SENT:                { label: 'Versendet',            color: '#5B8C2B' },
  APPOINTMENT_SCHEDULED:{ label: 'Termin vereinbart',   color: '#5B8C2B' },
  WON:                 { label: 'Gewonnen',             color: '#3D6B1F' },
  SOLD:                { label: 'Verkauft',             color: '#3D6B1F' },
  REJECTED:            { label: 'Abgelehnt',            color: '#9B2C2C' },
  LOST:                { label: 'Verloren',             color: '#9B2C2C' },
};

const StatusBadge = ({ status, size = 'sm' }) => {
  const cfg = statusConfig[status] || statusConfig.DRAFT;
  const pad = size === 'lg' ? '5px 14px' : '3px 10px';
  const fs = size === 'lg' ? 12.5 : 11;
  return (
    <span style={{
      display: 'inline-block', background: `${cfg.color}1A`, color: cfg.color,
      fontSize: fs, fontWeight: 700, padding: pad, borderRadius: 10,
      letterSpacing: '0.02em', whiteSpace: 'nowrap'
    }}>{cfg.label}</span>
  );
};

// WohnKapital Logo
const Logo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 28 28">
    <circle cx="20" cy="6" r="3.5" fill={theme.gold} />
    <path d="M 4 22 L 4 13 L 13 6 L 22 13 L 22 22 L 16 22 L 16 17 L 10 17 L 10 22 Z"
      fill="none" stroke={theme.aubergine} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
  </svg>
);

// =====================================================================
// SHARED — Header & Sidebar
// =====================================================================
const Header = ({ role, user, onRoleToggle, onLogout }) => (
  <div style={{ background: theme.mintLight, borderBottom: `1px solid ${theme.border}`, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <img src="/brand/wohnkapital-logo.svg" alt="WohnKapital" style={{ display: 'block', width: 154, height: 'auto' }} />
      </div>
      <div style={{ width: 1, height: 22, background: theme.border, margin: '0 8px' }} />
      <span style={{ fontSize: 12, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        {role === 'admin' ? 'Intern · CRM' : 'Partnerportal'}
      </span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <button onClick={onRoleToggle} style={{
        background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine,
        fontSize: 11.5, fontWeight: 600, padding: '6px 12px', borderRadius: 5, cursor: 'pointer',
        letterSpacing: '0.04em', textTransform: 'uppercase'
      }}>
        {role === 'admin' ? 'Zur Makleransicht' : 'Zur Admin-Ansicht'}
      </button>
      <div style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: 6, padding: '6px 12px', border: `1px solid ${theme.border}`, width: 240 }}>
        <Search size={14} style={{ color: `${theme.aubergine}88`, marginRight: 8 }} />
        <input placeholder="Suchen…" style={{ border: 'none', background: 'transparent', fontSize: 13, color: theme.ink, outline: 'none', width: '100%', fontFamily: 'inherit' }} />
      </div>
      <div style={{ position: 'relative', cursor: 'pointer' }}>
        <Bell size={18} style={{ color: theme.aubergine }} />
        <span style={{ position: 'absolute', top: -4, right: -4, background: theme.gold, color: theme.aubergine, fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 8 }}>3</span>
      </div>
      <MessageSquare size={18} style={{ color: theme.aubergine, cursor: 'pointer' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 12, borderLeft: `1px solid ${theme.border}` }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: theme.aubergine, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>{user.initials}</div>
        <span style={{ fontSize: 13, color: theme.ink, fontWeight: 500 }}>{user.name}</span>
        <button onClick={onLogout} title="Abmelden" style={{ background: theme.mintLight, border: `1px solid ${theme.border}`, color: theme.aubergine, borderRadius: 5, padding: '5px 8px', marginLeft: 4, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600 }}>
          <LogOut size={14} /> Logout
        </button>
      </div>
    </div>
  </div>
);

const Sidebar = ({ role, currentScreen, onNavigate }) => {
  const partnerNav = [
    { icon: Home, label: 'Home', screen: 'dashboard' },
    { icon: Building2, label: 'Verrentung' },
    { icon: FolderOpen, label: 'Zwischengespeichert' },
    { icon: Clock, label: 'In Bearbeitung', badge: 4 },
    { icon: Archive, label: 'Bestand' },
    { icon: FileText, label: 'Sonstiges' },
  ];
  const adminNav = [
    { icon: Home, label: 'Home', screen: 'dashboard' },
    { icon: TrendingUp, label: 'Leads', badge: 7, internal: true },
    { icon: Building2, label: 'Verrentung' },
    { icon: FolderOpen, label: 'Zwischengespeichert' },
    { icon: Clock, label: 'In Bearbeitung', badge: 23 },
    { icon: Archive, label: 'Bestand' },
    { icon: CheckCircle2, label: 'Verkauft', internal: true },
    { icon: Users, label: 'Partner' },
    { icon: FileText, label: 'Sonstiges' },
  ];
  const nav = role === 'admin' ? adminNav : partnerNav;
  const isActive = (item) => item.screen === currentScreen;

  return (
    <div style={{ width: 220, background: theme.mintLight, borderRight: `1px solid ${theme.border}`, padding: '16px 12px', flexShrink: 0, overflowY: 'auto' }}>
      {nav.map((item, i) => (
        <div key={i}
          onClick={() => item.screen && onNavigate(item.screen)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 6,
            background: isActive(item) ? theme.aubergine : 'transparent',
            color: isActive(item) ? 'white' : theme.ink,
            fontSize: 13, fontWeight: isActive(item) ? 600 : 500,
            marginBottom: 2, cursor: item.screen ? 'pointer' : 'default',
            opacity: item.screen ? 1 : 0.85
          }}>
          <item.icon size={15} />
          <span style={{ flex: 1 }}>{item.label}</span>
          {item.internal && (
            <span style={{ fontSize: 9, color: isActive(item) ? theme.gold : theme.oliv, fontWeight: 700, letterSpacing: '0.08em' }}>INT</span>
          )}
          {item.badge && (
            <span style={{ background: isActive(item) ? theme.gold : `${theme.aubergine}15`, color: theme.aubergine, fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 10 }}>{item.badge}</span>
          )}
        </div>
      ))}
      <div style={{ height: 16 }} />
      <div style={{ fontSize: 10, color: `${theme.aubergine}99`, fontWeight: 700, letterSpacing: '0.1em', padding: '0 10px 6px', textTransform: 'uppercase' }}>Wissen</div>
      {[
        { icon: BookOpen, label: 'Broschüre' },
        { icon: MapPin, label: 'Postbank Atlas' },
        { icon: FileText, label: 'Leitfaden' },
        { icon: HelpCircle, label: 'FAQs' },
      ].map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', fontSize: 12.5, color: `${theme.ink}cc`, cursor: 'pointer' }}>
          <item.icon size={14} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

// =====================================================================
// MOCK DATA
// =====================================================================
const mockCases = [
  { id: 'WK-2026-014', kunde: 'Schmidt, Eva', alter: 72, objekt: 'EFH Stuttgart-Vaihingen', adresse: 'Hauptstraße 14, 70563 Stuttgart', flaeche: 142, grundstueck: 380, status: 'DATA_INCOMPLETE', vor: 'Heute, 09:14', followUp: true, followUpReason: 'Energieausweis und Hausgeldabrechnung 2024 fehlen' },
  { id: 'WK-2026-013', kunde: 'Becker, Hans', alter: 68, objekt: 'ETW München-Pasing', adresse: 'Bodenseestraße 88, 81243 München', flaeche: 78, grundstueck: null, status: 'VALUATION_PENDING', vor: 'Gestern', followUp: false },
  { id: 'WK-2026-011', kunde: 'Wagner, Renate', alter: 74, objekt: 'EFH Tübingen', adresse: 'Im Rosengarten 7, 72072 Tübingen', flaeche: 165, grundstueck: 520, status: 'SENT', vor: 'Vor 2 Tagen', followUp: false },
  { id: 'WK-2026-009', kunde: 'Hofmann, Peter', alter: 70, objekt: 'ETW Esslingen', adresse: 'Pliensaustraße 22, 73728 Esslingen', flaeche: 92, grundstueck: null, status: 'DRAFT', vor: 'Vor 4 Tagen', followUp: false },
];

const demoLoginByRole = {
  admin: { email: 'admin@demo.local', password: 'demo1234' },
  partner: { email: 'makler@demo.local', password: 'demo1234' },
};

async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Aktion fehlgeschlagen');
  return payload;
}

async function postFormData(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    body,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Upload fehlgeschlagen');
  return payload;
}

async function ensureDemoSession(role) {
  return postJson('/api/auth/login', demoLoginByRole[role] || demoLoginByRole.partner);
}

function formatEuro(value) {
  if (!Number.isFinite(Number(value))) return '-';
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(value));
}

function dateLabel(value) {
  if (!value) return 'Gerade eben';
  try {
    return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
  } catch {
    return 'Gerade eben';
  }
}

function propertyTypeLabel(value) {
  const labels = {
    house: 'Haus',
    single_family: 'EFH',
    semi_detached: 'Doppelhaushälfte',
    row_house: 'Reihenhaus',
    apartment: 'ETW',
    multi_family: 'MFH',
    other: 'Objekt',
  };
  return labels[value] || 'Objekt';
}

function labelFrom(map, value, fallback = '-') {
  return value === undefined || value === null || value === '' ? fallback : (map[value] || value);
}

function isPreviewImage(document) {
  return document.fileType?.startsWith('image/');
}

function fileExtension(fileName = '') {
  const extension = fileName.split('.').pop();
  return extension && extension !== fileName ? extension.toUpperCase().slice(0, 5) : 'DATEI';
}

const genderLabels = { female: 'weiblich', male: 'männlich', diverse: 'divers', not_specified: 'keine Angabe' };
const maritalLabels = { single: 'ledig', married: 'verheiratet', divorced: 'geschieden', widowed: 'verwitwet', other: 'sonstiges' };
const incomeLabels = { under_1000: 'unter 1.000 €', from_1000_to_2000: '1.000 - 2.000 €', from_2000_to_3000: '2.000 - 3.000 €', over_3000: 'über 3.000 €' };
const conditionLabels = { very_good: 'sehr gut', good: 'gut', average: 'durchschnittlich', renovation_needed: 'renovierungsbedürftig' };
const ratingLabels = { very_good: 'sehr gut', good: 'gut', medium: 'mittel', moderate: 'mäßig', bad: 'schlecht', very_bad: 'sehr schlecht' };
const recipientLabels = { one_person: 'eine Person', both: 'beide Personen' };
const basementLabels = { none: 'kein Keller', partial: 'teilunterkellert', full: 'vollunterkellert' };
const parkingLabels = { garage: 'Garage', carport: 'Carport', outdoor_space: 'Stellplatz', duplex: 'Doppelparker' };
const occupancyLabels = { owner_occupied: 'selbst bewohnt', rented: 'vermietet', vacant: 'leerstehend', partially_rented: 'teilweise vermietet' };
const windowLabels = { wood: 'Holz', aluminium: 'Aluminium', plastic: 'Kunststoff' };
const energyCertificateLabels = { demand: 'Bedarfsausweis', consumption: 'Verbrauchsausweis' };
const energyCarrierLabels = { photovoltaik: 'Photovoltaik', solarthermie: 'Solarthermie', batteriespeicher: 'Batteriespeicher' };
const documentStatusLabels = { missing: 'fehlt', pending: 'eingereicht', ok: 'geprüft', review_required: 'Prüfung nötig', rejected: 'abgelehnt' };
const requirementLabels = { required: 'Pflicht', recommended: 'Empfohlen', optional: 'Optional' };
const documentCategoryLabels = {
  energy_certificate: 'Energieausweis',
  land_register: 'Grundbuchauszug',
  floorplan: 'Grundriss',
  section: 'Schnitt',
  living_area_calculation: 'Wohnflächenberechnung',
  photos: 'Objektfotos',
  declaration_of_division: 'Teilungserklärung',
  service_charge_statement: 'Hausgeldabrechnung',
  owners_meeting_minutes: 'Eigentümerprotokoll',
  maintenance_reserve: 'Instandhaltungsrücklage',
  power_of_attorney: 'Vollmacht Grundbuch',
  repair_offer: 'Reparaturangebot',
  other: 'Sonstiges',
};
const modernizationLabels = { none: 'keine', partial: 'teilweise', complete: 'vollständig' };
const productModelLabels = { fixed_residential_right: 'Verrentung mit befristetem Wohnrecht', sale_and_leaseback: 'Rückmietmodell', other: 'Sonstiges Modell' };

function yesNo(value) {
  return value ? 'ja' : 'nein';
}

function formatDate(value) {
  if (!value) return '-';
  try {
    return new Intl.DateTimeFormat('de-DE').format(new Date(value));
  } catch {
    return value;
  }
}

function mapCaseView(item) {
  const openReminder = item.reminders?.find((reminder) => reminder.status === 'open');
  const property = item.property;
  const customer = item.customer;
  return {
    id: property.caseNumber || property.id,
    propertyId: property.id,
    kunde: `${customer.lastName}, ${customer.firstName}`,
    alter: customer.ageAtSubmission || '',
    partner: item.partner?.contactName || item.partner?.companyName || '-',
    objekt: property.objectTitle || `${propertyTypeLabel(property.propertyType)} ${property.city}`,
    adresse: `${property.street}, ${property.postalCode} ${property.city}`,
    flaeche: property.livingAreaSqm,
    grundstueck: property.plotAreaSqm || null,
    status: property.status,
    vor: property.lastActivityLabel || dateLabel(property.updatedAt),
    followUp: Boolean(property.followUpRequired || openReminder),
    followUpReason: openReminder?.reason || property.followUpReason || '',
    raw: item,
  };
}

const defaultDraft = {
  firstName: 'Eva',
  lastName: 'Schmidt',
  ageAtSubmission: 72,
  gender: 'female',
  dateOfBirth: '1953-03-12',
  maritalStatus: 'widowed',
  monthlyIncomeRange: 'from_1000_to_2000',
  email: 'eva.schmidt@web.de',
  phone: '0711 / 23 45 67',
  mobile: '0172 / 12 34 567',
  street: 'Hauptstraße 14',
  postalCode: '70563',
  city: 'Stuttgart',
  propertyStreet: 'Hauptstraße 14',
  propertyPostalCode: '70563',
  propertyCity: 'Stuttgart',
  propertyType: 'single_family',
  livingAreaSqm: 142,
  plotAreaSqm: 380,
  usableAreaSqm: 55,
  yearBuilt: 1978,
  condition: 'good',
  occupancyStatus: 'owner_occupied',
  residentialRightRecipients: 'one_person',
  desiredResidentialRightYears: 10,
  secondResidentialRightWanted: true,
  secondResidentialRightYears: 5,
  fixedTermReason: 'Familienplanung',
  rentalOptionDeselected: false,
  coOwnershipShares: '',
  heatingType: 'central',
  heatingEnergySource: 'gas',
  heatingEnergySourceOther: '',
  heatingYear: 2015,
  energyCertificateAvailable: false,
  energyCertificateType: 'demand',
  energyClass: 'D',
  parkingAvailable: true,
  parkingType: 'garage',
  parkingCount: 1,
  basementType: 'full',
  windowMaterial: 'plastic',
  windowInstallationYear: 2012,
  asbestosRoofKnown: false,
  visualConditionRating: 'good',
  energyCarriers: ['photovoltaik'],
  knownDefects: '',
  remainingDebtAmount: 0,
  modernization: {
    heating: { scope: 'complete', year: '2015' },
    roof: { scope: 'partial', year: '2020' },
    facade: { scope: 'none', year: '' },
    windows: { scope: 'complete', year: '2012' },
    lines: { scope: 'partial', year: '2010' },
    bathrooms: { scope: 'partial', year: '2016' },
  },
  buildingCondition: {
    roof: 'good',
    facade: 'medium',
    masonry: 'good',
    bathrooms: 'good',
    windows: 'good',
    electric: 'medium',
    outdoor: 'good',
  },
  leasehold: false,
  monumentProtection: false,
  documentFile: null,
  documentFileName: '',
  documentCategory: 'energy_certificate',
  documentRequirementLevel: 'required',
  documentStatus: 'missing',
  documentMissingReason: 'Im Erfassungsbogen als erforderliches Dokument vorgemerkt.',
};

// =====================================================================
// SCREEN 1 — MAKLER-DASHBOARD
// =====================================================================
const MaklerDashboard = ({ cases = mockCases, onOpenCase, onNewCase }) => {
  const followUpCase = cases.find((item) => item.followUp);
  const stats = [
    { label: 'In Bearbeitung', value: cases.filter((item) => !['DRAFT', 'SENT', 'WON', 'SOLD', 'LOST'].includes(item.status)).length, sub: `davon ${cases.filter((item) => item.followUp).length} mit Rückfrage`, icon: Clock },
    { label: 'Eingereicht', value: cases.filter((item) => ['SUBMITTED', 'VALUATION_PENDING'].includes(item.status)).length, sub: 'wartet auf Bewertung', icon: TrendingUp },
    { label: 'Angebote offen', value: cases.filter((item) => ['OFFER_CALCULATED', 'OFFER_DRAFTED', 'INTERNAL_REVIEW', 'SENT'].includes(item.status)).length, sub: 'beim Kunden oder intern', icon: FileText },
    { label: 'Abgeschlossen', value: cases.filter((item) => ['WON', 'SOLD'].includes(item.status)).length, sub: 'YTD 2026', icon: CheckCircle2 },
  ];

  return (
    <div style={{ padding: '20px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>Guten Morgen, Markus</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: theme.aubergine, margin: 0, letterSpacing: '-0.01em' }}>Deine Übersicht</h1>
        </div>
        <button onClick={onNewCase} style={{ background: theme.aubergine, color: 'white', border: 'none', padding: '10px 18px', borderRadius: 6, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <Plus size={15} /> Neuer Fall
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 8, padding: '14px 16px', border: `1px solid ${theme.borderSoft}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.label}</span>
              <s.icon size={14} style={{ color: `${theme.aubergine}55` }} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: theme.aubergine, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11.5, color: `${theme.ink}99` }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {followUpCase && (
        <div style={{ background: theme.goldSoft, border: `1px solid ${theme.gold}55`, borderLeft: `3px solid ${theme.gold}`, borderRadius: 6, padding: '12px 14px', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertCircle size={18} style={{ color: theme.gold, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: theme.ink, marginBottom: 2 }}>Offene Rückfrage, Wiedervorlage heute</div>
            <div style={{ fontSize: 12, color: `${theme.ink}aa` }}>Fall {followUpCase.id}: {followUpCase.followUpReason || 'Bitte Rückfrage bearbeiten.'}</div>
          </div>
          <button onClick={() => onOpenCase(followUpCase.propertyId || followUpCase.id)} style={{ background: 'transparent', border: `1px solid ${theme.aubergine}44`, color: theme.aubergine, fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 5, cursor: 'pointer' }}>Bearbeiten</button>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: theme.aubergine }}>Aktive Fälle</span>
          <span style={{ fontSize: 12, color: `${theme.ink}88` }}>Sortiert nach letzter Aktivität</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: theme.mintLight }}>
              {['Fall', 'Kunde', 'Objekt', 'Status', 'Letzte Aktivität', ''].map((h, i) => (
                <th key={i} style={{ textAlign: 'left', padding: '8px 16px', fontSize: 11, fontWeight: 700, color: theme.oliv, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cases.map((r, i) => (
              <tr key={r.propertyId || r.id || i} onClick={() => onOpenCase(r.propertyId || r.id)} style={{ borderTop: `1px solid ${theme.borderSoft}`, cursor: 'pointer' }}>
                <td style={{ padding: '11px 16px', fontFamily: 'ui-monospace, "SF Mono", monospace', fontSize: 12, color: theme.aubergine, fontWeight: 600 }}>{r.id}</td>
                <td style={{ padding: '11px 16px', color: theme.ink }}>{r.kunde} {r.alter && <span style={{ color: `${theme.ink}77`, fontSize: 12 }}>({r.alter})</span>}</td>
                <td style={{ padding: '11px 16px', color: `${theme.ink}cc` }}>{r.objekt}</td>
                <td style={{ padding: '11px 16px' }}><StatusBadge status={r.status} /></td>
                <td style={{ padding: '11px 16px', color: `${theme.ink}88`, fontSize: 12 }}>{r.vor}</td>
                <td style={{ padding: '11px 16px', textAlign: 'right' }}><ChevronRight size={15} style={{ color: `${theme.aubergine}88` }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// =====================================================================
// SCREEN 2 — ADMIN-DASHBOARD
// =====================================================================
const AdminDashboard = ({ cases = mockCases, onOpenCase }) => (
  <div style={{ padding: '20px 28px' }}>
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>Intern · CRM</div>
      <h1 style={{ fontSize: 24, fontWeight: 600, color: theme.aubergine, margin: 0, letterSpacing: '-0.01em' }}>Pipeline-Übersicht</h1>
    </div>

    {/* Pipeline-Kennzahlen */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 22 }}>
      {[
        { label: 'Eingereicht', value: '7', sub: '+2 heute', color: theme.aubergineSoft },
        { label: 'In Bewertung', value: '4', sub: 'Ø 1.4 Tage offen', color: '#7B61C7' },
        { label: 'Interne Prüfung', value: '3', sub: '1 überfällig', color: theme.oliv },
        { label: 'Versendet', value: '12', sub: 'wartet auf Kunde', color: '#5B8C2B' },
        { label: 'Im Bestand', value: '47', sub: 'aktive Objekte', color: '#3D6B1F' },
      ].map((s, i) => (
        <div key={i} style={{ background: 'white', borderRadius: 8, padding: '14px 16px', border: `1px solid ${theme.borderSoft}`, borderTop: `3px solid ${s.color}` }}>
          <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: theme.aubergine, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
          <div style={{ fontSize: 11.5, color: `${theme.ink}99` }}>{s.sub}</div>
        </div>
      ))}
    </div>

    {/* Zwei Spalten: Offene Rückfragen + Karte */}
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, marginBottom: 22 }}>
      <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: theme.goldSoft }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={15} style={{ color: theme.gold }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: theme.aubergine }}>Offene Rückfragen</span>
          </div>
          <span style={{ fontSize: 12, color: `${theme.ink}88` }}>5 gesamt · 2 überfällig</span>
        </div>
        {(cases.filter((item) => item.followUp).length ? cases.filter((item) => item.followUp) : mockCases.filter((item) => item.followUp)).slice(0, 3).map((r, i) => (
          <div key={r.propertyId || r.id || i} onClick={() => onOpenCase(r.propertyId || r.id)} style={{ padding: '12px 16px', borderTop: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, color: theme.ink, fontWeight: 500 }}>
                <span style={{ fontFamily: 'ui-monospace, monospace', color: theme.aubergine, fontWeight: 600, marginRight: 8 }}>{r.id}</span>
                {r.kunde}
              </div>
              <div style={{ fontSize: 11.5, color: `${theme.ink}99`, marginTop: 2 }}>{r.followUpReason || 'Rückfrage offen'}</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 10, background: r.overdue ? '#9B2C2C1A' : `${theme.gold}1A`, color: r.overdue ? '#9B2C2C' : '#A87308' }}>
              Heute
            </span>
          </div>
        ))}
      </div>

      {/* Karten-Placeholder */}
      <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: theme.aubergine }}>Objekte in Bearbeitung</span>
          <div style={{ display: 'flex', gap: 4, background: theme.mintLight, borderRadius: 5, padding: 2 }}>
            <button style={{ background: theme.aubergine, color: 'white', border: 'none', fontSize: 11, padding: '3px 10px', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }}>In Bearbeitung</button>
            <button style={{ background: 'transparent', color: theme.aubergine, border: 'none', fontSize: 11, padding: '3px 10px', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }}>Bestand</button>
          </div>
        </div>
        <div style={{ height: 220, background: theme.mintLighter, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Mock Map Pins */}
          <svg width="100%" height="100%" viewBox="0 0 400 220" style={{ position: 'absolute' }}>
            <rect x="0" y="0" width="400" height="220" fill={theme.mintLighter} />
            <path d="M 50 80 Q 100 60 150 90 T 280 100 L 320 140 Q 280 170 220 160 T 100 170 Z" fill={theme.mint} stroke={theme.oliv} strokeWidth="0.5" opacity="0.5" />
            {[
              { x: 120, y: 110 }, { x: 180, y: 90 }, { x: 240, y: 130 },
              { x: 200, y: 70 }, { x: 280, y: 105 }, { x: 150, y: 145 },
            ].map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="8" fill={theme.aubergine} opacity="0.25" />
                <circle cx={p.x} cy={p.y} r="4" fill={theme.aubergine} />
              </g>
            ))}
          </svg>
          <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'white', padding: '4px 8px', borderRadius: 4, fontSize: 10, color: `${theme.ink}88`, border: `1px solid ${theme.borderSoft}` }}>
            23 Objekte · Süddeutschland
          </div>
        </div>
      </div>
    </div>

    {/* Alle Fälle */}
    <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: theme.aubergine }}>Alle aktiven Fälle</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: `${theme.ink}88` }}>Filter:</span>
          {['Alle', 'Eingereicht', 'In Bewertung', 'Prüfung'].map((f, i) => (
            <button key={i} style={{ background: i === 0 ? theme.aubergine : 'transparent', color: i === 0 ? 'white' : theme.aubergine, border: i === 0 ? 'none' : `1px solid ${theme.border}`, fontSize: 11.5, fontWeight: 600, padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}>{f}</button>
          ))}
        </div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: theme.mintLight }}>
            {['Fall', 'Kunde', 'Partner', 'Objekt', 'Status', 'Letzte Aktivität', ''].map((h, i) => (
              <th key={i} style={{ textAlign: 'left', padding: '8px 16px', fontSize: 11, fontWeight: 700, color: theme.oliv, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cases.map((r, i) => (
            <tr key={r.propertyId || r.id || i} onClick={() => onOpenCase(r.propertyId || r.id)} style={{ borderTop: `1px solid ${theme.borderSoft}`, cursor: 'pointer' }}>
              <td style={{ padding: '11px 16px', fontFamily: 'ui-monospace, monospace', fontSize: 12, color: theme.aubergine, fontWeight: 600 }}>{r.id}</td>
              <td style={{ padding: '11px 16px', color: theme.ink }}>{r.kunde}{r.alter ? ` (${r.alter})` : ''}</td>
              <td style={{ padding: '11px 16px', color: `${theme.ink}aa`, fontSize: 12 }}>{r.partner}</td>
              <td style={{ padding: '11px 16px', color: `${theme.ink}cc` }}>{r.objekt}</td>
              <td style={{ padding: '11px 16px' }}><StatusBadge status={r.status} /></td>
              <td style={{ padding: '11px 16px', color: `${theme.ink}88`, fontSize: 12 }}>{r.vor}</td>
              <td style={{ padding: '11px 16px', textAlign: 'right' }}><ChevronRight size={15} style={{ color: `${theme.aubergine}88` }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// =====================================================================
// SCREEN 3 — FALLDETAIL
// =====================================================================
const FallDetail = ({ caseId, onBack, role, cases = mockCases, onRefresh, setNotice }) => {
  const [activeTab, setActiveTab] = useState('kunde');
  const [busyAction, setBusyAction] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCategory, setUploadCategory] = useState('energy_certificate');
  const [uploadRequirementLevel, setUploadRequirementLevel] = useState('required');
  const [uploadNote, setUploadNote] = useState('');
  const c = cases.find(x => x.propertyId === caseId || x.id === caseId) || mockCases[0];
  const caseView = c.raw;
  const customer = caseView?.customer;
  const property = caseView?.property;
  const latestOffer = caseView?.offer;
  const productOffers = caseView?.offers?.length ? caseView.offers : latestOffer ? [latestOffer] : [];
  const latestValuation = caseView?.valuation;
  const documents = caseView?.documents?.length ? caseView.documents.map((document) => ({
    id: document.id,
    name: document.displayName || document.fileName,
    fileName: document.fileName,
    fileType: document.fileType,
    storageUrl: document.storageUrl,
    category: document.category,
    type: labelFrom(requirementLabels, document.requirementLevel),
    date: dateLabel(document.createdAt),
    status: document.status,
    statusLabel: labelFrom(documentStatusLabels, document.status),
    missingReason: document.missingReason,
  })) : [
    { id: 'mock-land-register', name: 'Grundbuchauszug.pdf', fileName: 'Grundbuchauszug.pdf', fileType: 'application/pdf', storageUrl: '', category: 'land_register', type: 'Pflicht', date: '18.05.2026', status: 'ok', statusLabel: 'geprüft' },
    { id: 'mock-floorplan', name: 'Grundriss_OG.pdf', fileName: 'Grundriss_OG.pdf', fileType: 'application/pdf', storageUrl: '', category: 'floorplan', type: 'Pflicht', date: '18.05.2026', status: 'ok', statusLabel: 'geprüft' },
    { id: 'mock-living-area', name: 'Wohnflächenberechnung.pdf', fileName: 'Wohnflächenberechnung.pdf', fileType: 'application/pdf', storageUrl: '', category: 'living_area_calculation', type: 'Pflicht', date: '18.05.2026', status: 'ok', statusLabel: 'geprüft' },
    { id: 'mock-energy', name: 'Energieausweis', fileName: 'Energieausweis', fileType: 'application/pdf', storageUrl: '', category: 'energy_certificate', type: 'Pflicht', date: null, status: 'missing', statusLabel: 'fehlt', missingReason: 'Energieausweis fehlt noch.' },
    { id: 'mock-photos', name: 'Fotos außen (12)', fileName: 'Fotos außen (12)', fileType: 'image/jpeg', storageUrl: '', category: 'photos', type: 'Pflicht', date: '18.05.2026', status: 'ok', statusLabel: 'geprüft' },
  ];
  const requiredDocumentRows = getRequiredDocumentsForPropertyType(property?.propertyType).map((requirement) => {
    const matchedDocument = documents.find((document) => document.category === requirement.category);
    return {
      ...requirement,
      status: matchedDocument?.status || 'missing',
      statusLabel: matchedDocument?.statusLabel || 'fehlt',
      fileName: matchedDocument?.name,
      missingReason: matchedDocument?.missingReason,
    };
  });
  const customerDetails = customer ? [
    ['Name', customer.displayName || `${customer.firstName} ${customer.lastName}`],
    ['Geschlecht', labelFrom(genderLabels, customer.gender)],
    ['Geburtsdatum', `${formatDate(customer.dateOfBirth)}${customer.ageAtSubmission ? ` (${customer.ageAtSubmission} Jahre)` : ''}`],
    ['Familienstand', labelFrom(maritalLabels, customer.maritalStatus)],
    ['Adresse', customer.addressText || `${customer.street || '-'}, ${customer.postalCode || ''} ${customer.city || ''}`],
    ['Telefon', customer.phone || '-'],
    ['Mobil', customer.mobile || '-'],
    ['E-Mail', customer.email || '-'],
    ['Monatl. Einkünfte', labelFrom(incomeLabels, customer.monthlyIncomeRange)],
    ['Einwilligung', customer.consentDataProcessing ? `erteilt am ${dateLabel(customer.createdAt)}` : 'fehlt'],
  ] : [
    ['Name', 'Eva Schmidt'],
    ['Geschlecht', 'weiblich'],
    ['Geburtsdatum', '12.03.1953 (72 Jahre)'],
    ['Familienstand', 'verwitwet'],
    ['Adresse', 'Hauptstraße 14, 70563 Stuttgart'],
    ['Telefon', '0711 / 23 45 67'],
    ['Mobil', '0172 / 12 34 567'],
    ['E-Mail', 'eva.schmidt@web.de'],
    ['Monatl. Einkünfte', '1.000 - 2.000 €'],
    ['Einwilligung', 'erteilt am 18.05.2026'],
  ];
  const modelDetails = property ? [
    ['Wohnrechtsberechtigte', labelFrom(recipientLabels, property.residentialRightRecipients)],
    ['Dauer Wohnrecht', property.desiredResidentialRightYears ? `${property.desiredResidentialRightYears} Jahre` : '-'],
    ['Zweite Laufzeit gewünscht', property.secondResidentialRightWanted ? `ja${property.secondResidentialRightYears ? `, ${property.secondResidentialRightYears} Jahre` : ''}` : 'nein'],
    ['Befristungsgrund', property.fixedTermReason || '-'],
    ['Spätere Anmietoption abgewählt', yesNo(property.rentalOptionDeselected)],
  ] : [
    ['Wohnrechtsberechtigte', 'eine Person'],
    ['Dauer Wohnrecht', '10 Jahre'],
    ['Zweite Laufzeit gewünscht', 'ja, 5 Jahre'],
    ['Befristungsgrund', 'Familienplanung'],
    ['Spätere Anmietoption abgewählt', 'nein'],
  ];
  const objectDetails = property ? [
    ['Typ', propertyTypeLabel(property.propertyType)],
    ['Baujahr', property.yearBuilt || '-'],
    ['Wohnfläche', `${property.livingAreaSqm} m²`],
    ['Grundstück', property.plotAreaSqm ? `${property.plotAreaSqm} m²` : '-'],
    ['Nutzfläche', property.usableAreaSqm ? `${property.usableAreaSqm} m²` : '-'],
    ['Miteigentumsanteile', property.coOwnershipShares || '-'],
    ['Nutzung', labelFrom(occupancyLabels, property.occupancyStatus)],
    ['Zustand', labelFrom(conditionLabels, property.condition)],
    ['Optik', labelFrom(ratingLabels, property.visualConditionRating)],
    ['Heizung', property.heatingType ? `${property.heatingType}${property.heatingYear ? ` (${property.heatingYear})` : ''}` : '-'],
    ['Energieausweis', `${yesNo(property.energyCertificateAvailable)}${property.energyCertificateType ? `, ${labelFrom(energyCertificateLabels, property.energyCertificateType)}` : ''}`],
    ['Energieklasse', property.energyClass || '-'],
    ['Fenster', property.windowMaterial ? `${labelFrom(windowLabels, property.windowMaterial)}${property.windowInstallationYear ? ` (${property.windowInstallationYear})` : ''}` : '-'],
    ['Parkplatz', property.parkingAvailable ? `${property.parkingCount || 1}x ${labelFrom(parkingLabels, property.parkingType)}` : 'nein'],
    ['Keller', labelFrom(basementLabels, property.basementType)],
    ['Asbest Dach bekannt', yesNo(property.asbestosRoofKnown)],
    ['PV / Solar', property.energyCarriers?.length ? property.energyCarriers.map((item) => labelFrom(energyCarrierLabels, item)).join(', ') : '-'],
    ['Erbbau/Denkmal', property.leasehold || property.monumentProtection ? 'ja' : 'nein'],
    ['Restschuld', property.remainingDebtAmount ? formatEuro(property.remainingDebtAmount) : '-'],
    ['Bekannte Mängel', property.knownDefects || '-'],
  ] : [
    ['Typ', 'Einfamilienhaus'],
    ['Baujahr', '1978'],
    ['Wohnfläche', '142 m²'],
    ['Grundstück', '380 m²'],
    ['Heizung', 'Gas-Brennwert (2015)'],
    ['Energieklasse', 'D (Bedarf)'],
    ['Optik', 'gut'],
    ['Fenster', 'Kunststoff (2012)'],
    ['Parkplatz', '1x Garage'],
    ['Keller', 'vollunterkellert'],
    ['PV / Solar', 'PV seit 2020'],
    ['Erbbau/Denkmal', 'nein'],
  ];
  const modernizationDetails = property?.modernization ? Object.entries(property.modernization).map(([key, value]) => [
    labelFrom(Object.fromEntries(modernizationFields), key, key),
    `${labelFrom(modernizationLabels, value?.scope)}${value?.year ? ` (${value.year})` : ''}`,
  ]) : [];
  const buildingConditionDetails = property?.buildingCondition ? Object.entries(property.buildingCondition).map(([key, value]) => [
    labelFrom(Object.fromEntries(buildingConditionFields), key, key),
    labelFrom(ratingLabels, value),
  ]) : [];
  const openReminders = caseView?.reminders?.filter((reminder) => reminder.status === 'open') || [];
  const missingDocuments = documents.filter((document) => ['missing', 'review_required', 'rejected'].includes(document.status));
  const taskRows = [
    ...openReminders.map((reminder) => ({ title: 'Rückfrage', text: reminder.reason, meta: `fällig ${dateLabel(reminder.dueAt)}`, tone: 'warning' })),
    ...missingDocuments.map((document) => ({ title: document.statusLabel, text: document.name, meta: document.missingReason || document.type, tone: document.status === 'rejected' ? 'danger' : 'warning' })),
  ];
  const activities = caseView?.activities?.length ? caseView.activities : [
    { createdAt: 'Heute, 09:14', userId: 'System', message: 'Erinnerung Rückfrage erstellt' },
    { createdAt: 'Gestern, 16:32', userId: 'A. Klein (Admin)', message: 'Rückfrage angefordert: Energieausweis' },
    { createdAt: 'Gestern, 14:08', userId: 'M. Krüger', message: 'Fall eingereicht' },
    { createdAt: '18.05., 11:20', userId: 'M. Krüger', message: 'Erfassung abgeschlossen' },
    { createdAt: '18.05., 09:45', userId: 'M. Krüger', message: 'Fall angelegt' },
  ];
  async function runCaseAction(label, action) {
    if (!c.propertyId) {
      setNotice?.('Dieser Mock-Fall ist noch nicht mit einer API-ID verbunden.');
      return;
    }
    setBusyAction(label);
    try {
      await action();
      await onRefresh?.();
      setNotice?.(`${label} abgeschlossen.`);
    } catch (err) {
      setNotice?.(err instanceof Error ? err.message : 'Aktion fehlgeschlagen');
    } finally {
      setBusyAction('');
    }
  }
  const startValuationAndOffer = (model) => runCaseAction(model === 'sale_and_leaseback' ? 'Rückmietmodell-Kalkulation' : 'Verrentungs-Kalkulation', async () => {
    await postJson(`/api/properties/${c.propertyId}/valuation`, { provider: 'sprengnetter' });
    await postJson(`/api/properties/${c.propertyId}/offer/calculate`, { model });
    await postJson(`/api/properties/${c.propertyId}/offer/generate-ai-text`);
  });
  const markFeedbackReceived = () => runCaseAction('Kundenrückmeldung', async () => {
    await postJson(`/api/properties/${c.propertyId}/feedback-received`);
  });
  const uploadDocument = () => runCaseAction('Dokument-Upload', async () => {
    if (!uploadFile) {
      throw new Error('Bitte zuerst eine Datei auswählen.');
    }
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('category', uploadCategory);
    formData.append('requirementLevel', uploadRequirementLevel);
    formData.append('status', 'pending');
    if (uploadNote) formData.append('missingReason', uploadNote);
    await postFormData(`/api/properties/${c.propertyId}/documents`, formData);
    setUploadFile(null);
    setUploadNote('');
  });
  const deleteDocument = (document) => runCaseAction('Dokument löschen', async () => {
    if (!document.id || document.id.startsWith('mock-')) {
      throw new Error('Dieses Mock-Dokument kann nicht gelöscht werden.');
    }
    if (!window.confirm(`Unterlage "${document.name}" wirklich löschen?`)) return;
    const response = await fetch(`/api/properties/${c.propertyId}/documents/${document.id}`, { method: 'DELETE' });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Löschen fehlgeschlagen');
  });
  const tabs = role === 'admin'
    ? [
        { id: 'kunde', label: 'Kunde' },
        { id: 'objekt', label: 'Objekt' },
        { id: 'indag', label: 'Unverbindliches Angebot' },
        { id: 'verbag', label: 'Verbindliches Angebot' },
        { id: 'doks', label: 'Objektunterlagen' },
        { id: 'aufgaben', label: 'Aufgaben' },
      ]
    : [
        { id: 'kunde', label: 'Kunde' },
        { id: 'objekt', label: 'Objekt' },
        { id: 'doks', label: 'Objektunterlagen' },
        { id: 'aufgaben', label: 'Aufgaben' },
      ];

  return (
    <div>
      {/* Top Bar */}
      <div style={{ padding: '14px 28px', background: theme.mintLight, borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: theme.aubergine, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
          <ArrowLeft size={15} /> Zurück
        </button>
        <div style={{ width: 1, height: 18, background: theme.border }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13, color: theme.aubergine, fontWeight: 700 }}>{c.id}</span>
            <StatusBadge status={c.status} size="lg" />
            {c.followUp && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: theme.goldSoft, color: '#A87308', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 10 }}>
                <AlertCircle size={12} /> Rückfrage offen
              </span>
            )}
          </div>
          <div style={{ fontSize: 17, fontWeight: 600, color: theme.ink, marginTop: 4 }}>{c.kunde} <span style={{ color: `${theme.ink}77`, fontSize: 14 }}>· {c.alter} Jahre</span></div>
          <div style={{ fontSize: 12, color: `${theme.ink}aa`, marginTop: 2 }}>{c.adresse} · {c.flaeche} m² Wohnfläche{c.grundstueck ? ` · ${c.grundstueck} m² Grundstück` : ''}</div>
        </div>
        <button style={{ background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine, fontSize: 12.5, fontWeight: 600, padding: '8px 14px', borderRadius: 5, cursor: 'pointer' }}>Bearbeiten</button>
        {role === 'admin' && (
          <>
            <button onClick={() => startValuationAndOffer('fixed_residential_right')} disabled={Boolean(busyAction)} style={{ background: theme.aubergine, border: 'none', color: 'white', fontSize: 12.5, fontWeight: 600, padding: '8px 14px', borderRadius: 5, cursor: busyAction ? 'wait' : 'pointer', opacity: busyAction ? 0.75 : 1 }}>
              {busyAction ? 'Läuft...' : 'Verrentung kalkulieren'}
            </button>
            <button onClick={() => startValuationAndOffer('sale_and_leaseback')} disabled={Boolean(busyAction)} style={{ background: 'white', border: `1px solid ${theme.aubergine}`, color: theme.aubergine, fontSize: 12.5, fontWeight: 600, padding: '8px 14px', borderRadius: 5, cursor: busyAction ? 'wait' : 'pointer', opacity: busyAction ? 0.75 : 1 }}>
              Rückmiete kalkulieren
            </button>
          </>
        )}
      </div>

      {/* Rückfrage-Banner */}
      {c.followUp && (
        <div style={{ background: theme.goldSoft, borderBottom: `1px solid ${theme.gold}55`, padding: '12px 28px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertCircle size={16} style={{ color: theme.gold }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: theme.ink }}>Rückfrage offen: <span style={{ fontWeight: 400 }}>{c.followUpReason}</span></div>
            <div style={{ fontSize: 11, color: `${theme.ink}99`, marginTop: 2 }}>Wiedervorlage: heute · Letzte Erinnerung vor 1 Tag</div>
          </div>
          <button onClick={markFeedbackReceived} disabled={Boolean(busyAction)} style={{ background: 'white', border: `1px solid ${theme.aubergine}44`, color: theme.aubergine, fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 5, cursor: busyAction ? 'wait' : 'pointer' }}>Kundenrückmeldung eingegangen</button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ background: 'white', borderBottom: `1px solid ${theme.border}`, padding: '0 28px', display: 'flex', gap: 4 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            background: 'transparent', border: 'none',
            padding: '12px 18px',
            fontSize: 13, fontWeight: 600,
            color: activeTab === t.id ? theme.aubergine : `${theme.ink}99`,
            borderBottom: activeTab === t.id ? `2px solid ${theme.aubergine}` : '2px solid transparent',
            cursor: 'pointer', marginBottom: -1
          }}>{t.label}</button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ padding: '20px 28px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        <div>
          {activeTab === 'kunde' && (
            <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, padding: '20px 22px' }}>
              <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Persönliche Daten</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 32px' }}>
                {customerDetails.map(([k, v], i) => (
                  <div key={i}>
                    <div style={{ fontSize: 11, color: `${theme.ink}88`, fontWeight: 600, marginBottom: 3 }}>{k}</div>
                    <div style={{ fontSize: 13.5, color: theme.ink }}>{v}</div>
                  </div>
                ))}
              </div>

              <div style={{ height: 1, background: theme.borderSoft, margin: '24px 0' }} />
              <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Wunschmodell</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 32px' }}>
                {modelDetails.map(([k, v], i) => (
                  <div key={i}>
                    <div style={{ fontSize: 11, color: `${theme.ink}88`, fontWeight: 600, marginBottom: 3 }}>{k}</div>
                    <div style={{ fontSize: 13.5, color: theme.ink }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'objekt' && (
            <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, padding: '20px 22px' }}>
              <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Objektdaten</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 32px' }}>
                {objectDetails.map(([k, v], i) => (
                  <div key={i}>
                    <div style={{ fontSize: 11, color: `${theme.ink}88`, fontWeight: 600, marginBottom: 3 }}>{k}</div>
                    <div style={{ fontSize: 13.5, color: theme.ink }}>{v}</div>
                  </div>
                ))}
              </div>
              {(modernizationDetails.length > 0 || buildingConditionDetails.length > 0) && (
                <>
                  <div style={{ height: 1, background: theme.borderSoft, margin: '24px 0' }} />
                  <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Modernisierungen und Bauteile</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 32px' }}>
                    {[...modernizationDetails, ...buildingConditionDetails].map(([k, v], i) => (
                      <div key={i}>
                        <div style={{ fontSize: 11, color: `${theme.ink}88`, fontWeight: 600, marginBottom: 3 }}>{k}</div>
                        <div style={{ fontSize: 13.5, color: theme.ink }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'doks' && (
            <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: theme.aubergine }}>Objektunterlagen</span>
                <span style={{ fontSize: 11, color: `${theme.ink}88` }}>Upload mit Kategorie und Prüfstatus</span>
              </div>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${theme.borderSoft}`, background: 'white' }}>
                <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Neue Unterlage hochladen</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.8fr', gap: 10, alignItems: 'end' }}>
                  <Field label="Datei">
                    <input type="file" onChange={(event) => setUploadFile(event.target.files?.[0] || null)} style={{ width: '100%', padding: '7px 10px', fontSize: 13, border: `1px solid ${theme.border}`, borderRadius: 5, background: 'white', color: theme.ink, boxSizing: 'border-box' }} />
                  </Field>
                  <Field label="Typ">
                    <Select value={uploadCategory} onChange={(event) => setUploadCategory(event.target.value)}>
                      {Object.entries(documentCategoryLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Pflichtstatus">
                    <Select value={uploadRequirementLevel} onChange={(event) => setUploadRequirementLevel(event.target.value)}>
                      <option value="required">Pflicht</option>
                      <option value="recommended">Empfohlen</option>
                      <option value="optional">Optional</option>
                    </Select>
                  </Field>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'end', marginTop: 10 }}>
                  <Field label="Hinweis">
                    <Input value={uploadNote} onChange={(event) => setUploadNote(event.target.value)} placeholder="Optionaler Hinweis zur Unterlage" />
                  </Field>
                  <button onClick={uploadDocument} disabled={Boolean(busyAction)} style={{ background: theme.aubergine, color: 'white', border: 'none', padding: '9px 14px', borderRadius: 5, fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: busyAction ? 'wait' : 'pointer', height: 38 }}>
                    <Upload size={13} /> {busyAction === 'Dokument-Upload' ? 'Lädt...' : 'Hochladen'}
                  </button>
                </div>
              </div>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${theme.borderSoft}`, background: theme.mintLighter }}>
                <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Pflichtdokumente</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {requiredDocumentRows.map((requirement) => {
                    const isMissing = requirement.status === 'missing' || requirement.status === 'rejected';
                    const needsReview = requirement.status === 'review_required' || requirement.status === 'pending';
                    return (
                      <div key={requirement.category} style={{ background: 'white', border: `1px solid ${isMissing ? `${theme.gold}66` : theme.borderSoft}`, borderRadius: 6, padding: '10px 12px', display: 'flex', gap: 9, alignItems: 'flex-start', minWidth: 0 }}>
                        {isMissing || needsReview ? (
                          <AlertCircle size={15} style={{ color: isMissing ? theme.gold : theme.oliv, flexShrink: 0, marginTop: 1 }} />
                        ) : (
                          <CheckCircle size={15} style={{ color: '#5B8C2B', flexShrink: 0, marginTop: 1 }} />
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 12.5, color: theme.ink, fontWeight: 700, lineHeight: 1.25 }}>{requirement.label}</div>
                          <div style={{ fontSize: 11, color: `${theme.ink}88`, marginTop: 3, lineHeight: 1.35 }}>
                            <span style={{ fontWeight: 700, color: isMissing ? theme.gold : needsReview ? theme.oliv : '#5B8C2B' }}>{requirement.statusLabel}</span>
                            {requirement.note ? <span> · {requirement.note}</span> : null}
                            {requirement.fileName ? <span> · {requirement.fileName}</span> : null}
                            {requirement.missingReason ? <span> · {requirement.missingReason}</span> : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ padding: '12px 18px', borderBottom: `1px solid ${theme.borderSoft}`, fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Hochgeladene Unterlagen</div>
              {documents.map((d, i) => (
                <div key={i} style={{ padding: '12px 18px', borderTop: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                  {d.storageUrl ? (
                    <a href={d.storageUrl} target="_blank" rel="noreferrer" style={{ width: 72, height: 54, border: `1px solid ${theme.borderSoft}`, borderRadius: 6, background: theme.mintLight, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', color: theme.aubergine, fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                      {isPreviewImage(d) ? (
                        <img src={d.storageUrl} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      ) : (
                        fileExtension(d.fileName || d.name)
                      )}
                    </a>
                  ) : (
                    <div style={{ width: 72, height: 54, border: `1px solid ${theme.borderSoft}`, borderRadius: 6, background: theme.mintLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={18} style={{ color: d.status === 'missing' ? theme.gold : theme.aubergine }} />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: theme.ink, fontWeight: 500 }}>
                      {d.storageUrl ? (
                        <a href={d.storageUrl} target="_blank" rel="noreferrer" style={{ color: theme.ink }}>{d.name}</a>
                      ) : d.name}
                    </div>
                    <div style={{ fontSize: 11, color: `${theme.ink}88`, marginTop: 2 }}>
                      <span style={{ color: d.type === 'Pflicht' ? theme.gold : `${theme.ink}66`, fontWeight: 600 }}>{d.type}</span>
                      {d.date && <span> · hochgeladen {d.date}</span>}
                      {d.missingReason && <span> · {d.missingReason}</span>}
                      {d.storageUrl && <span> · <a href={d.storageUrl} target="_blank" rel="noreferrer" style={{ color: theme.aubergine, fontWeight: 700 }}>Ansehen</a></span>}
                    </div>
                  </div>
                  {d.storageUrl && !d.id?.startsWith('mock-') && (
                    <button onClick={() => deleteDocument(d)} disabled={Boolean(busyAction)} style={{ background: '#fff7f5', border: '1px solid #efc0b9', color: '#9B2C2C', fontSize: 11.5, fontWeight: 700, padding: '6px 10px', borderRadius: 5, cursor: busyAction ? 'wait' : 'pointer' }}>
                      {busyAction === 'Dokument löschen' ? 'Löscht...' : 'Löschen'}
                    </button>
                  )}
                  {d.status === 'missing' ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: theme.gold }}>fehlt</span>
                  ) : d.status === 'review_required' || d.status === 'rejected' ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#9B2C2C' }}>{d.statusLabel}</span>
                  ) : (
                    <CheckCircle size={15} style={{ color: '#5B8C2B' }} />
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'aufgaben' && (
            <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, padding: '20px 22px' }}>
              <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Offene Aufgaben</div>
              {taskRows.length === 0 ? (
                <div style={{ fontSize: 13, color: `${theme.ink}88` }}>Keine offenen Aufgaben.</div>
              ) : taskRows.map((task, i) => (
                <div key={i} style={{ borderTop: i ? `1px solid ${theme.borderSoft}` : 'none', padding: i ? '12px 0 0' : '0 0 12px', marginTop: i ? 12 : 0, display: 'flex', gap: 10 }}>
                  <AlertCircle size={15} style={{ color: task.tone === 'danger' ? '#9B2C2C' : theme.gold, flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.ink }}>{task.title}</div>
                    <div style={{ fontSize: 12.5, color: theme.ink, marginTop: 2 }}>{task.text}</div>
                    <div style={{ fontSize: 11, color: `${theme.ink}88`, marginTop: 3 }}>{task.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'indag' && (
            <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, padding: '20px 22px' }}>
              <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Indikatives Angebot</div>
              {productOffers.length ? (
                <div style={{ display: 'grid', gap: 12 }}>
                  {productOffers.map((offer) => (
                    <div key={offer.id} style={{ border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '14px 16px', background: theme.mintLighter }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                        <div style={{ fontSize: 13.5, color: theme.aubergine, fontWeight: 700 }}>{labelFrom(productModelLabels, offer.model)}</div>
                        <span style={{ fontSize: 11, color: `${theme.ink}88`, fontWeight: 700, textTransform: 'uppercase' }}>{offer.status}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px 20px' }}>
                        {[
                          ['Marktwert', formatEuro(offer.marketValue)],
                          ['Auszahlung', formatEuro(offer.payoutAmount)],
                          ['Quote', offer.assumptions?.components?.payoutRatio ? `${Math.round(offer.assumptions.components.payoutRatio * 100)}%` : '-'],
                          ['Wohnrechtswert', offer.residentialRightValue ? formatEuro(offer.residentialRightValue) : '-'],
                          ['Instandhaltung / Abschlag', formatEuro(offer.companyMargin || offer.assumptions?.components?.maintenancePledge)],
                          ['Bewertungsanbieter', latestValuation?.provider || '-'],
                        ].map(([k, v], i) => (
                          <div key={i}>
                            <div style={{ fontSize: 11, color: `${theme.ink}88`, fontWeight: 600, marginBottom: 3 }}>{k}</div>
                            <div style={{ fontSize: 13.5, color: theme.ink }}>{v}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ fontSize: 11, color: `${theme.ink}88`, marginTop: 10 }}>{offer.assumptions?.sourceWorkbook || 'Applikationsformel'}</div>
                    </div>
                  ))}
                  {latestValuation ? (
                    <div style={{ fontSize: 12, color: `${theme.ink}88` }}>Wertspanne: {formatEuro(latestValuation.valueMin)} bis {formatEuro(latestValuation.valueMax)}</div>
                  ) : null}
                </div>
              ) : (
                <div style={{ background: theme.mintLight, borderRadius: 6, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Clock size={16} style={{ color: theme.aubergine }} />
                  <div style={{ fontSize: 13, color: theme.ink }}>Sobald die Rückfrage geschlossen ist, kann die Bewertung gestartet werden. Erst dann wird das indikative Angebot berechnet.</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'verbag' && (
            <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, padding: '20px 22px' }}>
              <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Verbindliches Angebot</div>
              <div style={{ fontSize: 13, color: `${theme.ink}88`, whiteSpace: 'pre-line' }}>{latestOffer?.aiCustomerText || latestOffer?.bindingOfferText || 'Noch nicht erstellt.'}</div>
            </div>
          )}
        </div>

        {/* Right column: Activity Log */}
        <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, padding: '16px 18px', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Activity size={14} style={{ color: theme.aubergine }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: theme.aubergine }}>Aktivitätslog</span>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 5, top: 8, bottom: 8, width: 1, background: theme.borderSoft }} />
            {activities.map((a, i) => (
              <div key={i} style={{ position: 'relative', paddingLeft: 18, paddingBottom: 12 }}>
                <div style={{ position: 'absolute', left: 2, top: 4, width: 8, height: 8, borderRadius: '50%', background: i === 0 ? theme.gold : theme.aubergine, border: `2px solid white`, boxShadow: `0 0 0 1px ${theme.border}` }} />
                <div style={{ fontSize: 11, color: `${theme.ink}88`, marginBottom: 2 }}>{a.time || dateLabel(a.createdAt)}</div>
                <div style={{ fontSize: 12.5, color: theme.ink, lineHeight: 1.4 }}>{a.text || a.message}</div>
                <div style={{ fontSize: 11, color: `${theme.ink}99`, marginTop: 2 }}>{a.actor || a.source || a.userId}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// =====================================================================
// SCREEN 4 — ERFASSUNGSBOGEN SCHRITT 1
// =====================================================================
const Erfassung = ({ onBack, onSaved, setNotice }) => {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState('');
  const [draft, setDraft] = useState(defaultDraft);
  const steps = [
    { n: 1, label: 'Persönliche Daten' },
    { n: 2, label: 'Wunschmodell' },
    { n: 3, label: 'Immobiliendaten' },
    { n: 4, label: 'Modernisierungen' },
    { n: 5, label: 'Dokumente' },
  ];
  const progress = Math.round((step / steps.length) * 100);
  async function saveCase(submit = false) {
    if (draft.leasehold || draft.monumentProtection) {
      setNotice?.('Erbbaurecht oder Denkmalschutz ist ein Ausschlusskriterium. Der Fall kann so nicht eingereicht werden.');
      return;
    }
    setSaving(submit ? 'submit' : 'draft');
    try {
      const customerPayload = {
        partnerId: 'partner_heimwert',
        firstName: draft.firstName,
        lastName: draft.lastName,
        displayName: `${draft.firstName} ${draft.lastName}`,
        ageAtSubmission: Number(draft.ageAtSubmission) || undefined,
        gender: draft.gender,
        dateOfBirth: draft.dateOfBirth,
        maritalStatus: draft.maritalStatus,
        monthlyIncomeRange: draft.monthlyIncomeRange,
        email: draft.email,
        phone: draft.phone,
        mobile: draft.mobile,
        street: draft.street,
        postalCode: draft.postalCode,
        city: draft.city,
        addressText: `${draft.street}, ${draft.postalCode} ${draft.city}`,
        consentDataProcessing: true,
      };
      const customerResult = await postJson('/api/customers', customerPayload);
      const propertyPayload = {
        customerId: customerResult.customer.id,
        objectTitle: `${propertyTypeLabel(draft.propertyType)} ${draft.propertyCity}`,
        propertyType: draft.propertyType,
        street: draft.propertyStreet,
        postalCode: draft.propertyPostalCode,
        city: draft.propertyCity,
        livingAreaSqm: Number(draft.livingAreaSqm),
        plotAreaSqm: Number(draft.plotAreaSqm) || undefined,
        yearBuilt: Number(draft.yearBuilt) || undefined,
        condition: draft.condition,
        occupancyStatus: draft.occupancyStatus,
        desiredModel: 'fixed_residential_right',
        residentialRightRecipients: draft.residentialRightRecipients,
        desiredResidentialRightYears: Number(draft.desiredResidentialRightYears) || 10,
        secondResidentialRightWanted: Boolean(draft.secondResidentialRightWanted),
        secondResidentialRightYears: Number(draft.secondResidentialRightYears) || undefined,
        fixedTermReason: draft.fixedTermReason,
        rentalOptionDeselected: Boolean(draft.rentalOptionDeselected),
        usableAreaSqm: Number(draft.usableAreaSqm) || undefined,
        coOwnershipShares: draft.coOwnershipShares || undefined,
        parkingAvailable: Boolean(draft.parkingAvailable),
        parkingType: draft.parkingType || undefined,
        parkingCount: Number(draft.parkingCount) || undefined,
        basementType: draft.basementType || undefined,
        heatingType: draft.heatingType,
        heatingEnergySource: draft.heatingEnergySource,
        heatingEnergySourceOther: draft.heatingEnergySource === 'other' ? draft.heatingEnergySourceOther : undefined,
        heatingYear: Number(draft.heatingYear) || undefined,
        energyCarriers: draft.energyCarriers,
        windowMaterial: draft.windowMaterial,
        windowInstallationYear: Number(draft.windowInstallationYear) || undefined,
        asbestosRoofKnown: Boolean(draft.asbestosRoofKnown),
        energyCertificateAvailable: Boolean(draft.energyCertificateAvailable),
        energyCertificateType: draft.energyCertificateType,
        energyClass: draft.energyClass,
        visualConditionRating: draft.visualConditionRating,
        leasehold: Boolean(draft.leasehold),
        monumentProtection: Boolean(draft.monumentProtection),
        leaseholdOrMonument: Boolean(draft.leasehold || draft.monumentProtection),
        knownDefects: draft.knownDefects,
        remainingDebtAmount: Number(draft.remainingDebtAmount) || undefined,
        modernization: draft.modernization,
        buildingCondition: draft.buildingCondition,
      };
      const propertyResult = await postJson('/api/properties', propertyPayload);
      if (draft.documentFile || draft.documentFileName) {
        if (draft.documentFile) {
          const documentForm = new FormData();
          documentForm.append('file', draft.documentFile);
          documentForm.append('category', draft.documentCategory);
          documentForm.append('requirementLevel', draft.documentRequirementLevel);
          documentForm.append('status', 'pending');
          if (draft.documentMissingReason) documentForm.append('missingReason', draft.documentMissingReason);
          await postFormData(`/api/properties/${propertyResult.property.id}/documents`, documentForm);
        } else {
          await postJson(`/api/properties/${propertyResult.property.id}/documents`, {
            fileName: draft.documentFileName,
            displayName: draft.documentFileName,
            category: draft.documentCategory,
            requirementLevel: draft.documentRequirementLevel,
            status: draft.documentStatus,
            missingReason: draft.documentMissingReason,
          });
        }
      }
      if (submit) {
        await postJson(`/api/properties/${propertyResult.property.id}/submit`);
      }
      setNotice?.(submit ? 'Fall wurde angelegt und eingereicht.' : 'Entwurf wurde angelegt.');
      await onSaved?.(propertyResult.property.id);
    } catch (err) {
      setNotice?.(err instanceof Error ? err.message : 'Fall konnte nicht gespeichert werden');
    } finally {
      setSaving('');
    }
  }

  return (
    <div>
      {/* Top Bar */}
      <div style={{ padding: '14px 28px', background: theme.mintLight, borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: theme.aubergine, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
          <ArrowLeft size={15} /> Zurück
        </button>
        <div style={{ width: 1, height: 18, background: theme.border }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Neuer Fall · Entwurf</div>
          <div style={{ fontSize: 17, fontWeight: 600, color: theme.ink, marginTop: 2 }}>Erfassung</div>
        </div>
        <button onClick={() => saveCase(false)} disabled={Boolean(saving)} style={{ background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine, fontSize: 12.5, fontWeight: 600, padding: '8px 14px', borderRadius: 5, cursor: saving ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Save size={13} /> {saving === 'draft' ? 'Speichert...' : 'Entwurf speichern'}
        </button>
      </div>

      {/* Stepper */}
      <div style={{ background: 'white', borderBottom: `1px solid ${theme.borderSoft}`, padding: '14px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {steps.map((s, i) => {
            const active = s.n === step;
            const done = s.n < step;
            return (
              <React.Fragment key={s.n}>
                <button onClick={() => setStep(s.n)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: active ? theme.aubergine : done ? '#5B8C2B' : 'white',
                    border: active || done ? 'none' : `1.5px solid ${theme.border}`,
                    color: active || done ? 'white' : `${theme.ink}77`,
                    fontSize: 12, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>{done ? <CheckCircle size={14} /> : s.n}</div>
                  <span style={{ fontSize: 12.5, fontWeight: active ? 600 : 500, color: active ? theme.aubergine : done ? '#5B8C2B' : `${theme.ink}88` }}>{s.label}</span>
                </button>
                {i < steps.length - 1 && <div style={{ flex: 1, height: 1, background: done ? '#5B8C2B44' : theme.border, margin: '0 12px' }} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
        <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, padding: '24px 28px' }}>
          {step === 1 && <FormStep1 draft={draft} setDraft={setDraft} />}
          {step === 2 && <FormStep2 draft={draft} setDraft={setDraft} />}
          {step === 3 && <FormStep3 draft={draft} setDraft={setDraft} />}
          {step === 4 && <FormStep4 draft={draft} setDraft={setDraft} />}
          {step === 5 && <FormStep5 draft={draft} setDraft={setDraft} />}

          {/* Form Actions */}
          <div style={{ borderTop: `1px solid ${theme.borderSoft}`, marginTop: 28, paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              style={{ background: 'transparent', border: `1px solid ${theme.border}`, color: theme.aubergine, fontSize: 13, fontWeight: 600, padding: '9px 16px', borderRadius: 5, cursor: step === 1 ? 'not-allowed' : 'pointer', opacity: step === 1 ? 0.4 : 1 }}>
              Zurück
            </button>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => saveCase(false)} disabled={Boolean(saving)} style={{ background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine, fontSize: 13, fontWeight: 600, padding: '9px 16px', borderRadius: 5, cursor: saving ? 'wait' : 'pointer' }}>
                {saving === 'draft' ? 'Speichert...' : 'Entwurf speichern'}
              </button>
              {step < 5 ? (
                <button onClick={() => setStep(Math.min(5, step + 1))} style={{ background: theme.aubergine, color: 'white', border: 'none', fontSize: 13, fontWeight: 600, padding: '9px 18px', borderRadius: 5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Weiter <ChevronRight size={15} />
                </button>
              ) : (
                <button onClick={() => saveCase(true)} disabled={Boolean(saving)} style={{ background: theme.aubergine, color: 'white', border: 'none', fontSize: 13, fontWeight: 600, padding: '9px 18px', borderRadius: 5, cursor: saving ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Send size={13} /> {saving === 'submit' ? 'Reicht ein...' : 'Einreichen'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hilfe-Sidebar */}
        <div>
          <div style={{ background: theme.mintLight, borderRadius: 8, padding: '16px 18px', marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Hinweis</div>
            <div style={{ fontSize: 12.5, color: theme.ink, lineHeight: 1.55 }}>
              Pflichtfelder sind mit <span style={{ color: theme.gold, fontWeight: 700 }}>*</span> markiert. Du kannst den Fall jederzeit als Entwurf speichern und später fortsetzen.
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, padding: '16px 18px' }}>
            <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Fortschritt</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 10 }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: theme.aubergine }}>{progress}%</span>
              <span style={{ fontSize: 12, color: `${theme.ink}88` }}>Schritt {step} von 5</span>
            </div>
            <div style={{ height: 6, background: theme.borderSoft, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: theme.aubergine, borderRadius: 3 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Form-Felder als wiederverwendbare Komponenten
const Field = ({ label, required, children, hint, width = '100%' }) => (
  <div style={{ width }}>
    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: theme.ink, marginBottom: 6, letterSpacing: '0.01em' }}>
      {label}{required && <span style={{ color: theme.gold, marginLeft: 2 }}>*</span>}
    </label>
    {children}
    {hint && <div style={{ fontSize: 11, color: `${theme.ink}88`, marginTop: 4 }}>{hint}</div>}
  </div>
);
const Input = ({ placeholder, defaultValue, type = 'text', value, onChange, checked }) => (
  <input type={type} placeholder={placeholder} defaultValue={defaultValue} value={value} onChange={onChange} checked={checked} style={{
    width: '100%', padding: '8px 12px', fontSize: 13.5, border: `1px solid ${theme.border}`,
    borderRadius: 5, background: 'white', color: theme.ink, outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box'
  }} />
);
const Select = ({ children, defaultValue, value, onChange }) => (
  <div style={{ position: 'relative' }}>
    <select defaultValue={defaultValue} value={value} onChange={onChange} style={{
      width: '100%', padding: '8px 32px 8px 12px', fontSize: 13.5, border: `1px solid ${theme.border}`,
      borderRadius: 5, background: 'white', color: theme.ink, outline: 'none', fontFamily: 'inherit',
      appearance: 'none', cursor: 'pointer'
    }}>{children}</select>
    <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: `${theme.aubergine}88`, pointerEvents: 'none' }} />
  </div>
);
const RadioGroup = ({ options, name, defaultValue, value, onChange }) => (
  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
    {options.map((o, i) => (
      <label key={i} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', border: `1px solid ${(value ?? defaultValue) === o.value ? theme.aubergine : theme.border}`,
        borderRadius: 5, fontSize: 12.5, cursor: 'pointer',
        background: (value ?? defaultValue) === o.value ? `${theme.aubergine}0D` : 'white',
        color: (value ?? defaultValue) === o.value ? theme.aubergine : theme.ink,
        fontWeight: (value ?? defaultValue) === o.value ? 600 : 500
      }}>
        <input type="radio" name={name} value={o.value} checked={(value ?? defaultValue) === o.value} onChange={() => onChange?.(o.value)} style={{ display: 'none' }} />
        {o.label}
      </label>
    ))}
  </div>
);

const FormStep1 = ({ draft, setDraft }) => (
  <div>
    <h2 style={{ fontSize: 18, fontWeight: 600, color: theme.aubergine, margin: '0 0 4px' }}>Persönliche Daten</h2>
    <div style={{ fontSize: 12.5, color: `${theme.ink}99`, marginBottom: 22 }}>Bitte erfasse die Stammdaten des Eigentümers.</div>

    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
      <Field label="Name" required><Input placeholder="Vor- und Nachname" value={`${draft.firstName} ${draft.lastName}`.trim()} onChange={(event) => {
        const [firstName, ...rest] = event.target.value.split(' ');
        setDraft({ ...draft, firstName, lastName: rest.join(' ') || draft.lastName });
      }} /></Field>
      <Field label="Geschlecht" required>
        <Select value={draft.gender} onChange={(event) => setDraft({ ...draft, gender: event.target.value })}>
          <option value="">Bitte wählen</option>
          <option value="female">weiblich</option>
          <option value="male">männlich</option>
          <option value="diverse">divers</option>
        </Select>
      </Field>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
      <Field label="Geburtsdatum" required><Input type="date" value={draft.dateOfBirth} onChange={(event) => setDraft({ ...draft, dateOfBirth: event.target.value })} /></Field>
      <Field label="Alter">
        <Input placeholder="wird berechnet" value={draft.ageAtSubmission} onChange={(event) => setDraft({ ...draft, ageAtSubmission: event.target.value })} />
      </Field>
      <Field label="Familienstand" required>
        <Select value={draft.maritalStatus} onChange={(event) => setDraft({ ...draft, maritalStatus: event.target.value })}>
          <option value="">Bitte wählen</option>
          <option value="single">ledig</option>
          <option value="married">verheiratet</option>
          <option value="widowed">verwitwet</option>
          <option value="divorced">geschieden</option>
        </Select>
      </Field>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 1.2fr', gap: 16, marginBottom: 16 }}>
      <Field label="Straße" required><Input placeholder="Straße und Hausnr." value={draft.street} onChange={(event) => setDraft({ ...draft, street: event.target.value })} /></Field>
      <Field label="PLZ" required><Input placeholder="70563" value={draft.postalCode} onChange={(event) => setDraft({ ...draft, postalCode: event.target.value })} /></Field>
      <Field label="Ort" required><Input placeholder="Stuttgart" value={draft.city} onChange={(event) => setDraft({ ...draft, city: event.target.value })} /></Field>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: 16, marginBottom: 16 }}>
      <Field label="Telefon"><Input placeholder="z.B. 0711 / 23 45 67" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} /></Field>
      <Field label="Mobil"><Input placeholder="z.B. 0172 / 12 34 567" value={draft.mobile} onChange={(event) => setDraft({ ...draft, mobile: event.target.value })} /></Field>
      <Field label="E-Mail"><Input type="email" placeholder="adresse@example.com" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></Field>
    </div>

    <div style={{ marginBottom: 20 }}>
      <Field label="Monatliche Einkünfte" required>
        <RadioGroup name="income" value={draft.monthlyIncomeRange} onChange={(value) => setDraft({ ...draft, monthlyIncomeRange: value })} options={[
          { value: 'under_1000', label: 'unter 1.000 €' },
          { value: 'from_1000_to_2000', label: '1.000 – 2.000 €' },
          { value: 'from_2000_to_3000', label: '2.000 – 3.000 €' },
          { value: 'over_3000', label: 'über 3.000 €' },
        ]} />
      </Field>
    </div>

    <div style={{ background: theme.mintLight, borderRadius: 6, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <input type="checkbox" checked readOnly style={{ marginTop: 2, accentColor: theme.aubergine }} />
      <div>
        <div style={{ fontSize: 12.5, color: theme.ink, fontWeight: 500 }}>Einwilligung zur Datenverarbeitung <span style={{ color: theme.gold }}>*</span></div>
        <div style={{ fontSize: 11.5, color: `${theme.ink}99`, marginTop: 3, lineHeight: 1.5 }}>Der Kunde willigt ein, dass seine Daten zum Zweck der Angebotserstellung verarbeitet und an WohnKapital übermittelt werden.</div>
      </div>
    </div>
  </div>
);

const FormStep2 = ({ draft, setDraft }) => (
  <div>
    <h2 style={{ fontSize: 18, fontWeight: 600, color: theme.aubergine, margin: '0 0 4px' }}>Wunschmodell</h2>
    <div style={{ fontSize: 12.5, color: `${theme.ink}99`, marginBottom: 22 }}>Wie soll das Wohnrecht ausgestaltet sein?</div>

    <div style={{ marginBottom: 18 }}>
      <Field label="Wer soll das Wohnrecht bekommen?" required>
        <RadioGroup name="recipient" value={draft.residentialRightRecipients} onChange={(value) => setDraft({ ...draft, residentialRightRecipients: value })} options={[
          { value: 'one_person', label: 'Eine Person' },
          { value: 'both', label: 'Beide Personen' },
        ]} />
      </Field>
    </div>

    <div style={{ marginBottom: 18 }}>
      <Field label="Dauer des Wohnrechts" required hint="Zwischen 5 und 15 Jahren wählbar.">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input type="range" min="5" max="15" value={draft.desiredResidentialRightYears} onChange={(event) => setDraft({ ...draft, desiredResidentialRightYears: Number(event.target.value) })} style={{ flex: 1, accentColor: theme.aubergine }} />
          <div style={{ minWidth: 80, padding: '6px 12px', background: theme.aubergine, color: 'white', borderRadius: 5, fontSize: 13, fontWeight: 600, textAlign: 'center' }}>{draft.desiredResidentialRightYears} Jahre</div>
        </div>
      </Field>
    </div>

    <div style={{ background: theme.mintLight, borderRadius: 6, padding: '14px 16px', marginBottom: 18 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: theme.ink, fontWeight: 600 }}>
        <input type="checkbox" checked={draft.secondResidentialRightWanted} onChange={(event) => setDraft({ ...draft, secondResidentialRightWanted: event.target.checked })} style={{ accentColor: theme.aubergine }} />
        Zweite Laufzeit gewünscht (kostenpflichtig)
      </label>
      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
        <Field label="Zweite Laufzeit">
          <Select value={String(draft.secondResidentialRightYears || 5)} onChange={(event) => setDraft({ ...draft, secondResidentialRightYears: Number(event.target.value) })}>
            <option value="5">5 Jahre</option>
            <option value="10">10 Jahre</option>
            <option value="15">15 Jahre</option>
          </Select>
        </Field>
        <Field label="Grund der Befristung">
          <Input placeholder="z.B. Familienplanung, gesundheitliche Gründe" value={draft.fixedTermReason} onChange={(event) => setDraft({ ...draft, fixedTermReason: event.target.value })} />
        </Field>
      </div>
    </div>

    <div style={{ background: theme.goldSoft, border: `1px solid ${theme.gold}55`, borderRadius: 6, padding: '12px 14px' }}>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: theme.ink }}>
        <input type="checkbox" checked={draft.rentalOptionDeselected} onChange={(event) => setDraft({ ...draft, rentalOptionDeselected: event.target.checked })} style={{ marginTop: 2, accentColor: theme.aubergine }} />
        <div>
          <div style={{ fontWeight: 600 }}>Spätere Anmietoption abwählen</div>
          <div style={{ fontSize: 11.5, color: `${theme.ink}99`, marginTop: 3, lineHeight: 1.5 }}>Abwahl kann zu höherer Auszahlung führen, allerdings muss nach Ablauf des Wohnrechts ausgezogen werden.</div>
        </div>
      </label>
    </div>
  </div>
);

const FormStep3 = ({ draft, setDraft }) => (
  <div>
    <h2 style={{ fontSize: 18, fontWeight: 600, color: theme.aubergine, margin: '0 0 4px' }}>Immobiliendaten</h2>
    <div style={{ fontSize: 12.5, color: `${theme.ink}99`, marginBottom: 22 }}>Erfasse die wesentlichen Eigenschaften der Immobilie.</div>

    <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Objektadresse</div>
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 1.2fr', gap: 16, marginBottom: 20 }}>
      <Field label="Straße" required><Input placeholder="Straße und Hausnr." value={draft.propertyStreet} onChange={(event) => setDraft({ ...draft, propertyStreet: event.target.value })} /></Field>
      <Field label="PLZ" required><Input placeholder="70563" value={draft.propertyPostalCode} onChange={(event) => setDraft({ ...draft, propertyPostalCode: event.target.value })} /></Field>
      <Field label="Ort" required><Input placeholder="Stuttgart" value={draft.propertyCity} onChange={(event) => setDraft({ ...draft, propertyCity: event.target.value })} /></Field>
    </div>

    <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Grunddaten</div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
      <Field label="Immobilientyp" required>
        <Select value={draft.propertyType} onChange={(event) => setDraft({ ...draft, propertyType: event.target.value })}><option value="">Bitte wählen</option><option value="single_family">Einfamilienhaus</option><option value="semi_detached">Doppelhaushälfte</option><option value="row_house">Reihenhaus</option><option value="apartment">Eigentumswohnung</option></Select>
      </Field>
      <Field label="Baujahr" required><Input type="number" placeholder="z.B. 1978" value={draft.yearBuilt} onChange={(event) => setDraft({ ...draft, yearBuilt: event.target.value })} /></Field>
      <Field label="Wohnfläche (m²)" required><Input type="number" placeholder="142" value={draft.livingAreaSqm} onChange={(event) => setDraft({ ...draft, livingAreaSqm: event.target.value })} /></Field>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
      <Field label="Grundstück (m²)"><Input type="number" placeholder="380" value={draft.plotAreaSqm} onChange={(event) => setDraft({ ...draft, plotAreaSqm: event.target.value })} /></Field>
      <Field label="Nutzfläche (m²)"><Input type="number" value={draft.usableAreaSqm} onChange={(event) => setDraft({ ...draft, usableAreaSqm: event.target.value })} /></Field>
      <Field label="Miteigentumsanteile" hint="Nur bei Wohnungen"><Input placeholder="z.B. 124/1000" value={draft.coOwnershipShares} onChange={(event) => setDraft({ ...draft, coOwnershipShares: event.target.value })} /></Field>
    </div>

    <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Nutzung und Zustand</div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
      <Field label="Nutzung">
        <Select value={draft.occupancyStatus} onChange={(event) => setDraft({ ...draft, occupancyStatus: event.target.value })}>
          <option value="owner_occupied">selbst bewohnt</option>
          <option value="rented">vermietet</option>
          <option value="vacant">leerstehend</option>
          <option value="partially_rented">teilweise vermietet</option>
        </Select>
      </Field>
      <Field label="Zustand" required>
        <Select value={draft.condition} onChange={(event) => setDraft({ ...draft, condition: event.target.value })}>
          <option value="very_good">sehr gut</option>
          <option value="good">gut</option>
          <option value="average">durchschnittlich</option>
          <option value="renovation_needed">renovierungsbedürftig</option>
        </Select>
      </Field>
      <Field label="Optik">
        <Select value={draft.visualConditionRating} onChange={(event) => setDraft({ ...draft, visualConditionRating: event.target.value })}>
          <option value="very_good">sehr gut</option>
          <option value="good">gut</option>
          <option value="medium">mittel</option>
          <option value="moderate">mäßig</option>
          <option value="bad">schlecht</option>
          <option value="very_bad">sehr schlecht</option>
        </Select>
      </Field>
    </div>

    <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Technik und Energie</div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
      <Field label="Heizungsart">
        <Select value={draft.heatingType} onChange={(event) => setDraft({ ...draft, heatingType: event.target.value })}>
          <option value="">Bitte wählen</option>
          <option value="central">Zentralheizung</option>
          <option value="floor">Etagenheizung</option>
          <option value="electric">Elektroheizung</option>
          <option value="single_stove">Einzelofen</option>
          <option value="none">Keine</option>
        </Select>
      </Field>
      <Field label="Energieträger / Wärmeerzeuger">
        <Select value={draft.heatingEnergySource || ''} onChange={(event) => setDraft({ ...draft, heatingEnergySource: event.target.value })}>
          <option value="">Bitte wählen</option>
          <option value="gas">Gas</option>
          <option value="oil">Öl</option>
          <option value="district_heating">Fernwärme</option>
          <option value="heat_pump">Wärmepumpe</option>
          <option value="electricity">Strom</option>
          <option value="wood_pellets">Holz/Pellets</option>
          <option value="hybrid">Hybrid</option>
          <option value="other">Sonstige</option>
        </Select>
      </Field>
      <Field label="Heizungsjahr"><Input type="number" value={draft.heatingYear} onChange={(event) => setDraft({ ...draft, heatingYear: event.target.value })} /></Field>
    </div>
    {draft.heatingEnergySource === 'other' && (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Field label="Beschreibung Energieträger">
          <Input value={draft.heatingEnergySourceOther || ''} onChange={(event) => setDraft({ ...draft, heatingEnergySourceOther: event.target.value })} />
        </Field>
      </div>
    )}

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
      <Field label="Energieklasse"><Input value={draft.energyClass} onChange={(event) => setDraft({ ...draft, energyClass: event.target.value })} /></Field>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
      <Field label="Energieausweis">
        <Select value={draft.energyCertificateAvailable ? 'yes' : 'no'} onChange={(event) => setDraft({ ...draft, energyCertificateAvailable: event.target.value === 'yes' })}>
          <option value="no">nicht vorhanden</option>
          <option value="yes">vorhanden</option>
        </Select>
      </Field>
      <Field label="Typ Energieausweis">
        <Select value={draft.energyCertificateType} onChange={(event) => setDraft({ ...draft, energyCertificateType: event.target.value })}>
          <option value="demand">Bedarfsausweis</option>
          <option value="consumption">Verbrauchsausweis</option>
          <option value="">Keine Angabe</option>
        </Select>
      </Field>
      <Field label="Keller">
        <Select value={draft.basementType} onChange={(event) => setDraft({ ...draft, basementType: event.target.value })}>
          <option value="none">kein Keller</option>
          <option value="partial">teilunterkellert</option>
          <option value="full">vollunterkellert</option>
        </Select>
      </Field>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
      <Field label="Fenstermaterial">
        <Select value={draft.windowMaterial} onChange={(event) => setDraft({ ...draft, windowMaterial: event.target.value })}>
          <option value="">Keine Angabe</option>
          <option value="wood">Holz</option>
          <option value="aluminium">Aluminium</option>
          <option value="plastic">Kunststoff</option>
        </Select>
      </Field>
      <Field label="Fensterjahr"><Input type="number" value={draft.windowInstallationYear} onChange={(event) => setDraft({ ...draft, windowInstallationYear: event.target.value })} /></Field>
      <Field label="Asbest im Dach bekannt?">
        <Select value={draft.asbestosRoofKnown ? 'yes' : 'no'} onChange={(event) => setDraft({ ...draft, asbestosRoofKnown: event.target.value === 'yes' })}>
          <option value="no">nein</option>
          <option value="yes">ja</option>
        </Select>
      </Field>
    </div>

    <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Außenbereich und Belastungen</div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
      <Field label="Parkplatz">
        <Select value={draft.parkingType} onChange={(event) => setDraft({ ...draft, parkingType: event.target.value, parkingAvailable: Boolean(event.target.value) })}>
          <option value="">kein Parkplatz</option>
          <option value="garage">Garage</option>
          <option value="carport">Carport</option>
          <option value="outdoor_space">Stellplatz</option>
          <option value="duplex">Doppelparker</option>
        </Select>
      </Field>
      <Field label="Anzahl Parkplätze"><Input type="number" value={draft.parkingCount} onChange={(event) => setDraft({ ...draft, parkingCount: event.target.value })} /></Field>
      <Field label="Restschuld (€)">
        <Input type="number" value={draft.remainingDebtAmount} onChange={(event) => setDraft({ ...draft, remainingDebtAmount: event.target.value })} />
      </Field>
    </div>

    <div style={{ background: '#9B2C2C0A', border: `1px solid #9B2C2C33`, borderLeft: `3px solid #9B2C2C`, borderRadius: 6, padding: '12px 14px', marginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <AlertTriangle size={16} style={{ color: '#9B2C2C' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: theme.ink, marginBottom: 6 }}>Ausschlusskriterien</div>
          <div style={{ display: 'flex', gap: 20, fontSize: 12.5, color: theme.ink }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={draft.leasehold} onChange={(event) => setDraft({ ...draft, leasehold: event.target.checked })} style={{ accentColor: '#9B2C2C' }} /> Erbbaurecht
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={draft.monumentProtection} onChange={(event) => setDraft({ ...draft, monumentProtection: event.target.checked })} style={{ accentColor: '#9B2C2C' }} /> Denkmalschutz
            </label>
          </div>
          <div style={{ fontSize: 11, color: '#9B2C2Cdd', marginTop: 6 }}>Wenn aktiviert, kann der Fall nicht eingereicht werden.</div>
        </div>
      </div>
    </div>

    <div style={{ marginTop: 16 }}>
      <Field label="Bekannte Mängel / Hinweise">
        <textarea value={draft.knownDefects} onChange={(event) => setDraft({ ...draft, knownDefects: event.target.value })} rows={3} placeholder="z.B. Feuchtigkeit, Reparaturen, Sanierungsdiskussionen" style={{ width: '100%', padding: '8px 12px', fontSize: 13.5, border: `1px solid ${theme.border}`, borderRadius: 5, background: 'white', color: theme.ink, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' }} />
      </Field>
    </div>
  </div>
);

const modernizationFields = [
  ['heating', 'Heizung'],
  ['roof', 'Dach'],
  ['facade', 'Fassade'],
  ['windows', 'Fenster'],
  ['lines', 'Leitungen'],
  ['bathrooms', 'Bäder'],
];

const buildingConditionFields = [
  ['roof', 'Dach'],
  ['facade', 'Fassade'],
  ['masonry', 'Mauerwerk'],
  ['bathrooms', 'Bäder'],
  ['windows', 'Fenster'],
  ['electric', 'Elektrik'],
  ['outdoor', 'Außenanlage'],
];

const FormStep4 = ({ draft, setDraft }) => {
  const setModernization = (key, patch) => setDraft({
    ...draft,
    modernization: {
      ...draft.modernization,
      [key]: { ...(draft.modernization?.[key] || {}), ...patch },
    },
  });
  const setBuildingCondition = (key, value) => setDraft({
    ...draft,
    buildingCondition: { ...draft.buildingCondition, [key]: value },
  });
  const toggleEnergyCarrier = (carrier) => {
    const current = new Set(draft.energyCarriers || []);
    if (current.has(carrier)) current.delete(carrier);
    else current.add(carrier);
    setDraft({ ...draft, energyCarriers: Array.from(current) });
  };

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: theme.aubergine, margin: '0 0 4px' }}>Modernisierungen</h2>
      <div style={{ fontSize: 12.5, color: `${theme.ink}99`, marginBottom: 22 }}>Bitte erfasse die wichtigsten Modernisierungen und den aktuellen Bauteilzustand.</div>

      <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Maßnahmen</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 22 }}>
        {modernizationFields.map(([key, label]) => (
          <div key={key} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label={label}>
              <Select value={draft.modernization?.[key]?.scope || 'none'} onChange={(event) => setModernization(key, { scope: event.target.value })}>
                <option value="none">keine</option>
                <option value="partial">teilweise</option>
                <option value="complete">vollständig</option>
              </Select>
            </Field>
            <Field label="Jahr / Hinweis">
              <Input value={draft.modernization?.[key]?.year || ''} onChange={(event) => setModernization(key, { year: event.target.value })} placeholder="z.B. 2018" />
            </Field>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Bauteilzustand</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
        {buildingConditionFields.map(([key, label]) => (
          <Field key={key} label={label}>
            <Select value={draft.buildingCondition?.[key] || 'medium'} onChange={(event) => setBuildingCondition(key, event.target.value)}>
              <option value="very_good">sehr gut</option>
              <option value="good">gut</option>
              <option value="medium">mittel</option>
              <option value="moderate">mäßig</option>
              <option value="bad">schlecht</option>
              <option value="very_bad">sehr schlecht</option>
            </Select>
          </Field>
        ))}
      </div>

      <div style={{ background: theme.mintLight, borderRadius: 6, padding: '12px 14px' }}>
        <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>PV / Solar / Speicher</div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12.5, color: theme.ink }}>
          {[
            ['photovoltaik', 'Photovoltaik'],
            ['solarthermie', 'Solarthermie'],
            ['batteriespeicher', 'Batteriespeicher'],
          ].map(([value, label]) => (
            <label key={value} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={(draft.energyCarriers || []).includes(value)} onChange={() => toggleEnergyCarrier(value)} style={{ accentColor: theme.aubergine }} />
              {label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

const FormStep5 = ({ draft, setDraft }) => (
  <div>
    <h2 style={{ fontSize: 18, fontWeight: 600, color: theme.aubergine, margin: '0 0 4px' }}>Dokumente</h2>
    <div style={{ fontSize: 12.5, color: `${theme.ink}99`, marginBottom: 22 }}>Dokumente werden mit Kategorie, Pflichtstatus und Prüfstatus am Fall gespeichert.</div>
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
      <Field label="Unterlage hochladen">
        <input type="file" onChange={(event) => {
          const file = event.target.files?.[0] || null;
          setDraft({ ...draft, documentFile: file, documentFileName: file?.name || '' });
        }} style={{ width: '100%', padding: '8px 12px', fontSize: 13.5, border: `1px solid ${theme.border}`, borderRadius: 5, background: 'white', color: theme.ink, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
      </Field>
      <Field label="Kategorie">
        <Select value={draft.documentCategory} onChange={(event) => setDraft({ ...draft, documentCategory: event.target.value })}>
          <option value="energy_certificate">Energieausweis</option>
          <option value="land_register">Grundbuchauszug</option>
          <option value="floorplan">Grundriss</option>
          <option value="living_area_calculation">Wohnflächenberechnung</option>
          <option value="photos">Fotos</option>
          <option value="other">Sonstiges</option>
        </Select>
      </Field>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
      <Field label="Dokumentenpflicht">
        <Select value={draft.documentRequirementLevel} onChange={(event) => setDraft({ ...draft, documentRequirementLevel: event.target.value })}>
          <option value="required">Pflicht</option>
          <option value="recommended">Empfohlen</option>
          <option value="optional">Optional</option>
        </Select>
      </Field>
      <Field label="Dokumentenstatus">
        <Select value={draft.documentStatus} onChange={(event) => setDraft({ ...draft, documentStatus: event.target.value })}>
          <option value="missing">fehlt</option>
          <option value="pending">eingereicht</option>
          <option value="ok">geprüft</option>
          <option value="review_required">Prüfung nötig</option>
          <option value="rejected">abgelehnt</option>
        </Select>
      </Field>
    </div>
    <Field label="Statusnotiz">
      <textarea value={draft.documentMissingReason} onChange={(event) => setDraft({ ...draft, documentMissingReason: event.target.value })} rows={3} style={{ width: '100%', padding: '8px 12px', fontSize: 13.5, border: `1px solid ${theme.border}`, borderRadius: 5, background: 'white', color: theme.ink, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' }} />
    </Field>
  </div>
);

// =====================================================================
// MAIN APP
// =====================================================================
export default function App({ initialRole = 'partner' } = {}) {
  const [role, setRole] = useState(initialRole);
  const [screen, setScreen] = useState('dashboard');
  const [caseId, setCaseId] = useState(null);
  const [cases, setCases] = useState(mockCases);
  const [notice, setNotice] = useState('');
  const [loadingCases, setLoadingCases] = useState(false);

  const user = role === 'admin'
    ? { name: 'A. Klein', initials: 'AK' }
    : { name: 'M. Krüger', initials: 'MK' };

  async function loadCases(nextRole = role) {
    setLoadingCases(true);
    try {
      await ensureDemoSession(nextRole);
      const response = await fetch('/api/properties');
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Fälle konnten nicht geladen werden');
      setCases((payload.cases || []).map(mapCaseView));
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Fälle konnten nicht geladen werden');
    } finally {
      setLoadingCases(false);
    }
  }

  useEffect(() => {
    loadCases(initialRole);
  }, [initialRole]);

  const handleNavigate = (s) => {
    setScreen(s);
    setCaseId(null);
  };
  const handleOpenCase = (id) => {
    setCaseId(id);
    setScreen('case');
  };
  const handleNewCase = () => setScreen('erfassung');
  const handleBack = () => setScreen('dashboard');
  const handleSavedCase = async (id) => {
    await loadCases(role);
    setCaseId(id);
    setScreen('case');
  };
  const toggleRole = () => {
    const nextRole = role === 'admin' ? 'partner' : 'admin';
    setRole(nextRole);
    setScreen('dashboard');
    setCaseId(null);
    loadCases(nextRole);
  };
  const handleLogout = async () => {
    try {
      const payload = await postJson('/api/auth/logout');
      window.location.replace(payload.redirectTo || '/login');
    } catch {
      window.location.replace('/login');
    }
  };

  return (
    <div style={{ background: theme.mint, fontFamily: '"Aptos", "Segoe UI", system-ui, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header role={role} user={user} onRoleToggle={toggleRole} onLogout={handleLogout} />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Sidebar role={role} currentScreen={screen} onNavigate={handleNavigate} />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {(notice || loadingCases) && (
            <div style={{ margin: '14px 28px 0', background: loadingCases ? theme.mintLight : theme.goldSoft, border: `1px solid ${loadingCases ? theme.border : `${theme.gold}55`}`, borderRadius: 6, padding: '9px 12px', fontSize: 12.5, color: theme.ink }}>
              {loadingCases ? 'Fälle werden geladen...' : notice}
            </div>
          )}
          {screen === 'dashboard' && role === 'partner' && <MaklerDashboard cases={cases} onOpenCase={handleOpenCase} onNewCase={handleNewCase} />}
          {screen === 'dashboard' && role === 'admin' && <AdminDashboard cases={cases} onOpenCase={handleOpenCase} />}
          {screen === 'case' && <FallDetail caseId={caseId} onBack={handleBack} role={role} cases={cases} onRefresh={() => loadCases(role)} setNotice={setNotice} />}
          {screen === 'erfassung' && <Erfassung onBack={handleBack} onSaved={handleSavedCase} setNotice={setNotice} />}
        </div>
      </div>
    </div>
  );
}

