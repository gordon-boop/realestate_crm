import React, { useState } from 'react';
import {
  Home, FileText, Building2, Archive, CheckCircle2, FolderOpen, BookOpen,
  MapPin, HelpCircle, Search, Bell, MessageSquare, LogOut, ChevronRight,
  Plus, Clock, AlertCircle, TrendingUp, Users, Briefcase, Settings,
  ArrowLeft, Upload, Calendar, Phone, Mail, Smartphone, User as UserIcon,
  Save, Send, CheckCircle, AlertTriangle, Activity, X, ChevronDown
} from 'lucide-react';

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
const Header = ({ role, user, onRoleToggle }) => (
  <div style={{ background: theme.mintLight, borderBottom: `1px solid ${theme.border}`, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Logo />
        <span style={{ fontSize: 18, fontWeight: 600, color: theme.aubergine, letterSpacing: '-0.01em' }}>WohnKapital</span>
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
        Rolle wechseln: {role === 'admin' ? 'Admin' : 'Makler'}
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
        <LogOut size={15} style={{ color: `${theme.aubergine}88`, marginLeft: 4, cursor: 'pointer' }} />
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

// =====================================================================
// SCREEN 1 — MAKLER-DASHBOARD
// =====================================================================
const MaklerDashboard = ({ onOpenCase, onNewCase }) => (
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

    {/* Stat Cards */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 22 }}>
      {[
        { label: 'In Bearbeitung', value: '4', sub: 'davon 1 mit Rückfrage', icon: Clock },
        { label: 'Eingereicht', value: '2', sub: 'wartet auf Bewertung', icon: TrendingUp },
        { label: 'Angebote offen', value: '1', sub: 'beim Kunden', icon: FileText },
        { label: 'Abgeschlossen', value: '7', sub: 'YTD 2026', icon: CheckCircle2 },
      ].map((s, i) => (
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

    {/* Rückfrage-Alert */}
    <div style={{ background: theme.goldSoft, border: `1px solid ${theme.gold}55`, borderLeft: `3px solid ${theme.gold}`, borderRadius: 6, padding: '12px 14px', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 12 }}>
      <AlertCircle size={18} style={{ color: theme.gold, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: theme.ink, marginBottom: 2 }}>1 offene Rückfrage, Wiedervorlage heute</div>
        <div style={{ fontSize: 12, color: `${theme.ink}aa` }}>Fall WK-2026-014, Schmidt: Energieausweis und Hausgeldabrechnung 2024 fehlen.</div>
      </div>
      <button onClick={() => onOpenCase('WK-2026-014')} style={{ background: 'transparent', border: `1px solid ${theme.aubergine}44`, color: theme.aubergine, fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 5, cursor: 'pointer' }}>Bearbeiten</button>
    </div>

    {/* Aktive Fälle */}
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
          {mockCases.map((r, i) => (
            <tr key={i} onClick={() => onOpenCase(r.id)} style={{ borderTop: `1px solid ${theme.borderSoft}`, cursor: 'pointer' }}>
              <td style={{ padding: '11px 16px', fontFamily: 'ui-monospace, "SF Mono", monospace', fontSize: 12, color: theme.aubergine, fontWeight: 600 }}>{r.id}</td>
              <td style={{ padding: '11px 16px', color: theme.ink }}>{r.kunde} <span style={{ color: `${theme.ink}77`, fontSize: 12 }}>({r.alter})</span></td>
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
// SCREEN 2 — ADMIN-DASHBOARD
// =====================================================================
const AdminDashboard = ({ onOpenCase }) => (
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
        {[
          { id: 'WK-2026-014', kunde: 'Schmidt, E.', reason: 'Energieausweis fehlt', due: 'Heute', overdue: false },
          { id: 'WK-2026-007', kunde: 'Müller, K.', reason: 'Grundbuchauszug', due: 'Vor 2 Tagen', overdue: true },
          { id: 'WK-2026-005', kunde: 'Klein, B.', reason: 'Hausgeldabrechnung 2024', due: 'Vor 1 Tag', overdue: true },
        ].map((r, i) => (
          <div key={i} style={{ padding: '12px 16px', borderTop: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, color: theme.ink, fontWeight: 500 }}>
                <span style={{ fontFamily: 'ui-monospace, monospace', color: theme.aubergine, fontWeight: 600, marginRight: 8 }}>{r.id}</span>
                {r.kunde}
              </div>
              <div style={{ fontSize: 11.5, color: `${theme.ink}99`, marginTop: 2 }}>{r.reason}</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 10, background: r.overdue ? '#9B2C2C1A' : `${theme.gold}1A`, color: r.overdue ? '#9B2C2C' : '#A87308' }}>
              {r.due}
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
          {[
            { id: 'WK-2026-014', kunde: 'Schmidt, E. (72)', partner: 'M. Krüger', objekt: 'EFH Stuttgart', status: 'DATA_INCOMPLETE', vor: 'Heute' },
            { id: 'WK-2026-013', kunde: 'Becker, H. (68)', partner: 'M. Krüger', objekt: 'ETW München', status: 'VALUATION_PENDING', vor: 'Gestern' },
            { id: 'WK-2026-012', kunde: 'Linde, A. (75)', partner: 'S. Bauer', objekt: 'EFH Karlsruhe', status: 'INTERNAL_REVIEW', vor: 'Gestern' },
            { id: 'WK-2026-011', kunde: 'Wagner, R. (74)', partner: 'M. Krüger', objekt: 'EFH Tübingen', status: 'SENT', vor: 'Vor 2 Tagen' },
            { id: 'WK-2026-010', kunde: 'Vogt, M. (71)', partner: 'T. Schäfer', objekt: 'ETW Augsburg', status: 'OFFER_CALCULATED', vor: 'Vor 3 Tagen' },
          ].map((r, i) => (
            <tr key={i} onClick={() => onOpenCase(r.id)} style={{ borderTop: `1px solid ${theme.borderSoft}`, cursor: 'pointer' }}>
              <td style={{ padding: '11px 16px', fontFamily: 'ui-monospace, monospace', fontSize: 12, color: theme.aubergine, fontWeight: 600 }}>{r.id}</td>
              <td style={{ padding: '11px 16px', color: theme.ink }}>{r.kunde}</td>
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
const FallDetail = ({ caseId, onBack, role }) => {
  const [activeTab, setActiveTab] = useState('kunde');
  const c = mockCases.find(x => x.id === caseId) || mockCases[0];
  const tabs = role === 'admin'
    ? [
        { id: 'kunde', label: 'Kunde' },
        { id: 'objekt', label: 'Objekt' },
        { id: 'indag', label: 'Ind. AG' },
        { id: 'verbag', label: 'Verb. AG' },
        { id: 'doks', label: 'Doks' },
        { id: 'aufgaben', label: 'Aufgaben' },
      ]
    : [
        { id: 'kunde', label: 'Kunde' },
        { id: 'objekt', label: 'Objekt' },
        { id: 'doks', label: 'Doks' },
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
          <button style={{ background: theme.aubergine, border: 'none', color: 'white', fontSize: 12.5, fontWeight: 600, padding: '8px 14px', borderRadius: 5, cursor: 'pointer' }}>Bewertung starten</button>
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
          <button style={{ background: 'white', border: `1px solid ${theme.aubergine}44`, color: theme.aubergine, fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 5, cursor: 'pointer' }}>Kundenrückmeldung eingegangen</button>
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
                {[
                  ['Name', 'Eva Schmidt'],
                  ['Geschlecht', 'weiblich'],
                  ['Geburtsdatum', '12.03.1953 (72 Jahre)'],
                  ['Familienstand', 'verwitwet'],
                  ['Adresse', 'Hauptstraße 14, 70563 Stuttgart'],
                  ['Telefon', '0711 / 23 45 67'],
                  ['Mobil', '0172 / 12 34 567'],
                  ['E-Mail', 'eva.schmidt@web.de'],
                  ['Monatl. Einkünfte', '1.000 – 2.000 €'],
                  ['Einwilligung', '✓ erteilt am 18.05.2026'],
                ].map(([k, v], i) => (
                  <div key={i}>
                    <div style={{ fontSize: 11, color: `${theme.ink}88`, fontWeight: 600, marginBottom: 3 }}>{k}</div>
                    <div style={{ fontSize: 13.5, color: theme.ink }}>{v}</div>
                  </div>
                ))}
              </div>

              <div style={{ height: 1, background: theme.borderSoft, margin: '24px 0' }} />
              <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Wunschmodell</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 32px' }}>
                {[
                  ['Wohnrechtsberechtigte', 'eine Person'],
                  ['Dauer Wohnrecht', '10 Jahre'],
                  ['Zweite Laufzeit gewünscht', 'ja, 5 Jahre'],
                  ['Befristungsgrund', 'Familienplanung'],
                  ['Spätere Anmietoption', 'aktiviert'],
                ].map(([k, v], i) => (
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
                {[
                  ['Typ', 'Einfamilienhaus'],
                  ['Baujahr', '1978'],
                  ['Wohnfläche', '142 m²'],
                  ['Grundstück', '380 m²'],
                  ['Heizung', 'Gas-Brennwert (2015)'],
                  ['Energieklasse', 'D (Bedarf)'],
                  ['Optik', 'gut'],
                  ['Fenster', 'Kunststoff (2012)'],
                  ['Parkplatz', '1× Garage'],
                  ['Keller', 'vollunterkellert'],
                  ['PV / Solar', 'PV seit 2020'],
                  ['Erbbau/Denkmal', 'nein'],
                ].map(([k, v], i) => (
                  <div key={i}>
                    <div style={{ fontSize: 11, color: `${theme.ink}88`, fontWeight: 600, marginBottom: 3 }}>{k}</div>
                    <div style={{ fontSize: 13.5, color: theme.ink }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'doks' && (
            <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: theme.aubergine }}>Dokumente</span>
                <button style={{ background: theme.aubergine, color: 'white', border: 'none', padding: '6px 12px', borderRadius: 5, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}><Upload size={13} /> Hochladen</button>
              </div>
              {[
                { name: 'Grundbuchauszug.pdf', type: 'Pflicht', date: '18.05.2026', status: 'ok' },
                { name: 'Grundriss_OG.pdf', type: 'Pflicht', date: '18.05.2026', status: 'ok' },
                { name: 'Wohnflaechenberechnung.pdf', type: 'Optional', date: '18.05.2026', status: 'ok' },
                { name: 'Energieausweis', type: 'Pflicht', date: null, status: 'missing' },
                { name: 'Fotos außen (12)', type: 'Empfohlen', date: '18.05.2026', status: 'ok' },
              ].map((d, i) => (
                <div key={i} style={{ padding: '12px 18px', borderTop: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <FileText size={16} style={{ color: d.status === 'missing' ? theme.gold : theme.aubergine }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: theme.ink, fontWeight: 500 }}>{d.name}</div>
                    <div style={{ fontSize: 11, color: `${theme.ink}88`, marginTop: 2 }}>
                      <span style={{ color: d.type === 'Pflicht' ? theme.gold : `${theme.ink}66`, fontWeight: 600 }}>{d.type}</span>
                      {d.date && <span> · hochgeladen {d.date}</span>}
                    </div>
                  </div>
                  {d.status === 'missing' ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: theme.gold }}>fehlt</span>
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
              <div style={{ fontSize: 13, color: `${theme.ink}88` }}>Keine offenen Aufgaben außer der laufenden Rückfrage.</div>
            </div>
          )}

          {activeTab === 'indag' && (
            <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, padding: '20px 22px' }}>
              <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Indikatives Angebot (Bewertung steht aus)</div>
              <div style={{ background: theme.mintLight, borderRadius: 6, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <Clock size={16} style={{ color: theme.aubergine }} />
                <div style={{ fontSize: 13, color: theme.ink }}>Sobald die Rückfrage geschlossen ist, kann die Bewertung gestartet werden. Erst dann wird das indikative Angebot berechnet.</div>
              </div>
            </div>
          )}

          {activeTab === 'verbag' && (
            <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, padding: '20px 22px' }}>
              <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Verbindliches Angebot</div>
              <div style={{ fontSize: 13, color: `${theme.ink}88` }}>Noch nicht erstellt.</div>
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
            {[
              { time: 'Heute, 09:14', actor: 'System', text: 'Erinnerung Rückfrage erstellt' },
              { time: 'Gestern, 16:32', actor: 'A. Klein (Admin)', text: 'Rückfrage angefordert: Energieausweis' },
              { time: 'Gestern, 14:08', actor: 'M. Krüger', text: 'Fall eingereicht' },
              { time: '18.05., 11:20', actor: 'M. Krüger', text: 'Erfassung abgeschlossen' },
              { time: '18.05., 09:45', actor: 'M. Krüger', text: 'Fall angelegt' },
            ].map((a, i) => (
              <div key={i} style={{ position: 'relative', paddingLeft: 18, paddingBottom: 12 }}>
                <div style={{ position: 'absolute', left: 2, top: 4, width: 8, height: 8, borderRadius: '50%', background: i === 0 ? theme.gold : theme.aubergine, border: `2px solid white`, boxShadow: `0 0 0 1px ${theme.border}` }} />
                <div style={{ fontSize: 11, color: `${theme.ink}88`, marginBottom: 2 }}>{a.time}</div>
                <div style={{ fontSize: 12.5, color: theme.ink, lineHeight: 1.4 }}>{a.text}</div>
                <div style={{ fontSize: 11, color: `${theme.ink}99`, marginTop: 2 }}>{a.actor}</div>
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
const Erfassung = ({ onBack, onSave }) => {
  const [step, setStep] = useState(1);
  const steps = [
    { n: 1, label: 'Persönliche Daten' },
    { n: 2, label: 'Wunschmodell' },
    { n: 3, label: 'Immobiliendaten' },
    { n: 4, label: 'Modernisierungen' },
    { n: 5, label: 'Dokumente' },
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
          <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Neuer Fall · Entwurf</div>
          <div style={{ fontSize: 17, fontWeight: 600, color: theme.ink, marginTop: 2 }}>Erfassung</div>
        </div>
        <button style={{ background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine, fontSize: 12.5, fontWeight: 600, padding: '8px 14px', borderRadius: 5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Save size={13} /> Entwurf speichern
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
          {step === 1 && <FormStep1 />}
          {step === 2 && <FormStep2 />}
          {step === 3 && <FormStep3 />}
          {step > 3 && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: theme.aubergine, margin: '0 0 16px' }}>{steps[step-1].label}</h2>
              <div style={{ fontSize: 13, color: `${theme.ink}88` }}>Weitere Felder folgen.</div>
            </div>
          )}

          {/* Form Actions */}
          <div style={{ borderTop: `1px solid ${theme.borderSoft}`, marginTop: 28, paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              style={{ background: 'transparent', border: `1px solid ${theme.border}`, color: theme.aubergine, fontSize: 13, fontWeight: 600, padding: '9px 16px', borderRadius: 5, cursor: step === 1 ? 'not-allowed' : 'pointer', opacity: step === 1 ? 0.4 : 1 }}>
              Zurück
            </button>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine, fontSize: 13, fontWeight: 600, padding: '9px 16px', borderRadius: 5, cursor: 'pointer' }}>
                Entwurf speichern
              </button>
              {step < 5 ? (
                <button onClick={() => setStep(Math.min(5, step + 1))} style={{ background: theme.aubergine, color: 'white', border: 'none', fontSize: 13, fontWeight: 600, padding: '9px 18px', borderRadius: 5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Weiter <ChevronRight size={15} />
                </button>
              ) : (
                <button style={{ background: theme.aubergine, color: 'white', border: 'none', fontSize: 13, fontWeight: 600, padding: '9px 18px', borderRadius: 5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Send size={13} /> Einreichen
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
              <span style={{ fontSize: 24, fontWeight: 700, color: theme.aubergine }}>20%</span>
              <span style={{ fontSize: 12, color: `${theme.ink}88` }}>Schritt 1 von 5</span>
            </div>
            <div style={{ height: 6, background: theme.borderSoft, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: '20%', height: '100%', background: theme.aubergine, borderRadius: 3 }} />
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
const Input = ({ placeholder, defaultValue, type = 'text' }) => (
  <input type={type} placeholder={placeholder} defaultValue={defaultValue} style={{
    width: '100%', padding: '8px 12px', fontSize: 13.5, border: `1px solid ${theme.border}`,
    borderRadius: 5, background: 'white', color: theme.ink, outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box'
  }} />
);
const Select = ({ children, defaultValue }) => (
  <div style={{ position: 'relative' }}>
    <select defaultValue={defaultValue} style={{
      width: '100%', padding: '8px 32px 8px 12px', fontSize: 13.5, border: `1px solid ${theme.border}`,
      borderRadius: 5, background: 'white', color: theme.ink, outline: 'none', fontFamily: 'inherit',
      appearance: 'none', cursor: 'pointer'
    }}>{children}</select>
    <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: `${theme.aubergine}88`, pointerEvents: 'none' }} />
  </div>
);
const RadioGroup = ({ options, name, defaultValue }) => (
  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
    {options.map((o, i) => (
      <label key={i} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', border: `1px solid ${defaultValue === o.value ? theme.aubergine : theme.border}`,
        borderRadius: 5, fontSize: 12.5, cursor: 'pointer',
        background: defaultValue === o.value ? `${theme.aubergine}0D` : 'white',
        color: defaultValue === o.value ? theme.aubergine : theme.ink,
        fontWeight: defaultValue === o.value ? 600 : 500
      }}>
        <input type="radio" name={name} defaultChecked={defaultValue === o.value} style={{ display: 'none' }} />
        {o.label}
      </label>
    ))}
  </div>
);

const FormStep1 = () => (
  <div>
    <h2 style={{ fontSize: 18, fontWeight: 600, color: theme.aubergine, margin: '0 0 4px' }}>Persönliche Daten</h2>
    <div style={{ fontSize: 12.5, color: `${theme.ink}99`, marginBottom: 22 }}>Bitte erfasse die Stammdaten des Eigentümers.</div>

    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
      <Field label="Name" required><Input placeholder="Vor- und Nachname" /></Field>
      <Field label="Geschlecht" required>
        <Select defaultValue="">
          <option value="">Bitte wählen</option>
          <option>weiblich</option>
          <option>männlich</option>
          <option>divers</option>
        </Select>
      </Field>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
      <Field label="Geburtsdatum" required><Input type="date" /></Field>
      <Field label="Alter">
        <Input placeholder="wird berechnet" />
      </Field>
      <Field label="Familienstand" required>
        <Select defaultValue="">
          <option value="">Bitte wählen</option>
          <option>ledig</option>
          <option>verheiratet</option>
          <option>verwitwet</option>
          <option>geschieden</option>
        </Select>
      </Field>
    </div>

    <div style={{ marginBottom: 16 }}>
      <Field label="Adresse" required><Input placeholder="Straße, Hausnr., PLZ, Ort" /></Field>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: 16, marginBottom: 16 }}>
      <Field label="Telefon"><Input placeholder="z.B. 0711 / 23 45 67" /></Field>
      <Field label="Mobil"><Input placeholder="z.B. 0172 / 12 34 567" /></Field>
      <Field label="E-Mail"><Input type="email" placeholder="adresse@example.com" /></Field>
    </div>

    <div style={{ marginBottom: 20 }}>
      <Field label="Monatliche Einkünfte" required>
        <RadioGroup name="income" defaultValue="1000-2000" options={[
          { value: '<1000', label: 'unter 1.000 €' },
          { value: '1000-2000', label: '1.000 – 2.000 €' },
          { value: '2000-3000', label: '2.000 – 3.000 €' },
          { value: '>3000', label: 'über 3.000 €' },
        ]} />
      </Field>
    </div>

    <div style={{ background: theme.mintLight, borderRadius: 6, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <input type="checkbox" style={{ marginTop: 2, accentColor: theme.aubergine }} />
      <div>
        <div style={{ fontSize: 12.5, color: theme.ink, fontWeight: 500 }}>Einwilligung zur Datenverarbeitung <span style={{ color: theme.gold }}>*</span></div>
        <div style={{ fontSize: 11.5, color: `${theme.ink}99`, marginTop: 3, lineHeight: 1.5 }}>Der Kunde willigt ein, dass seine Daten zum Zweck der Angebotserstellung verarbeitet und an WohnKapital übermittelt werden.</div>
      </div>
    </div>
  </div>
);

const FormStep2 = () => (
  <div>
    <h2 style={{ fontSize: 18, fontWeight: 600, color: theme.aubergine, margin: '0 0 4px' }}>Wunschmodell</h2>
    <div style={{ fontSize: 12.5, color: `${theme.ink}99`, marginBottom: 22 }}>Wie soll das Wohnrecht ausgestaltet sein?</div>

    <div style={{ marginBottom: 18 }}>
      <Field label="Wer soll das Wohnrecht bekommen?" required>
        <RadioGroup name="recipient" defaultValue="one" options={[
          { value: 'one', label: 'Eine Person' },
          { value: 'both', label: 'Beide Personen' },
        ]} />
      </Field>
    </div>

    <div style={{ marginBottom: 18 }}>
      <Field label="Dauer des Wohnrechts" required hint="Zwischen 5 und 15 Jahren wählbar.">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input type="range" min="5" max="15" defaultValue="10" style={{ flex: 1, accentColor: theme.aubergine }} />
          <div style={{ minWidth: 80, padding: '6px 12px', background: theme.aubergine, color: 'white', borderRadius: 5, fontSize: 13, fontWeight: 600, textAlign: 'center' }}>10 Jahre</div>
        </div>
      </Field>
    </div>

    <div style={{ background: theme.mintLight, borderRadius: 6, padding: '14px 16px', marginBottom: 18 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: theme.ink, fontWeight: 600 }}>
        <input type="checkbox" defaultChecked style={{ accentColor: theme.aubergine }} />
        Zweite Laufzeit gewünscht (kostenpflichtig)
      </label>
      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
        <Field label="Zweite Laufzeit">
          <Select defaultValue="5">
            <option value="5">5 Jahre</option>
            <option value="10">10 Jahre</option>
            <option value="15">15 Jahre</option>
          </Select>
        </Field>
        <Field label="Grund der Befristung">
          <Input placeholder="z.B. Familienplanung, gesundheitliche Gründe" />
        </Field>
      </div>
    </div>

    <div style={{ background: theme.goldSoft, border: `1px solid ${theme.gold}55`, borderRadius: 6, padding: '12px 14px' }}>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: theme.ink }}>
        <input type="checkbox" style={{ marginTop: 2, accentColor: theme.aubergine }} />
        <div>
          <div style={{ fontWeight: 600 }}>Spätere Anmietoption abwählen</div>
          <div style={{ fontSize: 11.5, color: `${theme.ink}99`, marginTop: 3, lineHeight: 1.5 }}>Abwahl kann zu höherer Auszahlung führen, allerdings muss nach Ablauf des Wohnrechts ausgezogen werden.</div>
        </div>
      </label>
    </div>
  </div>
);

const FormStep3 = () => (
  <div>
    <h2 style={{ fontSize: 18, fontWeight: 600, color: theme.aubergine, margin: '0 0 4px' }}>Immobiliendaten</h2>
    <div style={{ fontSize: 12.5, color: `${theme.ink}99`, marginBottom: 22 }}>Erfasse die wesentlichen Eigenschaften der Immobilie.</div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
      <Field label="Immobilientyp" required>
        <Select defaultValue=""><option value="">Bitte wählen</option><option>Einfamilienhaus</option><option>Doppelhaushälfte</option><option>Reihenhaus</option><option>Eigentumswohnung</option></Select>
      </Field>
      <Field label="Baujahr" required><Input type="number" placeholder="z.B. 1978" /></Field>
      <Field label="Wohnfläche (m²)" required><Input type="number" placeholder="142" /></Field>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
      <Field label="Grundstück (m²)"><Input type="number" placeholder="380" /></Field>
      <Field label="Nutzfläche (m²)"><Input type="number" /></Field>
      <Field label="Miteigentumsanteile" hint="Nur bei Wohnungen"><Input placeholder="z.B. 124/1000" /></Field>
    </div>

    <div style={{ background: '#9B2C2C0A', border: `1px solid #9B2C2C33`, borderLeft: `3px solid #9B2C2C`, borderRadius: 6, padding: '12px 14px', marginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <AlertTriangle size={16} style={{ color: '#9B2C2C' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: theme.ink, marginBottom: 6 }}>Ausschlusskriterien</div>
          <div style={{ display: 'flex', gap: 20, fontSize: 12.5, color: theme.ink }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" style={{ accentColor: '#9B2C2C' }} /> Erbbaurecht
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" style={{ accentColor: '#9B2C2C' }} /> Denkmalschutz
            </label>
          </div>
          <div style={{ fontSize: 11, color: '#9B2C2Cdd', marginTop: 6 }}>Wenn aktiviert, kann der Fall nicht eingereicht werden.</div>
        </div>
      </div>
    </div>
  </div>
);

// =====================================================================
// MAIN APP
// =====================================================================
export default function App() {
  const [role, setRole] = useState('partner');
  const [screen, setScreen] = useState('dashboard');
  const [caseId, setCaseId] = useState(null);

  const user = role === 'admin'
    ? { name: 'A. Klein', initials: 'AK' }
    : { name: 'M. Krüger', initials: 'MK' };

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
  const toggleRole = () => {
    setRole(role === 'admin' ? 'partner' : 'admin');
    setScreen('dashboard');
  };

  return (
    <div style={{ background: theme.mint, fontFamily: '"Aptos", "Segoe UI", system-ui, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header role={role} user={user} onRoleToggle={toggleRole} />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Sidebar role={role} currentScreen={screen} onNavigate={handleNavigate} />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {screen === 'dashboard' && role === 'partner' && <MaklerDashboard onOpenCase={handleOpenCase} onNewCase={handleNewCase} />}
          {screen === 'dashboard' && role === 'admin' && <AdminDashboard onOpenCase={handleOpenCase} />}
          {screen === 'case' && <FallDetail caseId={caseId} onBack={handleBack} role={role} />}
          {screen === 'erfassung' && <Erfassung onBack={handleBack} />}
        </div>
      </div>
    </div>
  );
}

