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
  OFFER_ACCEPTED:      { label: 'Angebot angenommen',   color: '#5B8C2B' },
  PURCHASE_STARTED:    { label: 'Ankauf gestartet',     color: theme.aubergineSoft },
  NOTARY_APPOINTMENT:  { label: 'Notartermin',          color: theme.oliv },
  PURCHASED:           { label: 'Angekauft',            color: '#3D6B1F' },
  IN_PORTFOLIO:        { label: 'Im Bestand',           color: '#3D6B1F' },
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

const LeadStatusBadge = ({ status }) => {
  const color = leadStatusColors[status] || theme.aubergine;
  return (
    <span style={{
      display: 'inline-block',
      background: `${color}1A`,
      color,
      fontSize: 11,
      fontWeight: 700,
      padding: '3px 10px',
      borderRadius: 10,
      whiteSpace: 'nowrap'
    }}>
      {leadStatusLabels[status] || status}
    </span>
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
const Header = ({ role, user, onRoleToggle, onLogout, onProfileOpen }) => (
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
        <button onClick={onProfileOpen} title="Profil öffnen" style={{ display: 'flex', alignItems: 'center', gap: 8, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', maxWidth: 190 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: theme.aubergine, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>{user.initials}</div>
          <span style={{ fontSize: 13, color: theme.ink, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{user.name}</span>
        </button>
        <button onClick={onLogout} title="Abmelden" style={{ background: theme.mintLight, border: `1px solid ${theme.border}`, color: theme.aubergine, borderRadius: 5, padding: '5px 8px', marginLeft: 4, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600 }}>
          <LogOut size={14} /> Logout
        </button>
      </div>
    </div>
  </div>
);

const Sidebar = ({ role, currentScreen, onNavigate, leadCount = 0 }) => {
  const partnerNav = [
    { icon: Home, label: 'Home', screen: 'dashboard' },
    { icon: TrendingUp, label: 'Leads', screen: 'leads', badge: leadCount || undefined },
    { icon: FolderOpen, label: 'Entwürfe', screen: 'drafts' },
    { icon: Clock, label: 'In Bearbeitung', screen: 'in_progress', badge: 4 },
    { icon: Archive, label: 'Bestand', screen: 'portfolio' },
    { icon: FileText, label: 'Sonstiges', screen: 'other' },
  ];
  const adminNav = [
    { icon: Home, label: 'Home', screen: 'dashboard' },
    { icon: TrendingUp, label: 'Leads', screen: 'leads', badge: leadCount || undefined, internal: true },
    { icon: FolderOpen, label: 'Entwürfe', screen: 'drafts' },
    { icon: Clock, label: 'In Bearbeitung', screen: 'in_progress', badge: 23 },
    { icon: Archive, label: 'Bestand', screen: 'portfolio' },
    { icon: CheckCircle2, label: 'Verkauft', screen: 'sold', internal: true },
    { icon: Users, label: 'Partner', screen: 'partners' },
    { icon: FileText, label: 'Sonstiges', screen: 'other' },
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
        { icon: BookOpen, label: 'Broschüre', screen: 'knowledge_brochure' },
        { icon: MapPin, label: 'Postbank Atlas', screen: 'knowledge_atlas' },
        { icon: FileText, label: 'Leitfaden', screen: 'knowledge_guide' },
        { icon: HelpCircle, label: 'FAQs', screen: 'knowledge_faq' },
      ].map((item, i) => (
        <div key={i} onClick={() => onNavigate(item.screen)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 6, background: currentScreen === item.screen ? `${theme.aubergine}12` : 'transparent', fontSize: 12.5, color: currentScreen === item.screen ? theme.aubergine : `${theme.ink}cc`, cursor: 'pointer' }}>
          <item.icon size={14} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

function initialsFromName(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] || 'U') + (parts[1]?.[0] || '');
}

function splitProfileName(profile = {}) {
  if (profile.firstName || profile.lastName) {
    return {
      firstName: profile.firstName || '',
      lastName: profile.lastName || ''
    };
  }
  const parts = String(profile.name || '').trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ')
  };
}

function profileDisplayName(profile = {}) {
  const { firstName, lastName } = splitProfileName(profile);
  return [firstName, lastName].filter(Boolean).join(' ') || profile.name || 'Benutzer';
}

const defaultProfiles = {
  admin: {
    firstName: 'Anna',
    lastName: 'Klein',
    name: 'Anna Klein',
    initials: 'AK',
    email: 'admin@demo.local',
    phone: '+49 711 100200',
    company: 'WohnKapital',
    roleLabel: 'Admin'
  },
  partner: {
    firstName: 'Markus',
    lastName: 'Krüger',
    name: 'Markus Krüger',
    initials: 'MK',
    email: 'makler@demo.local',
    phone: '+49 711 234567',
    company: 'Krüger Immobilien',
    roleLabel: 'Partner'
  }
};

const ProfileModal = ({ user, role, onClose, onSave }) => {
  const firstNameRef = React.useRef(null);
  const lastNameRef = React.useRef(null);
  const emailRef = React.useRef(null);
  const phoneRef = React.useRef(null);
  const companyRef = React.useRef(null);
  const profileName = splitProfileName(user);
  const save = () => {
    const nextFirstName = firstNameRef.current?.value?.trim() || profileName.firstName;
    const nextLastName = lastNameRef.current?.value?.trim() || profileName.lastName;
    const nextName = [nextFirstName, nextLastName].filter(Boolean).join(' ') || user.name;
    onSave({
      ...user,
      firstName: nextFirstName,
      lastName: nextLastName,
      name: nextName,
      email: emailRef.current?.value?.trim() || user.email,
      phone: phoneRef.current?.value?.trim() || '',
      company: companyRef.current?.value?.trim() || '',
      initials: initialsFromName(nextName).toUpperCase()
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(42, 26, 53, 0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: 'min(520px, 94vw)', background: 'white', borderRadius: 8, border: `1px solid ${theme.border}`, boxShadow: '0 24px 70px rgba(68, 0, 92, 0.18)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', background: theme.mintLight, borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: theme.aubergine, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{user.initials}</div>
            <div>
              <div style={{ fontSize: 15, color: theme.aubergine, fontWeight: 700 }}>Mein Profil</div>
              <div style={{ fontSize: 11.5, color: `${theme.ink}99` }}>{role === 'admin' ? 'Interner CRM-Zugang' : 'Maklerprofil'}</div>
            </div>
          </div>
          <button onClick={onClose} title="Schließen" style={{ background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine, borderRadius: 5, width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={15} />
          </button>
        </div>
        <div style={{ padding: '20px 22px', display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Vorname" required><Input defaultValue={profileName.firstName} inputRef={firstNameRef} /></Field>
            <Field label="Nachname" required><Input defaultValue={profileName.lastName} inputRef={lastNameRef} /></Field>
          </div>
          <Field label="E-Mail" required><Input type="email" defaultValue={user.email} inputRef={emailRef} /></Field>
          <Field label="Telefon"><Input defaultValue={user.phone} inputRef={phoneRef} /></Field>
          <Field label={role === 'admin' ? 'Organisation' : 'Firma'}><Input defaultValue={user.company} inputRef={companyRef} /></Field>
          {role === 'admin' && (
            <Field label="Rolle">
              <Input value={user.roleLabel} readOnly />
            </Field>
          )}
          <div style={{ background: theme.mintLight, borderRadius: 6, padding: '11px 13px', fontSize: 12.5, lineHeight: 1.5, color: `${theme.ink}cc` }}>
            Änderungen werden im MVP direkt für diese Sitzung gespeichert. Für produktive Nutzung wird dieser Bereich später an die Benutzerverwaltung angebunden.
          </div>
        </div>
        <div style={{ padding: '14px 22px 20px', borderTop: `1px solid ${theme.borderSoft}`, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine, borderRadius: 5, padding: '9px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Abbrechen</button>
          <button onClick={save} style={{ background: theme.aubergine, border: 'none', color: 'white', borderRadius: 5, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Profil speichern</button>
        </div>
      </div>
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

async function patchJson(url, body) {
  const response = await fetch(url, {
    method: 'PATCH',
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

function leadDisplayName(lead) {
  return lead?.name || [lead?.firstName, lead?.lastName].filter(Boolean).join(' ') || 'Kontakt offen';
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
const leadStatusLabels = {
  NEW: 'Neu',
  QUALIFIED: 'Qualifiziert',
  ASSIGNED: 'Zugewiesen',
  CONTACTED: 'Kontaktiert',
  CONVERTED: 'Umgewandelt',
  REJECTED: 'Abgelehnt',
};
const leadStatusColors = {
  NEW: theme.gold,
  QUALIFIED: theme.aubergineSoft,
  ASSIGNED: theme.oliv,
  CONTACTED: '#7B61C7',
  CONVERTED: '#5B8C2B',
  REJECTED: '#9B2C2C',
};

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

function filterCasesForScreen(cases, screen) {
  const statusGroups = {
    drafts: ['DRAFT'],
    in_progress: ['SUBMITTED', 'DATA_INCOMPLETE', 'VALUATION_PENDING', 'VALUATED', 'OFFER_CALCULATED', 'OFFER_DRAFTED', 'INTERNAL_REVIEW', 'APPROVED', 'SENT', 'OFFER_ACCEPTED', 'PURCHASE_STARTED', 'NOTARY_APPOINTMENT', 'PURCHASED', 'APPOINTMENT_SCHEDULED'],
    portfolio: ['OFFER_ACCEPTED', 'PURCHASE_STARTED', 'NOTARY_APPOINTMENT', 'PURCHASED', 'IN_PORTFOLIO', 'WON'],
    sold: ['SOLD', 'PURCHASED', 'IN_PORTFOLIO', 'WON'],
  };
  const statuses = statusGroups[screen] || [];
  return cases.filter((item) => statuses.includes(item.status));
}

function menuScreenTitle(screen) {
  const labels = {
    drafts: 'Entwürfe',
    in_progress: 'In Bearbeitung',
    portfolio: 'Bestand',
    sold: 'Verkauft',
  };
  return labels[screen] || 'Fälle';
}

function calculateAgeFromBirthDate(dateString) {
  if (!dateString) return '';
  const birthDate = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const hadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  if (!hadBirthdayThisYear) age -= 1;
  return age >= 0 ? age : '';
}

const defaultDraft = {
  title: '',
  firstName: 'Eva',
  lastName: 'Schmidt',
  ageAtSubmission: calculateAgeFromBirthDate('1953-03-12'),
  gender: 'female',
  dateOfBirth: '1953-03-12',
  maritalStatus: 'widowed',
  spouseTitle: '',
  spouseFirstName: '',
  spouseLastName: '',
  spouseGender: '',
  spouseDateOfBirth: '',
  spouseAgeAtSubmission: '',
  propertyOwnership: 'customer_1',
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
  desiredModel: 'fixed_residential_right',
  residentialRightRecipients: 'one_person',
  desiredResidentialRightYears: 10,
  rentalModelDisclosureAccepted: false,
  additionalOfferRequested: false,
  additionalOfferModel: 'sale_and_leaseback',
  additionalOfferResidentialRightYears: 10,
  additionalOfferReason: '',
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
  generalPropertyNotes: '',
  remainingDebtKnown: false,
  remainingDebtAmount: 0,
  modernization: {
    heating: { scope: 'complete', year: '2015', note: 'Gas-Brennwert erneuert' },
    roof: { scope: 'partial', year: '2020', note: 'PV-Anlage nachgerüstet' },
    facade: { scope: 'none', year: '', note: '' },
    windows: { scope: 'complete', year: '2012', note: 'Kunststofffenster' },
    lines: { scope: 'partial', year: '2010', note: '' },
    bathrooms: { scope: 'partial', year: '2016', note: '' },
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
const getBrokerNextStep = (item) => {
  if (item.kind === 'lead') return 'Lead prüfen';
  if (item.followUp || item.status === 'DATA_INCOMPLETE') return 'Unterlagen anfordern';
  if (['APPROVED', 'SENT', 'OFFER_ACCEPTED'].includes(item.status)) return 'Angebot nachfassen';
  if (item.status === 'DRAFT') return 'Entwurf vervollständigen';
  if (['SUBMITTED', 'VALUATION_PENDING', 'VALUATED'].includes(item.status)) return 'Bewertung abwarten';
  if (['OFFER_CALCULATED', 'OFFER_DRAFTED', 'INTERNAL_REVIEW'].includes(item.status)) return 'Prüfung beobachten';
  if (['PURCHASE_STARTED', 'NOTARY_APPOINTMENT', 'PURCHASED'].includes(item.status)) return 'Ankauf verfolgen';
  return 'Fall öffnen';
};

const PriorityActionCards = ({ assignedLeads, followUpCases, offerCases, onOpenLeads, onOpenCase }) => {
  const actions = [
    {
      title: 'Neue Leads',
      count: assignedLeads.length,
      description: 'Neue Anfragen prüfen und bei Interesse als Kundenfall übernehmen.',
      actionLabel: 'Leads prüfen',
      icon: TrendingUp,
      tone: 'lead',
      onClick: onOpenLeads,
    },
    {
      title: 'Rückfragen / fehlende Unterlagen',
      count: followUpCases.length,
      description: 'Offene Rückfragen, fehlende Pflichtunterlagen oder Wiedervorlagen bearbeiten.',
      actionLabel: 'Unterlagen anfordern',
      icon: AlertCircle,
      tone: 'urgent',
      onClick: () => followUpCases[0] && onOpenCase(followUpCases[0].propertyId || followUpCases[0].id),
    },
    {
      title: 'Angebote nachfassen',
      count: offerCases.length,
      description: 'Freigegebene oder versendete Angebote beim Kunden nachhalten.',
      actionLabel: 'Angebote nachfassen',
      icon: Send,
      tone: 'normal',
      onClick: () => offerCases[0] && onOpenCase(offerCases[0].propertyId || offerCases[0].id),
    },
  ];

  const toneStyles = {
    urgent: { border: `${theme.gold}88`, bar: theme.gold, background: theme.goldSoft, icon: '#A87308' },
    lead: { border: `${theme.oliv}66`, bar: theme.oliv, background: 'white', icon: theme.oliv },
    normal: { border: theme.borderSoft, bar: theme.aubergineSoft, background: 'white', icon: theme.aubergineSoft },
  };

  return (
    <div className="priority-action-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, marginBottom: 24 }}>
      {actions.map((action) => {
        const style = toneStyles[action.tone];
        const disabled = action.count === 0;
        return (
          <button
            key={action.title}
            onClick={disabled ? undefined : action.onClick}
            style={{
              background: style.background,
              border: `1px solid ${style.border}`,
              borderLeft: `4px solid ${style.bar}`,
              borderRadius: 8,
              padding: '18px 18px 16px',
              textAlign: 'left',
              minHeight: 154,
              cursor: disabled ? 'default' : 'pointer',
              opacity: disabled ? 0.68 : 1,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
              <action.icon size={18} style={{ color: style.icon, marginTop: 2 }} />
              <span style={{ fontSize: 30, fontWeight: 750, lineHeight: 1, color: theme.aubergine }}>{action.count}</span>
            </div>
            <div style={{ fontSize: 15, color: theme.ink, fontWeight: 700, marginBottom: 6 }}>{action.title}</div>
            <div style={{ fontSize: 12.5, color: `${theme.ink}99`, lineHeight: 1.45, minHeight: 36 }}>{action.description}</div>
            <div style={{ marginTop: 14, color: disabled ? `${theme.ink}66` : theme.aubergine, fontSize: 12.5, fontWeight: 750, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              {action.actionLabel} <ChevronRight size={13} />
            </div>
          </button>
        );
      })}
    </div>
  );
};

const DashboardSearch = ({ value, onChange }) => (
  <div style={{ position: 'relative', width: 'min(100%, 320px)' }}>
    <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: `${theme.aubergine}88` }} />
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Fall oder Kunde suchen"
      style={{
        width: '100%',
        padding: '9px 12px 9px 34px',
        border: `1px solid ${theme.border}`,
        borderRadius: 6,
        background: 'white',
        color: theme.ink,
        fontSize: 13,
        outline: 'none',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
      }}
    />
  </div>
);

const ActiveCasesTable = ({ items, onOpenCase, onOpenLeads }) => (
  <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, overflow: 'hidden' }}>
    <div className="lead-table-scroll" style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', minWidth: 820, borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: theme.mintLight }}>
            {['Fallnummer', 'Kunde', 'Objekt', 'Status', 'Nächster Schritt', 'Letzte Aktivität', ''].map((h, i) => (
              <th key={i} style={{ textAlign: 'left', padding: '9px 16px', fontSize: 11, fontWeight: 700, color: theme.oliv, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ padding: 28, color: `${theme.ink}88`, fontSize: 13 }}>Keine passenden aktiven Fälle gefunden.</td>
            </tr>
          ) : items.map((item, index) => {
            const open = () => item.kind === 'lead' ? onOpenLeads() : onOpenCase(item.propertyId || item.id);
            return (
              <tr key={`${item.kind || 'case'}-${item.propertyId || item.id}`} onClick={open} style={{ borderTop: index ? `1px solid ${theme.borderSoft}` : 'none', cursor: 'pointer' }}>
                <td style={{ padding: '12px 16px', fontFamily: 'ui-monospace, "SF Mono", monospace', fontSize: 12, color: theme.aubergine, fontWeight: 700 }}>{item.id}</td>
                <td style={{ padding: '12px 16px', color: theme.ink, fontWeight: 600 }}>{item.kunde}{item.alter ? <span style={{ color: `${theme.ink}77`, fontSize: 12, fontWeight: 500 }}> ({item.alter})</span> : null}</td>
                <td style={{ padding: '12px 16px', color: `${theme.ink}cc` }}>{item.objekt}</td>
                <td style={{ padding: '12px 16px' }}>{item.kind === 'lead' ? <LeadStatusBadge status={item.status} /> : <StatusBadge status={item.status} />}</td>
                <td style={{ padding: '12px 16px', color: theme.ink, fontWeight: 650 }}>{item.nextStep}</td>
                <td style={{ padding: '12px 16px', color: `${theme.ink}88`, fontSize: 12 }}>{item.vor}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <button onClick={(event) => { event.stopPropagation(); open(); }} style={{ background: 'transparent', border: `1px solid ${theme.border}`, color: theme.aubergine, fontSize: 11.5, fontWeight: 700, padding: '5px 9px', borderRadius: 5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Öffnen <ChevronRight size={12} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

const BrokerDashboard = ({ cases = mockCases, leads = [], onOpenCase, onNewCase, onOpenLeads }) => {
  const [search, setSearch] = useState('');
  const dashboardStatuses = ['SUBMITTED', 'DATA_INCOMPLETE', 'VALUATION_PENDING', 'VALUATED', 'OFFER_CALCULATED', 'OFFER_DRAFTED', 'INTERNAL_REVIEW', 'APPROVED', 'SENT', 'OFFER_ACCEPTED', 'PURCHASE_STARTED', 'NOTARY_APPOINTMENT'];
  const hasDashboardCases = cases.some((item) => item.followUp || dashboardStatuses.includes(item.status));
  const dashboardCases = hasDashboardCases ? cases : mockCases;
  const assignedLeads = leads.filter((lead) => !['CONVERTED', 'REJECTED'].includes(lead.status));
  const followUpCases = dashboardCases.filter((item) => item.followUp || item.status === 'DATA_INCOMPLETE');
  const activeCases = dashboardCases.filter((item) => dashboardStatuses.includes(item.status));
  const offerCases = dashboardCases.filter((item) => ['APPROVED', 'SENT', 'OFFER_ACCEPTED'].includes(item.status));
  const activeLeadRows = assignedLeads.map((lead) => ({
    kind: 'lead',
    id: lead.leadNumber,
    kunde: leadDisplayName(lead),
    objekt: `${propertyTypeLabel(lead.propertyType)} ${lead.city || ''}`.trim(),
    status: lead.status,
    nextStep: 'Lead prüfen',
    vor: dateLabel(lead.updatedAt || lead.createdAt),
    priority: 2,
  }));
  const activeCaseRows = activeCases.map((item) => ({
    ...item,
    kind: 'case',
    nextStep: getBrokerNextStep(item),
    priority: item.followUp || item.status === 'DATA_INCOMPLETE'
      ? 1
      : ['APPROVED', 'SENT', 'OFFER_ACCEPTED'].includes(item.status)
        ? 3
        : 4,
  }));
  const normalizedSearch = search.trim().toLowerCase();
  const tableItems = [...activeCaseRows, ...activeLeadRows]
    .filter((item) => !normalizedSearch || [item.id, item.kunde, item.objekt, item.status, item.nextStep].some((value) => String(value || '').toLowerCase().includes(normalizedSearch)))
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 7);

  return (
    <div style={{ padding: '22px 28px 28px' }}>
      <div className="broker-dashboard-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>Guten Morgen, Markus</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: theme.aubergine, margin: 0, letterSpacing: '-0.01em' }}>Was steht heute an?</h1>
        </div>
        <button onClick={onNewCase} style={{ background: theme.aubergine, color: 'white', border: 'none', padding: '10px 18px', borderRadius: 6, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <Plus size={15} /> Neuer Fall
        </button>
      </div>

      <PriorityActionCards assignedLeads={assignedLeads} followUpCases={followUpCases} offerCases={offerCases} onOpenLeads={onOpenLeads} onOpenCase={onOpenCase} />

      <div style={{ marginTop: 2 }}>
        <div className="active-cases-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: theme.aubergine, margin: 0 }}>Aktive Fälle</h2>
            <div style={{ fontSize: 12.5, color: `${theme.ink}88`, marginTop: 3 }}>Handlungsbedarf zuerst, maximal sieben Vorgänge.</div>
          </div>
          <DashboardSearch value={search} onChange={setSearch} />
        </div>
        <ActiveCasesTable items={tableItems} onOpenCase={onOpenCase} onOpenLeads={onOpenLeads} />
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

const CaseMenuScreen = ({ screen, cases = [], onOpenCase, role }) => {
  const filteredCases = filterCasesForScreen(cases, screen);
  const title = menuScreenTitle(screen);
  const subtitle = {
    drafts: 'Entwürfe, die noch nicht eingereicht wurden.',
    in_progress: 'Alle aktiven Vorgänge von Einreichung bis Freigabe.',
    portfolio: 'Fälle im Bestand oder in der Kundenphase nach Versand.',
    sold: 'Erfolgreich abgeschlossene und verkaufte Vorgänge.',
  }[screen] || 'Gefilterte Fallliste.';

  return (
    <div style={{ padding: '20px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>
            {role === 'admin' ? 'Intern · CRM' : 'Partnerportal'}
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: theme.aubergine, margin: 0, letterSpacing: '-0.01em' }}>{title}</h1>
          <div style={{ fontSize: 12.5, color: `${theme.ink}99`, marginTop: 5 }}>{subtitle}</div>
        </div>
        <div style={{ background: 'white', border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '10px 14px', minWidth: 120, textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: theme.aubergine, lineHeight: 1 }}>{filteredCases.length}</div>
          <div style={{ fontSize: 11, color: `${theme.ink}88`, marginTop: 3 }}>Fälle</div>
        </div>
      </div>

      <CaseTableCard
        title={title}
        emptyText={`Keine Fälle in "${title}".`}
        cases={filteredCases}
        onOpenCase={onOpenCase}
        showPartner={role === 'admin'}
      />
    </div>
  );
};

const acquisitionStages = [
  {
    title: 'Angebot angenommen',
    statuses: ['OFFER_ACCEPTED'],
    icon: CheckCircle2,
    tone: '#5B8C2B',
    text: 'Kunde hat das Angebot bestätigt. Ankauf muss intern gestartet werden.',
  },
  {
    title: 'Ankauf gestartet',
    statuses: ['PURCHASE_STARTED'],
    icon: Briefcase,
    tone: theme.aubergineSoft,
    text: 'Unterlagen und Vertragsvorbereitung laufen.',
  },
  {
    title: 'Notartermin',
    statuses: ['NOTARY_APPOINTMENT'],
    icon: Calendar,
    tone: theme.oliv,
    text: 'Termin ist vereinbart oder steht zur finalen Koordination an.',
  },
  {
    title: 'Angekauft',
    statuses: ['PURCHASED'],
    icon: CheckCircle,
    tone: '#3D6B1F',
    text: 'Ankauf ist abgeschlossen. Übergabe in den Bestand prüfen.',
  },
  {
    title: 'Im Bestand',
    statuses: ['IN_PORTFOLIO', 'WON'],
    icon: Archive,
    tone: '#3D6B1F',
    text: 'Objekt ist in der Bestandsverwaltung angekommen.',
  },
];

const nextPortfolioAction = {
  OFFER_ACCEPTED: 'Ankauf starten',
  PURCHASE_STARTED: 'Notartermin vorbereiten',
  NOTARY_APPOINTMENT: 'Ankauf abschließen',
  PURCHASED: 'In Bestand übernehmen',
  IN_PORTFOLIO: 'Bestandsdaten prüfen',
  WON: 'Bestandsdaten prüfen',
};

const PortfolioScreen = ({ cases = [], onOpenCase, role }) => {
  const pipelineStatuses = ['OFFER_ACCEPTED', 'PURCHASE_STARTED', 'NOTARY_APPOINTMENT', 'PURCHASED'];
  const portfolioStatuses = ['IN_PORTFOLIO', 'WON'];
  const pipelineCases = cases.filter((item) => pipelineStatuses.includes(item.status));
  const portfolioCases = cases.filter((item) => portfolioStatuses.includes(item.status));
  const relevantCases = [...pipelineCases, ...portfolioCases];
  const notaryCases = cases.filter((item) => item.status === 'NOTARY_APPOINTMENT');
  const transitionCases = cases.filter((item) => item.status === 'PURCHASED');

  const kpis = [
    { label: 'Ankaufspipeline', value: pipelineCases.length, sub: 'angenommen bis angekauft', icon: Briefcase },
    { label: 'Notartermine', value: notaryCases.length, sub: 'zu koordinieren', icon: Calendar },
    { label: 'Übergabe offen', value: transitionCases.length, sub: 'noch nicht im Bestand', icon: AlertCircle },
    { label: 'Im Bestand', value: portfolioCases.length, sub: 'aktive Bestandsobjekte', icon: Archive },
  ];

  return (
    <div style={{ padding: '20px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18, gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>
            {role === 'admin' ? 'Intern · Ankauf' : 'Partnerportal · Bestand'}
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: theme.aubergine, margin: 0, letterSpacing: '-0.01em' }}>Ankauf & Bestand</h1>
          <div style={{ fontSize: 12.5, color: `${theme.ink}99`, marginTop: 5 }}>
            Vom angenommenen Angebot über Notar und Ankauf bis zur Übergabe in den Bestand.
          </div>
        </div>
        <div style={{ background: 'white', border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '10px 14px', minWidth: 124, textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: theme.aubergine, lineHeight: 1 }}>{relevantCases.length}</div>
          <div style={{ fontSize: 11, color: `${theme.ink}88`, marginTop: 3 }}>Vorgänge</div>
        </div>
      </div>

      <div className="lead-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 18 }}>
        {kpis.map((item) => (
          <div key={item.label} style={{ background: 'white', borderRadius: 8, padding: '14px 16px', border: `1px solid ${theme.borderSoft}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
              <span style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{item.label}</span>
              <item.icon size={15} style={{ color: `${theme.aubergine}66` }} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: theme.aubergine, lineHeight: 1, marginBottom: 4 }}>{item.value}</div>
            <div style={{ fontSize: 11.5, color: `${theme.ink}99` }}>{item.sub}</div>
          </div>
        ))}
      </div>

      <div className="portfolio-stage-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 18 }}>
        {acquisitionStages.map((stage) => {
          const stageCases = cases.filter((item) => stage.statuses.includes(item.status));
          const firstCase = stageCases[0];
          return (
            <button key={stage.title} onClick={() => firstCase && onOpenCase(firstCase.propertyId || firstCase.id)} style={{
              background: 'white',
              border: `1px solid ${stageCases.length ? `${stage.tone}55` : theme.borderSoft}`,
              borderTop: `3px solid ${stage.tone}`,
              borderRadius: 8,
              padding: '13px 14px',
              textAlign: 'left',
              cursor: firstCase ? 'pointer' : 'default',
              minHeight: 134,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <stage.icon size={16} style={{ color: stage.tone }} />
                <span style={{ background: `${stage.tone}1A`, color: stage.tone, borderRadius: 12, padding: '2px 9px', fontSize: 11, fontWeight: 800 }}>{stageCases.length}</span>
              </div>
              <div style={{ fontSize: 13.5, color: theme.aubergine, fontWeight: 700, marginBottom: 6 }}>{stage.title}</div>
              <div style={{ fontSize: 11.5, color: `${theme.ink}99`, lineHeight: 1.45 }}>{stage.text}</div>
            </button>
          );
        })}
      </div>

      <div className="portfolio-layout-grid" style={{ display: 'grid', gridTemplateColumns: '1.45fr 0.9fr', gap: 16, marginBottom: 18 }}>
        <CaseTableCard
          title="Ankaufspipeline"
          emptyText="Keine Fälle in der Ankaufspipeline."
          cases={pipelineCases}
          onOpenCase={onOpenCase}
          showPartner={role === 'admin'}
        />
        <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: theme.aubergine }}>Nächste Schritte</span>
            <span style={{ fontSize: 12, color: `${theme.ink}88` }}>{pipelineCases.length} offen</span>
          </div>
          {pipelineCases.length === 0 ? (
            <div style={{ padding: 20, color: `${theme.ink}88`, fontSize: 13 }}>Aktuell keine offenen Ankaufsschritte.</div>
          ) : pipelineCases.slice(0, 5).map((item, index) => (
            <div key={item.propertyId || item.id} style={{ padding: '12px 16px', borderTop: index ? `1px solid ${theme.borderSoft}` : 'none', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 24, height: 24, borderRadius: 12, background: theme.mintLight, color: theme.aubergine, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Clock size={13} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, color: theme.ink, fontWeight: 700, marginBottom: 3 }}>{item.kunde}</div>
                <div style={{ fontSize: 11.5, color: `${theme.ink}88`, lineHeight: 1.4 }}>{item.id} · {item.objekt}</div>
                <div style={{ marginTop: 7, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <StatusBadge status={item.status} />
                  <button onClick={() => onOpenCase(item.propertyId || item.id)} style={{ background: 'transparent', border: `1px solid ${theme.border}`, color: theme.aubergine, fontSize: 11.5, fontWeight: 700, padding: '4px 8px', borderRadius: 5, cursor: 'pointer' }}>
                    {nextPortfolioAction[item.status] || 'Öffnen'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CaseTableCard
        title="Bestandsobjekte"
        emptyText="Noch keine Objekte im Bestand."
        cases={portfolioCases}
        onOpenCase={onOpenCase}
        showPartner={role === 'admin'}
      />
    </div>
  );
};

const CaseTableCard = ({ title, cases = [], onOpenCase, showPartner = false, emptyText = 'Keine Fälle vorhanden.' }) => (
  <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, overflow: 'hidden' }}>
    <div style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: theme.aubergine }}>{title}</span>
      <span style={{ fontSize: 12, color: `${theme.ink}88` }}>Sortiert nach letzter Aktivität</span>
    </div>
    {cases.length === 0 ? (
      <div style={{ padding: 28, color: `${theme.ink}88`, fontSize: 13 }}>{emptyText}</div>
    ) : (
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: theme.mintLight }}>
            {['Fall', 'Kunde', showPartner ? 'Partner' : null, 'Objekt', 'Status', 'Letzte Aktivität', ''].filter(Boolean).map((h, i) => (
              <th key={i} style={{ textAlign: 'left', padding: '8px 16px', fontSize: 11, fontWeight: 700, color: theme.oliv, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cases.map((row, i) => (
            <tr key={row.propertyId || row.id || i} onClick={() => onOpenCase(row.propertyId || row.id)} style={{ borderTop: `1px solid ${theme.borderSoft}`, cursor: 'pointer' }}>
              <td style={{ padding: '11px 16px', fontFamily: 'ui-monospace, monospace', fontSize: 12, color: theme.aubergine, fontWeight: 600 }}>{row.id}</td>
              <td style={{ padding: '11px 16px', color: theme.ink }}>{row.kunde} {row.alter ? <span style={{ color: `${theme.ink}77`, fontSize: 12 }}>({row.alter})</span> : null}</td>
              {showPartner && <td style={{ padding: '11px 16px', color: `${theme.ink}aa`, fontSize: 12 }}>{row.partner}</td>}
              <td style={{ padding: '11px 16px', color: `${theme.ink}cc` }}>{row.objekt}</td>
              <td style={{ padding: '11px 16px' }}><StatusBadge status={row.status} /></td>
              <td style={{ padding: '11px 16px', color: `${theme.ink}88`, fontSize: 12 }}>{row.vor}</td>
              <td style={{ padding: '11px 16px', textAlign: 'right' }}><ChevronRight size={15} style={{ color: `${theme.aubergine}88` }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const partnerInitial = (partner) => {
  const source = (partner.companyName || partner.contactName || '').trim();
  return source ? source[0].toUpperCase() : '#';
};

const PartnerDirectory = ({ partners = [], leads = [], onActivatePartner }) => {
  const [selectedLetter, setSelectedLetter] = useState('ALL');
  const [search, setSearch] = useState('');
  const availableLetters = new Set(partners.map(partnerInitial));
  const normalizedSearch = search.trim().toLowerCase();
  const visiblePartners = partners
    .filter((partner) => selectedLetter === 'ALL' || partnerInitial(partner) === selectedLetter)
    .filter((partner) => {
      if (!normalizedSearch) return true;
      return [partner.companyName, partner.contactName, partner.email, partner.phone, partner.address]
        .some((value) => String(value || '').toLowerCase().includes(normalizedSearch));
    })
    .sort((left, right) => String(left.companyName || left.contactName).localeCompare(String(right.companyName || right.contactName), 'de'));

  const activePartners = partners.filter((partner) => partner.status === 'active').length;
  const pendingPartners = partners.length - activePartners;

  return (
    <div style={{ padding: '20px 28px' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>Intern · CRM</div>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: theme.aubergine, margin: 0, letterSpacing: '-0.01em' }}>Partner</h1>
        <div style={{ fontSize: 12.5, color: `${theme.ink}99`, marginTop: 5 }}>Tabellarische Übersicht aller Vertriebspartner mit Lead-Zuweisungen und Freischaltung.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 48px', gap: 14, alignItems: 'start' }}>
        <div style={{ background: 'white', border: `1px solid ${theme.borderSoft}`, borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '13px 16px', borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: theme.aubergine }}>Partnerliste</div>
              <div style={{ fontSize: 11.5, color: `${theme.ink}88`, marginTop: 2 }}>{visiblePartners.length} von {partners.length} Partnern · {activePartners} aktiv · {pendingPartners} offen</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', background: theme.mintLighter, borderRadius: 6, padding: '7px 10px', border: `1px solid ${theme.border}`, width: 280, maxWidth: '100%' }}>
              <Search size={14} style={{ color: `${theme.aubergine}88`, marginRight: 8 }} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Partner suchen" style={{ border: 'none', background: 'transparent', fontSize: 13, color: theme.ink, outline: 'none', width: '100%', fontFamily: 'inherit' }} />
            </div>
          </div>

          {visiblePartners.length === 0 ? (
            <div style={{ padding: 28, color: `${theme.ink}88`, fontSize: 13 }}>Keine Partner für die aktuelle Auswahl gefunden.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: theme.mintLight }}>
                  {['Firma', 'Ansprechpartner', 'E-Mail', 'Telefon', 'Status', 'Offene Leads', ''].map((h, i) => (
                    <th key={i} style={{ textAlign: 'left', padding: '9px 14px', fontSize: 11, fontWeight: 700, color: theme.oliv, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visiblePartners.map((partner) => {
                  const assignedLeadCount = leads.filter((lead) => lead.assignedPartnerId === partner.id && lead.status !== 'CONVERTED').length;
                  const isActive = partner.status === 'active';
                  return (
                    <tr key={partner.id} style={{ borderTop: `1px solid ${theme.borderSoft}` }}>
                      <td style={{ padding: '12px 14px', color: theme.aubergine, fontWeight: 700 }}>{partner.companyName}</td>
                      <td style={{ padding: '12px 14px', color: theme.ink }}>{partner.contactName}</td>
                      <td style={{ padding: '12px 14px', color: theme.ink }}>{partner.email}</td>
                      <td style={{ padding: '12px 14px', color: theme.ink }}>{partner.phone || 'Telefon offen'}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? '#5B8C2B' : '#A87308', background: isActive ? '#5B8C2B1A' : `${theme.gold}1A`, borderRadius: 10, padding: '3px 9px', whiteSpace: 'nowrap' }}>
                          {isActive ? 'aktiv' : 'wartet auf Freischaltung'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: theme.aubergine, fontWeight: 800 }}>{assignedLeadCount}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        {!isActive ? (
                          <button onClick={() => onActivatePartner?.(partner.id)} style={{ background: theme.aubergine, color: 'white', border: 'none', padding: '7px 10px', borderRadius: 5, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            Freischalten
                          </button>
                        ) : (
                          <span style={{ color: `${theme.ink}66`, fontSize: 12 }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ background: 'white', border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '8px 6px', display: 'grid', gap: 3, justifyItems: 'center', position: 'sticky', top: 16 }}>
          <button onClick={() => setSelectedLetter('ALL')} title="Alle Partner" style={{ width: 32, height: 28, borderRadius: 5, border: selectedLetter === 'ALL' ? 'none' : `1px solid ${theme.borderSoft}`, background: selectedLetter === 'ALL' ? theme.aubergine : theme.mintLighter, color: selectedLetter === 'ALL' ? 'white' : theme.aubergine, fontSize: 10, fontWeight: 800, cursor: 'pointer' }}>
            Alle
          </button>
          {alphabet.map((letter) => {
            const enabled = availableLetters.has(letter);
            const active = selectedLetter === letter;
            return (
              <button key={letter} onClick={() => enabled && setSelectedLetter(letter)} disabled={!enabled} title={`Partner mit ${letter}`} style={{ width: 28, height: 24, borderRadius: 5, border: active ? 'none' : `1px solid ${theme.borderSoft}`, background: active ? theme.aubergine : enabled ? 'white' : theme.mintLighter, color: active ? 'white' : enabled ? theme.aubergine : `${theme.ink}33`, fontSize: 11, fontWeight: 800, cursor: enabled ? 'pointer' : 'not-allowed' }}>
                {letter}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const SimpleMenuScreen = ({ title, eyebrow = 'CRM', text }) => (
  <div style={{ padding: '20px 28px' }}>
    <div style={{ background: 'white', border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '24px 28px', maxWidth: 760 }}>
      <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>{eyebrow}</div>
      <h1 style={{ fontSize: 24, fontWeight: 600, color: theme.aubergine, margin: '0 0 10px' }}>{title}</h1>
      <div style={{ fontSize: 13.5, color: `${theme.ink}aa`, lineHeight: 1.65 }}>{text}</div>
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
  const acquisitionSteps = [
    { action: 'offer_accepted', status: 'OFFER_ACCEPTED', label: 'Angebot angenommen', date: property?.offerAcceptedAt },
    { action: 'purchase_started', status: 'PURCHASE_STARTED', label: 'Ankauf gestartet', date: property?.purchaseStartedAt },
    { action: 'notary_appointment', status: 'NOTARY_APPOINTMENT', label: 'Notartermin', date: property?.notaryAppointmentAt },
    { action: 'purchased', status: 'PURCHASED', label: 'Angekauft', date: property?.purchasedAt },
    { action: 'enter_portfolio', status: 'IN_PORTFOLIO', label: 'In Bestand übernehmen', date: property?.portfolioEnteredAt },
  ];
  const acquisitionStatusIndex = acquisitionSteps.findIndex((step) => step.status === property?.status);
  const handleAcquisitionAction = (step) => runCaseAction(step.label, async () => {
    await postJson(`/api/properties/${c.propertyId}/workflow`, { action: step.action });
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

        {/* Right column: Workflow & Activity Log */}
        <div style={{ display: 'grid', gap: 12, height: 'fit-content' }}>
        {role === 'admin' && (
          <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Briefcase size={14} style={{ color: theme.aubergine }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: theme.aubergine }}>Ankaufsprozess</span>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {acquisitionSteps.map((step, index) => {
                const reached = acquisitionStatusIndex >= index || Boolean(step.date);
                const nextAllowed = acquisitionStatusIndex === -1 ? index === 0 : index === acquisitionStatusIndex + 1;
                const disabled = Boolean(busyAction) || reached || !nextAllowed;
                return (
                  <button key={step.action} onClick={() => handleAcquisitionAction(step)} disabled={disabled} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    background: reached ? `${theme.aubergine}0A` : nextAllowed ? theme.aubergine : 'white',
                    color: reached ? theme.aubergine : nextAllowed ? 'white' : `${theme.ink}66`,
                    border: `1px solid ${reached || nextAllowed ? theme.aubergine : theme.border}`,
                    borderRadius: 6,
                    padding: '8px 10px',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: disabled ? 'default' : 'pointer',
                    opacity: disabled && !reached ? 0.55 : 1,
                    textAlign: 'left'
                  }}>
                    <span>{step.label}</span>
                    {reached ? <CheckCircle size={14} /> : <ChevronRight size={14} />}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: `${theme.ink}88`, marginTop: 10, lineHeight: 1.45 }}>
              Der Bestand beginnt, sobald der Fall als angekauft markiert und anschließend übernommen wurde.
            </div>
          </div>
        )}
        <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, padding: '16px 18px' }}>
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
        title: draft.title,
        firstName: draft.firstName,
        lastName: draft.lastName,
        displayName: [draft.title, draft.firstName, draft.lastName].filter(Boolean).join(' '),
        ageAtSubmission: Number(draft.ageAtSubmission) || undefined,
        gender: draft.gender,
        dateOfBirth: draft.dateOfBirth,
        maritalStatus: draft.maritalStatus,
        spouseTitle: draft.maritalStatus === 'married' ? draft.spouseTitle : undefined,
        spouseFirstName: draft.maritalStatus === 'married' ? draft.spouseFirstName : undefined,
        spouseLastName: draft.maritalStatus === 'married' ? draft.spouseLastName : undefined,
        spouseGender: draft.maritalStatus === 'married' ? draft.spouseGender : undefined,
        spouseDateOfBirth: draft.maritalStatus === 'married' ? draft.spouseDateOfBirth : undefined,
        propertyOwnership: draft.propertyOwnership,
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
        plotAreaSqm: Number(draft.plotAreaSqm),
        yearBuilt: Number(draft.yearBuilt) || undefined,
        condition: draft.condition,
        occupancyStatus: draft.occupancyStatus,
        desiredModel: draft.desiredModel,
        residentialRightRecipients: draft.residentialRightRecipients,
        desiredResidentialRightYears: Number(draft.desiredResidentialRightYears) || 10,
        rentalModelDisclosureAccepted: Boolean(draft.rentalModelDisclosureAccepted),
        additionalOfferRequested: Boolean(draft.additionalOfferRequested),
        additionalOfferModel: draft.additionalOfferRequested ? draft.additionalOfferModel : undefined,
        additionalOfferResidentialRightYears: draft.additionalOfferRequested ? Number(draft.additionalOfferResidentialRightYears) || undefined : undefined,
        additionalOfferReason: draft.additionalOfferRequested ? draft.additionalOfferReason : undefined,
        secondResidentialRightWanted: Boolean(draft.secondResidentialRightWanted),
        secondResidentialRightYears: Number(draft.secondResidentialRightYears) || undefined,
        fixedTermReason: draft.fixedTermReason,
        rentalOptionDeselected: Boolean(draft.rentalOptionDeselected),
        usableAreaSqm: Number(draft.usableAreaSqm) || undefined,
        coOwnershipShares: draft.propertyType === 'apartment' ? draft.coOwnershipShares || undefined : undefined,
        parkingAvailable: Boolean(draft.parkingAvailable),
        parkingType: draft.parkingAvailable ? draft.parkingType || undefined : undefined,
        parkingCount: draft.parkingAvailable ? Number(draft.parkingCount) || undefined : undefined,
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
        energyCertificateType: draft.energyCertificateAvailable ? draft.energyCertificateType : undefined,
        energyClass: draft.energyCertificateAvailable ? draft.energyClass : undefined,
        visualConditionRating: draft.visualConditionRating,
        leasehold: Boolean(draft.leasehold),
        monumentProtection: Boolean(draft.monumentProtection),
        leaseholdOrMonument: Boolean(draft.leasehold || draft.monumentProtection),
        knownDefects: draft.knownDefects,
        remainingDebtKnown: Boolean(draft.remainingDebtKnown),
        remainingDebtAmount: draft.remainingDebtKnown ? Number(draft.remainingDebtAmount) || undefined : undefined,
        modernization: draft.modernization,
        buildingCondition: draft.buildingCondition,
        generalPropertyNotes: draft.generalPropertyNotes,
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
const Input = ({ placeholder, defaultValue, type = 'text', value, onChange, checked, readOnly, inputRef }) => (
  <input ref={inputRef} type={type} placeholder={placeholder} defaultValue={defaultValue} value={value} onChange={onChange} onInput={onChange} checked={checked} readOnly={readOnly} style={{
    width: '100%', padding: '8px 12px', fontSize: 13.5, border: `1px solid ${theme.border}`,
    borderRadius: 5, background: readOnly ? theme.mintLighter : 'white', color: theme.ink, outline: 'none', fontFamily: 'inherit',
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

    <div style={{ display: 'grid', gridTemplateColumns: '0.7fr 1.25fr 1.4fr 1fr', gap: 16, marginBottom: 16 }}>
      <Field label="Titel">
        <Select value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })}>
          <option value="">kein Titel</option>
          <option value="Dr.">Dr.</option>
          <option value="Prof.">Prof.</option>
          <option value="Prof. Dr.">Prof. Dr.</option>
        </Select>
      </Field>
      <Field label="Vorname" required><Input placeholder="Eva" value={draft.firstName} onChange={(event) => setDraft({ ...draft, firstName: event.target.value })} /></Field>
      <Field label="Nachname" required><Input placeholder="Schmidt" value={draft.lastName} onChange={(event) => setDraft({ ...draft, lastName: event.target.value })} /></Field>
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
      <Field label="Geburtsdatum" required><Input type="date" value={draft.dateOfBirth} onChange={(event) => setDraft({ ...draft, dateOfBirth: event.target.value, ageAtSubmission: calculateAgeFromBirthDate(event.target.value) })} /></Field>
      <Field label="Alter">
        <Input placeholder="wird berechnet" value={draft.ageAtSubmission} readOnly />
      </Field>
      <Field label="Familienstand" required>
        <Select value={draft.maritalStatus} onChange={(event) => setDraft({ ...draft, maritalStatus: event.target.value, propertyOwnership: event.target.value === 'married' ? draft.propertyOwnership : 'customer_1' })}>
          <option value="">Bitte wählen</option>
          <option value="single">ledig</option>
          <option value="married">verheiratet</option>
          <option value="widowed">verwitwet</option>
          <option value="divorced">geschieden</option>
        </Select>
      </Field>
    </div>

    {draft.maritalStatus === 'married' && (
      <div style={{ background: theme.mintLighter, border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Kunde 2 / Ehepartner</div>
        <div style={{ display: 'grid', gridTemplateColumns: '0.7fr 1.2fr 1.2fr 1fr', gap: 16, marginBottom: 16 }}>
          <Field label="Titel Kunde 2">
            <Select value={draft.spouseTitle} onChange={(event) => setDraft({ ...draft, spouseTitle: event.target.value })}>
              <option value="">kein Titel</option>
              <option value="Dr.">Dr.</option>
              <option value="Prof.">Prof.</option>
              <option value="Prof. Dr.">Prof. Dr.</option>
            </Select>
          </Field>
          <Field label="Vorname Kunde 2" required><Input value={draft.spouseFirstName} onChange={(event) => setDraft({ ...draft, spouseFirstName: event.target.value })} /></Field>
          <Field label="Nachname Kunde 2" required><Input value={draft.spouseLastName} onChange={(event) => setDraft({ ...draft, spouseLastName: event.target.value })} /></Field>
          <Field label="Geschlecht Kunde 2">
            <Select value={draft.spouseGender} onChange={(event) => setDraft({ ...draft, spouseGender: event.target.value })}>
              <option value="">Bitte wählen</option>
              <option value="female">weiblich</option>
              <option value="male">männlich</option>
              <option value="diverse">divers</option>
              <option value="not_specified">keine Angabe</option>
            </Select>
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.7fr 2fr', gap: 16 }}>
          <Field label="Geburtsdatum Kunde 2"><Input type="date" value={draft.spouseDateOfBirth} onChange={(event) => setDraft({ ...draft, spouseDateOfBirth: event.target.value, spouseAgeAtSubmission: calculateAgeFromBirthDate(event.target.value) })} /></Field>
          <Field label="Alter Kunde 2"><Input placeholder="wird berechnet" value={draft.spouseAgeAtSubmission} readOnly /></Field>
          <Field label="Eigentümer-Auswahl" required>
            <RadioGroup name="propertyOwnership" value={draft.propertyOwnership} onChange={(value) => setDraft({ ...draft, propertyOwnership: value })} options={[
              { value: 'customer_1', label: 'Kunde 1' },
              { value: 'customer_2', label: 'Kunde 2' },
              { value: 'both', label: 'Beide' },
            ]} />
          </Field>
        </div>
      </div>
    )}

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
    <div style={{ fontSize: 12.5, color: `${theme.ink}99`, marginBottom: 22 }}>Bitte wähle das Hauptmodell. Ein zweites Angebot kann optional als Vergleich angefordert werden.</div>

    <div style={{ marginBottom: 18 }}>
      <Field label="Hauptmodell" required>
        <RadioGroup name="desiredModel" value={draft.desiredModel} onChange={(value) => setDraft({ ...draft, desiredModel: value })} options={[
          { value: 'fixed_residential_right', label: 'Befristetes Wohnrecht' },
          { value: 'sale_and_leaseback', label: 'Rückmiete' },
        ]} />
      </Field>
    </div>

    {draft.desiredModel === 'sale_and_leaseback' && (
      <div style={{ background: theme.goldSoft, border: `1px solid ${theme.gold}66`, borderLeft: `4px solid ${theme.gold}`, borderRadius: 8, padding: '13px 15px', marginBottom: 18 }}>
        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', color: theme.ink, fontSize: 12.5, lineHeight: 1.45 }}>
          <input type="checkbox" checked={draft.rentalModelDisclosureAccepted} onChange={(event) => setDraft({ ...draft, rentalModelDisclosureAccepted: event.target.checked })} style={{ marginTop: 2, accentColor: theme.aubergine }} />
          <span><strong>Belehrung Rückmiete:</strong> Beim Rückmietmodell fällt ab Tag 1 nach Verkauf eine laufende Miete an. Diese Information muss vor Einreichung mit dem Kunden besprochen werden.</span>
        </label>
      </div>
    )}

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

    <div style={{ background: theme.goldSoft, border: `1px solid ${theme.gold}55`, borderRadius: 6, padding: '12px 14px', marginBottom: 18 }}>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: theme.ink }}>
        <input type="checkbox" checked={draft.rentalOptionDeselected} onChange={(event) => setDraft({ ...draft, rentalOptionDeselected: event.target.checked })} style={{ marginTop: 2, accentColor: theme.aubergine }} />
        <div>
          <div style={{ fontWeight: 600 }}>Spätere Anmietoption abwählen</div>
          <div style={{ fontSize: 11.5, color: `${theme.ink}99`, marginTop: 3, lineHeight: 1.5 }}>Abwahl kann zu höherer Auszahlung führen, allerdings muss nach Ablauf des Wohnrechts ausgezogen werden.</div>
        </div>
      </label>
    </div>

    <div style={{ background: 'white', border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '14px 16px' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: theme.ink, fontWeight: 700 }}>
        <input type="checkbox" checked={draft.additionalOfferRequested} onChange={(event) => setDraft({ ...draft, additionalOfferRequested: event.target.checked })} style={{ accentColor: theme.aubergine }} />
        Zweites Angebot zusätzlich erstellen
      </label>
      {draft.additionalOfferRequested && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 16, marginTop: 14 }}>
          <Field label="Zweites Modell">
            <Select value={draft.additionalOfferModel} onChange={(event) => setDraft({ ...draft, additionalOfferModel: event.target.value })}>
              <option value="fixed_residential_right">Befristetes Wohnrecht</option>
              <option value="sale_and_leaseback">Rückmiete</option>
            </Select>
          </Field>
          <Field label="Laufzeit">
            <Select value={String(draft.additionalOfferResidentialRightYears || 10)} onChange={(event) => setDraft({ ...draft, additionalOfferResidentialRightYears: Number(event.target.value) })}>
              <option value="5">5 Jahre</option>
              <option value="10">10 Jahre</option>
              <option value="15">15 Jahre</option>
            </Select>
          </Field>
          <Field label="Hinweis zum zweiten Angebot">
            <Input value={draft.additionalOfferReason} onChange={(event) => setDraft({ ...draft, additionalOfferReason: event.target.value })} placeholder="z.B. Vergleich für Kundengespräch" />
          </Field>
        </div>
      )}
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

    <div style={{ display: 'grid', gridTemplateColumns: draft.propertyType === 'apartment' ? '1fr 1fr 1fr' : '1fr 1fr', gap: 16, marginBottom: 16 }}>
      <Field label="Grundstück (m²)" required><Input type="number" placeholder="380" value={draft.plotAreaSqm} onChange={(event) => setDraft({ ...draft, plotAreaSqm: event.target.value })} /></Field>
      <Field label="Nutzfläche (m²)"><Input type="number" value={draft.usableAreaSqm} onChange={(event) => setDraft({ ...draft, usableAreaSqm: event.target.value })} /></Field>
      {draft.propertyType === 'apartment' && (
        <Field label="Miteigentumsanteile" hint="Nur bei Eigentumswohnungen"><Input placeholder="z.B. 124/1000" value={draft.coOwnershipShares} onChange={(event) => setDraft({ ...draft, coOwnershipShares: event.target.value })} /></Field>
      )}
    </div>

    <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Objekteindruck</div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 16 }}>
      <Field label="Optik" required>
        <Select value={draft.visualConditionRating} onChange={(event) => setDraft({ ...draft, visualConditionRating: event.target.value })}>
          <option value="very_good">sehr gut</option>
          <option value="good">gut</option>
          <option value="medium">mittel</option>
          <option value="moderate">mäßig</option>
          <option value="bad">schlecht</option>
          <option value="very_bad">sehr schlecht</option>
        </Select>
      </Field>
      <div style={{ background: theme.mintLight, borderRadius: 6, padding: '10px 12px', fontSize: 12, color: `${theme.ink}99`, lineHeight: 1.45 }}>
        Weitere fachliche Einschätzungen werden intern aus Unterlagen, Rückfragen und Bewertung abgeleitet. Im Erfassungsbogen wird nur der sichtbare Objekteindruck abgefragt.
      </div>
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

    <div style={{ display: 'grid', gridTemplateColumns: draft.energyCertificateAvailable ? '1fr 1fr 1fr' : '1fr 2fr', gap: 16, marginBottom: 16 }}>
      <Field label="Energieausweis">
        <Select value={draft.energyCertificateAvailable ? 'yes' : 'no'} onChange={(event) => setDraft({ ...draft, energyCertificateAvailable: event.target.value === 'yes' })}>
          <option value="no">nicht vorhanden</option>
          <option value="yes">vorhanden</option>
        </Select>
      </Field>
      {draft.energyCertificateAvailable && (
        <>
          <Field label="Typ Energieausweis">
            <Select value={draft.energyCertificateType} onChange={(event) => setDraft({ ...draft, energyCertificateType: event.target.value })}>
              <option value="demand">Bedarfsausweis</option>
              <option value="consumption">Verbrauchsausweis</option>
              <option value="">Keine Angabe</option>
            </Select>
          </Field>
          <Field label="Energieklasse"><Input value={draft.energyClass} onChange={(event) => setDraft({ ...draft, energyClass: event.target.value })} /></Field>
        </>
      )}
      {!draft.energyCertificateAvailable && (
        <div style={{ alignSelf: 'end', background: theme.mintLight, borderRadius: 6, padding: '9px 12px', fontSize: 12, color: `${theme.ink}99` }}>
          Folgefelder erscheinen erst, wenn ein Energieausweis vorhanden ist.
        </div>
      )}
    </div>

    <div style={{ background: theme.mintLight, borderRadius: 6, padding: '12px 14px', marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>PV / Solar / Speicher</div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12.5, color: theme.ink }}>
        {[
          ['photovoltaik', 'Photovoltaik'],
          ['solarthermie', 'Solarthermie'],
          ['batteriespeicher', 'Batteriespeicher'],
        ].map(([value, label]) => (
          <label key={value} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={(draft.energyCarriers || []).includes(value)} onChange={() => {
              const current = new Set(draft.energyCarriers || []);
              if (current.has(value)) current.delete(value);
              else current.add(value);
              setDraft({ ...draft, energyCarriers: Array.from(current) });
            }} style={{ accentColor: theme.aubergine }} />
            {label}
          </label>
        ))}
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
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

    <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Außenbereich</div>
    <div style={{ display: 'grid', gridTemplateColumns: draft.parkingAvailable ? '1fr 1fr 1fr' : '1fr 2fr', gap: 16, marginBottom: 16 }}>
      <Field label="Parkplatz">
        <Select value={draft.parkingType} onChange={(event) => setDraft({ ...draft, parkingType: event.target.value, parkingAvailable: Boolean(event.target.value) })}>
          <option value="">kein Parkplatz</option>
          <option value="garage">Garage</option>
          <option value="carport">Carport</option>
          <option value="outdoor_space">Stellplatz</option>
          <option value="duplex">Doppelparker</option>
        </Select>
      </Field>
      {draft.parkingAvailable && (
        <Field label="Anzahl Parkplätze"><Input type="number" value={draft.parkingCount} onChange={(event) => setDraft({ ...draft, parkingCount: event.target.value })} /></Field>
      )}
    </div>

    <div style={{ background: 'white', border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Restschuld</div>
      <div style={{ display: 'grid', gridTemplateColumns: draft.remainingDebtKnown ? '1fr 1fr' : '1fr', gap: 16 }}>
        <Field label="Ist eine Restschuld bekannt?">
          <RadioGroup name="remainingDebtKnown" value={draft.remainingDebtKnown ? 'yes' : 'no'} onChange={(value) => setDraft({ ...draft, remainingDebtKnown: value === 'yes' })} options={[
            { value: 'no', label: 'Nein' },
            { value: 'yes', label: 'Ja' },
          ]} />
        </Field>
        {draft.remainingDebtKnown && (
          <Field label="Restschuld (€)" required>
            <Input type="number" value={draft.remainingDebtAmount} onChange={(event) => setDraft({ ...draft, remainingDebtAmount: event.target.value })} />
          </Field>
        )}
      </div>
    </div>

    <div style={{ background: theme.mintLighter, border: `1px solid ${theme.borderSoft}`, borderLeft: `4px solid ${theme.oliv}`, borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.ink, marginBottom: 4 }}>Allgemeiner Hinweis</div>
      <div style={{ fontSize: 12, color: `${theme.ink}99`, lineHeight: 1.45 }}>
        Bitte Besonderheiten früh dokumentieren, zum Beispiel Nießbrauch, Wohnungsbindung, größere Schäden, laufende Teilungserklärungsänderungen oder absehbare Instandhaltungen.
      </div>
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
    <div style={{ marginTop: 16 }}>
      <Field label="Allgemeine Notizen zur Immobilie">
        <textarea value={draft.generalPropertyNotes} onChange={(event) => setDraft({ ...draft, generalPropertyNotes: event.target.value })} rows={3} placeholder="Interne Hinweise oder Besonderheiten für die Prüfung" style={{ width: '100%', padding: '8px 12px', fontSize: 13.5, border: `1px solid ${theme.border}`, borderRadius: 5, background: 'white', color: theme.ink, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' }} />
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
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: theme.aubergine, margin: '0 0 4px' }}>Modernisierungen</h2>
      <div style={{ fontSize: 12.5, color: `${theme.ink}99`, marginBottom: 22 }}>Bitte erfasse die wichtigsten Modernisierungen und den aktuellen Bauteilzustand.</div>

      <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Maßnahmen</div>
      <div style={{ display: 'grid', gap: 10, marginBottom: 22 }}>
        {modernizationFields.map(([key, label]) => (
          <div key={key} style={{ display: 'grid', gridTemplateColumns: '1fr 0.85fr 0.9fr 1.6fr', gap: 10, alignItems: 'end', background: theme.mintLighter, border: `1px solid ${theme.borderSoft}`, borderRadius: 6, padding: '10px 12px' }}>
            <div style={{ fontSize: 12.5, color: theme.ink, fontWeight: 700, paddingBottom: 9 }}>{label}</div>
            <Field label="Status">
              <Select value={draft.modernization?.[key]?.scope || 'none'} onChange={(event) => setModernization(key, { scope: event.target.value })}>
                <option value="none">keine</option>
                <option value="partial">teilweise</option>
                <option value="complete">vollständig</option>
              </Select>
            </Field>
            <Field label="Jahr">
              <Input value={draft.modernization?.[key]?.year || ''} onChange={(event) => setModernization(key, { year: event.target.value })} placeholder="z.B. 2018" />
            </Field>
            <Field label="Hinweis">
              <Input value={draft.modernization?.[key]?.note || ''} onChange={(event) => setModernization(key, { note: event.target.value })} placeholder="kurzer Hinweis" />
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
    </div>
  );
};

const FormStep5 = ({ draft, setDraft }) => {
  const requiredDocuments = getRequiredDocumentsForPropertyType(draft.propertyType);
  return (
  <div>
    <h2 style={{ fontSize: 18, fontWeight: 600, color: theme.aubergine, margin: '0 0 4px' }}>Dokumente</h2>
    <div style={{ fontSize: 12.5, color: `${theme.ink}99`, marginBottom: 22 }}>Dokumente werden mit Kategorie, Pflichtstatus und Prüfstatus am Fall gespeichert.</div>

    <div style={{ background: theme.mintLighter, border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '14px 16px', marginBottom: 18 }}>
      <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Pflichtdokumentliste</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {requiredDocuments.map((item) => (
          <div key={item.category} style={{ background: 'white', border: `1px solid ${theme.borderSoft}`, borderRadius: 6, padding: '10px 12px', display: 'flex', gap: 9, alignItems: 'flex-start' }}>
            <FileText size={15} style={{ color: theme.aubergine, flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontSize: 12.5, color: theme.ink, fontWeight: 700 }}>{item.label}</div>
              {item.note && <div style={{ fontSize: 11, color: `${theme.ink}88`, marginTop: 3, lineHeight: 1.35 }}>{item.note}</div>}
            </div>
          </div>
        ))}
      </div>
      {draft.propertyType === 'apartment' && (
        <div style={{ marginTop: 10, background: theme.goldSoft, border: `1px solid ${theme.gold}55`, borderRadius: 6, padding: '9px 11px', fontSize: 11.5, color: theme.ink, lineHeight: 1.45 }}>
          Wohnungssonderfälle: Teilungserklärung, Hausgeld, Protokolle und Instandhaltungsrücklage sind für Eigentumswohnungen verpflichtend zu prüfen.
        </div>
      )}
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
      <Field label="Unterlage hochladen">
        <input type="file" onChange={(event) => {
          const file = event.target.files?.[0] || null;
          setDraft({ ...draft, documentFile: file, documentFileName: file?.name || '' });
        }} style={{ width: '100%', padding: '8px 12px', fontSize: 13.5, border: `1px solid ${theme.border}`, borderRadius: 5, background: 'white', color: theme.ink, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
      </Field>
      <Field label="Kategorie">
        <Select value={draft.documentCategory} onChange={(event) => setDraft({ ...draft, documentCategory: event.target.value })}>
          {Object.entries(documentCategoryLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
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
};

// =====================================================================
// SCREEN — LEADS
// =====================================================================
const LeadBoard = ({ role, leads = [], partners = [], onAssign, onConvert, onMarkContacted, onUpdateStatus, loading }) => {
  const [partnerSelection, setPartnerSelection] = useState({});
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [partnerFilter, setPartnerFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const visibleLeads = role === 'admin'
    ? leads
    : leads.filter((lead) => lead.status !== 'CONVERTED' && lead.status !== 'REJECTED');
  const searchNeedle = search.trim().toLowerCase();
  const filteredLeads = visibleLeads.filter((lead) => {
    const haystack = [
      lead.leadNumber,
      lead.name,
      lead.firstName,
      lead.lastName,
      lead.email,
      lead.phone,
      lead.postalCode,
      lead.city,
      lead.message,
      lead.estimatedPropertyValueRange,
      propertyTypeLabel(lead.propertyType)
    ].filter(Boolean).join(' ').toLowerCase();
    const matchesSearch = !searchNeedle || haystack.includes(searchNeedle);
    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    const matchesPartner = role !== 'admin' || partnerFilter === 'ALL' || (partnerFilter === 'UNASSIGNED' ? !lead.assignedPartnerId : lead.assignedPartnerId === partnerFilter);
    return matchesSearch && matchesStatus && matchesPartner;
  });
  const selectedLead = filteredLeads.find((lead) => lead.id === selectedLeadId) || filteredLeads[0];
  const leadStats = {
    new: visibleLeads.filter((lead) => lead.status === 'NEW').length,
    assigned: visibleLeads.filter((lead) => lead.status === 'ASSIGNED').length,
    contacted: visibleLeads.filter((lead) => lead.status === 'CONTACTED').length,
    converted: visibleLeads.filter((lead) => lead.status === 'CONVERTED').length
  };
  const activePartnerCount = partners.filter((partner) => partner.status === 'active').length;
  const activeStatusFilters = role === 'admin'
    ? ['ALL', 'NEW', 'QUALIFIED', 'ASSIGNED', 'CONTACTED', 'CONVERTED', 'REJECTED']
    : ['ALL', 'ASSIGNED', 'CONTACTED'];

  const leadName = leadDisplayName;
  const partnerName = (partnerId) => {
    const partner = partners.find((item) => item.id === partnerId);
    return partner ? `${partner.contactName || partner.companyName}` : 'nicht zugewiesen';
  };

  return (
    <div style={{ padding: '20px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>
            {role === 'admin' ? 'Homepage · Leadverteilung' : 'Zugewiesene Homepage-Leads'}
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: theme.aubergine, margin: 0, letterSpacing: '-0.01em' }}>Leads</h1>
        </div>
        <div style={{ fontSize: 12, color: `${theme.ink}88` }}>
          {loading ? 'Leads werden geladen...' : `${filteredLeads.length} von ${visibleLeads.length} Einträgen`}
        </div>
      </div>

      <div className="lead-kpi-grid" style={{ display: 'grid', gridTemplateColumns: role === 'admin' ? 'repeat(5, 1fr)' : 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Neue Leads', value: leadStats.new, sub: 'noch nicht verteilt', icon: TrendingUp },
          { label: 'Zugewiesen', value: leadStats.assigned, sub: role === 'admin' ? `${activePartnerCount} aktive Partner` : 'zur Bearbeitung', icon: Users },
          { label: 'Kontaktiert', value: leadStats.contacted, sub: 'Nachfassen', icon: Phone },
          { label: 'Umgewandelt', value: leadStats.converted, sub: 'Kundenfall erstellt', icon: CheckCircle2 },
          ...(role === 'admin' ? [{ label: 'Offen gesamt', value: visibleLeads.filter((lead) => !['CONVERTED', 'REJECTED'].includes(lead.status)).length, sub: 'aktive Pipeline', icon: Briefcase }] : [])
        ].map((stat) => (
          <div key={stat.label} style={{ background: 'white', border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '13px 15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 10.5, color: theme.oliv, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{stat.label}</span>
              <stat.icon size={14} style={{ color: `${theme.aubergine}66` }} />
            </div>
            <div style={{ fontSize: 25, lineHeight: 1, fontWeight: 750, color: theme.aubergine }}>{stat.value}</div>
            <div style={{ fontSize: 11.5, color: `${theme.ink}88`, marginTop: 5 }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="lead-workspace-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 16, alignItems: 'start' }}>
        <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 600, color: theme.aubergine }}>
                {role === 'admin' ? 'Leadverteilung' : 'Zur Bearbeitung'}
              </span>
              <div style={{ fontSize: 11.5, color: `${theme.ink}88`, marginTop: 2 }}>
                {role === 'admin' ? 'Homepage-Leads qualifizieren, Partner auswählen und übergeben.' : 'Lead kontaktieren und als Kundenfall übernehmen.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: theme.mintLighter, border: `1px solid ${theme.borderSoft}`, borderRadius: 5, padding: '6px 10px', minWidth: 220 }}>
                <Search size={14} style={{ color: `${theme.aubergine}88`, marginRight: 8 }} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Lead, Ort, Kontakt suchen" style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: 12.5, color: theme.ink }} />
              </div>
              {role === 'admin' && (
                <select value={partnerFilter} onChange={(event) => setPartnerFilter(event.target.value)} style={{ padding: '7px 10px', border: `1px solid ${theme.border}`, borderRadius: 5, color: theme.ink, background: 'white', fontSize: 12 }}>
                  <option value="ALL">Alle Partner</option>
                  <option value="UNASSIGNED">Nicht zugewiesen</option>
                  {partners.map((partner) => <option key={partner.id} value={partner.id}>{partner.contactName || partner.companyName}</option>)}
                </select>
              )}
            </div>
          </div>

          <div style={{ padding: '10px 16px', borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', gap: 6, flexWrap: 'wrap', background: theme.mintLighter }}>
            {activeStatusFilters.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  background: statusFilter === status ? theme.aubergine : 'white',
                  color: statusFilter === status ? 'white' : theme.aubergine,
                  border: statusFilter === status ? 'none' : `1px solid ${theme.border}`,
                  borderRadius: 5,
                  padding: '5px 10px',
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {status === 'ALL' ? 'Alle' : leadStatusLabels[status]}
              </button>
            ))}
          </div>

          {filteredLeads.length === 0 ? (
            <div style={{ padding: 28, color: `${theme.ink}88`, fontSize: 13 }}>Keine Leads für diesen Filter.</div>
          ) : (
            <div className="lead-table-scroll" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 860, borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: theme.mintLight }}>
                  {['Lead', 'Kontakt', 'Objektinteresse', 'Status', role === 'admin' ? 'Zuweisung' : 'Aktion'].map((h, i) => (
                    <th key={i} style={{ textAlign: 'left', padding: '8px 16px', fontSize: 11, fontWeight: 700, color: theme.oliv, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => {
                  const assignedPartner = partners.find((partner) => partner.id === lead.assignedPartnerId);
                  const selectedPartnerId = partnerSelection[lead.id] || lead.assignedPartnerId || partners[0]?.id || '';
                  const rowActive = selectedLead?.id === lead.id;
                  return (
                    <tr key={lead.id} onClick={() => setSelectedLeadId(lead.id)} style={{ borderTop: `1px solid ${theme.borderSoft}`, background: rowActive ? `${theme.aubergine}08` : 'white', cursor: 'pointer' }}>
                      <td style={{ padding: '12px 16px', fontFamily: 'ui-monospace, monospace', color: theme.aubergine, fontWeight: 700 }}>
                        <div>{lead.leadNumber}</div>
                        <div style={{ fontFamily: 'inherit', fontSize: 11, color: `${theme.ink}77`, marginTop: 3 }}>{formatDate(lead.createdAt)}</div>
                      </td>
                      <td style={{ padding: '12px 16px', color: theme.ink }}>
                        <div style={{ fontWeight: 600 }}>{leadName(lead)}</div>
                        <div style={{ color: `${theme.ink}88`, fontSize: 12, marginTop: 2 }}>
                          {[lead.email, lead.phone].filter(Boolean).join(' · ') || 'Kontaktdaten offen'}
                        </div>
                        {lead.message && <div style={{ color: `${theme.ink}99`, fontSize: 12, marginTop: 4, maxWidth: 340, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.message}</div>}
                      </td>
                      <td style={{ padding: '12px 16px', color: `${theme.ink}cc` }}>
                        <div>{propertyTypeLabel(lead.propertyType)} {lead.city || ''}</div>
                        <div style={{ color: `${theme.ink}88`, fontSize: 12, marginTop: 2 }}>
                          {[lead.postalCode, lead.estimatedPropertyValueRange && `${lead.estimatedPropertyValueRange} Tsd.`, lead.youngestOwnerAgeRange && `${lead.youngestOwnerAgeRange} Jahre`].filter(Boolean).join(' · ') || '-'}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}><LeadStatusBadge status={lead.status} /></td>
                      <td style={{ padding: '12px 16px' }} onClick={(event) => event.stopPropagation()}>
                        {role === 'admin' ? (
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                            <select
                              value={selectedPartnerId}
                              onChange={(event) => setPartnerSelection((current) => ({ ...current, [lead.id]: event.target.value }))}
                              disabled={lead.status === 'CONVERTED'}
                              style={{ minWidth: 180, padding: '7px 10px', border: `1px solid ${theme.border}`, borderRadius: 5, color: theme.ink, background: 'white' }}
                            >
                              {partners.length === 0 && <option value="">Kein Partner</option>}
                              {partners.map((partner) => <option key={partner.id} value={partner.id}>{partner.contactName || partner.companyName}</option>)}
                            </select>
                            <button
                              onClick={() => onAssign(lead.id, selectedPartnerId)}
                              disabled={!selectedPartnerId || lead.status === 'CONVERTED'}
                              style={{ background: theme.aubergine, color: 'white', border: 'none', padding: '7px 12px', borderRadius: 5, fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: !selectedPartnerId || lead.status === 'CONVERTED' ? 0.45 : 1 }}
                            >
                              {assignedPartner ? 'Neu zuweisen' : 'Zuweisen'}
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button onClick={() => onMarkContacted(lead.id)} disabled={lead.status === 'CONVERTED'} style={{ background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine, padding: '7px 12px', borderRadius: 5, fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: lead.status === 'CONVERTED' ? 0.45 : 1 }}>
                              Kontaktiert
                            </button>
                            <button onClick={() => onConvert(lead.id)} disabled={lead.status === 'CONVERTED'} style={{ background: theme.aubergine, color: 'white', border: 'none', padding: '7px 12px', borderRadius: 5, fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: lead.status === 'CONVERTED' ? 0.45 : 1 }}>
                              In Kundenfall umwandeln
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          )}
        </div>

        <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, padding: '16px 18px', minHeight: 360 }}>
          {selectedLead ? (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: theme.aubergine, fontWeight: 750 }}>{selectedLead.leadNumber}</div>
                  <h2 style={{ margin: '4px 0 0', fontSize: 18, color: theme.ink, fontWeight: 650 }}>{leadName(selectedLead)}</h2>
                </div>
                <LeadStatusBadge status={selectedLead.status} />
              </div>
              <div style={{ display: 'grid', gap: 12, fontSize: 12.5 }}>
                {[
                  ['Quelle', selectedLead.source || 'homepage'],
                  ['Erfasst', formatDate(selectedLead.createdAt)],
                  ['Kontakt', [selectedLead.email, selectedLead.phone].filter(Boolean).join(' · ') || 'offen'],
                  ['Objekt', `${propertyTypeLabel(selectedLead.propertyType)} ${selectedLead.city || ''}`.trim()],
                  ['PLZ', selectedLead.postalCode || '-'],
                  ['Wertindikation', selectedLead.estimatedPropertyValueRange ? `${selectedLead.estimatedPropertyValueRange} Tsd.` : '-'],
                  ['Jüngster Eigentümer', selectedLead.youngestOwnerAgeRange ? `${selectedLead.youngestOwnerAgeRange} Jahre` : '-'],
                  ['Interesse', productModelLabels[selectedLead.productInterest] || '-'],
                  ['Partner', partnerName(selectedLead.assignedPartnerId)]
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ color: `${theme.ink}77`, fontSize: 11, fontWeight: 700, marginBottom: 3 }}>{label}</div>
                    <div style={{ color: theme.ink, lineHeight: 1.4 }}>{value || '-'}</div>
                  </div>
                ))}
                <div>
                  <div style={{ color: `${theme.ink}77`, fontSize: 11, fontWeight: 700, marginBottom: 3 }}>Nachricht</div>
                  <div style={{ color: theme.ink, lineHeight: 1.55, background: theme.mintLighter, border: `1px solid ${theme.borderSoft}`, borderRadius: 6, padding: '10px 12px' }}>{selectedLead.message || 'Keine Nachricht hinterlegt.'}</div>
                </div>
              </div>

              {role === 'admin' ? (
                <div style={{ borderTop: `1px solid ${theme.borderSoft}`, marginTop: 16, paddingTop: 14, display: 'grid', gap: 8 }}>
                  <button disabled={selectedLead.status === 'CONVERTED'} onClick={() => onUpdateStatus(selectedLead.id, 'QUALIFIED')} style={{ background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine, borderRadius: 5, padding: '8px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: selectedLead.status === 'CONVERTED' ? 0.45 : 1 }}>Als qualifiziert markieren</button>
                  <button disabled={selectedLead.status === 'CONVERTED'} onClick={() => onUpdateStatus(selectedLead.id, 'REJECTED')} style={{ background: '#9B2C2C0F', border: '1px solid #9B2C2C33', color: '#9B2C2C', borderRadius: 5, padding: '8px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: selectedLead.status === 'CONVERTED' ? 0.45 : 1 }}>Lead ablehnen</button>
                </div>
              ) : (
                <div style={{ borderTop: `1px solid ${theme.borderSoft}`, marginTop: 16, paddingTop: 14, display: 'grid', gap: 8 }}>
                  <button disabled={selectedLead.status === 'CONVERTED'} onClick={() => onMarkContacted(selectedLead.id)} style={{ background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine, borderRadius: 5, padding: '8px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: selectedLead.status === 'CONVERTED' ? 0.45 : 1 }}>Kontaktiert markieren</button>
                  <button disabled={selectedLead.status === 'CONVERTED'} onClick={() => onConvert(selectedLead.id)} style={{ background: theme.aubergine, border: 'none', color: 'white', borderRadius: 5, padding: '9px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: selectedLead.status === 'CONVERTED' ? 0.45 : 1 }}>In Kundenfall umwandeln</button>
                </div>
              )}
            </>
          ) : (
            <div style={{ color: `${theme.ink}88`, fontSize: 13 }}>Kein Lead ausgewählt.</div>
          )}
        </div>
      </div>
    </div>
  );
};

// =====================================================================
// MAIN APP
// =====================================================================
export default function App({ initialRole = 'partner' } = {}) {
  const [role, setRole] = useState(initialRole);
  const [screen, setScreen] = useState('dashboard');
  const [caseId, setCaseId] = useState(null);
  const [cases, setCases] = useState(mockCases);
  const [leads, setLeads] = useState([]);
  const [partners, setPartners] = useState([]);
  const [notice, setNotice] = useState('');
  const [loadingCases, setLoadingCases] = useState(false);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [profiles, setProfiles] = useState(defaultProfiles);
  const [profileOpen, setProfileOpen] = useState(false);

  const rawUser = profiles[role] || defaultProfiles[role];
  const user = { ...rawUser, name: profileDisplayName(rawUser), initials: initialsFromName(profileDisplayName(rawUser)).toUpperCase() };

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

  async function loadLeads(nextRole = role) {
    setLoadingLeads(true);
    try {
      await ensureDemoSession(nextRole);
      const response = await fetch('/api/leads');
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Leads konnten nicht geladen werden');
      setLeads(payload.leads || []);

      if (nextRole === 'admin') {
        const partnerResponse = await fetch('/api/partners');
        const partnerPayload = await partnerResponse.json();
        if (!partnerResponse.ok) throw new Error(partnerPayload.error || 'Partner konnten nicht geladen werden');
        setPartners(partnerPayload.partners || []);
      }
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Leads konnten nicht geladen werden');
    } finally {
      setLoadingLeads(false);
    }
  }

  useEffect(() => {
    loadCases(initialRole);
    loadLeads(initialRole);
  }, [initialRole]);

  useEffect(() => {
    try {
      const storedProfiles = window.localStorage.getItem('wohnkapital_profiles');
      if (storedProfiles) setProfiles({ ...defaultProfiles, ...JSON.parse(storedProfiles) });
    } catch {
      // Profil bleibt im MVP in der laufenden Sitzung.
    }
  }, []);

  const handleNavigate = (s) => {
    setScreen(s);
    setCaseId(null);
    if (s === 'leads' || s === 'partners') loadLeads(role);
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
    setProfileOpen(false);
    loadCases(nextRole);
    loadLeads(nextRole);
  };
  const handleSaveProfile = (profile) => {
    const nextProfiles = { ...profiles, [role]: profile };
    setProfiles(nextProfiles);
    try {
      window.localStorage.setItem('wohnkapital_profiles', JSON.stringify(nextProfiles));
    } catch {
      // Speichern im Browser ist optional.
    }
    setProfileOpen(false);
    setNotice('Profil wurde gespeichert.');
  };
  const handleAssignLead = async (leadId, partnerId) => {
    try {
      await postJson(`/api/leads/${leadId}/assign`, { partnerId });
      setNotice('Lead wurde zugewiesen.');
      await loadLeads(role);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Lead konnte nicht zugewiesen werden');
    }
  };
  const handleMarkLeadContacted = async (leadId) => {
    try {
      await patchJson(`/api/leads/${leadId}/status`, { status: 'CONTACTED' });
      setNotice('Lead wurde als kontaktiert markiert.');
      await loadLeads(role);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Lead konnte nicht aktualisiert werden');
    }
  };
  const handleUpdateLeadStatus = async (leadId, status) => {
    try {
      await patchJson(`/api/leads/${leadId}/status`, { status });
      setNotice(`Lead wurde auf "${leadStatusLabels[status] || status}" gesetzt.`);
      await loadLeads(role);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Lead konnte nicht aktualisiert werden');
    }
  };
  const handleConvertLead = async (leadId) => {
    try {
      const payload = await postJson(`/api/leads/${leadId}/convert`);
      await loadCases(role);
      await loadLeads(role);
      setCaseId(payload.case?.property?.caseNumber || payload.case?.property?.id || null);
      setScreen('case');
      setNotice('Lead wurde in einen Kundenfall umgewandelt.');
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Lead konnte nicht umgewandelt werden');
    }
  };
  const handleActivatePartner = async (partnerId) => {
    try {
      await patchJson(`/api/partners/${partnerId}`, { status: 'active' });
      setNotice('Maklerzugang wurde freigeschaltet.');
      await loadLeads('admin');
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Maklerzugang konnte nicht freigeschaltet werden');
    }
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
      <Header role={role} user={user} onRoleToggle={toggleRole} onLogout={handleLogout} onProfileOpen={() => setProfileOpen(true)} />
      {profileOpen && <ProfileModal user={user} role={role} onClose={() => setProfileOpen(false)} onSave={handleSaveProfile} />}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Sidebar role={role} currentScreen={screen} onNavigate={handleNavigate} leadCount={leads.filter((lead) => role === 'admin' ? lead.status === 'NEW' : lead.status !== 'CONVERTED' && lead.status !== 'REJECTED').length} />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {(notice || loadingCases || loadingLeads) && (
            <div style={{ margin: '14px 28px 0', background: loadingCases ? theme.mintLight : theme.goldSoft, border: `1px solid ${loadingCases ? theme.border : `${theme.gold}55`}`, borderRadius: 6, padding: '9px 12px', fontSize: 12.5, color: theme.ink }}>
              {loadingCases ? 'Fälle werden geladen...' : loadingLeads ? 'Leads werden geladen...' : notice}
            </div>
          )}
          {screen === 'dashboard' && role === 'partner' && <BrokerDashboard cases={cases} leads={leads} onOpenCase={handleOpenCase} onNewCase={handleNewCase} onOpenLeads={() => handleNavigate('leads')} />}
          {screen === 'dashboard' && role === 'admin' && <AdminDashboard cases={cases} onOpenCase={handleOpenCase} />}
          {screen === 'leads' && <LeadBoard role={role} leads={leads} partners={partners} onAssign={handleAssignLead} onConvert={handleConvertLead} onMarkContacted={handleMarkLeadContacted} onUpdateStatus={handleUpdateLeadStatus} loading={loadingLeads} />}
          {screen === 'portfolio' && <PortfolioScreen cases={cases} onOpenCase={handleOpenCase} role={role} />}
          {['drafts', 'in_progress', 'sold'].includes(screen) && <CaseMenuScreen screen={screen} cases={cases} onOpenCase={handleOpenCase} role={role} />}
          {screen === 'partners' && role === 'admin' && <PartnerDirectory partners={partners} leads={leads} onActivatePartner={handleActivatePartner} />}
          {screen === 'other' && <SimpleMenuScreen title="Sonstiges" text="Hier bündeln wir später Sonderfälle, interne Notizen, nicht zuordenbare Vorgänge und administrative Ablagen. Für das MVP ist die Ansicht als sauberer Sammelpunkt vorbereitet." />}
          {screen === 'knowledge_brochure' && <SimpleMenuScreen title="Broschüre" eyebrow="Wissen" text="Hier kann später die aktuelle WohnKapital-Broschüre als Download, Vorschau oder Link hinterlegt werden." />}
          {screen === 'knowledge_atlas' && <SimpleMenuScreen title="Postbank Atlas" eyebrow="Wissen" text="Hier kann später der Postbank Atlas oder ein externer Marktdaten-Link für regionale Einschätzungen eingebunden werden." />}
          {screen === 'knowledge_guide' && <SimpleMenuScreen title="Leitfaden" eyebrow="Wissen" text="Hier entsteht der interne Leitfaden für Makler: Datenerfassung, Pflichtunterlagen, Rückfragen und Übergabe an WohnKapital." />}
          {screen === 'knowledge_faq' && <SimpleMenuScreen title="FAQs" eyebrow="Wissen" text="Hier sammeln wir die häufigsten Fragen von Maklern, Kunden und internen Mitarbeitern mit kurzen, freigegebenen Antworten." />}
          {screen === 'case' && <FallDetail caseId={caseId} onBack={handleBack} role={role} cases={cases} onRefresh={() => loadCases(role)} setNotice={setNotice} />}
          {screen === 'erfassung' && <Erfassung onBack={handleBack} onSaved={handleSavedCase} setNotice={setNotice} />}
        </div>
      </div>
    </div>
  );
}

