// @ts-nocheck
"use client";
import React, { useEffect, useRef, useState } from 'react';
import {
  Home, FileText, Building2, Archive, CheckCircle2, FolderOpen, BookOpen,
  MapPin, HelpCircle, Search, Bell, MessageSquare, LogOut, ChevronRight,
  Plus, Clock, AlertCircle, TrendingUp, Users, Briefcase, Settings,
  ArrowLeft, Upload, Calendar, Phone, Mail, Smartphone, User as UserIcon,
  Save, Send, CheckCircle, AlertTriangle, Activity, X, ChevronDown, ClipboardList
} from 'lucide-react';
import { getOptionalDocumentsForPropertyType, getRequiredDocumentsForPropertyType } from '@/lib/document-requirements';
import {
  buildingConditionComponentLabels,
  conditionRatingLabels,
  formatHeatingLabel,
  getCaseSourceLabel,
  modernizationComponentLabels,
  modernizationScopeLabels,
} from '@/lib/property-labels';
import { isInventoryCase } from '@/lib/acquisition-workflow';
import { PropertyMapWidget } from '@/components/dashboard/PropertyMapWidget';

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
  INDICATIVE_OFFER_SENT:{ label: 'Unverbindliches Angebot abgegeben', color: '#5B8C2B' },
  OFFER_ACCEPTED:      { label: 'UVA angenommen',       color: '#5B8C2B' },
  EXPERT_OPINION_ORDERED:{ label: 'Gutachten beauftragt', color: theme.aubergineSoft },
  EXPERT_OPINION_RECEIVED:{ label: 'Gutachten eingegangen', color: '#7B61C7' },
  BINDING_OFFER_SENT:  { label: 'VA abgegeben',         color: '#5B8C2B' },
  BINDING_OFFER_ACCEPTED:{ label: 'VA angenommen',      color: '#5B8C2B' },
  PURCHASE_STARTED:    { label: 'Ankauf gestartet',     color: theme.aubergineSoft },
  NOTARY_APPOINTMENT:  { label: 'Notartermin vereinbart', color: theme.oliv },
  PURCHASED:           { label: 'Kaufvertrag abgeschlossen', color: '#3D6B1F' },
  IN_PORTFOLIO:        { label: 'Im Bestand',           color: '#3D6B1F' },
  APPOINTMENT_SCHEDULED:{ label: 'Termin vereinbart',   color: '#5B8C2B' },
  WON:                 { label: 'Gewonnen',             color: '#3D6B1F' },
  SOLD:                { label: 'Verkauft',             color: '#3D6B1F' },
  EXIT_COMPLETED:      { label: 'Abgeschlossen',        color: '#3D6B1F' },
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
const GlobalSearch = ({ onOpenResult }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapperRef = useRef(null);
  const trimmedQuery = query.trim();

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false);
    };
    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useEffect(() => {
    if (trimmedQuery.length < 2) {
      setResults([]);
      setLoading(false);
      setOpen(false);
      setActiveIndex(0);
      return undefined;
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setOpen(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`, { signal: controller.signal });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || 'Suche fehlgeschlagen');
        setResults(payload.results || []);
        setActiveIndex(0);
      } catch (err) {
        if (err?.name !== 'AbortError') {
          setResults([]);
          setOpen(true);
        }
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [trimmedQuery]);

  const openResult = (result) => {
    if (!result) return;
    onOpenResult?.(result);
    setOpen(false);
    setQuery('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (event.key === 'ArrowDown' && results.length) {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
      return;
    }
    if (event.key === 'ArrowUp' && results.length) {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      openResult(results[activeIndex] || results[0]);
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: 290 }}>
      <div style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: 6, padding: '6px 12px', border: `1px solid ${theme.border}`, width: '100%', boxSizing: 'border-box' }}>
        <Search size={14} style={{ color: `${theme.aubergine}88`, marginRight: 8, flexShrink: 0 }} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => trimmedQuery.length >= 2 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Fall, Kunde oder Adresse suchen..."
          style={{ border: 'none', background: 'transparent', fontSize: 13, color: theme.ink, outline: 'none', width: '100%', fontFamily: 'inherit' }}
        />
      </div>
      {open && trimmedQuery.length >= 2 && (
        <div style={{ position: 'absolute', top: 38, right: 0, width: 430, maxWidth: 'calc(100vw - 48px)', background: 'white', border: `1px solid ${theme.border}`, borderRadius: 8, boxShadow: '0 18px 45px rgba(68, 0, 92, 0.16)', zIndex: 70, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '13px 14px', fontSize: 12.5, color: `${theme.ink}99` }}>Suche...</div>
          ) : results.length ? (
            <div style={{ maxHeight: 410, overflowY: 'auto' }}>
              {results.map((result, index) => {
                const primary = result.type === 'lead' ? result.leadNumber : result.caseNumber;
                const active = index === activeIndex;
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    type="button"
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => openResult(result)}
                    style={{ width: '100%', textAlign: 'left', background: active ? theme.mintLighter : 'white', border: 'none', borderTop: index ? `1px solid ${theme.borderSoft}` : 'none', padding: '11px 14px', cursor: 'pointer', display: 'grid', gap: 4 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: theme.aubergine, fontWeight: 800 }}>{primary}</span>
                      <span style={{ background: result.type === 'lead' ? theme.goldSoft : theme.mintLight, color: result.type === 'lead' ? theme.aubergine : '#3D6B1F', border: `1px solid ${result.type === 'lead' ? `${theme.gold}55` : '#3D6B1F22'}`, borderRadius: 999, padding: '3px 8px', fontSize: 10.5, fontWeight: 800, whiteSpace: 'nowrap' }}>
                        {result.statusLabel || (result.type === 'lead' ? 'Lead' : 'Status offen')}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: theme.ink, fontWeight: 800 }}>{result.customerName || 'Name offen'}</div>
                    <div style={{ fontSize: 12, color: `${theme.ink}99`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{result.propertyAddress || 'Adresse offen'}</div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '13px 14px', fontSize: 12.5, color: `${theme.ink}99` }}>Keine Treffer gefunden</div>
          )}
        </div>
      )}
    </div>
  );
};

const Header = ({ role, user, onRoleToggle, canToggleRole = false, onLogout, onProfileOpen, notifications = [], chatNotifications = [], currentCaseContext, onOpenCase, onOpenSearchResult, onOpenNotification, onOpenChatNotification, onOpenCurrentCaseChat }) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const visibleNotifications = notifications.slice(0, 8);
  const notificationCount = notifications.length;
  const visibleChatNotifications = chatNotifications.slice(0, 8);
  const chatCount = chatNotifications.length;

  return (
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
        {canToggleRole && (
          <button onClick={onRoleToggle} style={{
            background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine,
            fontSize: 11.5, fontWeight: 600, padding: '6px 12px', borderRadius: 5, cursor: 'pointer',
            letterSpacing: '0.04em', textTransform: 'uppercase'
          }}>
            {role === 'admin' ? 'Zur Makleransicht' : 'Zur Admin-Ansicht'}
          </button>
        )}
        <GlobalSearch onOpenResult={onOpenSearchResult} />
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setChatOpen(false);
            }}
            title="Prozessänderungen"
            style={{ position: 'relative', border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
          >
            <Bell size={18} style={{ color: theme.aubergine }} />
            {notificationCount > 0 && (
              <span style={{ position: 'absolute', top: -7, right: -8, background: theme.gold, color: theme.aubergine, fontSize: 9, fontWeight: 800, minWidth: 16, height: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', borderRadius: 8 }}>
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>
          {notificationsOpen && (
            <div style={{ position: 'absolute', right: -12, top: 30, width: 360, background: 'white', border: `1px solid ${theme.border}`, borderRadius: 8, boxShadow: '0 18px 45px rgba(68, 0, 92, 0.16)', zIndex: 40, overflow: 'hidden' }}>
              <div style={{ padding: '11px 14px', borderBottom: `1px solid ${theme.borderSoft}`, background: theme.mintLighter, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: theme.aubergine }}>Prozessänderungen</span>
                <span style={{ fontSize: 11, color: `${theme.ink}88`, fontWeight: 700 }}>{notificationCount} gesamt</span>
              </div>
              {visibleNotifications.length ? (
                <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                  {visibleNotifications.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setNotificationsOpen(false);
                        onOpenNotification ? onOpenNotification(item) : onOpenCase?.(item.propertyId || item.caseNumber);
                      }}
                      style={{ width: '100%', textAlign: 'left', background: 'white', border: 'none', borderTop: `1px solid ${theme.borderSoft}`, padding: '11px 14px', cursor: 'pointer', display: 'grid', gap: 3 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 800, color: theme.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.customerName}</span>
                        <span style={{ fontSize: 10.5, color: `${theme.ink}88`, whiteSpace: 'nowrap' }}>{dateLabel(item.date || item.createdAt)}</span>
                      </div>
                      <div style={{ fontSize: 12.5, color: theme.aubergine, fontWeight: 700 }}>{item.step || item.processStep || item.title}</div>
                      <div style={{ fontSize: 11.5, color: `${theme.ink}88`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.caseNumber}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '16px 14px', fontSize: 12.5, color: `${theme.ink}88`, lineHeight: 1.5 }}>
                  Keine neuen Änderungen im Ankaufsprozess.
                </div>
              )}
            </div>
          )}
        </div>
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => {
              if (currentCaseContext?.caseId) {
                onOpenCurrentCaseChat?.(currentCaseContext);
                setChatOpen(false);
                setNotificationsOpen(false);
                return;
              }
              setChatOpen(!chatOpen);
              setNotificationsOpen(false);
            }}
            title="Chat-Nachrichten"
            style={{ position: 'relative', border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
          >
            <MessageSquare size={18} style={{ color: theme.aubergine }} />
            {chatCount > 0 && (
              <span style={{ position: 'absolute', top: -7, right: -8, background: theme.gold, color: theme.aubergine, fontSize: 9, fontWeight: 800, minWidth: 16, height: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', borderRadius: 8 }}>
                {chatCount > 9 ? '9+' : chatCount}
              </span>
            )}
          </button>
          {chatOpen && (
            <div style={{ position: 'absolute', right: -12, top: 30, width: 380, background: 'white', border: `1px solid ${theme.border}`, borderRadius: 8, boxShadow: '0 18px 45px rgba(68, 0, 92, 0.16)', zIndex: 40, overflow: 'hidden' }}>
              <div style={{ padding: '11px 14px', borderBottom: `1px solid ${theme.borderSoft}`, background: theme.mintLighter, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: theme.aubergine }}>Chat zu Kundenfällen</span>
                <span style={{ fontSize: 11, color: `${theme.ink}88`, fontWeight: 700 }}>{chatCount} Nachrichten</span>
              </div>
              {visibleChatNotifications.length ? (
                <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                  {visibleChatNotifications.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setChatOpen(false);
                        onOpenChatNotification ? onOpenChatNotification(item) : onOpenCase?.(item.propertyId || item.caseNumber, 'chat');
                      }}
                      style={{ width: '100%', textAlign: 'left', background: 'white', border: 'none', borderTop: `1px solid ${theme.borderSoft}`, padding: '11px 14px', cursor: 'pointer', display: 'grid', gap: 4 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 800, color: theme.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.customerName}</span>
                        <span style={{ fontSize: 10.5, color: `${theme.ink}88`, whiteSpace: 'nowrap' }}>{dateLabel(item.createdAt)}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: theme.aubergine, fontWeight: 700 }}>
                        {item.authorName || item.actorName || 'WohnKapital'} · {item.caseNumber}
                      </div>
                      <div style={{ fontSize: 12, color: `${theme.ink}aa`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.message}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '16px 14px', fontSize: 12.5, color: `${theme.ink}88`, lineHeight: 1.5 }}>
                  Noch keine Chat-Nachrichten zu sichtbaren Kundenfällen.
                </div>
              )}
            </div>
          )}
        </div>
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
};

const SidebarQuickAction = ({ item, active, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect?.(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '7px 10px',
        borderRadius: 6,
        border: 'none',
        background: active ? `${theme.aubergine}12` : hovered || focused ? 'rgba(68, 0, 92, 0.055)' : 'transparent',
        color: active ? theme.aubergine : theme.ink,
        fontSize: 12.5,
        fontWeight: active ? 700 : 520,
        textAlign: 'left',
        cursor: 'pointer',
        outline: focused ? `2px solid ${theme.gold}` : 'none',
        outlineOffset: 1,
      }}
    >
      <Icon size={14} style={{ color: theme.gold, flexShrink: 0 }} />
      <span style={{ flex: 1, lineHeight: 1.25 }}>{item.label}</span>
    </button>
  );
};

const Sidebar = ({ role, internalRole = 'employee', currentScreen, onNavigate, onQuickAction, leadCount = 0, draftCount = 0, inProgressCount = 0, portfolioCount = 0, rejectedCount = 0 }) => {
  const [activeQuickAction, setActiveQuickAction] = useState('');
  const partnerNav = [
    { icon: Home, label: 'Home', screen: 'dashboard' },
    { icon: TrendingUp, label: 'Leads', screen: 'leads', badge: leadCount || undefined },
    { icon: FolderOpen, label: 'Entwürfe', screen: 'drafts', badge: draftCount || undefined },
    { icon: Clock, label: 'In Bearbeitung', screen: 'in_progress', badge: inProgressCount || undefined },
    { icon: X, label: 'Abgelehnt', screen: 'rejected', badge: rejectedCount || undefined },
    { icon: FileText, label: 'Sonstiges', screen: 'other' },
  ];
  const canViewStaff = ['admin', 'super_admin'].includes(internalRole);
  const adminNav = [
    { icon: Home, label: 'Home', screen: 'dashboard' },
    { icon: TrendingUp, label: 'Leads', screen: 'leads', badge: leadCount || undefined, internal: true },
    { icon: FolderOpen, label: 'Entwürfe', screen: 'drafts', badge: draftCount || undefined },
    { icon: Clock, label: 'In Bearbeitung', screen: 'in_progress', badge: inProgressCount || undefined },
    { icon: Archive, label: 'Bestand', screen: 'portfolio', badge: portfolioCount || undefined },
    { icon: CheckCircle2, label: 'Verkauft', screen: 'sold', internal: true },
    { icon: X, label: 'Abgelehnt', screen: 'rejected', badge: rejectedCount || undefined, internal: true },
    { icon: Users, label: 'Partner', screen: 'partners' },
    ...(canViewStaff ? [{ icon: Settings, label: 'Mitarbeiter', screen: 'staff', internal: true }] : []),
    { icon: FileText, label: 'Sonstiges', screen: 'other' },
  ];
  const nav = role === 'admin' ? adminNav : partnerNav;
  const isActive = (item) => item.screen === currentScreen;
  const canUseQuickActions = role === 'admin' && ['employee', 'advisor', 'admin', 'super_admin'].includes(internalRole);
  const quickActions = [
    { key: 'new-lead', icon: TrendingUp, label: 'Neuer Lead' },
    { key: 'new-case', icon: Plus, label: 'Neukunde erfassen' },
    { key: 'reminder', icon: Clock, label: 'Wiedervorlage anlegen' },
    { key: 'repair', icon: Settings, label: 'Reparatur erfassen' },
    { key: 'billing', icon: FileText, label: 'Abrechnung erfassen' },
  ];
  const selectQuickAction = (item) => {
    setActiveQuickAction(item.key);
    window.setTimeout(() => setActiveQuickAction((current) => current === item.key ? '' : current), 900);
    onQuickAction?.(item);
  };

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
        { icon: MapPin, label: 'Postbank Wohnatlas', screen: 'knowledge_atlas' },
        { icon: FileText, label: 'Leitfaden', screen: 'knowledge_guide' },
        { icon: HelpCircle, label: 'FAQs', screen: 'knowledge_faq' },
      ].map((item, i) => (
        <div key={i} onClick={() => onNavigate(item.screen)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 6, background: currentScreen === item.screen ? `${theme.aubergine}12` : 'transparent', fontSize: 12.5, color: currentScreen === item.screen ? theme.aubergine : `${theme.ink}cc`, cursor: 'pointer' }}>
          <item.icon size={14} />
          <span>{item.label}</span>
        </div>
      ))}
      {canUseQuickActions && (
        <>
          <div style={{ height: 14, borderTop: `1px solid ${theme.borderSoft}`, margin: '16px 4px 0' }} />
          <div style={{ fontSize: 10, color: `${theme.aubergine}99`, fontWeight: 700, letterSpacing: '0.1em', padding: '0 10px 6px', textTransform: 'uppercase' }}>Schnellfunktionen</div>
          <div style={{ display: 'grid', gap: 2 }}>
            {quickActions.map((item) => (
              <SidebarQuickAction key={item.key} item={item} active={activeQuickAction === item.key} onSelect={selectQuickAction} />
            ))}
          </div>
        </>
      )}
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

function profileFromSessionUser(sessionUser, fallback = {}) {
  if (!sessionUser) return fallback;
  const parts = String(sessionUser.name || '').trim().split(/\s+/).filter(Boolean);
  return {
    ...fallback,
    id: sessionUser.id || fallback.id,
    name: sessionUser.name || fallback.name,
    firstName: parts[0] || fallback.firstName,
    lastName: parts.slice(1).join(' ') || fallback.lastName,
    initials: initialsFromName(sessionUser.name || fallback.name || 'Benutzer').toUpperCase(),
    email: sessionUser.email || fallback.email,
    roleLabel: sessionUser.internalRole ? staffRoleLabels[sessionUser.internalRole] : fallback.roleLabel,
    internalRole: sessionUser.internalRole || fallback.internalRole,
  };
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
    roleLabel: 'Super-Admin',
    internalRole: 'super_admin'
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

const staffRoleLabels = {
  employee: 'Mitarbeiter',
  advisor: 'Kundenberater',
  admin: 'Admin',
  super_admin: 'Super-Admin',
};

const staffRoleDescriptions = {
  employee: 'Kann Kundenfälle bearbeiten.',
  advisor: 'Kann eigene Leads und Kundenfälle beraten und Angebote kalkulieren.',
  admin: 'Kann Partner freischalten, sperren, bearbeiten und Kundenfälle ablehnen.',
  super_admin: 'Kann Mitarbeiter anlegen, Rollen zuordnen und alle Admin-Rechte nutzen.',
};

const internalIntakeSourceLabels = {
  phone: 'Telefonanruf',
  referral: 'Empfehlung',
  offline_ad: 'Offline-Anzeige',
  event: 'Veranstaltung',
  other: 'Sonstige Quelle',
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
  try {
    const currentResponse = await fetch('/api/me');
    const currentPayload = await currentResponse.json().catch(() => ({}));
    if (currentResponse.ok && currentPayload.user?.role === role) {
      return currentPayload;
    }
  } catch {
    // Fallback auf Demo-Login, wenn keine Session gelesen werden kann.
  }
  return postJson('/api/auth/login', demoLoginByRole[role] || demoLoginByRole.partner);
}

function formatEuro(value) {
  if (!Number.isFinite(Number(value))) return '-';
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(value));
}

function formatEuroCents(value) {
  if (!Number.isFinite(Number(value))) return '-';
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value));
}

function formatGermanIntegerInput(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return '';
  return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Number(digits));
}

function parseGermanNumberInput(value) {
  const normalized = String(value ?? '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function formatPercent(value) {
  if (!Number.isFinite(Number(value))) return '-';
  return new Intl.NumberFormat('de-DE', { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(value));
}

function roundMoneyValue(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function normalizeFractionRate(value, fallback) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue <= 0) return fallback;
  return numberValue > 1 ? numberValue / 100 : numberValue;
}

function rentBackCalculationFromOffer(offer) {
  const marketValue = Number(offer?.marketValue);
  const payoutRate = 0.7;
  const annualRentRate = 0.05;
  const payoutAmount = marketValue > 0 ? roundMoneyValue(marketValue * payoutRate) : Number(offer?.payoutAmount);
  const annualRent = roundMoneyValue(payoutAmount * annualRentRate);
  const monthlyRent = roundMoneyValue(annualRent / 12);

  return {
    marketValue,
    payoutRate,
    payoutAmount,
    annualRentRate,
    annualRent,
    monthlyRent,
  };
}

function rentBackMetricRows(offer) {
  const metrics = rentBackCalculationFromOffer(offer);

  return [
    ['Verkehrswert', formatEuro(metrics.marketValue)],
    ['Auszahlungsquote', formatPercent(metrics.payoutRate)],
    ['Auszahlungsbetrag', formatEuroCents(metrics.payoutAmount)],
    ['Mietfaktor p.a.', formatPercent(metrics.annualRentRate)],
    ['Jahresmiete', formatEuroCents(metrics.annualRent)],
    ['Monatliche Miete', formatEuroCents(metrics.monthlyRent)],
  ];
}

function dateLabel(value) {
  if (!value) return 'Gerade eben';
  try {
    return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
  } catch {
    return 'Gerade eben';
  }
}

function customerNameForCase(item) {
  const customer = item.raw?.customer;
  if (customer?.displayName) return customer.displayName;
  const fullName = [customer?.firstName, customer?.lastName].filter(Boolean).join(' ').trim();
  return fullName || item.kunde || 'Kunde';
}

function buildProcessNotifications(cases = []) {
  const steps = [
    ['indicativeOfferSentAt', 'Unverbindliches Angebot abgegeben'],
    ['offerAcceptedAt', 'UVA angenommen'],
    ['expertOpinionOrderedAt', 'Gutachten beauftragt'],
    ['expertOpinionReceivedAt', 'Gutachten eingegangen'],
    ['bindingOfferSentAt', 'Verbindliches Angebot abgegeben'],
    ['bindingOfferAcceptedAt', 'VA angenommen'],
    ['notaryAppointmentAt', 'Notartermin vereinbart'],
    ['portfolioEnteredAt', 'Kaufvertrag abgeschlossen'],
  ];

  return cases
    .flatMap((item) => {
      const property = item.raw?.property || {};
      const caseNumber = property.caseNumber || item.id || item.propertyId;
      return steps
        .filter(([field]) => property[field])
        .map(([field, step]) => ({
          id: `${property.id || item.propertyId || caseNumber}-${field}`,
          propertyId: property.id || item.propertyId,
          caseNumber,
          customerName: customerNameForCase(item),
          step,
          date: property[field],
        }));
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function buildChatNotifications(cases = []) {
  return cases
    .flatMap((item) => {
      const property = item.raw?.property || {};
      const caseNumber = property.caseNumber || item.id || item.propertyId;
      return (item.raw?.chatMessages || []).map((message) => ({
        id: message.id,
        propertyId: property.id || item.propertyId,
        caseNumber,
        customerName: customerNameForCase(item),
        authorName: message.userName || (message.source === 'admin' ? 'Admin' : 'Makler'),
        authorRole: message.userRole || message.source,
        message: message.message,
        createdAt: message.createdAt,
      }));
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

const cityCoordinates = {
  augsburg: { lat: 48.3705, lng: 10.8978 },
  berlin: { lat: 52.52, lng: 13.405 },
  esslingen: { lat: 48.7428, lng: 9.3072 },
  karlsruhe: { lat: 49.0069, lng: 8.4037 },
  münchen: { lat: 48.1351, lng: 11.582 },
  munich: { lat: 48.1351, lng: 11.582 },
  stuttgart: { lat: 48.7758, lng: 9.1829 },
  tübingen: { lat: 48.5216, lng: 9.0576 },
  tuebingen: { lat: 48.5216, lng: 9.0576 },
};

const postalPrefixCoordinates = {
  0: { lat: 51.05, lng: 13.74 },
  1: { lat: 52.52, lng: 13.405 },
  2: { lat: 53.55, lng: 10.0 },
  3: { lat: 52.37, lng: 9.73 },
  4: { lat: 51.45, lng: 7.01 },
  5: { lat: 50.94, lng: 6.96 },
  6: { lat: 50.11, lng: 8.68 },
  7: { lat: 48.78, lng: 9.18 },
  8: { lat: 48.14, lng: 11.58 },
  9: { lat: 49.45, lng: 11.08 },
};

function normalizeLocationText(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function coordinatesForCase(item) {
  const property = item.raw?.property || {};
  const cityText = normalizeLocationText(`${property.city || item.adresse || item.objekt || ''}`);
  const cityMatch = Object.entries(cityCoordinates).find(([city]) => cityText.includes(normalizeLocationText(city)));
  if (cityMatch) return cityMatch[1];
  const postalCode = String(property.postalCode || item.adresse || '').match(/\b\d{5}\b/)?.[0];
  const fallback = postalPrefixCoordinates[postalCode?.[0]];
  return fallback || { lat: 51.1657, lng: 10.4515 };
}

function buildMapPoints(cases = []) {
  return cases
    .filter((item) => !['REJECTED', 'LOST'].includes(item.status))
    .map((item) => {
      const property = item.raw?.property || {};
      const coordinates = coordinatesForCase(item);
      return {
        id: item.propertyId || property.id || item.id,
        caseNumber: property.caseNumber || item.id,
        customerName: customerNameForCase(item),
        objectTitle: property.objectTitle || item.objekt || property.city || 'Objekt',
        status: item.status,
        lat: coordinates.lat,
        lng: coordinates.lng,
      };
    });
}

function GooglePropertyMap({ points = [], onOpenCase }) {
  const mapRef = React.useRef(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey || !mapRef.current || !points.length) return;
    let cancelled = false;

    const loadGoogleMaps = () => new Promise((resolve, reject) => {
      if (window.google?.maps) {
        resolve(window.google.maps);
        return;
      }
      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.google.maps), { once: true });
        existingScript.addEventListener('error', reject, { once: true });
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`;
      script.async = true;
      script.onload = () => resolve(window.google.maps);
      script.onerror = reject;
      document.head.appendChild(script);
    });

    loadGoogleMaps().then((maps) => {
      if (cancelled || !mapRef.current) return;
      const map = new maps.Map(mapRef.current, {
        center: { lat: 51.1657, lng: 10.4515 },
        zoom: 5.7,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          { featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{ color: '#5C4A66' }] },
        ],
      });
      const bounds = new maps.LatLngBounds();
      const infoWindow = new maps.InfoWindow();
      points.forEach((point) => {
        const position = { lat: point.lat, lng: point.lng };
        bounds.extend(position);
        const circle = new maps.Circle({
          map,
          center: position,
          radius: 22000,
          strokeColor: theme.aubergine,
          strokeOpacity: 0.85,
          strokeWeight: 2,
          fillColor: theme.aubergine,
          fillOpacity: 0.22,
          clickable: true,
        });
        circle.addListener('click', () => {
          infoWindow.setContent(`
            <div style="font-family: Arial, sans-serif; min-width: 160px;">
              <strong>${point.customerName}</strong><br />
              <span>${point.objectTitle}</span><br />
              <small>${point.caseNumber}</small>
            </div>
          `);
          infoWindow.setPosition(position);
          infoWindow.open(map);
          onOpenCase?.(point.id);
        });
      });
      if (points.length > 1) map.fitBounds(bounds, 48);
    }).catch(() => {
      // Fallback bleibt sichtbar, wenn Google Maps nicht geladen werden kann.
    });

    return () => {
      cancelled = true;
    };
  }, [apiKey, points, onOpenCase]);

  if (!apiKey) {
    return <FallbackGermanyMap points={points} onOpenCase={onOpenCase} />;
  }

  return (
    <div style={{ height: 240, position: 'relative' }}>
      <div ref={mapRef} style={{ position: 'absolute', inset: 0 }} />
      <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'white', padding: '4px 8px', borderRadius: 4, fontSize: 10, color: `${theme.ink}88`, border: `1px solid ${theme.borderSoft}` }}>
        {points.length} Objekte · Google Maps
      </div>
    </div>
  );
}

function FallbackGermanyMap({ points = [], onOpenCase }) {
  const projectedPoints = points.map((point, index) => {
    const x = Math.min(360, Math.max(40, ((point.lng - 5.5) / 10.5) * 320 + 40));
    const y = Math.min(210, Math.max(24, ((55.3 - point.lat) / 8.6) * 186 + 18));
    return { ...point, x: x + (index % 3) * 4, y: y + (index % 2) * 4 };
  });

  return (
    <div style={{ height: 240, background: theme.mintLighter, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="100%" height="100%" viewBox="0 0 400 240" style={{ position: 'absolute' }}>
        <rect x="0" y="0" width="400" height="240" fill={theme.mintLighter} />
        <path d="M196 26 L228 46 L244 77 L281 91 L266 130 L283 162 L250 205 L207 216 L165 201 L136 209 L112 174 L96 139 L113 103 L101 71 L137 49 Z" fill={theme.mint} stroke={theme.oliv} strokeWidth="1.2" opacity="0.72" />
        {projectedPoints.map((point) => (
          <g key={point.id} onClick={() => onOpenCase?.(point.id)} style={{ cursor: 'pointer' }}>
            <circle cx={point.x} cy={point.y} r="11" fill={theme.aubergine} opacity="0.22" />
            <circle cx={point.x} cy={point.y} r="5" fill={theme.aubergine} />
            <title>{`${point.customerName} · ${point.caseNumber}`}</title>
          </g>
        ))}
      </svg>
      <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'white', padding: '4px 8px', borderRadius: 4, fontSize: 10, color: `${theme.ink}88`, border: `1px solid ${theme.borderSoft}` }}>
        {points.length} Objekte · Deutschlandkarte
      </div>
      {!points.length && (
        <div style={{ fontSize: 12, color: `${theme.ink}88`, background: 'white', border: `1px solid ${theme.borderSoft}`, borderRadius: 6, padding: '8px 10px' }}>
          Noch keine Objekte mit Standortdaten.
        </div>
      )}
    </div>
  );
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

const caseTabKeys = ['kunde', 'objekt', 'rating', 'indag', 'verbag', 'kvabwicklung', 'bestand', 'verwertung', 'doks', 'aufgaben', 'chat'];
const caseTabAliases = {
  customer: 'kunde',
  kunde: 'kunde',
  object: 'objekt',
  objekt: 'objekt',
  property: 'objekt',
  rating: 'rating',
  objektrating: 'rating',
  object_rating: 'rating',
  'object-rating': 'rating',
  modernization: 'objekt',
  modernisierung: 'objekt',
  condition: 'objekt',
  zustand: 'objekt',
  offer: 'indag',
  indicative_offer: 'indag',
  unverbindliches_angebot: 'indag',
  binding_offer: 'verbag',
  verbindliches_angebot: 'verbag',
  purchase_processing: 'kvabwicklung',
  'purchase-processing': 'kvabwicklung',
  kaufvertragsabwicklung: 'kvabwicklung',
  vertragsabwicklung: 'kvabwicklung',
  contract_closing: 'kvabwicklung',
  'contract-closing': 'kvabwicklung',
  vertragsvollzug: 'kvabwicklung',
  kv: 'kvabwicklung',
  kv_abwicklung: 'kvabwicklung',
  'kv-abwicklung': 'kvabwicklung',
  kvabwicklung: 'kvabwicklung',
  portfolio: 'bestand',
  bestand: 'bestand',
  exit: 'verwertung',
  verwertung: 'verwertung',
  verwertung_nach_wohnrechtsende: 'verwertung',
  documents: 'doks',
  document: 'doks',
  doks: 'doks',
  objektunterlagen: 'doks',
  chat: 'chat',
  kommunikation: 'chat',
  activity: 'aufgaben',
  activities: 'aufgaben',
  aufgaben: 'aufgaben',
};

function normalizeCaseTab(tab, fallback = 'kunde') {
  if (!tab) return fallback;
  const normalized = String(tab).trim().toLowerCase();
  const mapped = caseTabAliases[normalized] || normalized;
  return caseTabKeys.includes(mapped) ? mapped : fallback;
}

function basePathForRole(role) {
  return role === 'admin' ? '/admin' : '/partner';
}

const appScreenKeys = [
  'dashboard',
  'leads',
  'drafts',
  'in_progress',
  'portfolio',
  'sold',
  'rejected',
  'partners',
  'staff',
  'other',
  'knowledge_brochure',
  'knowledge_atlas',
  'knowledge_guide',
  'knowledge_faq',
  'erfassung',
];

function normalizeAppScreen(screen, fallback = 'dashboard') {
  if (!screen) return fallback;
  const normalized = String(screen).trim().toLowerCase();
  return appScreenKeys.includes(normalized) ? normalized : fallback;
}

function parseAppLocation(fallbackScreen = 'dashboard') {
  if (typeof window === 'undefined') return normalizeAppScreen(fallbackScreen);
  const params = new URLSearchParams(window.location.search);
  return normalizeAppScreen(params.get('screen') || params.get('view'), fallbackScreen);
}

function parseCaseLocation(fallbackTab = 'kunde') {
  if (typeof window === 'undefined') return { caseId: null, tab: fallbackTab, returnTab: '' };
  const params = new URLSearchParams(window.location.search);
  return {
    caseId: params.get('case') || params.get('caseId'),
    tab: normalizeCaseTab(params.get('tab'), fallbackTab),
    returnTab: normalizeCaseTab(params.get('returnTab'), ''),
  };
}

function updateCaseUrl(role, caseId, tab = 'kunde', returnTab = '', mode = 'replace') {
  if (typeof window === 'undefined' || !caseId) return;
  const params = new URLSearchParams();
  params.set('case', String(caseId));
  params.set('tab', normalizeCaseTab(tab));
  if (returnTab && normalizeCaseTab(returnTab) !== normalizeCaseTab(tab)) {
    params.set('returnTab', normalizeCaseTab(returnTab));
  }
  const url = `${basePathForRole(role)}?${params.toString()}`;
  window.history[mode === 'push' ? 'pushState' : 'replaceState']({}, '', url);
}

function updateScreenUrl(role, screen = 'dashboard', mode = 'replace') {
  if (typeof window === 'undefined') return;
  const nextScreen = normalizeAppScreen(screen);
  const url = nextScreen === 'dashboard'
    ? basePathForRole(role)
    : `${basePathForRole(role)}?screen=${encodeURIComponent(nextScreen)}`;
  window.history[mode === 'push' ? 'pushState' : 'replaceState']({}, '', url);
}

function readLeadCreateFromUrl() {
  if (typeof window === 'undefined') return false;
  if (window.location.pathname === '/admin/leads/new') return true;
  const params = new URLSearchParams(window.location.search);
  return params.get('createLead') === '1' || params.get('mode') === 'create';
}

function readLeadIdFromUrl() {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('lead') || params.get('leadId');
}

function updateLeadCreateUrl(role, open = true, mode = 'replace') {
  if (typeof window === 'undefined') return;
  if (open && role === 'admin') {
    window.history[mode === 'push' ? 'pushState' : 'replaceState']({}, '', '/admin/leads/new');
    return;
  }
  const params = new URLSearchParams(window.location.search);
  params.set('screen', 'leads');
  if (open) {
    params.set('createLead', '1');
  } else {
    params.delete('createLead');
    if (params.get('screen') !== 'leads') params.set('screen', 'leads');
  }
  const query = params.toString();
  const url = query ? `${basePathForRole(role)}?${query}` : basePathForRole(role);
  window.history[mode === 'push' ? 'pushState' : 'replaceState']({}, '', url);
}

const portfolioBucketKeys = ['purchase-processing', 'inventory-management', 'sale-objects'];
const legacyPortfolioBucketMap = {
  'contract-closing': 'purchase-processing',
  contract_closing: 'purchase-processing',
  vertragsvollzug: 'purchase-processing',
  kvabwicklung: 'purchase-processing',
  'exit-sale': 'sale-objects',
  exit_sale: 'sale-objects',
  verwertung: 'sale-objects',
  verwertung_nach_wohnrechtsende: 'sale-objects',
};

function normalizePortfolioBucket(bucket, fallback = '') {
  if (!bucket) return fallback;
  const normalized = String(bucket).trim().toLowerCase();
  if (legacyPortfolioBucketMap[normalized]) return legacyPortfolioBucketMap[normalized];
  return portfolioBucketKeys.includes(normalized) ? normalized : fallback;
}

function parsePortfolioBucket(fallback = '') {
  if (typeof window === 'undefined') return fallback;
  const params = new URLSearchParams(window.location.search);
  return normalizePortfolioBucket(params.get('bucket'), fallback);
}

function updatePortfolioBucketUrl(role, bucket = '', mode = 'replace') {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  params.set('screen', 'portfolio');
  const nextBucket = normalizePortfolioBucket(bucket, '');
  if (nextBucket) {
    params.set('bucket', nextBucket);
  } else {
    params.delete('bucket');
  }
  window.history[mode === 'push' ? 'pushState' : 'replaceState']({}, '', `${basePathForRole(role)}?${params.toString()}`);
}

function clearCaseUrl(role, mode = 'replace') {
  if (typeof window === 'undefined') return;
  window.history[mode === 'push' ? 'pushState' : 'replaceState']({}, '', basePathForRole(role));
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

function isDateBefore(acceptedAt, submittedAt) {
  if (!acceptedAt || !submittedAt) return false;
  return new Date(acceptedAt) < new Date(submittedAt);
}

const genderLabels = { female: 'weiblich', male: 'männlich', diverse: 'divers', not_specified: 'keine Angabe' };
const maritalLabels = { single: 'ledig', married: 'verheiratet', divorced: 'geschieden', widowed: 'verwitwet', other: 'sonstiges' };
const incomeLabels = { under_1000: 'unter 1.000 €', from_1000_to_2000: '1.000 - 2.000 €', from_2000_to_3000: '2.000 - 3.000 €', over_3000: 'über 3.000 €' };
const ratingLabels = conditionRatingLabels;
const objectRatingCategoryOrder = ['Wirtschaftliche Faktoren', 'Mikrolage', 'Instandhaltungsaufwand', 'Immobilie', 'Energieausweis'];
const objectRatingCriterionOrder = [
  'rating_crit_economics_purchase_power_v1',
  'rating_crit_economics_unemployment_rate_v1',
  'rating_crit_economics_unemployment_trend_v1',
  'rating_crit_economics_migration_balance_v1',
  'rating_crit_economics_population_trend_v1',
  'rating_crit_micro_public_transport_v1',
  'rating_crit_micro_individual_transport_v1',
  'rating_crit_micro_infrastructure_v1',
  'rating_crit_micro_neighborhood_condition_v1',
  'rating_crit_micro_noise_emissions_v1',
  'rating_crit_maintenance_heating_v1',
  'rating_crit_maintenance_roof_v1',
  'rating_crit_maintenance_flat_roof_v1',
  'rating_crit_maintenance_facade_v1',
  'rating_crit_maintenance_masonry_v1',
  'rating_crit_maintenance_bathrooms_v1',
  'rating_crit_maintenance_electrical_v1',
  'rating_crit_maintenance_windows_v1',
  'rating_crit_property_layout_v1',
  'rating_crit_property_living_quality_v1',
  'rating_crit_property_light_v1',
  'rating_crit_property_outdoor_area_v1',
  'rating_crit_energy_certificate_class_v1',
];
const ratingRoofCriterionId = 'rating_crit_maintenance_roof_v1';
const ratingFlatRoofCriterionId = 'rating_crit_maintenance_flat_roof_v1';
const recipientLabels = { one_person: 'eine Person', both: 'beide Personen' };
const basementLabels = { none: 'kein Keller', partial: 'teilunterkellert', full: 'vollunterkellert' };
const parkingLabels = { garage: 'Garage', carport: 'Carport', outdoor_space: 'Stellplatz', duplex: 'Doppelparker' };
const windowLabels = { wood: 'Holz', aluminium: 'Aluminium', plastic: 'Kunststoff' };
const energyCertificateLabels = { demand: 'Bedarfsausweis', consumption: 'Verbrauchsausweis' };
const energyCarrierLabels = { photovoltaik: 'Photovoltaik', solarthermie: 'Solarthermie', batteriespeicher: 'Batteriespeicher' };
const moistureDamageLabels = { NONE: 'Nein', MINOR: 'Ja, geringfügig', SIGNIFICANT: 'Ja, erheblich' };
const accessibilityAssessmentLabels = { LOW_BARRIER: 'Barrierearm', PARTIALLY_RESTRICTED: 'Teilweise eingeschränkt', STRONGLY_RESTRICTED: 'Stark eingeschränkt' };
const documentStatusLabels = { missing: 'fehlt', pending: 'eingereicht', ok: 'geprüft', review_required: 'Prüfung nötig', rejected: 'abgelehnt' };
const documentScanStatusLabels = { pending: 'Virenscan offen', clean: 'Virenscan unauffällig', suspicious: 'Auffällig', failed: 'Scan fehlgeschlagen' };
const requirementLabels = { required: 'Pflicht', recommended: 'Empfohlen', optional: 'Optional' };
const rejectionReasons = [
  { value: 'location', label: 'Lage / Marktgängigkeit' },
  { value: 'condition', label: 'Objektzustand' },
  { value: 'age', label: 'Alter / Laufzeit passt nicht' },
  { value: 'documents', label: 'Unterlagen oder Datenlage unzureichend' },
  { value: 'valuation', label: 'Bewertung / Wirtschaftlichkeit' },
  { value: 'legal', label: 'Rechtliche Ausschlusskriterien' },
  { value: 'occupancy', label: 'Nutzung / Vermietung' },
  { value: 'other', label: 'Sonstiger Grund' },
];
const rejectionReasonLabels = Object.fromEntries(rejectionReasons.map((item) => [item.value, item.label]));
const workflowResetReasons = [
  'Gutachtertermin wurde geändert',
  'Bewertung muss angepasst werden',
  'Angebot muss neu kalkuliert werden',
  'Unterlagen fehlen',
  'Kunde hat Änderungswunsch',
  'Interne Prüfung erforderlich',
];
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
const modernizationLabels = modernizationScopeLabels;
const productModelLabels = { fixed_residential_right: 'Wohnrecht', sale_and_leaseback: 'Rückmietverkauf', other: 'Sonstiges Nutzungsmodell' };
const residentStatusLabels = {
  ACTIVE: 'Bewohner bleibt im Objekt',
  MOVE_OUT_PLANNED: 'Bewohner zieht aus',
  MOVED_OUT: 'Bewohner ausgezogen',
  DECEASED: 'Bewohner verstorben',
};
const usageModelLabels = {
  fixed_residential_right: 'Wohnrecht',
  lifelong_residential_right: 'Wohnrecht',
  usufruct: 'Wohnrecht',
  sale_and_leaseback: 'Rückmietverkauf',
  other: 'sonstiges Nutzungsmodell',
};
const exitTerminationReasonLabels = {
  move_out: 'Auszug',
  resident_death: 'Tod des Bewohners',
  fixed_term_expired: 'Ende des Wohnrechts',
  waiver_agreement: 'Verzicht / Aufhebungsvereinbarung',
  other: 'sonstiger Grund',
};
const exitSalesStatusLabels = {
  under_review: 'in Prüfung',
  access_pending: 'Objektzugang offen',
  inspection_scheduled: 'Begehung geplant',
  clearance_pending: 'Räumung offen',
  repairs_pending: 'Sanierung / Reparatur offen',
  sales_preparation: 'Verkaufsvorbereitung',
  marketing: 'in Vermarktung',
  sold: 'verkauft',
  completed: 'abgeschlossen',
};
const offerStatusLabels = {
  draft: 'Entwurf',
  review: 'In Prüfung',
  approved: 'Freigegeben',
  sent: 'Versendet',
  rejected: 'Abgelehnt',
};
const leadStatusLabels = {
  NEW: 'Neu',
  IN_REVIEW: 'In Prüfung',
  QUALIFIED: 'Qualifiziert',
  ASSIGNED: 'Zugewiesen',
  ASSIGNED_TO_PARTNER: 'An Makler weitergeleitet',
  CONTACTED: 'Kontaktiert',
  PARTNER_CONTACT_PENDING: 'Kontakt durch Makler offen',
  CONVERTED: 'Umgewandelt',
  CONVERTED_TO_CASE: 'In Kundenfall umgewandelt',
  CLOSED: 'Geschlossen',
  REJECTED: 'Abgelehnt',
};
const leadStatusColors = {
  NEW: theme.gold,
  IN_REVIEW: theme.aubergineSoft,
  QUALIFIED: theme.aubergineSoft,
  ASSIGNED: theme.oliv,
  ASSIGNED_TO_PARTNER: theme.oliv,
  CONTACTED: '#7B61C7',
  PARTNER_CONTACT_PENDING: '#7B61C7',
  CONVERTED: '#5B8C2B',
  CONVERTED_TO_CASE: '#5B8C2B',
  CLOSED: `${theme.ink}88`,
  REJECTED: '#9B2C2C',
};
const leadSourceLabels = {
  homepage: 'Homepage',
  website: 'Website',
  phone: 'Telefon',
  referral: 'Empfehlung',
  admin: 'Intern',
  internal: 'Intern',
  partner: 'Makler',
  other: 'Sonstiges',
};

function yesNo(value) {
  return value ? 'ja' : 'nein';
}

function yesNoOptional(value) {
  if (value === true) return 'ja';
  if (value === false) return 'nein';
  return '-';
}

function formatDate(value) {
  if (!value) return '-';
  try {
    return new Intl.DateTimeFormat('de-DE').format(new Date(value));
  } catch {
    return value;
  }
}

function dateInputValue(value) {
  if (!value) return '';
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return '';
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
    sourceLabel: getCaseSourceLabel(property.caseSource || (property.partnerId ? 'PARTNER' : 'INTERNAL')),
    objekt: property.objectTitle || `${propertyTypeLabel(property.propertyType)} ${property.city}`,
    adresse: `${property.street}, ${property.postalCode} ${property.city}`,
    flaeche: property.livingAreaSqm,
    grundstueck: property.plotAreaSqm || null,
    status: property.status,
    rejectionReasonCode: property.rejectionReasonCode,
    rejectionReasonLabel: property.rejectionReasonLabel,
    rejectionNote: property.rejectionNote,
    rejectedAt: property.rejectedAt,
    vor: property.lastActivityLabel || dateLabel(property.updatedAt),
    followUp: Boolean(property.followUpRequired || openReminder),
    followUpReason: openReminder?.reason || property.followUpReason || '',
    raw: item,
  };
}

function filterCasesForScreen(cases, screen) {
  if (screen === 'sold') {
    return cases.filter((item) => isSoldOrFinalizedCase(item));
  }

  const statusGroups = {
    drafts: ['DRAFT'],
    in_progress: ['SUBMITTED', 'DATA_INCOMPLETE', 'VALUATION_PENDING', 'VALUATED', 'OFFER_CALCULATED', 'OFFER_DRAFTED', 'INTERNAL_REVIEW', 'APPROVED', 'SENT', 'INDICATIVE_OFFER_SENT', 'OFFER_ACCEPTED', 'EXPERT_OPINION_ORDERED', 'EXPERT_OPINION_RECEIVED', 'BINDING_OFFER_SENT', 'BINDING_OFFER_ACCEPTED', 'PURCHASE_STARTED', 'NOTARY_APPOINTMENT', 'PURCHASED', 'APPOINTMENT_SCHEDULED'],
    portfolio: ['IN_PORTFOLIO', 'WON'],
    rejected: ['REJECTED', 'LOST'],
  };
  const statuses = statusGroups[screen] || [];
  return cases.filter((item) => statuses.includes(item.status));
}

function isSoldOrFinalizedCase(item) {
  const exitSalesStatus = item.raw?.property?.exitProcess?.salesStatus;
  return item.status === 'SOLD' || exitSalesStatus === 'sold' || exitSalesStatus === 'completed';
}

function soldScreenStatus(item) {
  return item.status === 'SOLD' || item.raw?.property?.exitProcess?.salesStatus === 'sold'
    ? 'SOLD'
    : 'EXIT_COMPLETED';
}

function menuScreenTitle(screen) {
  const labels = {
    drafts: 'Entwürfe',
    in_progress: 'In Bearbeitung',
    portfolio: 'Bestand',
    sold: 'Verkauft',
    rejected: 'Abgelehnt',
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

function buildingConditionValue(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return { rating: value.rating || '', description: value.description || '' };
  }
  return { rating: value || '', description: '' };
}

function buildingConditionRating(value) {
  return buildingConditionValue(value).rating;
}

const defaultDraft = {
  title: '',
  firstName: '',
  lastName: '',
  ageAtSubmission: '',
  gender: '',
  dateOfBirth: '',
  maritalStatus: '',
  spouseTitle: '',
  spouseFirstName: '',
  spouseLastName: '',
  spouseGender: '',
  spouseDateOfBirth: '',
  spouseAgeAtSubmission: '',
  propertyOwnership: '',
  monthlyIncomeRange: '',
  email: '',
  phone: '',
  mobile: '',
  street: '',
  postalCode: '',
  city: '',
  consentDataProcessing: false,
  propertyStreet: '',
  propertyPostalCode: '',
  propertyCity: '',
  propertyType: '',
  livingAreaSqm: '',
  plotAreaSqm: '',
  usableAreaSqm: '',
  yearBuilt: '',
  condition: 'average',
  occupancyStatus: '',
  desiredModel: '',
  residentialRightRecipients: '',
  residentialRightPerson: '',
  desiredResidentialRightYears: '',
  rentalModelDisclosureAccepted: false,
  additionalOfferRequested: false,
  additionalOfferModel: '',
  additionalOfferResidentialRightRecipients: '',
  additionalOfferResidentialRightPerson: '',
  additionalOfferResidentialRightYears: '',
  additionalOfferReason: '',
  additionalOfferRentalModelDisclosureAccepted: false,
  secondResidentialRightWanted: false,
  secondResidentialRightYears: '',
  fixedTermReason: '',
  rentalOptionDeselected: false,
  coOwnershipShares: '',
  heatingType: '',
  heatingEnergySource: '',
  heatingEnergySourceOther: '',
  heatingYear: '',
  energyCertificateAvailable: false,
  energyCertificateType: '',
  energyClass: '',
  parkingAvailable: false,
  parkingType: '',
  parkingCount: '',
  basementType: '',
  windowMaterial: '',
  windowInstallationYear: '',
  asbestosRoofKnown: '',
  visualConditionRating: '',
  energyCarriers: [],
  knownDefects: '',
  knownMajorMaintenanceOrSpecialAssessments: '',
  knownMajorMaintenanceOrSpecialAssessmentsDescription: '',
  moistureDamageStatus: '',
  moistureDamageDescription: '',
  accessibilityAssessment: '',
  hasElevator: '',
  generalPropertyNotes: '',
  remainingDebtKnown: '',
  remainingDebtAmount: '',
  modernization: {
    heating: { scope: 'none', year: '', note: '' },
    roof: { scope: 'none', year: '', note: '' },
    facade: { scope: 'none', year: '', note: '' },
    windows: { scope: 'none', year: '', note: '' },
    lines: { scope: 'none', year: '', note: '' },
    bathrooms: { scope: 'none', year: '', note: '' },
  },
  buildingCondition: {
    roof: { rating: '', description: '' },
    facade: { rating: '', description: '' },
    masonry: { rating: '', description: '' },
    windows: { rating: '', description: '' },
    basement: { rating: '', description: '' },
    electric: { rating: '', description: '' },
    sanitary: { rating: '', description: '' },
    interior: { rating: '', description: '' },
    outdoor: { rating: '', description: '' },
    other: { rating: '', description: '' },
  },
  leasehold: false,
  monumentProtection: false,
  documentFile: null,
  documentFileName: '',
  documentCategory: '',
  documentRequirementLevel: 'optional',
  documentStatus: 'pending',
  documentMissingReason: '',
  documentUploads: {},
  existingDocumentCategories: [],
};

function draftFromCaseView(caseView) {
  if (!caseView) return { ...defaultDraft };
  const customer = caseView.customer || {};
  const property = caseView.property || {};
  const existingDocumentCategories = Array.from(new Set((caseView.documents || []).map((document) => document.category).filter(Boolean)));
  return {
    ...defaultDraft,
    modernization: { ...defaultDraft.modernization, ...(property.modernization || {}) },
    buildingCondition: { ...defaultDraft.buildingCondition, ...(property.buildingCondition || {}) },
    title: customer.title || '',
    firstName: customer.firstName || '',
    lastName: customer.lastName || '',
    ageAtSubmission: customer.ageAtSubmission || calculateAgeFromBirthDate(dateInputValue(customer.dateOfBirth)),
    gender: customer.gender || '',
    dateOfBirth: dateInputValue(customer.dateOfBirth),
    maritalStatus: customer.maritalStatus || '',
    spouseTitle: customer.spouseTitle || '',
    spouseFirstName: customer.spouseFirstName || '',
    spouseLastName: customer.spouseLastName || '',
    spouseGender: customer.spouseGender || '',
    spouseDateOfBirth: dateInputValue(customer.spouseDateOfBirth),
    spouseAgeAtSubmission: calculateAgeFromBirthDate(dateInputValue(customer.spouseDateOfBirth)),
    propertyOwnership: customer.propertyOwnership || '',
    monthlyIncomeRange: customer.monthlyIncomeRange || '',
    email: customer.email || '',
    phone: customer.phone || '',
    mobile: customer.mobile || '',
    street: customer.street || property.street || '',
    postalCode: customer.postalCode || property.postalCode || '',
    city: customer.city || property.city || '',
    consentDataProcessing: Boolean(customer.consentDataProcessing),
    propertyType: property.propertyType || '',
    livingAreaSqm: property.livingAreaSqm || '',
    plotAreaSqm: property.plotAreaSqm ?? '',
    usableAreaSqm: property.usableAreaSqm || '',
    yearBuilt: property.yearBuilt || '',
    condition: property.condition || 'average',
    occupancyStatus: property.occupancyStatus || '',
    desiredModel: property.desiredModel || '',
    residentialRightRecipients: property.residentialRightRecipients || '',
    residentialRightPerson: property.residentialRightPerson || '',
    desiredResidentialRightYears: property.desiredResidentialRightYears || '',
    rentalModelDisclosureAccepted: Boolean(property.rentalModelDisclosureAccepted),
    additionalOfferRequested: Boolean(property.additionalOfferRequested),
    additionalOfferModel: property.additionalOfferModel || '',
    additionalOfferResidentialRightRecipients: property.additionalOfferResidentialRightRecipients || '',
    additionalOfferResidentialRightPerson: property.additionalOfferResidentialRightPerson || '',
    additionalOfferResidentialRightYears: property.additionalOfferResidentialRightYears || '',
    additionalOfferReason: property.additionalOfferReason || '',
    additionalOfferRentalModelDisclosureAccepted: Boolean(property.additionalOfferRentalModelDisclosureAccepted),
    fixedTermReason: property.fixedTermReason || '',
    coOwnershipShares: property.coOwnershipShares || '',
    heatingType: property.heatingType || '',
    heatingEnergySource: property.heatingEnergySource || '',
    heatingEnergySourceOther: property.heatingEnergySourceOther || '',
    heatingYear: property.heatingYear || '',
    energyCertificateAvailable: Boolean(property.energyCertificateAvailable),
    energyCertificateType: property.energyCertificateType || '',
    energyClass: property.energyClass || '',
    parkingAvailable: Boolean(property.parkingAvailable),
    parkingType: property.parkingAvailable ? property.parkingType || '' : 'none',
    parkingCount: property.parkingCount || '',
    basementType: property.basementType || '',
    windowMaterial: property.windowMaterial || '',
    windowInstallationYear: property.windowInstallationYear || '',
    asbestosRoofKnown: property.asbestosRoofKnown === true ? 'yes' : property.asbestosRoofKnown === false ? 'no' : '',
    visualConditionRating: property.visualConditionRating || '',
    energyCarriers: property.energyCarriers || [],
    knownDefects: property.knownDefects || '',
    knownMajorMaintenanceOrSpecialAssessments: property.knownMajorMaintenanceOrSpecialAssessments ?? '',
    knownMajorMaintenanceOrSpecialAssessmentsDescription: property.knownMajorMaintenanceOrSpecialAssessmentsDescription || '',
    moistureDamageStatus: property.moistureDamageStatus || '',
    moistureDamageDescription: property.moistureDamageDescription || '',
    accessibilityAssessment: property.accessibilityAssessment || '',
    hasElevator: property.hasElevator ?? '',
    generalPropertyNotes: property.generalPropertyNotes || property.notes || '',
    remainingDebtKnown: property.remainingDebtKnown ?? '',
    remainingDebtAmount: property.remainingDebtAmount || '',
    leasehold: Boolean(property.leasehold),
    monumentProtection: Boolean(property.monumentProtection),
    documentUploads: {},
    existingDocumentCategories,
  };
}

function hasValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function customerOneName(draft) {
  return [draft.firstName, draft.lastName].filter(Boolean).join(' ').trim() || 'Kunde 1';
}

function customerTwoName(draft) {
  return [draft.spouseFirstName, draft.spouseLastName].filter(Boolean).join(' ').trim() || 'Kunde 2';
}

function documentFilesForCategory(draft, category) {
  return draft.documentUploads?.[category] || [];
}

function hasUploadedDocument(draft, category) {
  return documentFilesForCategory(draft, category).length > 0 || draft.existingDocumentCategories?.includes(category);
}

function missingRequiredDocumentFields(draft) {
  const missing = [];
  const requiredDocuments = getRequiredDocumentsForPropertyType(draft.propertyType);
  for (const document of requiredDocuments) {
    if (document.category === 'land_register') {
      if (!hasUploadedDocument(draft, 'land_register') && !hasUploadedDocument(draft, 'power_of_attorney')) {
        missing.push('document:land_register_or_power');
      }
      continue;
    }
    if (!hasUploadedDocument(draft, document.category)) {
      missing.push(`document:${document.category}`);
    }
  }
  return missing;
}

function requiredDocumentFieldKeys(draft) {
  return getRequiredDocumentsForPropertyType(draft.propertyType).map((document) => (
    document.category === 'land_register'
      ? 'document:land_register_or_power'
      : `document:${document.category}`
  ));
}

const validationFieldLabels = {
  firstName: 'Persönliche Daten: Vorname',
  lastName: 'Persönliche Daten: Nachname',
  gender: 'Persönliche Daten: Geschlecht',
  dateOfBirth: 'Persönliche Daten: Geburtsdatum',
  maritalStatus: 'Persönliche Daten: Familienstand',
  monthlyIncomeRange: 'Persönliche Daten: Monatliche Einkünfte',
  email: 'Persönliche Daten: E-Mail',
  phone: 'Persönliche Daten: Telefon',
  street: 'Persönliche Daten: Straße',
  postalCode: 'Persönliche Daten: PLZ',
  city: 'Persönliche Daten: Ort',
  consentDataProcessing: 'Persönliche Daten: Einwilligung zur Datenverarbeitung',
  spouseFirstName: 'Kunde 2: Vorname',
  spouseLastName: 'Kunde 2: Nachname',
  spouseGender: 'Kunde 2: Geschlecht',
  spouseDateOfBirth: 'Kunde 2: Geburtsdatum',
  propertyOwnership: 'Kunde 2: Eigentümer-Auswahl',
  desiredModel: 'Wunschmodell: Hauptmodell',
  residentialRightRecipients: 'Wunschmodell: Wohnrechtsberechtigte',
  residentialRightPerson: 'Wunschmodell: Person mit Wohnrecht',
  desiredResidentialRightYears: 'Wunschmodell: Dauer Wohnrecht',
  fixedTermReason: 'Wunschmodell: Grund der Befristung',
  rentalModelDisclosureAccepted: 'Wunschmodell: Belehrung Rückmietverkauf',
  additionalOfferModel: 'Zweites Angebot: Modell',
  additionalOfferResidentialRightRecipients: 'Zweites Angebot: Wohnrechtsberechtigte',
  additionalOfferResidentialRightPerson: 'Zweites Angebot: Person mit Wohnrecht',
  additionalOfferResidentialRightYears: 'Zweites Angebot: Laufzeit',
  additionalOfferReason: 'Zweites Angebot: Grund / Hinweis',
  additionalOfferRentalModelDisclosureAccepted: 'Zweites Angebot: Belehrung Rückmietverkauf',
  propertyType: 'Immobiliendaten: Immobilientyp',
  yearBuilt: 'Immobiliendaten: Baujahr',
  livingAreaSqm: 'Immobiliendaten: Wohnfläche',
  plotAreaSqm: 'Immobiliendaten: Grundstück',
  usableAreaSqm: 'Immobiliendaten: Nutzfläche',
  coOwnershipShares: 'Immobiliendaten: Miteigentumsanteile',
  visualConditionRating: 'Immobiliendaten: Optik',
  heatingType: 'Immobiliendaten: Heizungsart',
  heatingEnergySource: 'Immobiliendaten: Energieträger',
  heatingEnergySourceOther: 'Immobiliendaten: Beschreibung Energieträger',
  heatingYear: 'Immobiliendaten: Heizungsjahr',
  energyCertificateAvailable: 'Immobiliendaten: Energieausweis',
  energyCertificateType: 'Immobiliendaten: Typ Energieausweis',
  energyClass: 'Immobiliendaten: Energieklasse',
  basementType: 'Immobiliendaten: Keller',
  windowMaterial: 'Immobiliendaten: Fenstermaterial',
  windowInstallationYear: 'Immobiliendaten: Fensterjahr',
  asbestosRoofKnown: 'Immobiliendaten: Asbest im Dach',
  parkingType: 'Immobiliendaten: Parkplatz',
  parkingCount: 'Immobiliendaten: Anzahl Parkplätze',
  hasElevator: 'Immobiliendaten: Aufzug vorhanden',
  knownMajorMaintenanceOrSpecialAssessments: 'Zustand: Instandhaltungen oder Sonderumlagen',
  knownMajorMaintenanceOrSpecialAssessmentsDescription: 'Zustand: Beschreibung Instandhaltungen oder Sonderumlagen',
  moistureDamageStatus: 'Zustand: Feuchtigkeit, Schimmel oder Wasserschäden',
  moistureDamageDescription: 'Zustand: Beschreibung Feuchtigkeit, Schimmel oder Wasserschäden',
  accessibilityAssessment: 'Zustand: Zugänglichkeit',
  remainingDebtKnown: 'Immobiliendaten: Restschuld bekannt',
  remainingDebtAmount: 'Immobiliendaten: Restschuld-Betrag',
  buildingConditionRoof: 'Zustand: Dach',
  buildingConditionFacade: 'Zustand: Fassade',
  buildingConditionMasonry: 'Zustand: Mauerwerk',
  buildingConditionWindows: 'Zustand: Fenster',
  buildingConditionBasement: 'Zustand: Keller',
  buildingConditionElectric: 'Zustand: Elektrik',
  buildingConditionSanitary: 'Zustand: Sanitär',
  buildingConditionInterior: 'Zustand: Innenausbau',
  buildingConditionOutdoor: 'Zustand: Außenanlagen',
  buildingConditionOther: 'Zustand: Sonstiges',
  modernizationYearHeating: 'Modernisierungen: Jahr Heizung',
  modernizationYearRoof: 'Modernisierungen: Jahr Dach',
  modernizationYearFacade: 'Modernisierungen: Jahr Fassade',
  modernizationYearWindows: 'Modernisierungen: Jahr Fenster',
  modernizationYearLines: 'Modernisierungen: Jahr Leitungen',
  modernizationYearBathrooms: 'Modernisierungen: Jahr Bäder',
  'document:land_register_or_power': 'Dokumente: Grundbuchauszug',
  'document:photos': 'Dokumente: Aussagekräftige Objektfotos',
  'document:floorplan': 'Dokumente: Bemaßter Grundriss',
  'document:living_area_calculation': 'Dokumente: Wohnflächenberechnung',
  'document:declaration_of_division': 'Dokumente: Teilungserklärung',
  'document:service_charge_statement': 'Dokumente: Hausgeldabrechnungen',
  'document:owners_meeting_minutes': 'Dokumente: Eigentümerversammlungsprotokolle',
  'document:maintenance_reserve': 'Dokumente: Nachweis Instandhaltungsrücklage',
};

function validationMessageFor(step, fields) {
  if (!fields.length) return '';
  const labels = fields.map((field) => validationFieldLabels[field] || field);
  const intro = step === 5 ? 'Folgende Pflichtdokumente fehlen:' : 'Folgende Pflichtfelder fehlen:';
  return `${intro} ${labels.join(', ')}.`;
}

function validateCaseStep(step, draft) {
  const fields = [];
  const checked = [];
  const add = (field, valid) => {
    checked.push(field);
    if (!valid) fields.push(field);
  };

  if (step === 1) {
    add('firstName', hasValue(draft.firstName));
    add('lastName', hasValue(draft.lastName));
    add('gender', hasValue(draft.gender));
    add('dateOfBirth', hasValue(draft.dateOfBirth));
    add('maritalStatus', hasValue(draft.maritalStatus));
    add('monthlyIncomeRange', hasValue(draft.monthlyIncomeRange));
    add('email', hasValue(draft.email));
    add('phone', hasValue(draft.phone));
    add('street', hasValue(draft.street));
    add('postalCode', hasValue(draft.postalCode));
    add('city', hasValue(draft.city));
    add('consentDataProcessing', draft.consentDataProcessing === true);
    if (draft.maritalStatus === 'married') {
      add('spouseFirstName', hasValue(draft.spouseFirstName));
      add('spouseLastName', hasValue(draft.spouseLastName));
      add('spouseGender', hasValue(draft.spouseGender));
      add('spouseDateOfBirth', hasValue(draft.spouseDateOfBirth));
      add('propertyOwnership', hasValue(draft.propertyOwnership));
    }
  }

  if (step === 2) {
    add('desiredModel', hasValue(draft.desiredModel));
    if (draft.desiredModel === 'fixed_residential_right') {
      add('residentialRightRecipients', hasValue(draft.residentialRightRecipients));
      if (draft.maritalStatus === 'married' && draft.residentialRightRecipients === 'one_person') {
        add('residentialRightPerson', hasValue(draft.residentialRightPerson));
      }
      add('desiredResidentialRightYears', hasValue(draft.desiredResidentialRightYears));
      add('fixedTermReason', hasValue(draft.fixedTermReason));
    }
    if (draft.desiredModel === 'sale_and_leaseback') {
      add('rentalModelDisclosureAccepted', draft.rentalModelDisclosureAccepted === true);
    }
    if (draft.additionalOfferRequested) {
      add('additionalOfferModel', hasValue(draft.additionalOfferModel));
      if (draft.additionalOfferModel === 'fixed_residential_right') {
        add('additionalOfferResidentialRightRecipients', hasValue(draft.additionalOfferResidentialRightRecipients));
        if (draft.maritalStatus === 'married' && draft.additionalOfferResidentialRightRecipients === 'one_person') {
          add('additionalOfferResidentialRightPerson', hasValue(draft.additionalOfferResidentialRightPerson));
        }
        add('additionalOfferResidentialRightYears', hasValue(draft.additionalOfferResidentialRightYears));
        add('additionalOfferReason', hasValue(draft.additionalOfferReason));
      }
      if (draft.additionalOfferModel === 'sale_and_leaseback') {
        add('additionalOfferRentalModelDisclosureAccepted', draft.additionalOfferRentalModelDisclosureAccepted === true);
      }
    }
  }

  if (step === 3) {
    add('propertyType', hasValue(draft.propertyType));
    add('yearBuilt', hasValue(draft.yearBuilt));
    add('livingAreaSqm', hasValue(draft.livingAreaSqm));
    add('plotAreaSqm', hasValue(draft.plotAreaSqm));
    add('visualConditionRating', hasValue(draft.visualConditionRating));
    if (draft.propertyType === 'apartment') add('coOwnershipShares', hasValue(draft.coOwnershipShares));
    if (draft.propertyType === 'apartment') add('hasElevator', draft.hasElevator === true || draft.hasElevator === false);
    add('heatingType', hasValue(draft.heatingType));
    add('heatingEnergySource', hasValue(draft.heatingEnergySource));
    if (draft.heatingEnergySource === 'other') add('heatingEnergySourceOther', hasValue(draft.heatingEnergySourceOther));
    add('heatingYear', hasValue(draft.heatingYear));
    add('energyCertificateAvailable', draft.energyCertificateAvailable === true || draft.energyCertificateAvailable === false);
    if (draft.energyCertificateAvailable) {
      add('energyCertificateType', hasValue(draft.energyCertificateType));
      add('energyClass', hasValue(draft.energyClass));
    }
    add('basementType', hasValue(draft.basementType));
    add('windowMaterial', hasValue(draft.windowMaterial));
    add('windowInstallationYear', hasValue(draft.windowInstallationYear));
    add('asbestosRoofKnown', draft.asbestosRoofKnown === 'yes' || draft.asbestosRoofKnown === 'no');
    add('parkingType', hasValue(draft.parkingType));
    if (draft.parkingType && draft.parkingType !== 'none') {
      add('parkingCount', hasValue(draft.parkingCount));
    }
    add('remainingDebtKnown', draft.remainingDebtKnown === true || draft.remainingDebtKnown === false);
    if (draft.remainingDebtKnown) {
      add('remainingDebtAmount', hasValue(draft.remainingDebtAmount));
    }
  }

  if (step === 4) {
    modernizationFields.forEach(([key]) => {
      const modernization = draft.modernization?.[key];
      if (modernization?.scope && modernization.scope !== 'none') {
        add(`modernizationYear${key.charAt(0).toUpperCase()}${key.slice(1)}`, hasValue(modernization.year));
      }
    });
    add('buildingConditionRoof', hasValue(buildingConditionRating(draft.buildingCondition?.roof)));
    add('buildingConditionFacade', hasValue(buildingConditionRating(draft.buildingCondition?.facade)));
    add('buildingConditionMasonry', hasValue(buildingConditionRating(draft.buildingCondition?.masonry)));
    add('buildingConditionWindows', hasValue(buildingConditionRating(draft.buildingCondition?.windows)));
    add('buildingConditionBasement', hasValue(buildingConditionRating(draft.buildingCondition?.basement)));
    add('buildingConditionElectric', hasValue(buildingConditionRating(draft.buildingCondition?.electric)));
    add('buildingConditionSanitary', hasValue(buildingConditionRating(draft.buildingCondition?.sanitary)));
    add('buildingConditionInterior', hasValue(buildingConditionRating(draft.buildingCondition?.interior)));
    add('buildingConditionOutdoor', hasValue(buildingConditionRating(draft.buildingCondition?.outdoor)));
    add('knownMajorMaintenanceOrSpecialAssessments', draft.knownMajorMaintenanceOrSpecialAssessments === true || draft.knownMajorMaintenanceOrSpecialAssessments === false);
    if (draft.knownMajorMaintenanceOrSpecialAssessments === true) {
      add('knownMajorMaintenanceOrSpecialAssessmentsDescription', hasValue(draft.knownMajorMaintenanceOrSpecialAssessmentsDescription));
    }
    add('moistureDamageStatus', hasValue(draft.moistureDamageStatus));
    if (draft.moistureDamageStatus === 'MINOR' || draft.moistureDamageStatus === 'SIGNIFICANT') {
      add('moistureDamageDescription', hasValue(draft.moistureDamageDescription));
    }
    add('accessibilityAssessment', hasValue(draft.accessibilityAssessment));
  }

  if (step === 5) {
    checked.push(...requiredDocumentFieldKeys(draft));
    fields.push(...missingRequiredDocumentFields(draft));
  }

  const valid = fields.length === 0;
  return {
    valid,
    fields,
    checked,
    message: valid ? '' : validationMessageFor(step, fields)
  };
}

function validateCaseDraft(draft) {
  const allFields = [];
  let firstInvalidStep = 5;
  for (const currentStep of [1, 2, 3, 4, 5]) {
    const result = validateCaseStep(currentStep, draft);
    if (!result.valid) {
      if (!allFields.length) firstInvalidStep = currentStep;
      allFields.push(...result.fields);
    }
  }
  if (allFields.length) {
    const labels = allFields.map((field) => validationFieldLabels[field] || field);
    return {
      valid: false,
      fields: allFields,
      step: firstInvalidStep,
      message: `Bitte ergänzen Sie folgende Pflichtfelder: ${labels.join(', ')}.`
    };
  }
  return { valid: true, fields: [], step: 5, message: '' };
}

function validateForNavigation(step, draft, options = {}) {
  return options.allowIncomplete ? { valid: true, fields: [], message: '' } : validateCaseStep(step, draft);
}

function validateForDraftSave(_draft, _options = {}) {
  return { valid: true, fields: [], message: '' };
}

function validateForSubmit(draft) {
  return validateCaseDraft(draft);
}

// =====================================================================
// SCREEN 1 — MAKLER-DASHBOARD
// =====================================================================
const getBrokerNextStep = (item) => {
  if (item.kind === 'lead') return 'Lead prüfen';
  if (item.followUp || item.status === 'DATA_INCOMPLETE') return 'Unterlagen anfordern';
  if (['APPROVED', 'SENT', 'INDICATIVE_OFFER_SENT'].includes(item.status)) return 'UVA nachfassen';
  if (item.status === 'OFFER_ACCEPTED') return 'Gutachten abwarten';
  if (['EXPERT_OPINION_ORDERED', 'EXPERT_OPINION_RECEIVED'].includes(item.status)) return 'Gutachten / VA verfolgen';
  if (['BINDING_OFFER_SENT', 'BINDING_OFFER_ACCEPTED'].includes(item.status)) return 'VA nachfassen';
  if (item.status === 'DRAFT') return 'Entwurf vervollständigen';
  if (['SUBMITTED', 'VALUATION_PENDING', 'VALUATED'].includes(item.status)) return 'Bewertung abwarten';
  if (['OFFER_CALCULATED', 'OFFER_DRAFTED', 'INTERNAL_REVIEW'].includes(item.status)) return 'Prüfung beobachten';
  if (['PURCHASE_STARTED', 'NOTARY_APPOINTMENT', 'PURCHASED'].includes(item.status)) return 'Notarprozess verfolgen';
  if (item.status === 'REJECTED') return 'Ablehnungsgrund ansehen';
  return 'Fall öffnen';
};

const brokerBucketKeys = ['new-leads', 'missing-documents', 'follow-up-offers'];
const brokerLeadStatuses = ['ASSIGNED', 'ASSIGNED_TO_PARTNER', 'CONTACTED', 'PARTNER_CONTACT_PENDING'];
const brokerMissingDocumentStatuses = ['DATA_INCOMPLETE'];
const brokerOfferFollowUpStatuses = ['APPROVED', 'SENT', 'INDICATIVE_OFFER_SENT', 'BINDING_OFFER_SENT'];
const brokerDashboardStatuses = [
  'SUBMITTED',
  'DATA_INCOMPLETE',
  'VALUATION_PENDING',
  'VALUATED',
  'OFFER_CALCULATED',
  'OFFER_DRAFTED',
  'INTERNAL_REVIEW',
  'APPROVED',
  'SENT',
  'INDICATIVE_OFFER_SENT',
  'OFFER_ACCEPTED',
  'EXPERT_OPINION_ORDERED',
  'EXPERT_OPINION_RECEIVED',
  'BINDING_OFFER_SENT',
  'BINDING_OFFER_ACCEPTED',
  'PURCHASE_STARTED',
  'NOTARY_APPOINTMENT',
];

function readBrokerBucketFromUrl() {
  if (typeof window === 'undefined') return '';
  const bucket = new URLSearchParams(window.location.search).get('bucket');
  return brokerBucketKeys.includes(bucket) ? bucket : '';
}

function writeBrokerBucketToUrl(bucket) {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  params.delete('case');
  params.delete('caseId');
  params.delete('tab');
  params.delete('returnTab');
  if (bucket) params.set('bucket', bucket);
  else params.delete('bucket');
  const query = params.toString();
  window.history.pushState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
}

function brokerGreeting(user = {}) {
  const firstName = splitProfileName(user).firstName;
  return firstName ? `Hallo ${firstName}` : 'Hallo';
}

const BrokerWorkBuckets = ({ buckets, activeBucket, onSelect }) => (
  <div className="priority-action-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, marginBottom: 24 }}>
    {buckets.map((bucket) => {
      const active = activeBucket === bucket.key;
      return (
        <button
          key={bucket.key}
          onClick={() => onSelect(active ? '' : bucket.key)}
          style={{
            background: active ? theme.aubergine : 'white',
            border: `1px solid ${active ? theme.aubergine : theme.borderSoft}`,
            borderRadius: 8,
            padding: '18px 18px 16px',
            textAlign: 'left',
            minHeight: 154,
            cursor: 'pointer',
            boxShadow: active ? '0 12px 28px rgba(68,0,92,0.14)' : 'none',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: active ? theme.gold : theme.oliv, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{bucket.title}</div>
            <bucket.icon size={17} style={{ color: active ? theme.gold : `${theme.aubergine}77`, marginTop: 1 }} />
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1, color: active ? 'white' : theme.aubergine, marginBottom: 9 }}>{bucket.count}</div>
          <div style={{ fontSize: 12.5, color: active ? 'rgba(255,255,255,0.82)' : `${theme.ink}99`, lineHeight: 1.45, flex: 1 }}>{bucket.description}</div>
          <div style={{ marginTop: 14, color: active ? theme.gold : theme.aubergine, fontSize: 12.5, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            {bucket.action} <ChevronRight size={13} />
          </div>
        </button>
      );
    })}
  </div>
);

const BrokerDashboardSearch = ({ value, onChange }) => (
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

const BrokerWorklist = ({ items, activeBucket, totalCount, onOpenCase, onOpenLeads, onShowAllCases }) => (
  <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, overflow: 'hidden' }}>
    <div className="lead-table-scroll" style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: theme.mintLight }}>
            {['Fallnummer', 'Herkunft', 'Kunde', 'Objekt', 'Status', 'Nächster Schritt', 'Letzte Aktivität', ''].map((h, i) => (
              <th key={i} style={{ textAlign: 'left', padding: '9px 16px', fontSize: 11, fontWeight: 700, color: theme.oliv, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ padding: 28, color: `${theme.ink}88`, fontSize: 13 }}>{activeBucket ? 'Keine Vorgänge in diesem Arbeitskorb.' : 'Keine passenden aktiven Fälle gefunden.'}</td>
            </tr>
          ) : items.map((item, index) => {
            const open = () => item.kind === 'lead' ? onOpenLeads() : onOpenCase(item.propertyId || item.id, item.tab || 'kunde');
            return (
              <tr key={`${item.kind || 'case'}-${item.propertyId || item.id}`} onClick={open} style={{ borderTop: index ? `1px solid ${theme.borderSoft}` : 'none', cursor: 'pointer' }}>
                <td style={{ padding: '12px 16px', fontFamily: 'ui-monospace, "SF Mono", monospace', fontSize: 12, color: theme.aubergine, fontWeight: 700 }}>{item.id}</td>
                <td style={{ padding: '12px 16px', color: `${theme.ink}99`, fontSize: 12 }}>{item.sourceLabel || (item.kind === 'lead' ? 'Lead' : 'Partner')}</td>
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
    {totalCount > items.length && (
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${theme.borderSoft}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 12.5, color: `${theme.ink}88` }}>{totalCount - items.length} weitere Vorgänge vorhanden.</span>
        <button onClick={onShowAllCases} style={{ background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine, fontSize: 12.5, fontWeight: 800, padding: '7px 11px', borderRadius: 5, cursor: 'pointer' }}>
          Alle Fälle anzeigen
        </button>
      </div>
    )}
  </div>
);

const BrokerDashboard = ({ cases = mockCases, leads = [], user = {}, onOpenCase, onNewCase, onOpenLeads, onShowAllCases }) => {
  const [search, setSearch] = useState('');
  const [activeBucket, setActiveBucket] = useState(() => readBrokerBucketFromUrl());
  const dashboardStatuses = brokerDashboardStatuses;
  const hasDashboardCases = cases.some((item) => item.followUp || dashboardStatuses.includes(item.status));
  const dashboardCases = hasDashboardCases ? cases : mockCases;
  const assignedLeads = leads.filter((lead) => brokerLeadStatuses.includes(lead.status));
  const followUpCases = dashboardCases.filter((item) => item.followUp || brokerMissingDocumentStatuses.includes(item.status));
  const activeCases = dashboardCases.filter((item) => dashboardStatuses.includes(item.status));
  const offerCases = dashboardCases.filter((item) => brokerOfferFollowUpStatuses.includes(item.status));
  const changeBucket = (bucket) => {
    setActiveBucket(bucket);
    writeBrokerBucketToUrl(bucket);
  };
  const activeLeadRows = assignedLeads.map((lead) => ({
    kind: 'lead',
    id: lead.leadNumber,
    kunde: leadDisplayName(lead),
    sourceLabel: 'Lead',
    objekt: `${propertyTypeLabel(lead.propertyType)} ${lead.city || ''}`.trim(),
    status: lead.status,
    nextStep: 'Lead prüfen',
    vor: dateLabel(lead.updatedAt || lead.createdAt),
    priority: 4,
  }));
  const activeCaseRows = activeCases.map((item) => ({
    ...item,
    kind: 'case',
    tab: item.followUp || item.status === 'DATA_INCOMPLETE'
      ? 'doks'
      : ['APPROVED', 'SENT', 'INDICATIVE_OFFER_SENT', 'BINDING_OFFER_SENT'].includes(item.status)
        ? 'indag'
        : 'kunde',
    nextStep: getBrokerNextStep(item),
    priority: item.followUp || item.status === 'DATA_INCOMPLETE'
      ? 1
      : brokerOfferFollowUpStatuses.includes(item.status)
        ? 3
        : 4,
  }));
  const buckets = [
    {
      key: 'new-leads',
      title: 'Neue Leads',
      count: activeLeadRows.length,
      description: 'Neue Anfragen prüfen und bei Interesse als Kundenfall übernehmen.',
      action: 'Leads prüfen',
      icon: TrendingUp,
    },
    {
      key: 'missing-documents',
      title: 'Rückfragen / fehlende Unterlagen',
      count: followUpCases.length,
      description: 'Offene Rückfragen, fehlende Pflichtunterlagen oder Wiedervorlagen bearbeiten.',
      action: 'Unterlagen anfordern',
      icon: AlertCircle,
    },
    {
      key: 'follow-up-offers',
      title: 'Angebote nachfassen',
      count: offerCases.length,
      description: 'Freigegebene oder versendete Angebote beim Kunden nachhalten.',
      action: 'Angebote nachfassen',
      icon: Send,
    },
  ];
  const bucketTitles = {
    'new-leads': 'Neue Leads',
    'missing-documents': 'Rückfragen / fehlende Unterlagen',
    'follow-up-offers': 'Angebote nachfassen',
  };
  const rowsByBucket = {
    'new-leads': activeLeadRows,
    'missing-documents': activeCaseRows.filter((item) => item.followUp || brokerMissingDocumentStatuses.includes(item.status)),
    'follow-up-offers': activeCaseRows.filter((item) => brokerOfferFollowUpStatuses.includes(item.status)),
  };
  const normalizedSearch = search.trim().toLowerCase();
  const baseRows = activeBucket ? (rowsByBucket[activeBucket] || []) : [...activeCaseRows, ...activeLeadRows];
  const filteredRows = baseRows
    .filter((item) => !normalizedSearch || [item.id, item.kunde, item.objekt, item.status, item.nextStep].some((value) => String(value || '').toLowerCase().includes(normalizedSearch)))
    .sort((a, b) => a.priority - b.priority || String(b.vor || '').localeCompare(String(a.vor || ''), 'de'));
  const tableItems = filteredRows.slice(0, 7);
  const tableTitle = activeBucket ? bucketTitles[activeBucket] : 'Aktive Fälle';

  return (
    <div style={{ padding: '22px 28px 28px' }}>
      <div className="broker-dashboard-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>{brokerGreeting(user)}</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: theme.aubergine, margin: 0, letterSpacing: '-0.01em' }}>Was steht heute an?</h1>
        </div>
        <button onClick={onNewCase} style={{ background: theme.aubergine, color: 'white', border: 'none', padding: '10px 18px', borderRadius: 6, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <Plus size={15} /> Neukunde anlegen
        </button>
      </div>

      <BrokerWorkBuckets buckets={buckets} activeBucket={activeBucket} onSelect={changeBucket} />

      <div style={{ marginTop: 2 }}>
        <div className="active-cases-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: theme.aubergine, margin: 0 }}>{tableTitle}</h2>
            <div style={{ fontSize: 12.5, color: `${theme.ink}88`, marginTop: 3 }}>Handlungsbedarf zuerst, maximal sieben Vorgänge.</div>
          </div>
          <BrokerDashboardSearch value={search} onChange={setSearch} />
        </div>
        <BrokerWorklist
          items={tableItems}
          activeBucket={activeBucket}
          totalCount={filteredRows.length}
          onOpenCase={onOpenCase}
          onOpenLeads={onOpenLeads}
          onShowAllCases={onShowAllCases}
        />
      </div>
    </div>
  );
};

// =====================================================================
// SCREEN 2 — ADMIN-DASHBOARD
// =====================================================================
const adminBucketKeys = ['new-leads', 'new-submissions', 'acquisition-process', 'other'];
const adminNewSubmissionStatuses = ['SUBMITTED', 'DATA_INCOMPLETE', 'INTERNAL_REVIEW'];
const adminAcquisitionStatuses = [
  'VALUATION_PENDING',
  'VALUATED',
  'OFFER_CALCULATED',
  'OFFER_DRAFTED',
  'APPROVED',
  'SENT',
  'INDICATIVE_OFFER_SENT',
  'OFFER_ACCEPTED',
  'EXPERT_OPINION_ORDERED',
  'EXPERT_OPINION_RECEIVED',
  'BINDING_OFFER_SENT',
  'BINDING_OFFER_ACCEPTED',
  'PURCHASE_STARTED',
  'NOTARY_APPOINTMENT',
  'PURCHASED',
];
const adminOtherStatuses = ['IN_PORTFOLIO', 'APPOINTMENT_SCHEDULED', 'WON', 'SOLD'];
const adminLeadStatuses = ['NEW', 'IN_REVIEW', 'QUALIFIED', 'ASSIGNED', 'ASSIGNED_TO_PARTNER', 'CONTACTED', 'PARTNER_CONTACT_PENDING'];

function readAdminBucketFromUrl() {
  if (typeof window === 'undefined') return '';
  const bucket = new URLSearchParams(window.location.search).get('bucket');
  return adminBucketKeys.includes(bucket) ? bucket : '';
}

function writeAdminBucketToUrl(bucket) {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  params.delete('case');
  params.delete('caseId');
  params.delete('tab');
  params.delete('returnTab');
  if (bucket) params.set('bucket', bucket);
  else params.delete('bucket');
  const query = params.toString();
  window.history.pushState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
}

function dateRank(value) {
  if (!value) return 5;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 5;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  if (date < today) return 0;
  if (date.getTime() === today.getTime()) return 1;
  return 4;
}

function adminCaseDueDate(item) {
  const property = item.raw?.property || {};
  return property.followUpDueAt
    || property.notaryAppointmentAt
    || property.nextPortfolioReviewAt
    || property.portfolioTasks?.nextAppointmentDate
    || property.exitProcess?.followUpAt
    || property.lastActivityAt;
}

function adminCaseNextStep(item) {
  const property = item.raw?.property || {};
  if (item.followUp || item.status === 'DATA_INCOMPLETE') return 'Rückfrage klären';
  if (item.status === 'SUBMITTED') return 'Einreichung prüfen';
  if (item.status === 'INTERNAL_REVIEW') return 'Interne Entscheidung treffen';
  if (['VALUATION_PENDING', 'VALUATED'].includes(item.status)) return 'Bewertung prüfen';
  if (['OFFER_CALCULATED', 'OFFER_DRAFTED', 'APPROVED', 'SENT', 'INDICATIVE_OFFER_SENT'].includes(item.status)) return 'Unverbindliches Angebot bearbeiten';
  if (item.status === 'OFFER_ACCEPTED') return 'Gutachten beauftragen';
  if (item.status === 'EXPERT_OPINION_ORDERED') return 'Gutachteneingang erfassen';
  if (item.status === 'EXPERT_OPINION_RECEIVED') return 'Verbindliches Angebot kalkulieren';
  if (item.status === 'BINDING_OFFER_SENT') return 'VA nachfassen';
  if (item.status === 'BINDING_OFFER_ACCEPTED') return 'Notartermin vereinbaren';
  if (['PURCHASE_STARTED', 'NOTARY_APPOINTMENT', 'PURCHASED'].includes(item.status)) return 'Kaufvertrag / Vollzug bearbeiten';
  if (item.status === 'IN_PORTFOLIO') return 'Bestandsverwaltung prüfen';
  if (item.status === 'SOLD') return 'Verkauf prüfen';
  if (property.exitProcess) return 'Verkaufsprozess prüfen';
  return 'Vorgang öffnen';
}

function adminCaseTab(item) {
  if (['SUBMITTED', 'DATA_INCOMPLETE', 'INTERNAL_REVIEW'].includes(item.status)) return 'kunde';
  if (['VALUATION_PENDING', 'VALUATED', 'OFFER_CALCULATED', 'OFFER_DRAFTED', 'APPROVED', 'SENT', 'INDICATIVE_OFFER_SENT', 'OFFER_ACCEPTED', 'EXPERT_OPINION_ORDERED', 'EXPERT_OPINION_RECEIVED'].includes(item.status)) return 'indag';
  if (['BINDING_OFFER_SENT', 'BINDING_OFFER_ACCEPTED'].includes(item.status)) return 'verbag';
  if (['PURCHASE_STARTED', 'NOTARY_APPOINTMENT', 'PURCHASED'].includes(item.status)) return 'kvabwicklung';
  if (item.status === 'SOLD') return 'verwertung';
  if (item.raw?.property?.exitProcess) return 'verwertung';
  if (['IN_PORTFOLIO', 'WON'].includes(item.status)) return 'bestand';
  return 'kunde';
}

function adminWarningBadges(item) {
  const badges = [];
  const dueRank = dateRank(adminCaseDueDate(item));
  if (item.followUp) badges.push('Rückfrage offen');
  if (item.status === 'DATA_INCOMPLETE') badges.push('Unterlagen fehlen');
  if (dueRank === 0) badges.push('überfällig');
  if (dueRank === 1) badges.push('Wiedervorlage heute');
  return badges;
}

function leadNextStep(lead) {
  if (lead.status === 'NEW') return 'Lead qualifizieren';
  if (['IN_REVIEW', 'QUALIFIED'].includes(lead.status)) return 'Verantwortlichen zuweisen';
  if (['ASSIGNED', 'ASSIGNED_TO_PARTNER'].includes(lead.status)) return 'Kontakt aufnehmen';
  if (['CONTACTED', 'PARTNER_CONTACT_PENDING'].includes(lead.status)) return 'In Kundenfall umwandeln';
  return 'Lead prüfen';
}

function leadAssigneeLabel(lead) {
  if (lead.assignedAdvisorName) return lead.assignedAdvisorName;
  if (lead.assignedPartnerName) return lead.assignedPartnerName;
  if (lead.assignedPartnerId) return 'Partner zugewiesen';
  if (lead.assignedAdvisorUserId) return 'Intern zugewiesen';
  return 'nicht zugewiesen';
}

function adminWorkRows({ cases, leads, bucket }) {
  const activeBucket = bucket || 'new-submissions';
  const leadRows = leads
    .filter((lead) => activeBucket === 'new-leads' && adminLeadStatuses.includes(lead.status))
    .map((lead) => ({
      kind: 'lead',
      id: lead.id,
      displayId: lead.leadNumber || lead.id,
      customer: leadDisplayName(lead),
      origin: lead.source === 'homepage' ? 'Homepage' : lead.source || 'Lead',
      responsible: leadAssigneeLabel(lead),
      object: `${propertyTypeLabel(lead.propertyType)} ${lead.city || ''}`.trim() || '-',
      nextStep: leadNextStep(lead),
      status: lead.status,
      lastActivity: formatDate(lead.updatedAt || lead.createdAt),
      sortRank: lead.status === 'NEW' ? 2 : 4,
    }));

  const caseRows = cases
    .filter((item) => {
      if (activeBucket === 'new-submissions') return adminNewSubmissionStatuses.includes(item.status);
      if (activeBucket === 'acquisition-process') return adminAcquisitionStatuses.includes(item.status);
      if (activeBucket === 'other') return adminOtherStatuses.includes(item.status) || item.raw?.property?.exitProcess;
      return false;
    })
    .map((item) => {
      const due = adminCaseDueDate(item);
      return {
        kind: 'case',
        id: item.propertyId || item.id,
        displayId: item.id,
        customer: `${item.kunde}${item.alter ? ` (${item.alter})` : ''}`,
        origin: item.sourceLabel || getCaseSourceLabel(item.raw?.property?.caseSource) || 'Partner',
        responsible: item.partner || item.raw?.property?.assignedAdvisor?.name || 'intern',
        object: item.objekt,
        nextStep: adminCaseNextStep(item),
        status: item.status,
        lastActivity: item.vor || formatDate(item.raw?.property?.lastActivityAt || item.raw?.property?.updatedAt),
        tab: adminCaseTab(item),
        warnings: adminWarningBadges(item),
        sortRank: Math.min(dateRank(due), item.status === 'SUBMITTED' ? 2 : item.followUp ? 3 : 4),
        lastActivityValue: item.raw?.property?.lastActivityAt || item.raw?.property?.updatedAt,
      };
    });

  return [...leadRows, ...caseRows].sort((a, b) => {
    if (a.sortRank !== b.sortRank) return a.sortRank - b.sortRank;
    return new Date(b.lastActivityValue || 0).getTime() - new Date(a.lastActivityValue || 0).getTime();
  });
}

const AdminWorkBuckets = ({ buckets, activeBucket, onSelect, style = {} }) => (
  <div className="lead-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(170px, 1fr))', gap: 14, marginBottom: 18, ...style }}>
    {buckets.map((bucket) => {
      const active = activeBucket === bucket.key;
      return (
        <button
          key={bucket.key}
          onClick={() => onSelect(bucket.key)}
          style={{
            textAlign: 'left',
            background: active ? theme.aubergine : 'white',
            color: active ? 'white' : theme.ink,
            border: `1px solid ${active ? theme.aubergine : theme.borderSoft}`,
            borderRadius: 10,
            padding: '14px 16px',
            cursor: 'pointer',
            minHeight: 104,
            boxShadow: active ? '0 12px 28px rgba(68,0,92,0.14)' : 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 10.5, color: active ? theme.gold : theme.oliv, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{bucket.title}</span>
            <bucket.icon size={15} style={{ color: active ? theme.gold : `${theme.aubergine}77` }} />
          </div>
          <div style={{ fontSize: 28, lineHeight: 1, fontWeight: 800, color: active ? 'white' : theme.aubergine }}>{bucket.count}</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: active ? theme.gold : theme.aubergine, marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            {bucket.action} <ChevronRight size={13} />
          </div>
        </button>
      );
    })}
  </div>
);

const AdminWorklist = ({ title, rows, activeBucket, onOpenCase, onOpenLeads, style = {} }) => (
  <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, overflow: 'hidden', ...style }}>
    <div style={{ padding: '13px 16px', borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div>
        <span style={{ fontSize: 15, fontWeight: 700, color: theme.aubergine }}>{title}</span>
        <div style={{ fontSize: 11.5, color: `${theme.ink}88`, marginTop: 3 }}>Arbeitsliste nach Handlungsbedarf sortiert. Erst hier öffnest du konkrete Vorgänge.</div>
      </div>
      <span style={{ fontSize: 12, color: `${theme.ink}88`, fontWeight: 700 }}>{rows.length} Vorgänge</span>
    </div>
    {rows.length === 0 ? (
      <div style={{ padding: 28, color: `${theme.ink}88`, fontSize: 13 }}>Keine Vorgänge in diesem Arbeitskorb.</div>
    ) : (
      <div style={{ overflowX: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '13%' }} />
            <col style={{ width: '17%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '7%' }} />
          </colgroup>
          <thead>
            <tr style={{ background: theme.mintLight }}>
              {['Fall / Lead', 'Kunde', 'Herkunft', 'Objekt', 'Nächster Schritt', 'Status', 'Öffnen'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontSize: 10.5, fontWeight: 800, color: theme.oliv, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.kind}-${row.id}`} style={{ borderTop: `1px solid ${theme.borderSoft}` }}>
                <td style={{ padding: '11px 10px', fontFamily: 'ui-monospace, monospace', fontSize: 11.5, color: theme.aubergine, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.displayId}</td>
                <td style={{ padding: '11px 10px', color: theme.ink, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.customer}</td>
                <td style={{ padding: '11px 10px', color: `${theme.ink}99`, fontSize: 12, overflow: 'hidden' }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.origin}</div>
                  <div style={{ color: `${theme.ink}77`, fontSize: 11, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.responsible}</div>
                </td>
                <td style={{ padding: '11px 10px', color: `${theme.ink}cc`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.object}</td>
                <td style={{ padding: '11px 10px', color: theme.ink, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 650, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.nextStep}</div>
                  <div style={{ fontSize: 11, color: `${theme.ink}77`, marginTop: 2 }}>{row.lastActivity}</div>
                  {!!row.warnings?.length && (
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 5 }}>
                      {row.warnings.map((badge) => (
                        <span key={badge} style={{ background: badge === 'überfällig' ? '#9B2C2C14' : theme.goldSoft, color: badge === 'überfällig' ? '#9B2C2C' : '#A87308', borderRadius: 12, padding: '2px 7px', fontSize: 10.5, fontWeight: 800 }}>{badge}</span>
                      ))}
                    </div>
                  )}
                </td>
                <td style={{ padding: '11px 10px' }}>{row.kind === 'lead' ? <LeadStatusBadge status={row.status} /> : <StatusBadge status={row.status} />}</td>
                <td style={{ padding: '11px 10px', textAlign: 'right' }}>
                  <button
                    onClick={() => row.kind === 'lead' ? onOpenLeads?.() : onOpenCase(row.id, row.tab || 'kunde')}
                    style={{ background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine, borderRadius: 5, padding: '6px 8px', fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <ChevronRight size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const UrgentTasksPanel = ({ cases, onOpenCase }) => {
  const tasks = cases
    .filter((item) => item.followUp || item.status === 'DATA_INCOMPLETE' || dateRank(adminCaseDueDate(item)) <= 1)
    .slice(0, 5);
  return (
    <div style={{ background: 'white', border: `1px solid ${theme.borderSoft}`, borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px', borderBottom: `1px solid ${theme.borderSoft}`, background: theme.goldSoft, display: 'flex', alignItems: 'center', gap: 8 }}>
        <AlertCircle size={15} style={{ color: theme.gold }} />
        <span style={{ fontSize: 14, fontWeight: 800, color: theme.aubergine }}>Dringende Aufgaben</span>
      </div>
      {tasks.length === 0 ? (
        <div style={{ padding: 14, fontSize: 12.5, color: `${theme.ink}88` }}>Keine dringenden Aufgaben.</div>
      ) : tasks.map((item) => (
        <button key={item.propertyId || item.id} onClick={() => onOpenCase(item.propertyId || item.id, adminCaseTab(item))} style={{ width: '100%', textAlign: 'left', background: 'white', border: 'none', borderTop: `1px solid ${theme.borderSoft}`, padding: '11px 14px', cursor: 'pointer' }}>
          <div style={{ fontSize: 12.5, color: theme.ink, fontWeight: 750 }}>{item.kunde}</div>
          <div style={{ fontSize: 11.5, color: `${theme.ink}88`, marginTop: 3 }}>{adminCaseNextStep(item)}</div>
        </button>
      ))}
    </div>
  );
};

const AdminDashboard = ({ cases = mockCases, leads = [], onOpenCase, onNewCase, onNewLead, onOpenLeads, canCreateCase = false }) => {
  const [activeBucket, setActiveBucket] = useState(readAdminBucketFromUrl);
  const setBucket = (bucket) => {
    setActiveBucket(bucket);
    writeAdminBucketToUrl(bucket);
  };
  const buckets = [
    {
      key: 'new-leads',
      title: 'Neue Leads',
      count: leads.filter((lead) => adminLeadStatuses.includes(lead.status)).length,
      description: 'Homepage-Leads, Kontaktanfragen und unqualifizierte Interessenten.',
      action: 'Leads prüfen',
      icon: TrendingUp,
    },
    {
      key: 'new-submissions',
      title: 'Neue Einreichungen',
      count: cases.filter((item) => adminNewSubmissionStatuses.includes(item.status)).length,
      description: 'Eingereichte Partner- und interne Fälle für die Erstprüfung.',
      action: 'Einreichungen prüfen',
      icon: FolderOpen,
    },
    {
      key: 'acquisition-process',
      title: 'Im Ankaufsprozess',
      count: cases.filter((item) => adminAcquisitionStatuses.includes(item.status)).length,
      description: 'Bewertung, Gutachten, Angebote, Notar und Vertragsvollzug.',
      action: 'Ankäufe bearbeiten',
      icon: Briefcase,
    },
    {
      key: 'other',
      title: 'Sonstiges',
      count: cases.filter((item) => adminOtherStatuses.includes(item.status) || item.raw?.property?.exitProcess).length,
      description: 'Bestand, Bewohneranfragen, Reparaturen, Abrechnungen und laufende Objektverwaltung.',
      action: 'Themen öffnen',
      icon: Archive,
    },
  ];
  const activeBucketDefinition = buckets.find((bucket) => bucket.key === activeBucket);
  const tableTitle = activeBucketDefinition?.title || 'Neueste Einreichungen';
  const rows = adminWorkRows({ cases, leads, bucket: activeBucket });

  return (
    <div style={{ padding: '20px 28px' }}>
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>Intern · CRM</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: theme.aubergine, margin: 0, letterSpacing: '-0.01em' }}>Ankaufsübersicht</h1>
          <div style={{ fontSize: 12.5, color: `${theme.ink}99`, marginTop: 5 }}>Leads, Einreichungen und laufende Ankäufe nach Handlungsbedarf.</div>
        </div>
      </div>

      <div className="admin-dashboard-top-grid" style={{ marginBottom: 18 }}>
        <AdminWorkBuckets buckets={buckets} activeBucket={activeBucket} onSelect={setBucket} style={{ marginBottom: 0 }} />
      </div>

      <div className="admin-dashboard-main-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(390px, 0.74fr)', gap: 16, alignItems: 'stretch' }}>
        <AdminWorklist
          title={tableTitle}
          rows={rows}
          activeBucket={activeBucket}
          onOpenCase={onOpenCase}
          onOpenLeads={onOpenLeads}
          style={{ height: '100%' }}
        />
        <PropertyMapWidget fillHeight height={288} />
      </div>

      <div style={{ marginTop: 16 }}>
        <UrgentTasksPanel cases={cases} onOpenCase={onOpenCase} />
      </div>
    </div>
  );
};

const CaseMenuScreen = ({ screen, cases = [], onOpenCase, role }) => {
  const filteredCases = filterCasesForScreen(cases, screen);
  const title = menuScreenTitle(screen);
  const subtitle = {
    drafts: 'Entwürfe, die noch nicht eingereicht wurden.',
    in_progress: 'Alle aktiven Vorgänge von Einreichung bis Freigabe.',
    portfolio: 'Fälle im Bestand oder in der Kundenphase nach Versand.',
    sold: 'Weiterverkaufte oder final abgeschlossene Objekte.',
    rejected: 'Abgelehnte Vorgänge mit dokumentiertem Grund für den Makler.',
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
        showRejection={screen === 'rejected'}
        statusForCase={screen === 'sold' ? soldScreenStatus : undefined}
      />
    </div>
  );
};

const acquisitionStages = [
  {
    title: 'UVA angenommen',
    statuses: ['OFFER_ACCEPTED'],
    icon: CheckCircle2,
    tone: '#5B8C2B',
    text: 'Kunde hat das unverbindliche Angebot bestätigt. Gutachten beauftragen.',
  },
  {
    title: 'Gutachten',
    statuses: ['EXPERT_OPINION_ORDERED', 'EXPERT_OPINION_RECEIVED'],
    icon: Briefcase,
    tone: theme.aubergineSoft,
    text: 'Gutachten ist beauftragt oder bereits eingegangen.',
  },
  {
    title: 'VA / Notartermin',
    statuses: ['BINDING_OFFER_SENT', 'BINDING_OFFER_ACCEPTED', 'NOTARY_APPOINTMENT'],
    icon: Calendar,
    tone: theme.oliv,
    text: 'Verbindliches Angebot und Notartermin laufen.',
  },
  {
    title: 'Kaufvertrag',
    statuses: ['NOTARY_APPOINTMENT'],
    icon: Calendar,
    tone: theme.oliv,
    text: 'Kaufvertrag steht vor Abschluss.',
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
  OFFER_ACCEPTED: 'Gutachten beauftragen',
  EXPERT_OPINION_ORDERED: 'Gutachteneingang dokumentieren',
  EXPERT_OPINION_RECEIVED: 'VA abgeben',
  BINDING_OFFER_SENT: 'VA nachfassen',
  BINDING_OFFER_ACCEPTED: 'Notartermin vereinbaren',
  NOTARY_APPOINTMENT: 'Kaufvertrag abschließen',
  IN_PORTFOLIO: 'Bestandsdaten prüfen',
  WON: 'Bestandsdaten prüfen',
};

function portfolioCompletion(property = {}) {
  const checks = [
    Boolean(property.purchaseContractNumber),
    Boolean(property.purchaseContractSignedAt || property.purchasedAt),
    Boolean(property.purchasePrice),
    Boolean(property.payoutPaidAt),
    Boolean(property.ownershipTransferAt),
    property.desiredModel === 'sale_and_leaseback' ? Boolean(property.monthlyRent && property.rentStartAt) : Boolean(property.residentialRightStartAt || property.residentialRightEndAt),
    Boolean(property.maintenancePlan?.nextReviewDate || property.portfolioTasks?.nextAppointmentDate),
  ];
  const done = checks.filter(Boolean).length;
  return { done, total: checks.length, percent: Math.round((done / checks.length) * 100) };
}

function portfolioFormFromProperty(property = {}) {
  return {
    purchaseContractNumber: property.purchaseContractNumber || '',
    purchaseContractSignedAt: dateInputValue(property.purchaseContractSignedAt || property.purchasedAt),
    purchasePrice: property.purchasePrice || '',
    payoutPaidAt: dateInputValue(property.payoutPaidAt),
    ownershipTransferAt: dateInputValue(property.ownershipTransferAt),
    landRegisterEntryAt: dateInputValue(property.landRegisterEntryAt),
    monthlyRent: property.monthlyRent || '',
    rentStartAt: dateInputValue(property.rentStartAt),
    rentDeposit: property.rentDeposit || '',
    residentialRightStartAt: dateInputValue(property.residentialRightStartAt),
    residentialRightEndAt: dateInputValue(property.residentialRightEndAt),
    residentialRightNotes: property.residentialRightNotes || '',
    notaryAppointmentRequestedAt: dateInputValue(property.notaryAppointmentRequestedAt),
    notaryAppointmentAt: dateInputValue(property.notaryAppointmentAt),
    purchaseContractDraftReceivedAt: dateInputValue(property.purchaseContractDraftReceivedAt),
    purchaseContractDraftReviewedAt: dateInputValue(property.purchaseContractDraftReviewedAt),
    priorityNoticeRegisteredAt: dateInputValue(property.priorityNoticeRegisteredAt),
    purchasePriceDueAt: dateInputValue(property.purchasePriceDueAt),
    purchasePricePaidAt: dateInputValue(property.purchasePricePaidAt || property.payoutPaidAt),
    residentialRightRegisteredAt: dateInputValue(property.residentialRightRegisteredAt || property.landRegisterEntryAt),
    benefitsAndBurdensTransferAt: dateInputValue(property.benefitsAndBurdensTransferAt || property.ownershipTransferAt),
    buildingInsuranceClarified: Boolean(property.buildingInsuranceClarified),
    propertyManagerInformed: Boolean(property.propertyManagerInformed),
    serviceChargeInfoRequested: Boolean(property.serviceChargeInfoRequested),
    propertyTaxInfoAvailable: Boolean(property.propertyTaxInfoAvailable),
    propertyFileComplete: Boolean(property.propertyFileComplete),
    portfolioEnteredAt: dateInputValue(property.portfolioEnteredAt),
    residentStaysInProperty: property.residentStaysInProperty !== false,
    residentName: property.residentName || '',
    usageModel: property.usageModel || (property.desiredModel === 'sale_and_leaseback' ? 'sale_and_leaseback' : 'fixed_residential_right'),
    usageRightStartsAt: dateInputValue(property.usageRightStartsAt || property.residentialRightStartAt || property.rentStartAt),
    usageRightEndsAt: dateInputValue(property.usageRightEndsAt || property.residentialRightEndAt),
    monthlyUsageFee: property.monthlyUsageFee || property.monthlyRent || '',
    residentContactName: property.residentContactName || '',
    residentEmergencyContact: property.residentEmergencyContact || '',
    propertyManagerName: property.propertyManagerName || '',
    buildingInsurance: property.buildingInsurance || '',
    serviceChargeStatus: property.serviceChargeStatus || '',
    repairReportingChannelClarified: Boolean(property.repairReportingChannelClarified),
    conditionDocumentationAvailable: Boolean(property.conditionDocumentationAvailable),
    nextPortfolioReviewAt: dateInputValue(property.nextPortfolioReviewAt),
    maintenanceNextReviewDate: property.maintenancePlan?.nextReviewDate || '',
    maintenanceResponsible: property.maintenancePlan?.responsible || '',
    maintenanceBudget: property.maintenancePlan?.annualBudget || '',
    maintenanceNotes: property.maintenancePlan?.notes || '',
    nextAppointmentDate: property.portfolioTasks?.nextAppointmentDate || '',
    nextAppointmentType: property.portfolioTasks?.nextAppointmentType || '',
    nextAppointmentNote: property.portfolioTasks?.nextAppointmentNote || '',
    portfolioNotes: property.portfolioNotes || '',
  };
}

function exitProcessFormFromProperty(property = {}) {
  const exitProcess = property.exitProcess || {};
  return {
    usageRightEndedAt: dateInputValue(exitProcess.usageRightEndedAt),
    terminationReason: exitProcess.terminationReason || 'move_out',
    terminationProofAvailable: Boolean(exitProcess.terminationProofAvailable),
    relativesOrEstateContact: exitProcess.relativesOrEstateContact || '',
    relativesContactedAt: dateInputValue(exitProcess.relativesContactedAt),
    propertyAccessClarified: Boolean(exitProcess.propertyAccessClarified),
    keyHandoverPlannedAt: dateInputValue(exitProcess.keyHandoverPlannedAt),
    keysReceivedAt: dateInputValue(exitProcess.keysReceivedAt),
    inspectionPlannedAt: dateInputValue(exitProcess.inspectionPlannedAt),
    inspectionCompletedAt: dateInputValue(exitProcess.inspectionCompletedAt),
    postMoveOutConditionReportAvailable: Boolean(exitProcess.postMoveOutConditionReportAvailable),
    clearanceRequired: Boolean(exitProcess.clearanceRequired),
    clearanceOrderedAt: dateInputValue(exitProcess.clearanceOrderedAt),
    clearanceCompletedAt: dateInputValue(exitProcess.clearanceCompletedAt),
    safetyInspectionCompleted: Boolean(exitProcess.safetyInspectionCompleted),
    insuranceCoverageChecked: Boolean(exitProcess.insuranceCoverageChecked),
    repairNeedCaptured: Boolean(exitProcess.repairNeedCaptured),
    salesPreparationStartedAt: dateInputValue(exitProcess.salesPreparationStartedAt),
    brokerMandatedAt: dateInputValue(exitProcess.brokerMandatedAt),
    marketingStartedAt: dateInputValue(exitProcess.marketingStartedAt),
    salePriceIndication: exitProcess.salePriceIndication || '',
    salePriceFinal: exitProcess.salePriceFinal || '',
    salesStatus: exitProcess.salesStatus || 'under_review',
    saleNotarizedAt: dateInputValue(exitProcess.saleNotarizedAt),
    salePriceReceivedAt: dateInputValue(exitProcess.salePriceReceivedAt),
    exitCompletedAt: dateInputValue(exitProcess.exitCompletedAt),
    internalNote: exitProcess.internalNote || '',
    responsibleUserId: exitProcess.responsibleUserId || '',
    followUpAt: dateInputValue(exitProcess.followUpAt),
  };
}

const PortfolioScreen = ({ cases = [], onOpenCase, role }) => {
  const [activeBucket, setActiveBucket] = useState(() => parsePortfolioBucket(''));
  const [quickAction, setQuickAction] = useState('');

  useEffect(() => {
    const syncBucket = () => setActiveBucket(parsePortfolioBucket(''));
    syncBucket();
    window.addEventListener('popstate', syncBucket);
    return () => window.removeEventListener('popstate', syncBucket);
  }, []);

  if (role !== 'admin') {
    return (
      <div style={{ padding: '28px' }}>
        <div style={{ background: 'white', border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '20px 22px', color: theme.ink }}>
          Die interne Bestandsverwaltung ist nur für WohnKapital-Mitarbeiter sichtbar.
        </div>
      </div>
    );
  }

  const portfolioStatuses = ['IN_PORTFOLIO', 'WON'];
  const purchaseProcessingCases = cases.filter((item) => ['BINDING_OFFER_ACCEPTED', 'NOTARY_APPOINTMENT'].includes(item.status));
  const inventoryCases = cases.filter((item) => portfolioStatuses.includes(item.status));
  const contractClosingCases = inventoryCases.filter((item) => {
    const property = item.raw?.property || {};
    return !property.purchasePricePaidAt || !property.residentialRightRegisteredAt || !property.propertyFileComplete || !property.portfolioEnteredAt;
  });
  const saleObjectCases = inventoryCases.filter((item) => {
    const exitProcess = item.raw?.property?.exitProcess || {};
    return Boolean(exitProcess.usageRightEndedAt || exitProcess.salesStatus && exitProcess.salesStatus !== 'under_review');
  });
  const uniqueCases = (items) => Array.from(new Map(items.map((item) => [item.propertyId || item.id, item])).values());
  const purchaseHandlingCases = uniqueCases([...purchaseProcessingCases, ...contractClosingCases]);
  const openCases = uniqueCases([...purchaseHandlingCases, ...inventoryCases, ...saleObjectCases]);

  const bucketDefinitions = [
    {
      key: 'purchase-processing',
      title: 'Kaufvertragsabwicklung',
      description: 'Vom Kaufvertragsabschluss bis zur Kaufpreiszahlung und Grundbucheintragung.',
      action: 'Abwicklung prüfen',
      cases: purchaseHandlingCases,
      icon: Briefcase,
      tone: theme.aubergine,
      tab: 'kvabwicklung',
    },
    {
      key: 'inventory-management',
      title: 'Bestandsverwaltung',
      description: 'Bewohner, Reparaturen, Abrechnungen und laufende Verwaltung.',
      action: 'Bestand prüfen',
      cases: inventoryCases,
      icon: Archive,
      tone: '#5B8C2B',
      tab: 'bestand',
    },
    {
      key: 'sale-objects',
      title: 'Verkaufsprozess',
      description: 'Nach Wohnrechtsende oder Ende des Rückmietverkaufs: Zugang, Vorbereitung, Vermarktung und Verkauf.',
      action: 'Verkauf prüfen',
      cases: saleObjectCases,
      icon: AlertCircle,
      tone: theme.gold,
      tab: 'verwertung',
    },
  ];
  const activeBucketDefinition = bucketDefinitions.find((item) => item.key === activeBucket);
  const phaseForCase = (item) => {
    if (saleObjectCases.some((entry) => (entry.propertyId || entry.id) === (item.propertyId || item.id))) return 'Verkaufsprozess';
    if (purchaseHandlingCases.some((entry) => (entry.propertyId || entry.id) === (item.propertyId || item.id))) return 'Kaufvertragsabwicklung';
    if (inventoryCases.some((entry) => (entry.propertyId || entry.id) === (item.propertyId || item.id))) return 'Bestandsverwaltung';
    return 'Ankauf';
  };
  const targetTabForCase = (item, preferActiveBucket = true) => {
    if (preferActiveBucket && activeBucketDefinition?.tab) return activeBucketDefinition.tab;
    const phase = phaseForCase(item);
    if (phase === 'Kaufvertragsabwicklung') return 'kvabwicklung';
    if (phase === 'Verkaufsprozess') return 'verwertung';
    return 'bestand';
  };
  const dueDateForCase = (item) => {
    const property = item.raw?.property || {};
    return property.nextPortfolioReviewAt
      || property.followUpDueAt
      || property.notaryAppointmentAt
      || property.portfolioTasks?.nextAppointmentDate
      || property.exitProcess?.followUpAt
      || property.lastActivityAt;
  };
  const sortCases = (items) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const rank = (item) => {
      const due = dueDateForCase(item);
      if (!due) return 3;
      const date = new Date(due);
      date.setHours(0, 0, 0, 0);
      if (date < today) return 0;
      if (date.getTime() === today.getTime()) return 1;
      return 2;
    };
    return [...items].sort((a, b) => {
      const rankDiff = rank(a) - rank(b);
      if (rankDiff) return rankDiff;
      const aDate = new Date(dueDateForCase(a) || a.raw?.property?.lastActivityAt || a.raw?.property?.updatedAt || 0).getTime();
      const bDate = new Date(dueDateForCase(b) || b.raw?.property?.lastActivityAt || b.raw?.property?.updatedAt || 0).getTime();
      return aDate - bDate;
    });
  };
  const visibleCases = sortCases(activeBucketDefinition ? activeBucketDefinition.cases : openCases);
  const deadlineCases = sortCases(openCases.filter((item) => dueDateForCase(item))).slice(0, 5);
  const tableTitle = activeBucketDefinition?.title || 'Alle offenen Vorgänge';

  const selectBucket = (bucket) => {
    const nextBucket = normalizePortfolioBucket(bucket, '');
    setActiveBucket(nextBucket);
    updatePortfolioBucketUrl(role, nextBucket, 'push');
  };

  const openCaseFromList = (item, preferActiveBucket = true) => {
    onOpenCase(item.propertyId || item.id, targetTabForCase(item, preferActiveBucket));
  };

  return (
    <div style={{ padding: '20px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20, gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>
            Intern · Ankauf und Bestand
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: theme.aubergine, margin: 0, letterSpacing: '-0.01em' }}>Ankaufs- und Bestandsabwicklung</h1>
          <div style={{ fontSize: 12.5, color: `${theme.ink}99`, marginTop: 5 }}>
            Arbeitskörbe filtern die Vorgangsliste. Der konkrete Fall wird erst aus der Liste geöffnet.
          </div>
        </div>
        {activeBucket && (
          <button onClick={() => selectBucket('')} style={{ background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine, borderRadius: 5, padding: '8px 12px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
            Alle Vorgänge anzeigen
          </button>
        )}
      </div>

      <div className="lead-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(220px, 1fr))', gap: 12, marginBottom: 18 }}>
        {bucketDefinitions.map((bucket) => {
          const active = activeBucket === bucket.key;
          return (
            <button key={bucket.key} onClick={() => selectBucket(bucket.key)} style={{
              background: active ? theme.aubergine : 'white',
              color: active ? 'white' : theme.ink,
              border: `1px solid ${active ? theme.aubergine : theme.borderSoft}`,
              borderRadius: 8,
              padding: '15px 16px',
              textAlign: 'left',
              cursor: 'pointer',
              minHeight: 136,
              boxShadow: active ? '0 12px 28px rgba(68,0,92,0.14)' : 'none',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <bucket.icon size={16} style={{ color: active ? theme.gold : `${theme.aubergine}77` }} />
                <span style={{ fontSize: 24, lineHeight: 1, color: active ? 'white' : theme.aubergine, fontWeight: 800 }}>{bucket.cases.length}</span>
              </div>
              <div style={{ fontSize: 13.5, color: active ? theme.gold : theme.aubergine, fontWeight: 800, marginBottom: 6 }}>{bucket.title}</div>
              <div style={{ fontSize: 12, color: active ? 'rgba(255,255,255,0.82)' : `${theme.ink}99`, lineHeight: 1.45, flex: 1 }}>{bucket.description}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: active ? theme.gold : theme.aubergine, marginTop: 12 }}>{bucket.action}</div>
            </button>
          );
        })}
      </div>

      <div className="portfolio-layout-grid" style={{ display: 'grid', gridTemplateColumns: '1.55fr 0.75fr', gap: 16 }}>
        <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, overflow: 'hidden' }}>
          <div style={{ padding: '13px 16px', borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: theme.aubergine }}>{tableTitle}</span>
            <span style={{ fontSize: 12, color: `${theme.ink}88` }}>{visibleCases.length} Vorgänge</span>
          </div>
          {visibleCases.length === 0 ? (
            <div style={{ padding: 28, color: `${theme.ink}88`, fontSize: 13 }}>
              {activeBucketDefinition ? 'Keine offenen Vorgänge in diesem Arbeitskorb.' : 'Aktuell keine offenen Vorgänge in Ankauf oder Bestand.'}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: theme.mintLight }}>
                  {['Fall', 'Kunde / Bewohner', 'Objekt', ...(!activeBucketDefinition ? ['Phase'] : []), 'Nächster Schritt', 'Frist / Wiedervorlage', 'Status', 'Öffnen'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, fontWeight: 700, color: theme.oliv, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleCases.map((item, index) => {
                  const property = item.raw?.property || {};
                  return (
                    <tr key={item.propertyId || item.id} style={{ borderTop: index ? `1px solid ${theme.borderSoft}` : 'none' }}>
                      <td style={{ padding: '11px 12px', fontFamily: 'ui-monospace, monospace', fontSize: 12, color: theme.aubergine, fontWeight: 700 }}>{item.id}</td>
                      <td style={{ padding: '11px 12px', color: theme.ink, fontWeight: 650 }}>{property.residentName || item.kunde}</td>
                      <td style={{ padding: '11px 12px', color: `${theme.ink}cc` }}>{item.objekt}</td>
                      {!activeBucketDefinition && <td style={{ padding: '11px 12px', color: `${theme.ink}aa`, fontSize: 12.5 }}>{phaseForCase(item)}</td>}
                      <td style={{ padding: '11px 12px', color: theme.ink }}>{nextPortfolioAction[item.status] || (targetTabForCase(item) === 'verwertung' ? 'Verkauf prüfen' : 'Bestandsakte prüfen')}</td>
                      <td style={{ padding: '11px 12px', color: `${theme.ink}99`, fontSize: 12.5 }}>{formatDate(dueDateForCase(item))}</td>
                      <td style={{ padding: '11px 12px' }}><StatusBadge status={item.status} /></td>
                      <td style={{ padding: '11px 12px', textAlign: 'right' }}>
                        <button onClick={() => openCaseFromList(item)} style={{ background: 'transparent', border: `1px solid ${theme.border}`, color: theme.aubergine, borderRadius: 5, padding: '5px 9px', fontSize: 11.5, fontWeight: 800, cursor: 'pointer' }}>
                          Öffnen
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
          <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, overflow: 'hidden' }}>
            <div style={{ padding: '13px 16px', borderBottom: `1px solid ${theme.borderSoft}`, fontSize: 14, fontWeight: 700, color: theme.aubergine }}>Nächste Fristen</div>
            {deadlineCases.length === 0 ? (
              <div style={{ padding: 16, color: `${theme.ink}88`, fontSize: 12.5 }}>Keine offenen Fristen.</div>
            ) : deadlineCases.map((item, index) => (
              <button key={item.propertyId || item.id} onClick={() => openCaseFromList(item, false)} style={{ width: '100%', background: 'white', border: 'none', borderTop: index ? `1px solid ${theme.borderSoft}` : 'none', padding: '11px 16px', textAlign: 'left', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 12.5, color: theme.ink, fontWeight: 700 }}>{item.kunde}</span>
                  <span style={{ fontSize: 11.5, color: `${theme.ink}88` }}>{formatDate(dueDateForCase(item))}</span>
                </div>
                <div style={{ fontSize: 11.5, color: `${theme.ink}88`, marginTop: 3 }}>{item.id} · {nextPortfolioAction[item.status] || 'Wiedervorlage prüfen'}</div>
              </button>
            ))}
          </div>

          <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, overflow: 'hidden' }}>
            <div style={{ padding: '13px 16px', borderBottom: `1px solid ${theme.borderSoft}`, fontSize: 14, fontWeight: 700, color: theme.aubergine }}>Schnellaktionen</div>
            {['Reparatur erfassen', 'Abrechnung erfassen', 'Bewohneranfrage erfassen', 'Wiedervorlage anlegen'].map((label, index) => (
              <button key={label} onClick={() => setQuickAction(label)} style={{ width: '100%', background: 'white', border: 'none', borderTop: index ? `1px solid ${theme.borderSoft}` : 'none', padding: '11px 16px', textAlign: 'left', color: theme.aubergine, fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}>
                {label}
              </button>
            ))}
            {quickAction && (
              <div style={{ margin: '0 12px 12px', background: theme.mintLighter, border: `1px solid ${theme.borderSoft}`, borderRadius: 6, padding: '10px 12px', fontSize: 12, color: theme.ink, lineHeight: 1.45 }}>
                {quickAction}: Erfassung wird in der Fallakte vorbereitet. Bitte zuerst einen Vorgang aus der Liste öffnen.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CaseTableCard = ({ title, cases = [], onOpenCase, showPartner = false, showRejection = false, emptyText = 'Keine Fälle vorhanden.', statusForCase = (row) => row.status }) => (
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
            {['Fall', 'Herkunft', 'Kunde', showPartner ? 'Partner' : null, 'Objekt', 'Status', showRejection ? 'Ablehnungsgrund' : null, 'Letzte Aktivität', ''].filter(Boolean).map((h, i) => (
              <th key={i} style={{ textAlign: 'left', padding: '8px 16px', fontSize: 11, fontWeight: 700, color: theme.oliv, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cases.map((row, i) => (
            <tr key={row.propertyId || row.id || i} onClick={() => onOpenCase(row.propertyId || row.id)} style={{ borderTop: `1px solid ${theme.borderSoft}`, cursor: 'pointer' }}>
              <td style={{ padding: '11px 16px', fontFamily: 'ui-monospace, monospace', fontSize: 12, color: theme.aubergine, fontWeight: 600 }}>{row.id}</td>
              <td style={{ padding: '11px 16px', color: `${theme.ink}99`, fontSize: 12 }}>{row.sourceLabel || 'Partner'}</td>
              <td style={{ padding: '11px 16px', color: theme.ink }}>{row.kunde} {row.alter ? <span style={{ color: `${theme.ink}77`, fontSize: 12 }}>({row.alter})</span> : null}</td>
              {showPartner && <td style={{ padding: '11px 16px', color: `${theme.ink}aa`, fontSize: 12 }}>{row.partner}</td>}
              <td style={{ padding: '11px 16px', color: `${theme.ink}cc` }}>{row.objekt}</td>
              <td style={{ padding: '11px 16px' }}><StatusBadge status={statusForCase(row)} /></td>
              {showRejection && (
                <td style={{ padding: '11px 16px', color: '#9B2C2C', fontSize: 12.5, fontWeight: 650, maxWidth: 280 }}>
                  <div>{row.rejectionReasonLabel || labelFrom(rejectionReasonLabels, row.rejectionReasonCode, '-')}</div>
                  {row.rejectionNote && <div style={{ color: `${theme.ink}88`, fontSize: 11.5, fontWeight: 500, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.rejectionNote}</div>}
                </td>
              )}
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

const registrationStatusLabels = {
  email_pending: 'E-Mail offen',
  pending_approval: 'Freigabe offen',
  approved: 'freigegeben',
  rejected: 'abgelehnt',
};

const PartnerDirectory = ({ partners = [], registrations = [], leads = [], onSetPartnerStatus, onDeletePartner }) => {
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
  const inactivePartners = partners.length - activePartners;
  const openRegistrations = registrations.filter((registration) => registration.status !== 'approved');

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
              <div style={{ fontSize: 11.5, color: `${theme.ink}88`, marginTop: 2 }}>{visiblePartners.length} von {partners.length} Partnern · {activePartners} aktiv · {inactivePartners} gesperrt/offen · {openRegistrations.length} Registrierungen offen</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', background: theme.mintLighter, borderRadius: 6, padding: '7px 10px', border: `1px solid ${theme.border}`, width: 280, maxWidth: '100%' }}>
              <Search size={14} style={{ color: `${theme.aubergine}88`, marginRight: 8 }} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Partner suchen" style={{ border: 'none', background: 'transparent', fontSize: 13, color: theme.ink, outline: 'none', width: '100%', fontFamily: 'inherit' }} />
            </div>
          </div>

          {openRegistrations.length > 0 && (
            <div style={{ padding: '12px 16px', background: theme.goldSoft, borderBottom: `1px solid ${theme.gold}55` }}>
              <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Offene Maklerregistrierungen</div>
              <div style={{ display: 'grid', gap: 8 }}>
                {openRegistrations.slice(0, 6).map((registration) => (
                  <div key={registration.id} style={{ background: 'white', border: `1px solid ${theme.borderSoft}`, borderRadius: 6, padding: '10px 12px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: theme.ink }}>{registration.companyName} · {registration.contactName}</div>
                      <div style={{ fontSize: 11.5, color: `${theme.ink}88`, marginTop: 3 }}>
                        {registration.email} · {registrationStatusLabels[registration.status] || registration.status}
                      </div>
                      {registration.status === 'email_pending' && registration.confirmationUrl && (
                        <a href={registration.confirmationUrl} style={{ display: 'inline-block', marginTop: 5, fontSize: 11.5, color: theme.aubergine, fontWeight: 800 }}>
                          Bestätigungslink öffnen
                        </a>
                      )}
                    </div>
                    {registration.partnerId && registration.status === 'pending_approval' ? (
                      <button onClick={() => onSetPartnerStatus?.(registration.partnerId, 'active')} style={{ background: theme.aubergine, color: 'white', border: 'none', borderRadius: 5, padding: '7px 10px', fontSize: 11.5, fontWeight: 800, cursor: 'pointer' }}>
                        Freigeben
                      </button>
                    ) : (
                      <span style={{ fontSize: 11, color: registration.status === 'email_pending' ? '#A87308' : `${theme.ink}88`, fontWeight: 800 }}>{registration.status === 'email_pending' ? 'wartet auf E-Mail' : 'offen'}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {visiblePartners.length === 0 ? (
            <div style={{ padding: 28, color: `${theme.ink}88`, fontSize: 13 }}>Keine Partner für die aktuelle Auswahl gefunden.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: theme.mintLight }}>
                  {['Firma', 'Ansprechpartner', 'E-Mail', 'Telefon', 'Status', 'Offene Leads', 'Aktionen'].map((h, i) => (
                    <th key={i} style={{ textAlign: 'left', padding: '9px 14px', fontSize: 11, fontWeight: 700, color: theme.oliv, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visiblePartners.map((partner) => {
                  const assignedLeadCount = leads.filter((lead) => lead.assignedPartnerId === partner.id && !['CONVERTED', 'CONVERTED_TO_CASE'].includes(lead.status)).length;
                  const isActive = partner.status === 'active';
                  const registration = partner.registration || registrations.find((item) => item.partnerId === partner.id);
                  const emailPending = registration?.status === 'email_pending';
                  return (
                    <tr key={partner.id} style={{ borderTop: `1px solid ${theme.borderSoft}` }}>
                      <td style={{ padding: '12px 14px', color: theme.aubergine, fontWeight: 700 }}>{partner.companyName}</td>
                      <td style={{ padding: '12px 14px', color: theme.ink }}>{partner.contactName}</td>
                      <td style={{ padding: '12px 14px', color: theme.ink }}>{partner.email}</td>
                      <td style={{ padding: '12px 14px', color: theme.ink }}>{partner.phone || 'Telefon offen'}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? '#5B8C2B' : '#A87308', background: isActive ? '#5B8C2B1A' : `${theme.gold}1A`, borderRadius: 10, padding: '3px 9px', whiteSpace: 'nowrap' }}>
                          {isActive ? 'aktiv' : registrationStatusLabels[registration?.status] || 'gesperrt / offen'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: theme.aubergine, fontWeight: 800 }}>{assignedLeadCount}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, flexWrap: 'wrap' }}>
                        {!isActive ? (
                          <button disabled={emailPending} onClick={() => onSetPartnerStatus?.(partner.id, 'active')} title={emailPending ? 'Bitte zuerst die E-Mail bestätigen.' : 'Partner freischalten'} style={{ background: emailPending ? theme.borderSoft : theme.aubergine, color: emailPending ? `${theme.ink}66` : 'white', border: 'none', padding: '7px 10px', borderRadius: 5, fontSize: 12, fontWeight: 700, cursor: emailPending ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
                            Freischalten
                          </button>
                        ) : (
                          <button onClick={() => onSetPartnerStatus?.(partner.id, 'inactive')} style={{ background: 'white', color: theme.aubergine, border: `1px solid ${theme.border}`, padding: '7px 10px', borderRadius: 5, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            Sperren
                          </button>
                        )}
                          <button onClick={() => onDeletePartner?.(partner)} style={{ background: '#fff7f5', color: '#9B2C2C', border: '1px solid #efc0b9', padding: '7px 10px', borderRadius: 5, fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            Löschen
                          </button>
                        </div>
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

const StaffDirectory = ({ staff = [], canManageStaff = false, onCreateStaff, onUpdateStaffRole, onDeleteStaff }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('demo1234');
  const [internalRole, setInternalRole] = useState('employee');
  const [search, setSearch] = useState('');
  const normalizedSearch = search.trim().toLowerCase();
  const visibleStaff = staff
    .filter((member) => !normalizedSearch || [member.name, member.email, staffRoleLabels[member.internalRole]].some((value) => String(value || '').toLowerCase().includes(normalizedSearch)))
    .sort((left, right) => String(left.name).localeCompare(String(right.name), 'de'));

  const submit = () => {
    if (!canManageStaff) return;
    const name = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ');
    onCreateStaff?.({ name, email, password, internalRole });
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('demo1234');
    setInternalRole('employee');
  };

  return (
    <div style={{ padding: '20px 28px' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>Intern · CRM</div>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: theme.aubergine, margin: 0, letterSpacing: '-0.01em' }}>Mitarbeiter</h1>
        <div style={{ fontSize: 12.5, color: `${theme.ink}99`, marginTop: 5 }}>Interne Benutzer und Rollen für Bearbeitung, Admin-Rechte und Super-Admin-Verwaltung.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 16, alignItems: 'start' }}>
        <div style={{ background: 'white', border: `1px solid ${theme.borderSoft}`, borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '13px 16px', borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: theme.aubergine }}>Interne Mitarbeiter</div>
              <div style={{ fontSize: 11.5, color: `${theme.ink}88`, marginTop: 2 }}>{visibleStaff.length} von {staff.length} Einträgen</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', background: theme.mintLighter, borderRadius: 6, padding: '7px 10px', border: `1px solid ${theme.border}`, width: 280, maxWidth: '100%' }}>
              <Search size={14} style={{ color: `${theme.aubergine}88`, marginRight: 8 }} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Mitarbeiter suchen" style={{ border: 'none', background: 'transparent', fontSize: 13, color: theme.ink, outline: 'none', width: '100%', fontFamily: 'inherit' }} />
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: theme.mintLight }}>
                {['Name', 'E-Mail', 'Rolle', 'Berechtigung', 'Aktion'].map((h, i) => (
                  <th key={i} style={{ textAlign: 'left', padding: '9px 14px', fontSize: 11, fontWeight: 700, color: theme.oliv, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleStaff.map((member) => (
                <tr key={member.id} style={{ borderTop: `1px solid ${theme.borderSoft}` }}>
                  <td style={{ padding: '12px 14px', color: theme.aubergine, fontWeight: 750 }}>{member.name}</td>
                  <td style={{ padding: '12px 14px', color: theme.ink }}>{member.email}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: member.internalRole === 'super_admin' ? theme.aubergine : member.internalRole === 'admin' ? '#5B8C2B' : member.internalRole === 'advisor' ? theme.aubergineSoft : theme.inkSoft, background: member.internalRole === 'super_admin' ? `${theme.aubergine}14` : member.internalRole === 'admin' ? '#5B8C2B1A' : member.internalRole === 'advisor' ? `${theme.aubergine}10` : theme.mintLight, borderRadius: 10, padding: '3px 9px', whiteSpace: 'nowrap' }}>
                      {staffRoleLabels[member.internalRole] || member.internalRole}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', color: `${theme.ink}99`, fontSize: 12.5, maxWidth: 280 }}>{staffRoleDescriptions[member.internalRole]}</td>
                  <td style={{ padding: '12px 14px' }}>
                    {canManageStaff ? (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ minWidth: 150 }}>
                          <Select value={member.internalRole} onChange={(event) => onUpdateStaffRole?.(member.id, event.target.value)}>
                            <option value="employee">Mitarbeiter</option>
                            <option value="advisor">Kundenberater</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super-Admin</option>
                          </Select>
                        </div>
                        <button onClick={() => onDeleteStaff?.(member)} style={{ background: '#fff7f5', color: '#9B2C2C', border: '1px solid #efc0b9', padding: '7px 10px', borderRadius: 5, fontSize: 12, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          Löschen
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: `${theme.ink}88` }}>Nur Super-Admin</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: 'white', border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '16px 18px', opacity: canManageStaff ? 1 : 0.72 }}>
          <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Neuen Mitarbeiter anlegen</div>
          {!canManageStaff && (
            <div style={{ background: theme.goldSoft, border: `1px solid ${theme.gold}55`, borderRadius: 6, padding: '10px 12px', fontSize: 12, color: theme.ink, lineHeight: 1.45, marginBottom: 12 }}>
              Nur Super-Admins können neue Mitarbeiter anlegen oder Rollen ändern.
            </div>
          )}
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="Vorname" required><Input value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="Vorname" /></Field>
              <Field label="Nachname" required><Input value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="Nachname" /></Field>
            </div>
            <Field label="E-Mail" required><Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="name@wohn-kapital.de" /></Field>
            <Field label="Startpasswort" required><Input value={password} onChange={(event) => setPassword(event.target.value)} type="text" /></Field>
            <Field label="Rolle" required>
              <Select value={internalRole} onChange={(event) => setInternalRole(event.target.value)}>
                <option value="employee">Mitarbeiter</option>
                <option value="advisor">Kundenberater</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super-Admin</option>
              </Select>
            </Field>
            <div style={{ background: theme.mintLighter, border: `1px solid ${theme.borderSoft}`, borderRadius: 6, padding: '10px 12px', fontSize: 12, color: `${theme.ink}99`, lineHeight: 1.45 }}>
              {staffRoleDescriptions[internalRole]}
            </div>
            <button onClick={submit} disabled={!canManageStaff || !firstName.trim() || !lastName.trim() || !email.trim()} style={{ background: theme.aubergine, color: 'white', border: 'none', padding: '10px 14px', borderRadius: 5, fontSize: 13, fontWeight: 800, cursor: !canManageStaff || !firstName.trim() || !lastName.trim() || !email.trim() ? 'default' : 'pointer', opacity: !canManageStaff || !firstName.trim() || !lastName.trim() || !email.trim() ? 0.55 : 1 }}>
              Mitarbeiter anlegen
            </button>
          </div>
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

const postbankWohnatlasImageUrl = 'https://www.postbank.de/dam/postbank/medienartikel/bilder/2026/Postbank-Wohnatlas-2026-Preisatlas.png';

const PostbankWohnatlasScreen = () => (
  <div style={{ padding: '20px 28px' }}>
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>Wissen</div>
      <h1 style={{ fontSize: 24, fontWeight: 600, color: theme.aubergine, margin: 0 }}>Postbank Wohnatlas 2026</h1>
      <div style={{ fontSize: 13.5, color: `${theme.ink}99`, marginTop: 6 }}>Preisentwicklung und regionale Einordnung auf Basis des Postbank Wohnatlas.</div>
    </div>

    <div style={{ background: 'white', border: `1px solid ${theme.borderSoft}`, borderRadius: 8, overflow: 'hidden', boxShadow: '0 14px 34px rgba(68, 0, 92, 0.045)' }}>
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 14, color: theme.aubergine, fontWeight: 800 }}>Preisentwicklungskarte</div>
          <div style={{ fontSize: 12, color: `${theme.ink}88`, marginTop: 3 }}>Quelle: Postbank Wohnatlas 2026</div>
        </div>
        <a
          href={postbankWohnatlasImageUrl}
          target="_blank"
          rel="noreferrer"
          style={{ background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine, borderRadius: 5, padding: '8px 12px', fontSize: 12.5, fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7 }}
        >
          Original öffnen
          <ChevronRight size={14} />
        </a>
      </div>
      <div style={{ padding: 16, background: theme.mintLighter, overflowX: 'auto' }}>
        <img
          src={postbankWohnatlasImageUrl}
          alt="Postbank Wohnatlas 2026 Preisatlas"
          style={{ display: 'block', width: '100%', maxWidth: 1400, minWidth: 720, height: 'auto', margin: '0 auto', borderRadius: 6, border: `1px solid ${theme.borderSoft}`, background: 'white' }}
        />
      </div>
      <div style={{ padding: '10px 16px 14px', fontSize: 11.5, color: `${theme.ink}88`, lineHeight: 1.5, borderTop: `1px solid ${theme.borderSoft}` }}>
        Diese Darstellung dient der internen Marktinformation. Nutzungsrechte für externe Veröffentlichungen sind gesondert zu prüfen.
      </div>
    </div>
  </div>
);

const firstProcessDate = (...values) => values.find(Boolean) || null;

function isToday(value) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  return date.getFullYear() === today.getFullYear()
    && date.getMonth() === today.getMonth()
    && date.getDate() === today.getDate();
}

function processDateLabel(value, isCurrent) {
  if (!value) return '–';
  if (isCurrent && isToday(value)) return 'heute';
  try {
    return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit' }).format(new Date(value));
  } catch {
    return '–';
  }
}

function buildAcquisitionTimelineSteps(property = {}) {
  const steps = [
    {
      key: 'submitted',
      label: 'Eingereicht',
      date: firstProcessDate(property?.submittedAt, property?.createdAt),
    },
    {
      key: 'uva-submitted',
      label: 'UVA abgegeben',
      date: firstProcessDate(property?.nonBindingOfferSubmittedAt, property?.indicativeOfferSentAt),
    },
    {
      key: 'uva-accepted',
      label: 'UVA angenommen',
      date: firstProcessDate(property?.nonBindingOfferAcceptedAt, property?.offerAcceptedAt),
    },
    {
      key: 'appraisal-ordered',
      label: 'Gutachten beauftragt',
      date: firstProcessDate(property?.appraisalOrderedAt, property?.expertOpinionOrderedAt),
    },
    {
      key: 'appraisal-received',
      label: 'Gutachten eingegangen',
      date: firstProcessDate(property?.appraisalReceivedAt, property?.expertOpinionReceivedAt),
    },
    {
      key: 'va-submitted',
      label: 'VA abgegeben',
      date: firstProcessDate(property?.bindingOfferSubmittedAt, property?.bindingOfferSentAt),
    },
    {
      key: 'va-accepted',
      label: 'VA angenommen',
      date: property?.bindingOfferAcceptedAt,
    },
    {
      key: 'notary-contract',
      label: 'Notar & Kaufvertrag',
      date: firstProcessDate(property?.notaryAppointmentAt, property?.purchaseContractSignedAt, property?.purchasedAt, property?.portfolioEnteredAt),
    },
  ];
  const lastReachedIndex = steps.reduce((highest, step, index) => (step.date ? index : highest), -1);
  const currentIndex = Math.max(0, lastReachedIndex);
  return steps.map((step, index) => ({
    ...step,
    current: index === currentIndex,
    completed: index < currentIndex,
    open: index > currentIndex,
  }));
}

const AcquisitionProcessStepper = ({ property }) => {
  const steps = buildAcquisitionTimelineSteps(property);
  const currentIndex = Math.max(0, steps.findIndex((step) => step.current));
  const lineOffsetPercent = 100 / (steps.length * 2);
  const completedLineWidth = currentIndex === 0
    ? '0%'
    : `calc((100% - ${100 / steps.length}%) * ${currentIndex / (steps.length - 1)})`;

  return (
    <div style={{ background: 'white', border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '18px 20px 16px', boxShadow: '0 10px 26px rgba(68, 0, 92, 0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase' }}>ANKAUFSPROZESS</div>
        <div style={{ background: theme.goldSoft, border: `1px solid ${theme.gold}66`, color: theme.aubergine, borderRadius: 999, padding: '5px 10px', fontSize: 11, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          SIE SIND HIER · SCHRITT {currentIndex + 1} VON {steps.length}
        </div>
      </div>
      <div className="acquisition-stepper-scroll" style={{ overflowX: 'auto', overflowY: 'hidden', paddingBottom: 2, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div style={{ position: 'relative', minWidth: 960 }}>
          <div style={{ position: 'absolute', top: 16, left: `${lineOffsetPercent}%`, right: `${lineOffsetPercent}%`, height: 2, background: theme.borderSoft, zIndex: 1 }} />
          <div style={{ position: 'absolute', top: 16, left: `${lineOffsetPercent}%`, width: completedLineWidth, height: 2, background: theme.aubergine, zIndex: 2 }} />
          <div style={{ position: 'relative', zIndex: 3, display: 'grid', gridTemplateColumns: `repeat(${steps.length}, minmax(120px, 1fr))`, alignItems: 'start' }}>
          {steps.map((step, index) => {
            const circleBase = {
              position: 'relative',
              zIndex: 4,
              width: 34,
              height: 34,
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 900,
              boxSizing: 'border-box',
            };
            const circleStyle = step.completed
              ? { ...circleBase, background: theme.aubergine, border: `2px solid ${theme.aubergine}`, color: 'white' }
              : step.current
                ? { ...circleBase, background: 'white', border: `2px solid ${theme.gold}`, color: theme.aubergine, boxShadow: `0 0 0 4px ${theme.goldSoft}` }
                : { ...circleBase, background: '#FAF8FB', border: `1px solid ${theme.border}`, color: `${theme.ink}77` };
            return (
              <div key={step.key} style={{ display: 'grid', gridTemplateRows: '34px 34px 18px', rowGap: 6, justifyItems: 'center', alignItems: 'start', textAlign: 'center', padding: '0 8px' }}>
                <div style={circleStyle}>
                  {step.completed ? <CheckCircle size={16} /> : index + 1}
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.25, fontWeight: step.current ? 800 : 700, color: step.current || step.completed ? theme.aubergine : `${theme.ink}88`, display: 'flex', alignItems: 'start', justifyContent: 'center', maxWidth: 112 }}>
                  {step.label}
                </div>
                <div style={{ fontSize: 11.5, color: step.current ? theme.aubergine : `${theme.ink}77`, fontWeight: step.current ? 800 : 600 }}>
                  {processDateLabel(step.date, step.current)}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
};

const SidePanelCard = ({ title, count, children, actionLabel, onAction }) => (
  <div style={{ background: 'white', borderRadius: 12, border: `1px solid ${theme.borderSoft}`, padding: '17px 18px', boxShadow: '0 10px 28px rgba(68, 0, 92, 0.035)' }}>
    <div style={{ fontSize: 10.5, color: theme.aubergine, fontWeight: 850, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 16 }}>
      {title}{Number.isFinite(count) ? ` · ${count}` : ''}
    </div>
    {children}
    {actionLabel && (
      <button onClick={onAction} style={{ marginTop: 14, background: 'transparent', border: 'none', borderBottom: `1px solid ${theme.gold}`, color: theme.aubergine, padding: '0 0 3px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
        {actionLabel}
      </button>
    )}
  </div>
);

const CaseSidePanel = ({ activities, taskRows, documents, onShowTasks, onShowDocuments }) => {
  const visibleActivities = (activities || []).slice(0, 3);
  const visibleTasks = (taskRows || []).slice(0, 3);
  const importantDocuments = (documents || [])
    .filter((document) => ['expert_opinion', 'appraisal', 'land_register', 'energy_certificate'].includes(document.category))
    .slice(0, 3);
  const visibleDocuments = importantDocuments.length ? importantDocuments : (documents || []).slice(0, 3);

  return (
    <div style={{ display: 'grid', gap: 16, height: 'fit-content' }}>
      <SidePanelCard title="Aktivität" actionLabel="Alle anzeigen">
        {visibleActivities.length ? visibleActivities.map((activity, index) => (
          <div key={activity.id || index} style={{ display: 'grid', gridTemplateColumns: '56px 1fr', gap: 12, padding: index === 0 ? '0 0 12px' : '12px 0', borderBottom: index < visibleActivities.length - 1 ? `1px solid ${theme.borderSoft}` : 'none' }}>
            <div style={{ fontSize: 11.5, color: `${theme.ink}88`, fontWeight: 700 }}>{activity.time || dateLabel(activity.createdAt)}</div>
            <div>
              <div style={{ fontSize: 12.5, color: theme.ink, lineHeight: 1.35 }}>{activity.text || activity.message}</div>
              <div style={{ fontSize: 11, color: `${theme.ink}77`, marginTop: 3 }}>{activity.actor || activity.source || activity.userId || 'intern'}</div>
            </div>
          </div>
        )) : (
          <div style={{ fontSize: 12.5, color: `${theme.ink}88` }}>Keine Aktivitäten vorhanden.</div>
        )}
      </SidePanelCard>

      <SidePanelCard title="Offene Aufgaben" count={visibleTasks.length} actionLabel="Neue Aufgabe" onAction={onShowTasks}>
        {visibleTasks.length ? visibleTasks.map((task, index) => (
          <div key={`${task.title}-${index}`} style={{ display: 'grid', gridTemplateColumns: '18px 1fr', gap: 10, padding: index === 0 ? '0 0 12px' : '12px 0', borderBottom: index < visibleTasks.length - 1 ? `1px solid ${theme.borderSoft}` : 'none' }}>
            <div style={{ width: 14, height: 14, border: `1px solid ${theme.aubergine}66`, borderRadius: 3, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 12.5, color: theme.ink, lineHeight: 1.35, fontWeight: 650 }}>{task.text || task.title}</div>
              <div style={{ fontSize: 11, color: `${theme.ink}77`, marginTop: 3 }}>{task.meta || task.title}</div>
            </div>
          </div>
        )) : (
          <div style={{ fontSize: 12.5, color: `${theme.ink}88` }}>Keine offenen Aufgaben.</div>
        )}
      </SidePanelCard>

      <SidePanelCard title="Objektunterlagen" actionLabel="Alle Dokumente" onAction={onShowDocuments}>
        {visibleDocuments.length ? visibleDocuments.map((document, index) => (
          <div key={document.id || index} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: index === 0 ? '0 0 10px' : '10px 0', borderBottom: index < visibleDocuments.length - 1 ? `1px solid ${theme.borderSoft}` : 'none' }}>
            <FileText size={15} style={{ color: theme.aubergine, flex: '0 0 auto' }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, color: theme.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{document.name || document.fileName}</div>
              <div style={{ fontSize: 10.8, color: `${theme.ink}77`, marginTop: 2 }}>{document.statusLabel || document.type || 'Unterlage'}</div>
            </div>
          </div>
        )) : (
          <div style={{ fontSize: 12.5, color: `${theme.ink}88` }}>Keine Dokumente vorhanden.</div>
        )}
      </SidePanelCard>
    </div>
  );
};

// =====================================================================
// SCREEN 3 — FALLDETAIL
// =====================================================================
const FallDetail = ({ caseId, onBack, role, internalRole = 'employee', cases = mockCases, onRefresh, onNotificationsRefresh, setNotice, onEdit, initialTab = 'kunde', returnTab = '', onTabChange, onReturnToTab }) => {
  const [activeTab, setActiveTab] = useState(normalizeCaseTab(initialTab));
  const [busyAction, setBusyAction] = useState('');
  const [recentSuccessAction, setRecentSuccessAction] = useState('');
  const [openCalculation, setOpenCalculation] = useState('');
  const [calculationParams, setCalculationParams] = useState({});
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCategory, setUploadCategory] = useState('energy_certificate');
  const [uploadRequirementLevel, setUploadRequirementLevel] = useState('required');
  const [uploadNote, setUploadNote] = useState('');
  const [documentReviewInputs, setDocumentReviewInputs] = useState({});
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReasonCode, setRejectionReasonCode] = useState('location');
  const [rejectionNote, setRejectionNote] = useState('');
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetTargetStatus, setResetTargetStatus] = useState('SUBMITTED');
  const [resetReason, setResetReason] = useState(workflowResetReasons[0]);
  const [resetNote, setResetNote] = useState('');
  const [expertOpinionOrderedDate, setExpertOpinionOrderedDate] = useState('');
  const [expertOpinionReceivedDate, setExpertOpinionReceivedDate] = useState('');
  const [expertOpinionCompany, setExpertOpinionCompany] = useState('');
  const [notaryAppointmentDate, setNotaryAppointmentDate] = useState('');
  const [notaryOffice, setNotaryOffice] = useState('');
  const [indicativeOfferSentDate, setIndicativeOfferSentDate] = useState('');
  const [indicativeOfferAcceptedDate, setIndicativeOfferAcceptedDate] = useState('');
  const [bindingOfferSentDate, setBindingOfferSentDate] = useState('');
  const [bindingOfferAcceptedDate, setBindingOfferAcceptedDate] = useState('');
  const [acceptedOfferDialog, setAcceptedOfferDialog] = useState(null);
  const [acceptedOfferModelInput, setAcceptedOfferModelInput] = useState('');
  const [acceptedOfferNote, setAcceptedOfferNote] = useState('');
  const [expertOpinionValue, setExpertOpinionValue] = useState('');
  const [residentStatusAction, setResidentStatusAction] = useState('');
  const [residentStatusForm, setResidentStatusForm] = useState({ moveOutDate: '', deathDate: '', reportedAt: '', note: '', relativesOrEstateContact: '' });
  const [ratingScoreInputs, setRatingScoreInputs] = useState({});
  const [ratingReturnInput, setRatingReturnInput] = useState('');
  const [openRatingInfo, setOpenRatingInfo] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatVisibility, setChatVisibility] = useState('shared');
  const [chatAttachmentFiles, setChatAttachmentFiles] = useState([]);
  const [portfolioForm, setPortfolioForm] = useState(() => portfolioFormFromProperty({}));
  const [exitProcessForm, setExitProcessForm] = useState(() => exitProcessFormFromProperty({}));
  const c = cases.find(x => x.propertyId === caseId || x.id === caseId) || mockCases[0];
  const caseView = c.raw;
  const customer = caseView?.customer;
  const property = caseView?.property;
  const canRejectCase = role === 'admin' && ['admin', 'super_admin'].includes(internalRole);
  const canManageOffers = role === 'admin' && ['advisor', 'admin', 'super_admin'].includes(internalRole);
  const canManageWorkflow = role === 'admin' && ['employee', 'advisor', 'admin', 'super_admin'].includes(internalRole);
  const canEditOfferDates = canManageWorkflow;
  const canManagePortfolio = role === 'admin' && ['employee', 'advisor', 'admin', 'super_admin'].includes(internalRole);
  const canManageRating = role === 'admin' && ['advisor', 'admin', 'super_admin'].includes(internalRole);
  const canReviewDocuments = canManageOffers;
  const canEditCaseData = role === 'admin' || property?.status === 'DRAFT';
  const canDeleteDocuments = role === 'admin' || property?.status === 'DRAFT';
  const inventoryCase = isInventoryCase(property);
  const canManageResidentStatus = inventoryCase && role === 'admin' && ['employee', 'advisor', 'admin', 'super_admin'].includes(internalRole);

  useEffect(() => {
    setActiveTab(normalizeCaseTab(initialTab));
  }, [caseId, initialTab]);

  useEffect(() => {
    setPortfolioForm(portfolioFormFromProperty(property || {}));
  }, [property?.id, property?.updatedAt, property?.portfolioEnteredAt]);

  useEffect(() => {
    setExitProcessForm(exitProcessFormFromProperty(property || {}));
  }, [property?.id, property?.updatedAt, property?.exitProcess?.updatedAt]);

  useEffect(() => {
    setIndicativeOfferSentDate(dateInputValue(property?.indicativeOfferSentAt));
    setIndicativeOfferAcceptedDate(dateInputValue(property?.offerAcceptedAt));
    setBindingOfferSentDate(dateInputValue(property?.bindingOfferSentAt));
    setBindingOfferAcceptedDate(dateInputValue(property?.bindingOfferAcceptedAt));
  }, [property?.id, property?.updatedAt, property?.indicativeOfferSentAt, property?.offerAcceptedAt, property?.bindingOfferSentAt, property?.bindingOfferAcceptedAt]);

  useEffect(() => {
    if (activeTab !== 'chat' || !c.propertyId) return;
    postJson(`/api/properties/${c.propertyId}/chat/read`, {})
      .then(() => onNotificationsRefresh?.())
      .catch(() => undefined);
  }, [activeTab, c.propertyId]);
  const changeTab = (tab) => {
    const nextTab = normalizeCaseTab(tab);
    setActiveTab(nextTab);
    onTabChange?.(nextTab);
  };
  const chatReturnTab = activeTab === 'chat' ? normalizeCaseTab(returnTab, '') : '';
  const latestOffer = caseView?.offer;
  const productOffers = (caseView?.offers?.length ? caseView.offers : latestOffer ? [latestOffer] : [])
    .slice()
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime());
  const indicativeOffers = productOffers.filter((offer) => offer.kind !== 'binding');
  const bindingOffers = productOffers.filter((offer) => offer.kind === 'binding');
  const offerVersionsCount = (offer) => offer?.versions?.length || offer?.currentVersion || 1;
  const hasBindingOffer = bindingOffers.length > 0;
  const salesProcessActive = Boolean(inventoryCase && (
    property?.exitProcess ||
    property?.residentStaysInProperty === false ||
    ['MOVE_OUT_PLANNED', 'MOVED_OUT', 'DECEASED'].includes(property?.residentStatus)
  ));
  useEffect(() => {
    const existingExpertOpinionValue = bindingOffers[0]?.marketValue;
    setExpertOpinionValue(existingExpertOpinionValue ? formatGermanIntegerInput(existingExpertOpinionValue) : '');
  }, [property?.id, bindingOffers[0]?.marketValue]);
  const canPrepareBindingOffer = Boolean(property?.expertOpinionReceivedAt) || ['EXPERT_OPINION_RECEIVED', 'BINDING_OFFER_SENT', 'BINDING_OFFER_ACCEPTED', 'NOTARY_APPOINTMENT', 'IN_PORTFOLIO', 'WON'].includes(property?.status);
  const requestedOfferModels = property ? [
    {
      key: property.desiredModel || 'fixed_residential_right',
      model: property.desiredModel || 'fixed_residential_right',
      residentialRightYears: property.desiredResidentialRightYears,
      recipient: property.residentialRightRecipients,
      recipientPerson: property.residentialRightPerson,
      reason: property.fixedTermReason,
      primary: true
    },
    ...(property.additionalOfferRequested ? [{
      key: `additional-${property.additionalOfferModel || 'sale_and_leaseback'}`,
      model: property.additionalOfferModel || 'sale_and_leaseback',
      residentialRightYears: property.additionalOfferResidentialRightYears,
      recipient: property.additionalOfferResidentialRightRecipients,
      recipientPerson: property.additionalOfferResidentialRightPerson,
      reason: property.additionalOfferReason,
      primary: false
    }] : [])
  ] : [
    { key: 'fixed_residential_right', model: 'fixed_residential_right', residentialRightYears: 10, recipient: 'one_person', reason: 'Mock-Fall', primary: true }
  ];
  const acceptedOfferOptions = (action) => {
    const kind = action === 'binding_offer_accepted' ? 'binding' : 'indicative';
    const offers = kind === 'binding' ? bindingOffers : indicativeOffers;
    const models = offers.length
      ? offers.map((offer) => offer.model)
      : requestedOfferModels.map((modelRequest) => modelRequest.model);
    return Array.from(new Set(models.filter((model) => model && model !== 'other')))
      .map((model) => ({
        model,
        label: labelFrom(productModelLabels, model),
        offerId: offers.find((offer) => offer.model === model)?.id
      }));
  };
  const existingAcceptedOfferModel = (action) => (
    action === 'binding_offer_accepted'
      ? property?.bindingAcceptedOfferModel
      : property?.indicativeAcceptedOfferModel
  );
  const acceptedOfferModelLabel = (action) => {
    const model = existingAcceptedOfferModel(action);
    return model ? labelFrom(productModelLabels, model) : '-';
  };
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
    scanStatus: document.scanStatus || 'pending',
    scanStatusLabel: labelFrom(documentScanStatusLabels, document.scanStatus || 'pending'),
    scanNote: document.scanNote,
    reviewedAt: document.reviewedAt,
    currentVersion: document.currentVersion || 1,
    versions: document.versions || [],
    missingReason: document.missingReason,
  })) : [
    { id: 'mock-land-register', name: 'Grundbuchauszug.pdf', fileName: 'Grundbuchauszug.pdf', fileType: 'application/pdf', storageUrl: '', category: 'land_register', type: 'Pflicht', date: '18.05.2026', status: 'ok', statusLabel: 'geprüft', scanStatus: 'clean', scanStatusLabel: 'Virenscan unauffällig', currentVersion: 1, versions: [] },
    { id: 'mock-floorplan', name: 'Grundriss_OG.pdf', fileName: 'Grundriss_OG.pdf', fileType: 'application/pdf', storageUrl: '', category: 'floorplan', type: 'Pflicht', date: '18.05.2026', status: 'ok', statusLabel: 'geprüft', scanStatus: 'clean', scanStatusLabel: 'Virenscan unauffällig', currentVersion: 1, versions: [] },
    { id: 'mock-living-area', name: 'Wohnflächenberechnung.pdf', fileName: 'Wohnflächenberechnung.pdf', fileType: 'application/pdf', storageUrl: '', category: 'living_area_calculation', type: 'Pflicht', date: '18.05.2026', status: 'ok', statusLabel: 'geprüft', scanStatus: 'clean', scanStatusLabel: 'Virenscan unauffällig', currentVersion: 1, versions: [] },
    { id: 'mock-energy', name: 'Energieausweis', fileName: 'Energieausweis', fileType: 'application/pdf', storageUrl: '', category: 'energy_certificate', type: 'Pflicht', date: null, status: 'missing', statusLabel: 'fehlt', scanStatus: 'pending', scanStatusLabel: 'Virenscan offen', currentVersion: 1, versions: [], missingReason: 'Energieausweis fehlt noch.' },
    { id: 'mock-photos', name: 'Fotos außen (12)', fileName: 'Fotos außen (12)', fileType: 'image/jpeg', storageUrl: '', category: 'photos', type: 'Pflicht', date: '18.05.2026', status: 'ok', statusLabel: 'geprüft', scanStatus: 'clean', scanStatusLabel: 'Virenscan unauffällig', currentVersion: 1, versions: [] },
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
    ['Person mit Wohnrecht', property.residentialRightPerson ? labelFrom({ customer_1: 'Kunde 1', customer_2: 'Kunde 2' }, property.residentialRightPerson) : '-'],
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
    ['Aufzug vorhanden', property.propertyType === 'apartment' ? yesNoOptional(property.hasElevator) : 'nicht relevant'],
    ['Optik', labelFrom(ratingLabels, property.visualConditionRating)],
    ['Heizung', formatHeatingLabel(property)],
    ['Energieausweis', `${yesNo(property.energyCertificateAvailable)}${property.energyCertificateType ? `, ${labelFrom(energyCertificateLabels, property.energyCertificateType)}` : ''}`],
    ['Energieklasse', property.energyClass || '-'],
    ['Fenster', property.windowMaterial ? `${labelFrom(windowLabels, property.windowMaterial)}${property.windowInstallationYear ? ` (${property.windowInstallationYear})` : ''}` : '-'],
    ['Parkplatz', property.parkingAvailable ? `${property.parkingCount || 1}x ${labelFrom(parkingLabels, property.parkingType)}` : 'nein'],
    ['Keller', labelFrom(basementLabels, property.basementType)],
    ['Asbest Dach bekannt', yesNo(property.asbestosRoofKnown)],
    ['PV / Solar', property.energyCarriers?.length ? property.energyCarriers.map((item) => labelFrom(energyCarrierLabels, item)).join(', ') : '-'],
    ['Erbbau/Denkmal', property.leasehold || property.monumentProtection ? 'ja' : 'nein'],
    ['Restschuld', property.remainingDebtAmount ? formatEuro(property.remainingDebtAmount) : '-'],
    ['Größere Instandhaltungen oder Sonderumlagen', yesNoOptional(property.knownMajorMaintenanceOrSpecialAssessments)],
    ['Beschreibung Instandhaltungen / Sonderumlagen', property.knownMajorMaintenanceOrSpecialAssessmentsDescription || '-'],
    ['Feuchtigkeit, Schimmel oder Wasserschäden', labelFrom(moistureDamageLabels, property.moistureDamageStatus)],
    ['Beschreibung Feuchtigkeit / Schäden', property.moistureDamageDescription || '-'],
    ['Einschätzung Zugänglichkeit', labelFrom(accessibilityAssessmentLabels, property.accessibilityAssessment)],
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
  const modernizationDetails = property?.modernization ? Object.entries(property.modernization)
    .filter(([, value]) => value?.scope && value.scope !== 'none')
    .map(([key, value]) => ({
      label: labelFrom(modernizationComponentLabels, key, key),
      year: value?.year || 'unbekannt',
      scope: labelFrom(modernizationLabels, value?.scope, 'unbekannt'),
      note: value?.note || '-',
    })) : [];
  const buildingConditionDetails = property?.buildingCondition ? Object.entries(property.buildingCondition)
    .map(([key, value]) => {
      const normalized = buildingConditionValue(value);
      return {
        label: labelFrom(buildingConditionComponentLabels, key, key),
        rating: labelFrom(ratingLabels, normalized.rating, '-'),
        description: normalized.description || '-',
      };
    })
    .filter((item) => item.rating !== '-' || item.description !== '-') : [];
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
  const chatMessages = caseView?.chatMessages?.length ? caseView.chatMessages : [];
  const objectRating = caseView?.objectRatings?.[0];
  const ratingStatusLabels = { draft: 'Entwurf', analyst_review: 'Analystenprüfung', approved: 'Freigegeben' };
  const ratingSourceLabels = { questionnaire: 'Fragebogen', api: 'API / Marktdaten', analyst: 'Analyst', document: 'Dokument' };
  const ratingScores = (objectRating?.scores || [])
    .filter((score) => score.criterion?.active !== false && score.criterion?.category?.active !== false)
    .sort((a, b) => {
      const aCategoryIndex = objectRatingCategoryOrder.indexOf(a.criterion?.category?.name || '');
      const bCategoryIndex = objectRatingCategoryOrder.indexOf(b.criterion?.category?.name || '');
      const categoryCompare = (aCategoryIndex === -1 ? objectRatingCategoryOrder.length : aCategoryIndex) - (bCategoryIndex === -1 ? objectRatingCategoryOrder.length : bCategoryIndex);
      if (categoryCompare !== 0) return categoryCompare;
      const aCriterionIndex = objectRatingCriterionOrder.indexOf(a.criterionId);
      const bCriterionIndex = objectRatingCriterionOrder.indexOf(b.criterionId);
      return (aCriterionIndex === -1 ? objectRatingCriterionOrder.length : aCriterionIndex) - (bCriterionIndex === -1 ? objectRatingCriterionOrder.length : bCriterionIndex);
    });
  const ratingCategories = Array.from(new Map(ratingScores
    .map((score) => score.criterion?.category)
    .filter(Boolean)
    .map((category) => [category.id, category])
  ).values()).sort((a, b) => {
    const aIndex = objectRatingCategoryOrder.indexOf(a.name);
    const bIndex = objectRatingCategoryOrder.indexOf(b.name);
    return (aIndex === -1 ? objectRatingCategoryOrder.length : aIndex) - (bIndex === -1 ? objectRatingCategoryOrder.length : bIndex);
  });
  const ratingScoreValue = (score) => score?.finalScore ?? score?.analystScore ?? score?.prefilledScore;
  const ratingScoreValueWithInput = (score) => {
    const input = ratingScoreInputs[score.id] || {};
    if (input.cleared) return '';
    if (Object.prototype.hasOwnProperty.call(input, 'analystScore')) return input.analystScore || '';
    return score?.analystScore || score?.finalScore || score?.prefilledScore || '';
  };
  const roofScore = ratingScores.find((score) => score.criterionId === ratingRoofCriterionId);
  const flatRoofScore = ratingScores.find((score) => score.criterionId === ratingFlatRoofCriterionId);
  const roofInputValue = roofScore ? ratingScoreValueWithInput(roofScore) : '';
  const flatRoofInputValue = flatRoofScore ? ratingScoreValueWithInput(flatRoofScore) : '';
  const selectedRoofCriterionId = roofInputValue && !flatRoofInputValue
    ? ratingRoofCriterionId
    : flatRoofInputValue && !roofInputValue
      ? ratingFlatRoofCriterionId
      : '';
  const ratingCriterionWeight = (criterion) => {
    const overrides = criterion?.weightOverrides || {};
    const overrideKey = property?.propertyType === 'apartment' ? 'apartment' : property?.propertyType ? 'house' : '';
    return Number(overrides?.[overrideKey] ?? criterion?.weight ?? 0);
  };
  const ratingEffectiveCriterionWeight = (criterion) => {
    if (criterion?.id === ratingRoofCriterionId) return selectedRoofCriterionId === ratingRoofCriterionId ? ratingCriterionWeight(criterion) : 0;
    if (criterion?.id === ratingFlatRoofCriterionId) return selectedRoofCriterionId === ratingFlatRoofCriterionId ? ratingCriterionWeight(criterion) : 0;
    return ratingCriterionWeight(criterion);
  };
  const weightedScore = (scores) => {
    const usable = scores
      .map((score) => ({ value: ratingScoreValue(score), weight: ratingEffectiveCriterionWeight(score.criterion) }))
      .filter((item) => Number.isFinite(Number(item.value)) && item.weight > 0);
    const totalWeight = usable.reduce((sum, item) => sum + item.weight, 0);
    if (!totalWeight) return undefined;
    return usable.reduce((sum, item) => sum + Number(item.value) * item.weight, 0) / totalWeight;
  };
  const ratingCategoryRows = ratingCategories.map((category) => ({
    category,
    score: weightedScore(ratingScores.filter((score) => score.criterion?.categoryId === category.id))
  }));
  const ratingScoreDefinitions = (criterion) => (criterion?.scoreDefinitions?.length ? criterion.scoreDefinitions : [1, 2, 3, 4, 5, 6].map((value) => ({ scoreValue: value, label: String(value) })));
  const ratingOpenChecks = ratingScores.filter((score) => !ratingScoreValue(score) || Number(score.confidence || 0) < 0.65);
  const ratingReadOnly = objectRating?.status === 'approved' || !canManageRating;
  const ratingReturnPercent = ratingReturnInput || (objectRating?.finalTargetReturn ? String((Number(objectRating.finalTargetReturn) * 100).toLocaleString('de-DE', { maximumFractionDigits: 2 })) : '');
  async function runCaseAction(label, action) {
    if (!c.propertyId) {
      setNotice?.('Dieser Mock-Fall ist noch nicht mit einer API-ID verbunden.');
      return;
    }
    setRecentSuccessAction('');
    setBusyAction(label);
    try {
      await action();
      await onRefresh?.();
      await onNotificationsRefresh?.();
      setRecentSuccessAction(label);
      setNotice?.(`${label} abgeschlossen.`);
    } catch (err) {
      setNotice?.(err instanceof Error ? err.message : 'Aktion fehlgeschlagen');
    } finally {
      setBusyAction('');
    }
  }
  const generateObjectRating = () => runCaseAction('Objektrating erzeugen', async () => {
    await postJson(`/api/properties/${c.propertyId}/rating`, {});
  });
  const saveRatingScore = (score) => runCaseAction('Rating-Kriterium speichern', async () => {
    const input = ratingScoreInputs[score.id] || {};
    const analystScore = Number(input.analystScore || score.analystScore || score.finalScore || score.prefilledScore);
    const comment = String(input.comment || '').trim();
    if (!comment) throw new Error('Bitte einen Kommentar zur Scoreänderung hinterlegen.');
    await patchJson(`/api/properties/${c.propertyId}/rating/scores/${score.id}`, { analystScore, comment });
  });
  const saveRatingReturn = () => runCaseAction('Zielrendite speichern', async () => {
    const parsed = parseGermanNumberInput(ratingReturnPercent);
    if (!Number.isFinite(parsed)) throw new Error('Bitte eine gültige Zielrendite eingeben.');
    await patchJson(`/api/properties/${c.propertyId}/rating/final-return`, { finalTargetReturn: parsed / 100 });
    setRatingReturnInput('');
  });
  const approveRating = () => runCaseAction('Objektrating freigeben', async () => {
    await postJson(`/api/properties/${c.propertyId}/rating/approve`, {});
  });
  const startValuationAndOffer = (model) => runCaseAction(model === 'sale_and_leaseback' ? 'Rückmietverkauf-Kalkulation' : 'Wohnrecht-Kalkulation', async () => {
    await postJson(`/api/properties/${c.propertyId}/valuation`, { provider: 'sprengnetter' });
    await postJson(`/api/properties/${c.propertyId}/offer/calculate`, { model });
    await postJson(`/api/properties/${c.propertyId}/offer/generate-ai-text`);
  });
  const calculateBindingOffer = (modelRequest, index) => runCaseAction('VA-Kalkulation', async () => {
    if (!canPrepareBindingOffer) {
      throw new Error('Bitte zuerst das Gutachten als eingegangen markieren.');
    }
    const parsedExpertOpinionValue = parseGermanNumberInput(expertOpinionValue);
    if (!Number.isFinite(parsedExpertOpinionValue) || parsedExpertOpinionValue <= 0) {
      throw new Error('Bitte zuerst den Gutachtenwert eintragen.');
    }
    const key = `binding-${modelRequest.key}-${index}`;
    const params = calculationParams[key] || {};
    await postJson(`/api/properties/${c.propertyId}/offer/calculate`, {
      kind: 'binding',
      model: modelRequest.model,
      inputs: {
        ...params,
        expertOpinionValue: parsedExpertOpinionValue,
        residentialRightYears: modelRequest.residentialRightYears || property?.desiredResidentialRightYears,
        livingAreaSqm: property?.livingAreaSqm,
        garageCount: property?.parkingAvailable ? property?.parkingCount : 0,
      }
    });
    await postJson(`/api/properties/${c.propertyId}/offer/generate-ai-text`);
  });
  const markIndicativeOfferSent = () => runCaseAction('Unverbindliches Angebot verschickt', async () => {
    await postJson(`/api/properties/${c.propertyId}/workflow`, { action: 'indicative_offer_sent' });
  });
  const markIndicativeOfferAccepted = () => runCaseAction('UVA angenommen', async () => {
    if (property?.status !== 'INDICATIVE_OFFER_SENT' && property?.status !== 'OFFER_ACCEPTED') {
      throw new Error('Bitte zuerst das unverbindliche Angebot als abgegeben markieren.');
    }
    await postJson(`/api/properties/${c.propertyId}/workflow`, { action: 'offer_accepted' });
  });
  const saveExpertOpinionOrderData = () => runCaseAction('Gutachtenbeauftragung speichern', async () => {
    const orderedDate = expertOpinionOrderedDate || dateInputValue(property?.expertOpinionOrderedAt);
    const company = expertOpinionCompany.trim() || property?.expertOpinionCompany || '';
    if (!orderedDate) throw new Error('Bitte geben Sie das Beauftragungsdatum an.');
    if (!company.trim()) throw new Error('Bitte geben Sie den Gutachter oder die Gutachterfirma an.');
    await postJson(`/api/properties/${c.propertyId}/workflow`, {
      action: 'expert_opinion_ordered',
      expertOpinionOrderedAt: orderedDate,
      expertOpinionCompany: company.trim()
    });
  });
  const markFeedbackReceived = () => runCaseAction('Kundenrückmeldung', async () => {
    await postJson(`/api/properties/${c.propertyId}/feedback-received`);
  });
  const rejectCase = () => runCaseAction('Fall ablehnen', async () => {
    const reason = rejectionReasons.find((item) => item.value === rejectionReasonCode);
    if (rejectionNote.trim().length < 8) {
      throw new Error('Bitte einen kurzen Hinweis an den Makler hinterlegen.');
    }
    await postJson(`/api/properties/${c.propertyId}/reject`, {
      reasonCode: rejectionReasonCode,
      reasonLabel: reason?.label,
      note: rejectionNote.trim() || undefined,
    });
    setRejectModalOpen(false);
    setRejectionNote('');
  });
  const acquisitionSteps = [
    { action: null, status: 'SUBMITTED', label: 'Eingereicht', date: property?.createdAt },
    { action: 'indicative_offer_sent', status: 'INDICATIVE_OFFER_SENT', label: 'Unverbindliches Angebot (UVA) abgegeben', date: property?.indicativeOfferSentAt },
    { action: 'offer_accepted', status: 'OFFER_ACCEPTED', label: 'UVA angenommen', date: property?.offerAcceptedAt },
    { action: 'expert_opinion_ordered', status: 'EXPERT_OPINION_ORDERED', label: 'Gutachten beauftragt', date: property?.expertOpinionOrderedAt },
    { action: 'expert_opinion_received', status: 'EXPERT_OPINION_RECEIVED', label: 'Gutachten eingegangen', date: property?.expertOpinionReceivedAt },
    { action: 'binding_offer_sent', status: 'BINDING_OFFER_SENT', label: 'Verbindliches Angebot (VA) abgegeben', date: property?.bindingOfferSentAt },
    { action: 'binding_offer_accepted', status: 'BINDING_OFFER_ACCEPTED', label: 'VA angenommen', date: property?.bindingOfferAcceptedAt },
    { action: 'notary_appointment_ordered', status: 'NOTARY_APPOINTMENT', label: 'Notartermin vereinbart', date: property?.notaryAppointmentAt, needsDate: true },
    { action: 'contract_signed', status: 'IN_PORTFOLIO', label: 'Kaufvertrag abgeschlossen', date: property?.portfolioEnteredAt },
  ];
  const acquisitionStatusAliases = {
    DATA_INCOMPLETE: 'SUBMITTED',
    VALUATION_PENDING: 'SUBMITTED',
    VALUATED: 'SUBMITTED',
    OFFER_CALCULATED: 'SUBMITTED',
    OFFER_DRAFTED: 'SUBMITTED',
    INTERNAL_REVIEW: 'SUBMITTED',
    APPROVED: 'SUBMITTED',
    SENT: 'SUBMITTED',
    PURCHASED: 'IN_PORTFOLIO',
    WON: 'IN_PORTFOLIO'
  };
  const workflowStatus = acquisitionStatusAliases[property?.status] || property?.status;
  const acquisitionStatusIndexFromStatus = acquisitionSteps.findIndex((step) => step.status === workflowStatus);
  const acquisitionStatusIndexFromDates = acquisitionSteps.reduce((highestIndex, step, index) => (
    step.date ? Math.max(highestIndex, index) : highestIndex
  ), -1);
  const acquisitionStatusIndex = Math.max(acquisitionStatusIndexFromStatus, acquisitionStatusIndexFromDates);
  const resetTargetOptions = acquisitionSteps
    .filter((_, index) => index < acquisitionStatusIndex)
    .map((step) => ({ value: step.status, label: step.label }));
  const finalWorkflowStatus = ['PURCHASED', 'IN_PORTFOLIO', 'WON', 'SOLD'].includes(property?.status);
  const canOpenResetWorkflow = canManageWorkflow
    && resetTargetOptions.length > 0
    && !['REJECTED', 'LOST'].includes(property?.status)
    && (!finalWorkflowStatus || ['admin', 'super_admin'].includes(internalRole));
  const openResetWorkflowModal = () => {
    const fallbackTarget = resetTargetOptions[resetTargetOptions.length - 1]?.value || 'SUBMITTED';
    setResetTargetStatus(resetTargetOptions.some((item) => item.value === resetTargetStatus) ? resetTargetStatus : fallbackTarget);
    setResetReason(workflowResetReasons[0]);
    setResetNote('');
    setResetModalOpen(true);
  };
  const handleAcquisitionAction = (step, acceptedSelection = null) => runCaseAction(step.label, async () => {
    if (!step.action) return;
    if (step.action === 'indicative_offer_sent' && !(indicativeOfferSentDate || dateInputValue(property?.indicativeOfferSentAt))) {
      throw new Error('Bitte zuerst „Unverbindliches Angebot abgegeben am“ eintragen.');
    }
    if (step.action === 'offer_accepted') {
      const submittedDate = indicativeOfferSentDate || dateInputValue(property?.indicativeOfferSentAt);
      const acceptedDate = indicativeOfferAcceptedDate || dateInputValue(property?.offerAcceptedAt);
      if (!submittedDate) throw new Error('Bitte zuerst „Unverbindliches Angebot abgegeben am“ eintragen.');
      if (!acceptedDate) throw new Error('Bitte zuerst „Unverbindliches Angebot angenommen am“ eintragen.');
      if (acceptedDate && isDateBefore(acceptedDate, submittedDate)) {
        throw new Error('Das Annahmedatum darf nicht vor dem Abgabedatum liegen.');
      }
    }
    if (step.action === 'binding_offer_sent' && !(bindingOfferSentDate || dateInputValue(property?.bindingOfferSentAt))) {
      throw new Error('Bitte zuerst „Verbindliches Angebot abgegeben am“ eintragen.');
    }
    if (step.action === 'binding_offer_accepted') {
      const submittedDate = bindingOfferSentDate || dateInputValue(property?.bindingOfferSentAt);
      const acceptedDate = bindingOfferAcceptedDate || dateInputValue(property?.bindingOfferAcceptedAt);
      if (!submittedDate) throw new Error('Bitte zuerst „Verbindliches Angebot abgegeben am“ eintragen.');
      if (!acceptedDate) throw new Error('Bitte zuerst „Verbindliches Angebot angenommen am“ eintragen.');
      if (acceptedDate && isDateBefore(acceptedDate, submittedDate)) {
        throw new Error('Das Annahmedatum darf nicht vor dem Abgabedatum liegen.');
      }
    }
    if (step.action === 'expert_opinion_ordered') {
      if (!expertOpinionOrderedDate && !property?.expertOpinionOrderedAt) {
        throw new Error('Bitte geben Sie das Beauftragungsdatum an.');
      }
      if (!expertOpinionCompany.trim() && !property?.expertOpinionCompany) {
        throw new Error('Bitte geben Sie den Gutachter oder die Gutachterfirma an.');
      }
    }
    if (step.action === 'expert_opinion_received') {
      const orderedDate = expertOpinionOrderedDate || dateInputValue(property?.expertOpinionOrderedAt);
      const receivedDate = expertOpinionReceivedDate || dateInputValue(property?.expertOpinionReceivedAt);
      if (!receivedDate) throw new Error('Bitte geben Sie das Eingangsdatum des Gutachtens an.');
      if (orderedDate && isDateBefore(receivedDate, orderedDate)) {
        throw new Error('Das Eingangsdatum des Gutachtens darf nicht vor der Beauftragung liegen.');
      }
    }
    if (step.needsDate && !notaryAppointmentDate && !property?.notaryAppointmentAt) {
      throw new Error('Bitte zuerst den Notartermin eintragen.');
    }
    if (step.needsDate && !notaryOffice.trim() && !property?.notaryOffice) {
      throw new Error('Bitte Notar oder Notariat eintragen.');
    }
    await postJson(`/api/properties/${c.propertyId}/workflow`, {
      action: step.action,
      indicativeOfferSentAt: step.action === 'indicative_offer_sent' ? (indicativeOfferSentDate || dateInputValue(property?.indicativeOfferSentAt)) : undefined,
      offerAcceptedAt: step.action === 'offer_accepted' ? (indicativeOfferAcceptedDate || dateInputValue(property?.offerAcceptedAt)) : undefined,
      expertOpinionOrderedAt: step.action === 'expert_opinion_ordered' ? (expertOpinionOrderedDate || property?.expertOpinionOrderedAt) : undefined,
      expertOpinionReceivedAt: step.action === 'expert_opinion_received' ? (expertOpinionReceivedDate || property?.expertOpinionReceivedAt) : undefined,
      expertOpinionCompany: step.action === 'expert_opinion_ordered' ? (expertOpinionCompany.trim() || property?.expertOpinionCompany) : undefined,
      bindingOfferSentAt: step.action === 'binding_offer_sent' ? (bindingOfferSentDate || dateInputValue(property?.bindingOfferSentAt)) : undefined,
      bindingOfferAcceptedAt: step.action === 'binding_offer_accepted' ? (bindingOfferAcceptedDate || dateInputValue(property?.bindingOfferAcceptedAt)) : undefined,
      acceptedOfferModel: acceptedSelection?.model,
      acceptedOfferId: acceptedSelection?.offerId,
      acceptedOfferNote: acceptedSelection?.note,
      notaryAppointmentAt: step.needsDate ? (notaryAppointmentDate || property?.notaryAppointmentAt) : undefined,
      notaryOffice: step.needsDate ? (notaryOffice.trim() || property?.notaryOffice) : undefined
    });
  });
  const saveOfferDateFields = (kind) => runCaseAction(kind === 'binding' ? 'Datumsfelder verbindliches Angebot' : 'Datumsfelder unverbindliches Angebot', async () => {
    if (kind === 'binding') {
      const submittedDate = bindingOfferSentDate || dateInputValue(property?.bindingOfferSentAt);
      const acceptedDate = bindingOfferAcceptedDate || dateInputValue(property?.bindingOfferAcceptedAt);
      if (acceptedDate && !submittedDate) {
        throw new Error('Bitte zuerst „Verbindliches Angebot abgegeben am“ eintragen.');
      }
      if (isDateBefore(acceptedDate, submittedDate)) {
        throw new Error('Das Annahmedatum darf nicht vor dem Abgabedatum liegen.');
      }
      if (bindingOfferSentDate) {
        await postJson(`/api/properties/${c.propertyId}/workflow`, { action: 'binding_offer_sent', bindingOfferSentAt: bindingOfferSentDate });
      }
      if (bindingOfferAcceptedDate) {
        startAcceptedOfferSelection('binding_offer_accepted');
      }
      return;
    }
    const submittedDate = indicativeOfferSentDate || dateInputValue(property?.indicativeOfferSentAt);
    const acceptedDate = indicativeOfferAcceptedDate || dateInputValue(property?.offerAcceptedAt);
    if (acceptedDate && !submittedDate) {
      throw new Error('Bitte zuerst „Unverbindliches Angebot abgegeben am“ eintragen.');
    }
    if (isDateBefore(acceptedDate, submittedDate)) {
      throw new Error('Das Annahmedatum darf nicht vor dem Abgabedatum liegen.');
    }
    if (indicativeOfferSentDate) {
      await postJson(`/api/properties/${c.propertyId}/workflow`, { action: 'indicative_offer_sent', indicativeOfferSentAt: indicativeOfferSentDate });
    }
    if (indicativeOfferAcceptedDate) {
      startAcceptedOfferSelection('offer_accepted');
    }
  });
  const createIndicativeOfferPdf = (model) => runCaseAction('PDF-Angebot erstellen', async () => {
    const response = await fetch(`/api/properties/${c.propertyId}/offer/generate-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || 'Das PDF konnte nicht erstellt werden. Bitte versuchen Sie es erneut.');
    }
    if (payload.downloadUrl) {
      window.open(payload.downloadUrl, '_blank', 'noopener,noreferrer');
    }
  });
  const indicativeOfferDateFields = (
    <div style={{ background: theme.mintLight, border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: canEditOfferDates ? '1fr 1fr auto' : '1fr 1fr', gap: 10, alignItems: 'end' }}>
        <Field label="Unverbindliches Angebot abgegeben am">
          <Input type="date" value={indicativeOfferSentDate} onChange={(event) => setIndicativeOfferSentDate(event.target.value)} readOnly={!canEditOfferDates} />
        </Field>
        <Field label="Unverbindliches Angebot angenommen am" invalid={Boolean(indicativeOfferAcceptedDate && indicativeOfferSentDate && isDateBefore(indicativeOfferAcceptedDate, indicativeOfferSentDate))}>
          <Input type="date" value={indicativeOfferAcceptedDate} onChange={(event) => setIndicativeOfferAcceptedDate(event.target.value)} readOnly={!canEditOfferDates} />
        </Field>
        {canEditOfferDates && (
          <button onClick={() => saveOfferDateFields('indicative')} disabled={Boolean(busyAction)} style={offerButtonStyle('primary', { disabled: Boolean(busyAction), busy: Boolean(busyAction) })}>
            Daten speichern
          </button>
        )}
      </div>
    </div>
  );
  const bindingOfferDateFields = (
    <div style={{ background: theme.mintLight, border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: canEditOfferDates ? '1fr 1fr auto' : '1fr 1fr', gap: 10, alignItems: 'end' }}>
        <Field label="Verbindliches Angebot abgegeben am">
          <Input type="date" value={bindingOfferSentDate} onChange={(event) => setBindingOfferSentDate(event.target.value)} readOnly={!canEditOfferDates} />
        </Field>
        <Field label="Verbindliches Angebot angenommen am" invalid={Boolean(bindingOfferAcceptedDate && bindingOfferSentDate && isDateBefore(bindingOfferAcceptedDate, bindingOfferSentDate))}>
          <Input type="date" value={bindingOfferAcceptedDate} onChange={(event) => setBindingOfferAcceptedDate(event.target.value)} readOnly={!canEditOfferDates} />
        </Field>
        {canEditOfferDates && (
          <button onClick={() => saveOfferDateFields('binding')} disabled={Boolean(busyAction)} style={offerButtonStyle('primary', { disabled: Boolean(busyAction), busy: Boolean(busyAction) })}>
            Daten speichern
          </button>
        )}
      </div>
    </div>
  );
  const resetWorkflowStep = () => runCaseAction('Prozessschritt zurücksetzen', async () => {
    if (!resetTargetStatus) {
      throw new Error('Bitte einen neuen Prozessschritt auswählen.');
    }
    if (!resetReason.trim()) {
      throw new Error('Grund der Rücksetzung ist erforderlich.');
    }
    await postJson(`/api/properties/${c.propertyId}/workflow/reset`, {
      targetStatus: resetTargetStatus,
      reason: resetReason.trim(),
      note: resetNote.trim() || undefined,
    });
    setResetModalOpen(false);
    setResetNote('');
  });
  const workflowAction = (action) => acquisitionSteps.find((step) => step.action === action);
  const startAcceptedOfferSelection = (action, preferredModel) => {
    const options = acceptedOfferOptions(action);
    const existingModel = existingAcceptedOfferModel(action);
    if (role !== 'admin' && !existingModel) {
      setNotice?.('Das angenommene Modell kann nur intern erfasst werden.');
      return true;
    }
    const selectedModel = existingModel || preferredModel || (options.length === 1 ? options[0].model : '');
    const selectedOffer = options.find((option) => option.model === selectedModel);
    if (!existingModel && options.length > 1) {
      setAcceptedOfferDialog({ action, preferredModel });
      setAcceptedOfferModelInput(selectedModel || options[0]?.model || '');
      setAcceptedOfferNote('');
      return true;
    }
    const step = workflowAction(action);
    if (!step) return false;
    handleAcquisitionAction(step, selectedModel ? { model: selectedModel, offerId: selectedOffer?.offerId } : null);
    return true;
  };
  const submitAcceptedOfferSelection = () => {
    if (!acceptedOfferDialog) return;
    const model = acceptedOfferModelInput;
    if (!model) {
      setNotice?.('Bitte wählen Sie das angenommene Modell aus.');
      return;
    }
    const options = acceptedOfferOptions(acceptedOfferDialog.action);
    const selectedOffer = options.find((option) => option.model === model);
    if (!selectedOffer) {
      setNotice?.('Das ausgewählte Modell wurde nicht angeboten.');
      return;
    }
    const step = workflowAction(acceptedOfferDialog.action);
    if (!step) {
      setNotice?.('Dieser Prozessschritt ist nicht vorbereitet.');
      return;
    }
    setAcceptedOfferDialog(null);
    setAcceptedOfferNote('');
    handleAcquisitionAction(step, { model, offerId: selectedOffer.offerId, note: acceptedOfferNote.trim() || undefined });
  };
  const runWorkflowAction = (action, preferredModel) => {
    const step = workflowAction(action);
    if (!step) {
      setNotice?.('Dieser Prozessschritt ist nicht vorbereitet.');
      return;
    }
    if (action === 'offer_accepted' || action === 'binding_offer_accepted') {
      startAcceptedOfferSelection(action, preferredModel);
      return;
    }
    handleAcquisitionAction(step);
  };
  const workflowActionState = (action) => {
    const index = acquisitionSteps.findIndex((step) => step.action === action);
    const step = acquisitionSteps[index];
    if (index < 0 || !step) return { step: null, reached: false, nextAllowed: false, disabled: true };
    const reached = acquisitionStatusIndex >= index || Boolean(step.date);
    const nextAllowed = acquisitionStatusIndex === -1 ? index === 0 : index === acquisitionStatusIndex + 1;
    const needsDateBeforeAction = step.needsDate && nextAllowed && (!notaryAppointmentDate && !property?.notaryAppointmentAt || !notaryOffice.trim() && !property?.notaryOffice);
    const missingBindingOffer = action === 'binding_offer_sent' && !hasBindingOffer;
    const missingRequiredActionData =
      (action === 'indicative_offer_sent' && !(indicativeOfferSentDate || dateInputValue(property?.indicativeOfferSentAt))) ||
      (action === 'offer_accepted' && !(indicativeOfferAcceptedDate || dateInputValue(property?.offerAcceptedAt))) ||
      (action === 'expert_opinion_ordered' && (!(expertOpinionOrderedDate || dateInputValue(property?.expertOpinionOrderedAt)) || !(expertOpinionCompany.trim() || property?.expertOpinionCompany))) ||
      (action === 'expert_opinion_received' && !(expertOpinionReceivedDate || dateInputValue(property?.expertOpinionReceivedAt))) ||
      (action === 'binding_offer_sent' && !(bindingOfferSentDate || dateInputValue(property?.bindingOfferSentAt))) ||
      (action === 'binding_offer_accepted' && !(bindingOfferAcceptedDate || dateInputValue(property?.bindingOfferAcceptedAt)));
    return {
      step,
      reached,
      nextAllowed,
      disabled: Boolean(busyAction) || reached || !nextAllowed || needsDateBeforeAction || missingBindingOffer || missingRequiredActionData
    };
  };
  const workflowButtonStyle = ({ reached, nextAllowed, disabled }) => ({
    background: reached ? '#5B8C2B14' : nextAllowed ? theme.aubergine : 'white',
    border: `1px solid ${reached ? '#5B8C2B33' : nextAllowed ? theme.aubergine : theme.border}`,
    color: reached ? '#5B8C2B' : nextAllowed ? 'white' : `${theme.ink}66`,
    borderRadius: 5,
    padding: '7px 11px',
    fontSize: 12,
    fontWeight: 800,
    cursor: disabled ? 'default' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    opacity: disabled && !reached ? 0.58 : 1
  });
  function offerButtonStyle(variant = 'primary', { disabled = false, busy = false } = {}) {
    const styles = {
      primary: {
        background: theme.aubergine,
        border: `1px solid ${theme.aubergine}`,
        color: 'white',
      },
      secondary: {
        background: 'white',
        border: `1px solid ${theme.aubergine}`,
        color: theme.aubergine,
      },
      disabled: {
        background: '#F7F4F8',
        border: `1px solid ${theme.border}`,
        color: `${theme.ink}66`,
      },
    };
    const selected = disabled ? styles.disabled : styles[variant] || styles.primary;
    return {
      ...selected,
      borderRadius: 8,
      padding: '10px 16px',
      minHeight: 42,
      width: 'auto',
      justifySelf: 'start',
      whiteSpace: 'nowrap',
      fontSize: 12.5,
      fontWeight: 850,
      fontFamily: 'inherit',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      cursor: disabled ? 'default' : busy ? 'wait' : 'pointer',
      opacity: disabled ? 0.62 : 1,
    };
  }
  const OfferDonePill = ({ children }) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#5B8C2B14', color: '#5B8C2B', border: '1px solid #5B8C2B33', borderRadius: 999, padding: '6px 11px', minHeight: 32, fontSize: 11.5, fontWeight: 850, whiteSpace: 'nowrap' }}>
      <CheckCircle size={13} /> {children}
    </span>
  );
  const OfferSuccessHint = ({ action, children = 'Berechnung aktualisiert' }) => (
    recentSuccessAction === action ? (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#5B8C2B', fontSize: 12, fontWeight: 800 }}>
        <CheckCircle size={13} /> {children}
      </span>
    ) : null
  );
  const renderOfferWorkflowControl = (action, label) => {
    const state = workflowActionState(action);
    if (state.reached) {
      return <OfferDonePill>{label}</OfferDonePill>;
    }
    return (
      <button onClick={() => runWorkflowAction(action)} disabled={state.disabled} style={offerButtonStyle(state.nextAllowed ? 'primary' : 'secondary', { disabled: state.disabled })}>
        {label}
      </button>
    );
  };
  const offerShellStyle = { background: 'white', border: `1px solid ${theme.border}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 14px 34px rgba(68, 0, 92, 0.045)' };
  const offerHeaderStyle = { padding: '20px 24px', borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 };
  const offerHeroStyle = { background: '#FEFCF8', padding: '28px 26px', display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(280px, 416px)', gap: 28, alignItems: 'center' };
  const offerSectionTitleStyle = { fontSize: 10.5, color: theme.aubergine, fontWeight: 850, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 14 };
  const renderOfferBreakdown = (rows, emptyText) => (
    <div style={{ background: 'white', border: `1px solid ${theme.border}`, borderRadius: 12, padding: '14px 18px' }}>
      {rows.length ? rows.map(([label, value], rowIndex) => {
        const isDelta = String(label).startsWith('Δ');
        const isNegative = String(value).startsWith('-');
        return (
          <div key={`${label}-${rowIndex}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, borderBottom: rowIndex < rows.length - 1 ? `1px solid ${theme.borderSoft}` : 'none', padding: '8px 0' }}>
            <span style={{ fontSize: 12.5, color: `${theme.ink}99`, fontWeight: 650 }}>{label}</span>
            <span style={{ fontSize: 12.5, color: isDelta ? (isNegative ? '#9B2C2C' : '#2F7D32') : theme.aubergine, fontWeight: 800, textAlign: 'right' }}>{value}</span>
          </div>
        );
      }) : (
        <div style={{ fontSize: 12.5, color: `${theme.ink}88` }}>{emptyText}</div>
      )}
    </div>
  );
  const renderOfferChipRows = (rows) => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
      {rows.map(([label, value]) => (
        <span key={label} style={{ border: `1px solid ${theme.border}`, background: 'white', color: theme.ink, borderRadius: 6, padding: '7px 10px', fontSize: 11.5, fontWeight: 650 }}>
          {label} {value}
        </span>
      ))}
    </div>
  );
  const renderIndicativeOfferCard = (modelRequest, index) => {
    const offer = indicativeOffers.find((item) => item.model === modelRequest.model);
    const key = `${modelRequest.key}-${index}`;
    const params = calculationParams[key] || {};
    const isRentBack = modelRequest.model === 'sale_and_leaseback';
    const rentBackMetrics = isRentBack && offer ? rentBackCalculationFromOffer(offer) : null;
    const quote = rentBackMetrics
      ? Math.round(rentBackMetrics.payoutRate * 100)
      : offer?.payoutAmount && offer?.marketValue ? Math.round((offer.payoutAmount / offer.marketValue) * 100) : undefined;
    const payoutValue = rentBackMetrics?.payoutAmount ?? offer?.payoutAmount;
    const calculationActionLabel = isRentBack ? 'Rückmietverkauf-Kalkulation' : 'Wohnrecht-Kalkulation';
    const offerMeta = offer ? `Version ${offer.currentVersion || 1} · zuletzt berechnet` : 'Entwurf';
    const maintenanceValue = offer ? (params.maintenance || offer.companyMargin || offer.assumptions?.components?.maintenancePledge) : null;
    const breakdownRows = offer ? (isRentBack ? rentBackMetricRows(offer) : [
      ['Verkehrswert', formatEuro(offer.marketValue)],
      ['Wohnrechtswert', offer.residentialRightValue ? formatEuro(offer.residentialRightValue) : '-'],
      ['Risikoabschlag', offer.riskDiscount ? formatEuro(offer.riskDiscount) : '-'],
      ['Marge', offer.companyMargin ? formatEuro(offer.companyMargin) : '-'],
      ['Auszahlungsbetrag', formatEuro(offer.payoutAmount)],
      ['Quote', quote ? `${quote}%` : '-'],
    ]) : [];
    const chipRows = [
      ['Verkehrswert', offer ? formatEuro(offer.marketValue) : params.marketValue ? `${params.marketValue} €` : '-'],
      ['Modell', labelFrom(productModelLabels, modelRequest.model)],
      isRentBack
        ? ['Info', 'Miete ab Tag 1']
        : ['Laufzeit', `${modelRequest.residentialRightYears || property?.desiredResidentialRightYears || '-'} Jahre`],
    ];
    const statusSent = workflowActionState('indicative_offer_sent');
    const statusAccepted = workflowActionState('offer_accepted');
    const nextStep = !statusSent.reached
      ? {
          title: 'Als Nächstes: Unverbindliches Angebot abgeben',
          help: 'Berechnung prüfen und den Schritt markieren, sobald der Kunde informiert ist.',
          label: 'Unverbindliches Angebot abgegeben',
          action: 'indicative_offer_sent',
          state: statusSent,
        }
      : !statusAccepted.reached
        ? {
            title: 'Als Nächstes: Annahme dokumentieren',
            help: 'Sobald der Kunde das unverbindliche Angebot annimmt, kann die Gutachtenbeauftragung starten.',
            label: 'UVA angenommen',
            action: 'offer_accepted',
            state: statusAccepted,
          }
        : {
            title: 'Unverbindliches Angebot angenommen',
            help: 'Der nächste operative Schritt ist die Gutachtenbeauftragung.',
            label: 'UVA angenommen',
            action: 'offer_accepted',
            state: statusAccepted,
          };

    return (
      <div key={`indicative-offer-card-${key}`} style={offerShellStyle}>
        <div style={offerHeaderStyle}>
          <div style={{ fontSize: 18, color: theme.aubergine, fontWeight: 800 }}>
            Unverbindliches Angebot · <span style={{ fontStyle: 'italic', fontWeight: 700 }}>{labelFrom(productModelLabels, modelRequest.model)}</span>
          </div>
          <div style={{ fontSize: 12, color: `${theme.ink}88`, whiteSpace: 'nowrap' }}>{offerMeta}</div>
        </div>

        <div style={offerHeroStyle}>
          <div>
            <div style={{ fontSize: 10.5, color: theme.aubergine, fontWeight: 850, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 10 }}>Unverbindliche Auszahlung</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 33.6, lineHeight: 1, color: theme.aubergine, fontWeight: 700, fontFamily: 'inherit' }}>{payoutValue ? formatEuroCents(payoutValue) : '-'}</div>
              <div style={{ fontSize: 16, color: `${theme.ink}88`, fontWeight: 650 }}>{quote ? `${quote}%` : '-'}</div>
            </div>
            {rentBackMetrics && (
              <div style={{ marginTop: 8, fontSize: 13, color: `${theme.ink}99`, fontWeight: 650 }}>
                Monatliche Miete {formatEuroCents(rentBackMetrics.monthlyRent)}
              </div>
            )}
            {renderOfferChipRows(chipRows)}
          </div>
          {renderOfferBreakdown(breakdownRows, 'Noch keine UVA-Kalkulation vorhanden.')}
        </div>

        {canManageOffers && (
          <div style={{ padding: '20px 24px', borderTop: `1px solid ${theme.borderSoft}` }}>
            <div style={offerSectionTitleStyle}>Berechnungs-Eingabe</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 14 }}>
              {[
                ['marketValue', 'Verkehrswert (€)'],
                ['maintenance', 'Instandhaltung (€)'],
                ['interestRate', 'Interne Verzinsung (%)'],
                ['safetyDiscount', 'Sicherheitsabschlag (%)'],
              ].map(([field, label]) => (
                <Field key={field} label={label}>
                  <Input type="number" value={params[field] || ''} onChange={(event) => setCalculationParams({ ...calculationParams, [key]: { ...params, [field]: event.target.value } })} />
                </Field>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => startValuationAndOffer(modelRequest.model)} disabled={Boolean(busyAction)} style={offerButtonStyle('secondary', { disabled: Boolean(busyAction), busy: busyAction === calculationActionLabel })}>
                {busyAction === calculationActionLabel ? 'Berechnet...' : offer ? 'Neu berechnen' : 'Unverbindliches Angebot berechnen'}
              </button>
              <OfferSuccessHint action={calculationActionLabel} />
            </div>
          </div>
        )}

        {modelRequest.primary && (
          <div style={{ padding: '20px 24px', borderTop: `1px solid ${theme.borderSoft}` }}>
            <div style={offerSectionTitleStyle}>Angebotsdaten</div>
            <div style={{ display: 'grid', gridTemplateColumns: canEditOfferDates ? '1fr 1fr auto' : '1fr 1fr', gap: 14, alignItems: 'end' }}>
              <Field label="Unverbindliches Angebot abgegeben am">
                <Input type="date" value={indicativeOfferSentDate} onChange={(event) => setIndicativeOfferSentDate(event.target.value)} readOnly={!canEditOfferDates} />
              </Field>
              <Field label="Unverbindliches Angebot angenommen am" invalid={Boolean(indicativeOfferAcceptedDate && indicativeOfferSentDate && isDateBefore(indicativeOfferAcceptedDate, indicativeOfferSentDate))}>
                <Input type="date" value={indicativeOfferAcceptedDate} onChange={(event) => setIndicativeOfferAcceptedDate(event.target.value)} readOnly={!canEditOfferDates} />
              </Field>
              {canEditOfferDates && (
                <button onClick={() => saveOfferDateFields('indicative')} disabled={Boolean(busyAction)} style={offerButtonStyle('primary', { disabled: Boolean(busyAction), busy: Boolean(busyAction) })}>
                  Daten speichern
                </button>
              )}
            </div>
            <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 8, background: theme.mintLight, border: `1px solid ${theme.borderSoft}`, borderRadius: 999, padding: '6px 11px', fontSize: 12, color: theme.ink, fontWeight: 750 }}>
              <span style={{ color: `${theme.ink}88`, fontWeight: 650 }}>Angenommenes Modell:</span>
              <span style={{ color: theme.aubergine }}>{acceptedOfferModelLabel('offer_accepted')}</span>
            </div>
          </div>
        )}

        {isRentBack && offer && (
          <div style={{ padding: '0 24px 18px', fontSize: 11.5, color: `${theme.ink}88`, lineHeight: 1.45 }}>
            Demo-Kalkulation: Die Auszahlung beträgt pauschal 70 % des Verkehrswerts. Die jährliche Miete beträgt 5 % des Auszahlungsbetrags. Rating-Tool folgt.
          </div>
        )}

        <div style={{ background: '#FCF8F0', borderTop: `1px solid ${theme.borderSoft}`, padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 13, color: theme.aubergine, fontWeight: 850 }}>{nextStep.title}</div>
            <div style={{ fontSize: 12, color: `${theme.ink}88`, marginTop: 4 }}>{nextStep.help}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {canManageOffers && (
              <>
                <button
                  onClick={() => createIndicativeOfferPdf(modelRequest.model)}
                  disabled={Boolean(busyAction) || !offer}
                  title={!offer ? 'Bitte zuerst das unverbindliche Angebot berechnen.' : 'PDF-Angebot erstellen'}
                  style={offerButtonStyle('secondary', { disabled: Boolean(busyAction) || !offer, busy: busyAction === 'PDF-Angebot erstellen' })}
                >
                  PDF-Angebot erstellen
                </button>
                {!offer && <span style={{ fontSize: 11.5, color: `${theme.ink}88` }}>Bitte zuerst das unverbindliche Angebot berechnen.</span>}
              </>
            )}
            {(canManageOffers || role === 'partner') && (
              nextStep.state.reached ? (
                <OfferDonePill>{nextStep.label}</OfferDonePill>
              ) : (
                <button onClick={() => runWorkflowAction(nextStep.action, modelRequest.model)} disabled={nextStep.state.disabled} style={offerButtonStyle('primary', { disabled: nextStep.state.disabled })}>
                  {nextStep.label}
                  <ChevronRight size={15} />
                </button>
              )
            )}
          </div>
        </div>
      </div>
    );
  };
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
  const updateDocumentReviewInput = (documentId, patch) => {
    setDocumentReviewInputs((current) => ({
      ...current,
      [documentId]: { ...(current[documentId] || {}), ...patch },
    }));
  };
  const reviewDocument = (document) => runCaseAction('Dokument prüfen', async () => {
    if (!document.id || document.id.startsWith('mock-')) {
      throw new Error('Dieses Mock-Dokument kann nicht geprüft werden.');
    }
    const input = documentReviewInputs[document.id] || {};
    await patchJson(`/api/properties/${c.propertyId}/documents/${document.id}`, {
      status: input.status || document.status,
      requirementLevel: input.requirementLevel || (document.type === 'Pflicht' ? 'required' : document.type === 'Empfohlen' ? 'recommended' : 'optional'),
      scanStatus: input.scanStatus || document.scanStatus || 'pending',
      scanNote: input.scanNote,
      missingReason: input.missingReason,
    });
  });
  const sendChatMessage = () => runCaseAction('Chat-Nachricht senden', async () => {
    const message = chatInput.trim();
    if (!message && !chatAttachmentFiles.length) {
      throw new Error('Bitte eine Nachricht eingeben.');
    }
    if (chatAttachmentFiles.length) {
      const formData = new FormData();
      formData.append('message', message || 'Anhang');
      formData.append('visibility', role === 'admin' ? chatVisibility : 'shared');
      chatAttachmentFiles.slice(0, 5).forEach((file) => formData.append('attachments', file));
      await postFormData(`/api/properties/${c.propertyId}/chat`, formData);
    } else {
      await postJson(`/api/properties/${c.propertyId}/chat`, {
        message,
        visibility: role === 'admin' ? chatVisibility : 'shared',
      });
    }
    setChatInput('');
    setChatVisibility('shared');
    setChatAttachmentFiles([]);
    await onNotificationsRefresh?.();
  });
  const updatePortfolioForm = (patch) => setPortfolioForm((current) => ({ ...current, ...patch }));
  const updateExitProcessForm = (patch) => setExitProcessForm((current) => ({ ...current, ...patch }));
  const savePortfolioFile = () => runCaseAction('Bestandsakte speichern', async () => {
    const payload = {
      purchaseContractNumber: portfolioForm.purchaseContractNumber,
      purchaseContractSignedAt: portfolioForm.purchaseContractSignedAt,
      purchasePrice: portfolioForm.purchasePrice,
      payoutPaidAt: portfolioForm.payoutPaidAt,
      ownershipTransferAt: portfolioForm.ownershipTransferAt,
      landRegisterEntryAt: portfolioForm.landRegisterEntryAt,
      monthlyRent: portfolioForm.monthlyRent,
      rentStartAt: portfolioForm.rentStartAt,
      rentDeposit: portfolioForm.rentDeposit,
      residentialRightStartAt: portfolioForm.residentialRightStartAt,
      residentialRightEndAt: portfolioForm.residentialRightEndAt,
      residentialRightNotes: portfolioForm.residentialRightNotes,
      notaryAppointmentRequestedAt: portfolioForm.notaryAppointmentRequestedAt,
      purchaseContractDraftReceivedAt: portfolioForm.purchaseContractDraftReceivedAt,
      purchaseContractDraftReviewedAt: portfolioForm.purchaseContractDraftReviewedAt,
      priorityNoticeRegisteredAt: portfolioForm.priorityNoticeRegisteredAt,
      purchasePriceDueAt: portfolioForm.purchasePriceDueAt,
      purchasePricePaidAt: portfolioForm.purchasePricePaidAt,
      residentialRightRegisteredAt: portfolioForm.residentialRightRegisteredAt,
      benefitsAndBurdensTransferAt: portfolioForm.benefitsAndBurdensTransferAt,
      buildingInsuranceClarified: portfolioForm.buildingInsuranceClarified,
      propertyManagerInformed: portfolioForm.propertyManagerInformed,
      serviceChargeInfoRequested: portfolioForm.serviceChargeInfoRequested,
      propertyTaxInfoAvailable: portfolioForm.propertyTaxInfoAvailable,
      propertyFileComplete: portfolioForm.propertyFileComplete,
      portfolioEnteredAt: portfolioForm.portfolioEnteredAt,
      residentStaysInProperty: portfolioForm.residentStaysInProperty,
      residentName: portfolioForm.residentName,
      usageModel: portfolioForm.usageModel,
      usageRightStartsAt: portfolioForm.usageRightStartsAt,
      usageRightEndsAt: portfolioForm.usageRightEndsAt,
      monthlyUsageFee: portfolioForm.monthlyUsageFee,
      residentContactName: portfolioForm.residentContactName,
      residentEmergencyContact: portfolioForm.residentEmergencyContact,
      propertyManagerName: portfolioForm.propertyManagerName,
      buildingInsurance: portfolioForm.buildingInsurance,
      serviceChargeStatus: portfolioForm.serviceChargeStatus,
      repairReportingChannelClarified: portfolioForm.repairReportingChannelClarified,
      conditionDocumentationAvailable: portfolioForm.conditionDocumentationAvailable,
      nextPortfolioReviewAt: portfolioForm.nextPortfolioReviewAt,
      maintenancePlan: {
        nextReviewDate: portfolioForm.maintenanceNextReviewDate,
        responsible: portfolioForm.maintenanceResponsible,
        annualBudget: portfolioForm.maintenanceBudget,
        notes: portfolioForm.maintenanceNotes,
      },
      portfolioTasks: {
        nextAppointmentDate: portfolioForm.nextAppointmentDate,
        nextAppointmentType: portfolioForm.nextAppointmentType,
        nextAppointmentNote: portfolioForm.nextAppointmentNote,
      },
      portfolioNotes: portfolioForm.portfolioNotes,
    };
    await patchJson(`/api/properties/${c.propertyId}/portfolio`, payload);
  });
  const saveExitProcess = () => runCaseAction('Verkaufsprozess speichern', async () => {
    await patchJson(`/api/properties/${c.propertyId}/exit`, exitProcessForm);
  });
  const startResidentStatusAction = (action) => {
    if (!inventoryCase) {
      setNotice?.('Bewohnerstatus kann erst nach Bestandsübernahme geändert werden.');
      return;
    }
    const label = action === 'deceased' ? 'verstorben' : 'zieht aus';
    const firstQuestion = action === 'deceased'
      ? 'Möchten Sie den Bewohnerstatus auf „verstorben“ setzen?'
      : 'Möchten Sie den Bewohnerstatus auf „zieht aus“ setzen?';
    if (!window.confirm(firstQuestion)) return;
    if (!window.confirm('Diese Änderung startet den Verkaufsprozess. Bitte bestätigen Sie erneut.')) return;
    setResidentStatusAction(action);
    setResidentStatusForm({
      moveOutDate: action === 'move_out' ? dateInputValue(property?.residentMoveOutDate || property?.exitProcess?.usageRightEndedAt) : '',
      deathDate: action === 'deceased' ? dateInputValue(property?.residentDeathDate || property?.exitProcess?.usageRightEndedAt) : '',
      reportedAt: action === 'deceased' ? dateInputValue(new Date().toISOString()) : '',
      note: '',
      relativesOrEstateContact: property?.residentEmergencyContact || property?.exitProcess?.relativesOrEstateContact || ''
    });
    setNotice?.(`Bewohnerstatus „${label}“ vorbereiten.`);
  };
  const submitResidentStatusAction = () => runCaseAction('Bewohnerstatus speichern', async () => {
    if (!inventoryCase) {
      throw new Error('Bewohnerstatus kann erst nach Bestandsübernahme geändert werden.');
    }
    await postJson(`/api/properties/${c.propertyId}/resident-status`, {
      action: residentStatusAction,
      ...residentStatusForm,
    });
    setResidentStatusAction('');
    await onRefresh?.();
    changeTab('verwertung');
  });
  const openTaskCount = taskRows.length;
  const unreadCommunicationCount = chatMessages.filter((message) => !message.readByCurrentUser).length;
  const tabs = [
    { id: 'kunde', label: 'Kunde' },
    { id: 'objekt', label: 'Objekt' },
    ...(role === 'admin' ? [{ id: 'rating', label: 'Objektrating' }] : []),
    { id: 'indag', label: 'Unverbindliches Angebot' },
    { id: 'verbag', label: 'Verbindliches Angebot' },
    ...(role === 'admin' ? [
      { id: 'kvabwicklung', label: 'KV-Abwicklung' },
      { id: 'bestand', label: 'Bestandsverwaltung' },
      { id: 'verwertung', label: 'Verkaufsprozess', disabled: !salesProcessActive },
    ] : []),
    { id: 'doks', label: 'Objektunterlagen' },
    ...(role === 'admin' ? [{ id: 'aufgaben', label: 'Aufgaben', tool: true, icon: ClipboardList, badge: openTaskCount }] : []),
    { id: 'chat', label: 'Kommunikation', tool: true, icon: MessageSquare, badge: unreadCommunicationCount },
  ];
  const renderBindingOfferCard = (modelRequest, index) => {
    const bindingOffer = bindingOffers.find((item) => item.model === modelRequest.model);
    const indicativeOffer = indicativeOffers.find((item) => item.model === modelRequest.model);
    const isRentBack = modelRequest.model === 'sale_and_leaseback';
    const bindingRentBackMetrics = isRentBack && bindingOffer ? rentBackCalculationFromOffer(bindingOffer) : null;
    const indicativeRentBackMetrics = isRentBack && indicativeOffer ? rentBackCalculationFromOffer(indicativeOffer) : null;
    const deltaMarket = bindingOffer && indicativeOffer ? bindingOffer.marketValue - indicativeOffer.marketValue : undefined;
    const deltaPayout = bindingOffer && indicativeOffer
      ? (bindingRentBackMetrics?.payoutAmount ?? bindingOffer.payoutAmount) - (indicativeRentBackMetrics?.payoutAmount ?? indicativeOffer.payoutAmount)
      : undefined;
    const quote = bindingRentBackMetrics
      ? Math.round(bindingRentBackMetrics.payoutRate * 100)
      : bindingOffer?.payoutAmount && bindingOffer?.marketValue ? Math.round((bindingOffer.payoutAmount / bindingOffer.marketValue) * 100) : undefined;
    const payoutValue = bindingRentBackMetrics?.payoutAmount ?? bindingOffer?.payoutAmount;
    const offerMeta = bindingOffer
      ? `Version ${bindingOffer.currentVersion || 1} · zuletzt berechnet`
      : 'Entwurf';
    const statusSent = workflowActionState('binding_offer_sent');
    const statusAccepted = workflowActionState('binding_offer_accepted');
    const nextStep = !statusSent.reached
      ? {
          title: 'Als Nächstes: Verbindliches Angebot abgeben',
          help: 'Berechnung ist final. Markiere den Schritt, sobald der Kunde informiert ist.',
          label: 'Angebot abgegeben',
          action: 'binding_offer_sent',
          state: statusSent,
        }
      : !statusAccepted.reached
        ? {
            title: 'Als Nächstes: Annahme dokumentieren',
            help: 'Sobald der Kunde das verbindliche Angebot angenommen hat, kann die Notarvorbereitung starten.',
            label: 'VA angenommen',
            action: 'binding_offer_accepted',
            state: statusAccepted,
          }
        : {
            title: 'Verbindliches Angebot angenommen',
            help: 'Der nächste operative Schritt liegt in Notartermin und Kaufvertrag.',
            label: 'VA angenommen',
            action: 'binding_offer_accepted',
            state: statusAccepted,
          };
    const breakdownRows = bindingOffer ? (isRentBack ? [
      ...rentBackMetricRows(bindingOffer),
      ['Δ Wert vs. UVA', deltaMarket !== undefined ? `${deltaMarket >= 0 ? '+' : ''}${formatEuro(deltaMarket)}` : '-'],
      ['Δ Auszahlung vs. UVA', deltaPayout !== undefined ? `${deltaPayout >= 0 ? '+' : ''}${formatEuroCents(deltaPayout)}` : '-'],
    ] : [
      ['UVA-Marktwert', indicativeOffer ? formatEuro(indicativeOffer.marketValue) : '-'],
      ['Gutachtenwert', formatEuro(bindingOffer.marketValue)],
      ['Wohnrechtswert', bindingOffer.residentialRightValue ? formatEuro(bindingOffer.residentialRightValue) : '-'],
      ['Risikoabschlag', bindingOffer.riskDiscount ? formatEuro(bindingOffer.riskDiscount) : '-'],
      ['Marge', bindingOffer.companyMargin ? formatEuro(bindingOffer.companyMargin) : '-'],
      ['Δ Wert vs. UVA', deltaMarket !== undefined ? `${deltaMarket >= 0 ? '+' : ''}${formatEuro(deltaMarket)}` : '-'],
      ['Δ Auszahlung vs. UVA', deltaPayout !== undefined ? `${deltaPayout >= 0 ? '+' : ''}${formatEuro(deltaPayout)}` : '-'],
    ]) : [];
    const chipRows = [
      ['Gutachtenwert', bindingOffer ? formatEuro(bindingOffer.marketValue) : expertOpinionValue ? `${expertOpinionValue} €` : '-'],
      ['Modell', labelFrom(productModelLabels, modelRequest.model)],
      isRentBack
        ? ['Info', 'Miete ab Tag 1']
        : ['Laufzeit', `${modelRequest.residentialRightYears || property?.desiredResidentialRightYears || '-'} Jahre`],
    ];

    return (
      <div key={`binding-offer-card-${modelRequest.key}-${index}`} style={{ background: 'white', border: `1px solid ${theme.border}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 14px 34px rgba(68, 0, 92, 0.045)' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ fontSize: 18, color: theme.aubergine, fontWeight: 800 }}>
            Verbindliches Angebot · <span style={{ fontStyle: 'italic', fontWeight: 700 }}>{labelFrom(productModelLabels, modelRequest.model)}</span>
          </div>
          <div style={{ fontSize: 12, color: `${theme.ink}88`, whiteSpace: 'nowrap' }}>{offerMeta}</div>
        </div>

        <div style={{ background: '#FEFCF8', padding: '28px 26px', display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(280px, 416px)', gap: 28, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10.5, color: theme.aubergine, fontWeight: 850, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 10 }}>Verbindliche Auszahlung</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 33.6, lineHeight: 1, color: theme.aubergine, fontWeight: 700, fontFamily: 'inherit' }}>{payoutValue ? formatEuroCents(payoutValue) : '-'}</div>
              <div style={{ fontSize: 16, color: `${theme.ink}88`, fontWeight: 650 }}>{quote ? `${quote}%` : '-'}</div>
            </div>
            {bindingRentBackMetrics && (
              <div style={{ marginTop: 8, fontSize: 13, color: `${theme.ink}99`, fontWeight: 650 }}>
                Monatliche Miete {formatEuroCents(bindingRentBackMetrics.monthlyRent)}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
              {chipRows.map(([label, value]) => (
                <span key={label} style={{ border: `1px solid ${theme.border}`, background: 'white', color: theme.ink, borderRadius: 6, padding: '7px 10px', fontSize: 11.5, fontWeight: 650 }}>
                  {label} {value}
                </span>
              ))}
            </div>
          </div>

          <div style={{ background: 'white', border: `1px solid ${theme.border}`, borderRadius: 12, padding: '14px 18px' }}>
            {breakdownRows.length ? breakdownRows.map(([label, value], rowIndex) => {
              const isDelta = String(label).startsWith('Δ');
              const isNegative = String(value).startsWith('-');
              return (
                <div key={`${label}-${rowIndex}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, borderBottom: rowIndex < breakdownRows.length - 1 ? `1px solid ${theme.borderSoft}` : 'none', padding: '8px 0' }}>
                  <span style={{ fontSize: 12.5, color: `${theme.ink}99`, fontWeight: 650 }}>{label}</span>
                  <span style={{ fontSize: 12.5, color: isDelta ? (isNegative ? '#9B2C2C' : '#2F7D32') : theme.aubergine, fontWeight: 800, textAlign: 'right' }}>{value}</span>
                </div>
              );
            }) : (
              <div style={{ fontSize: 12.5, color: `${theme.ink}88` }}>Noch keine VA-Kalkulation vorhanden.</div>
            )}
          </div>
        </div>

        {canManageOffers && (
          <div style={{ padding: '20px 24px', borderTop: `1px solid ${theme.borderSoft}` }}>
            <div style={{ fontSize: 10.5, color: theme.aubergine, fontWeight: 850, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 14 }}>Berechnungs-Eingabe</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 300px) max-content auto', gap: 14, alignItems: 'end' }}>
              <Field label="Gutachtenwert (€)" required>
                <Input type="text" value={expertOpinionValue} onChange={(event) => setExpertOpinionValue(formatGermanIntegerInput(event.target.value))} placeholder="z.B. 650.000" inputMode="numeric" />
              </Field>
              <button onClick={() => calculateBindingOffer(modelRequest, index)} disabled={Boolean(busyAction) || !canPrepareBindingOffer} style={offerButtonStyle('secondary', { disabled: Boolean(busyAction) || !canPrepareBindingOffer, busy: busyAction === 'VA-Kalkulation' })}>
                {busyAction === 'VA-Kalkulation' ? 'Berechnet...' : 'Neu berechnen'}
              </button>
              <OfferSuccessHint action="VA-Kalkulation" />
            </div>
          </div>
        )}

        {modelRequest.primary && (
          <div style={{ padding: '20px 24px', borderTop: `1px solid ${theme.borderSoft}` }}>
            <div style={{ fontSize: 10.5, color: theme.aubergine, fontWeight: 850, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 14 }}>Angebotsdaten</div>
            <div style={{ display: 'grid', gridTemplateColumns: canEditOfferDates ? '1fr 1fr auto' : '1fr 1fr', gap: 14, alignItems: 'end' }}>
              <Field label="Verbindliches Angebot abgegeben am">
                <Input type="date" value={bindingOfferSentDate} onChange={(event) => setBindingOfferSentDate(event.target.value)} readOnly={!canEditOfferDates} />
              </Field>
              <Field label="Verbindliches Angebot angenommen am" invalid={Boolean(bindingOfferAcceptedDate && bindingOfferSentDate && isDateBefore(bindingOfferAcceptedDate, bindingOfferSentDate))}>
                <Input type="date" value={bindingOfferAcceptedDate} onChange={(event) => setBindingOfferAcceptedDate(event.target.value)} readOnly={!canEditOfferDates} />
              </Field>
              {canEditOfferDates && (
                <button onClick={() => saveOfferDateFields('binding')} disabled={Boolean(busyAction)} style={offerButtonStyle('primary', { disabled: Boolean(busyAction), busy: Boolean(busyAction) })}>
                  Daten speichern
                </button>
              )}
            </div>
            <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 8, background: theme.mintLight, border: `1px solid ${theme.borderSoft}`, borderRadius: 999, padding: '6px 11px', fontSize: 12, color: theme.ink, fontWeight: 750 }}>
              <span style={{ color: `${theme.ink}88`, fontWeight: 650 }}>Angenommenes Modell:</span>
              <span style={{ color: theme.aubergine }}>{acceptedOfferModelLabel('binding_offer_accepted')}</span>
            </div>
          </div>
        )}

        {modelRequest.model === 'sale_and_leaseback' && bindingOffer && (
          <div style={{ padding: '0 24px 18px', fontSize: 11.5, color: `${theme.ink}88`, lineHeight: 1.45 }}>
            Demo-Kalkulation: Die Auszahlung beträgt pauschal 70 % des Verkehrswerts. Die jährliche Miete beträgt 5 % des Auszahlungsbetrags. Rating-Tool folgt.
          </div>
        )}

        <div style={{ background: '#FCF8F0', borderTop: `1px solid ${theme.borderSoft}`, padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 13, color: theme.aubergine, fontWeight: 850 }}>{nextStep.title}</div>
            <div style={{ fontSize: 12, color: `${theme.ink}88`, marginTop: 4 }}>{nextStep.help}</div>
          </div>
          {(canManageOffers || role === 'partner') && (
            nextStep.state.reached ? (
              <OfferDonePill>{nextStep.label}</OfferDonePill>
            ) : (
              <button onClick={() => runWorkflowAction(nextStep.action, modelRequest.model)} disabled={nextStep.state.disabled} style={offerButtonStyle('primary', { disabled: nextStep.state.disabled })}>
                {nextStep.label}
                <ChevronRight size={15} />
              </button>
            )
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <style>{`
        .case-tabs-strip::-webkit-scrollbar,
        .acquisition-stepper-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
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
        {canEditCaseData && (
          <button onClick={() => onEdit?.(c.propertyId || c.id)} style={{ background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine, fontSize: 12.5, fontWeight: 600, padding: '8px 14px', borderRadius: 5, cursor: 'pointer' }}>Bearbeiten</button>
        )}
        {canRejectCase && property?.status !== 'REJECTED' && (
          <button onClick={() => setRejectModalOpen(true)} disabled={Boolean(busyAction)} style={{ background: '#9B2C2C0F', border: '1px solid #9B2C2C55', color: '#9B2C2C', fontSize: 12.5, fontWeight: 700, padding: '8px 14px', borderRadius: 5, cursor: busyAction ? 'wait' : 'pointer', opacity: busyAction ? 0.75 : 1 }}>
            Fall ablehnen
          </button>
        )}
        {canOpenResetWorkflow && (
          <button onClick={openResetWorkflowModal} disabled={Boolean(busyAction)} style={{ background: 'white', border: `1px solid ${theme.aubergine}`, color: theme.aubergine, fontSize: 12.5, fontWeight: 700, padding: '8px 14px', borderRadius: 5, cursor: busyAction ? 'wait' : 'pointer', opacity: busyAction ? 0.75 : 1 }}>
            Schritt zurücksetzen
          </button>
        )}
      </div>

      {rejectModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(42, 26, 53, 0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ width: 'min(520px, 94vw)', background: 'white', borderRadius: 8, border: `1px solid ${theme.border}`, boxShadow: '0 24px 70px rgba(68, 0, 92, 0.18)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', background: '#9B2C2C0F', borderBottom: '1px solid #9B2C2C22', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 15, color: '#9B2C2C', fontWeight: 800 }}>Fall ablehnen</div>
                <div style={{ fontSize: 11.5, color: `${theme.ink}99`, marginTop: 2 }}>Der Makler sieht den Grund im Ordner „Abgelehnt“ und in der Fallansicht.</div>
              </div>
              <button onClick={() => setRejectModalOpen(false)} title="Schließen" style={{ background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine, borderRadius: 5, width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={15} />
              </button>
            </div>
            <div style={{ padding: '20px 22px', display: 'grid', gap: 14 }}>
              <Field label="Ablehnungsgrund" required>
                <Select value={rejectionReasonCode} onChange={(event) => setRejectionReasonCode(event.target.value)}>
                  {rejectionReasons.map((reason) => <option key={reason.value} value={reason.value}>{reason.label}</option>)}
                </Select>
              </Field>
              <Field label="Hinweis an den Makler" required invalid={rejectionNote.trim().length > 0 && rejectionNote.trim().length < 8}>
                <textarea value={rejectionNote} onChange={(event) => setRejectionNote(event.target.value)} placeholder="Kurze Begründung oder nächster sinnvoller Hinweis..." style={{ width: '100%', minHeight: 96, padding: '9px 12px', fontSize: 13.5, border: `1px solid ${theme.border}`, borderRadius: 5, background: 'white', color: theme.ink, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' }} />
              </Field>
              <div style={{ background: theme.goldSoft, border: `1px solid ${theme.gold}55`, borderRadius: 6, padding: '10px 12px', fontSize: 12.5, color: theme.ink, lineHeight: 1.5 }}>
                Ablehnen ist besser als Löschen: Der Vorgang bleibt nachvollziehbar, der Makler sieht den Grund und die Historie bleibt erhalten.
              </div>
            </div>
            <div style={{ padding: '14px 22px 20px', borderTop: `1px solid ${theme.borderSoft}`, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setRejectModalOpen(false)} style={{ background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine, borderRadius: 5, padding: '9px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Abbrechen</button>
              <button onClick={rejectCase} disabled={Boolean(busyAction) || rejectionNote.trim().length < 8} style={{ background: '#9B2C2C', border: 'none', color: 'white', borderRadius: 5, padding: '9px 16px', fontSize: 13, fontWeight: 800, cursor: busyAction ? 'wait' : rejectionNote.trim().length < 8 ? 'not-allowed' : 'pointer', opacity: busyAction || rejectionNote.trim().length < 8 ? 0.55 : 1 }}>
                {busyAction === 'Fall ablehnen' ? 'Wird abgelehnt...' : 'Ablehnen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {resetModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(42, 26, 53, 0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ width: 'min(560px, 94vw)', background: 'white', borderRadius: 8, border: `1px solid ${theme.border}`, boxShadow: '0 24px 70px rgba(68, 0, 92, 0.18)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', background: theme.mintLight, borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 15, color: theme.aubergine, fontWeight: 800 }}>Prozessschritt zurücksetzen</div>
                <div style={{ fontSize: 11.5, color: `${theme.ink}99`, marginTop: 2 }}>Der Fall springt auf einen früheren Schritt. Angebote und Bewertungen bleiben als Historie erhalten.</div>
              </div>
              <button onClick={() => setResetModalOpen(false)} title="Schließen" style={{ background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine, borderRadius: 5, width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={15} />
              </button>
            </div>
            <div style={{ padding: '20px 22px', display: 'grid', gap: 14 }}>
              <Field label="Neuer Prozessschritt" required>
                <Select value={resetTargetStatus} onChange={(event) => setResetTargetStatus(event.target.value)}>
                  {resetTargetOptions.map((step) => <option key={step.value} value={step.value}>{step.label}</option>)}
                </Select>
              </Field>
              <Field label="Grund der Rücksetzung" required>
                <Select value={resetReason} onChange={(event) => setResetReason(event.target.value)}>
                  {workflowResetReasons.map((reason) => <option key={reason} value={reason}>{reason}</option>)}
                </Select>
              </Field>
              <Field label="Interne Notiz">
                <textarea value={resetNote} onChange={(event) => setResetNote(event.target.value)} placeholder="Optionale interne Erläuterung..." style={{ width: '100%', minHeight: 92, padding: '9px 12px', fontSize: 13.5, border: `1px solid ${theme.border}`, borderRadius: 5, background: 'white', color: theme.ink, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' }} />
              </Field>
              <div style={{ background: theme.goldSoft, border: `1px solid ${theme.gold}55`, borderRadius: 6, padding: '10px 12px', fontSize: 12.5, color: theme.ink, lineHeight: 1.5 }}>
                Die Rücksetzung wird mit altem Schritt, neuem Schritt, Nutzer, Uhrzeit und Grund im Aktivitätslog gespeichert.
              </div>
            </div>
            <div style={{ padding: '14px 22px 20px', borderTop: `1px solid ${theme.borderSoft}`, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setResetModalOpen(false)} style={{ background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine, borderRadius: 5, padding: '9px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Abbrechen</button>
              <button onClick={resetWorkflowStep} disabled={Boolean(busyAction) || !resetReason.trim() || !resetTargetStatus} style={{ background: theme.aubergine, border: 'none', color: 'white', borderRadius: 5, padding: '9px 16px', fontSize: 13, fontWeight: 800, cursor: busyAction ? 'wait' : !resetReason.trim() || !resetTargetStatus ? 'not-allowed' : 'pointer', opacity: busyAction || !resetReason.trim() || !resetTargetStatus ? 0.55 : 1 }}>
                {busyAction === 'Prozessschritt zurücksetzen' ? 'Wird zurückgesetzt...' : 'Zurücksetzen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {acceptedOfferDialog && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 91, background: 'rgba(42, 26, 53, 0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ width: 'min(520px, 94vw)', background: 'white', borderRadius: 8, border: `1px solid ${theme.border}`, boxShadow: '0 24px 70px rgba(68, 0, 92, 0.18)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', background: theme.mintLight, borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 15, color: theme.aubergine, fontWeight: 800 }}>Angenommenes Angebotsmodell auswählen</div>
                <div style={{ fontSize: 11.5, color: `${theme.ink}99`, marginTop: 2 }}>Der Kunde hat mehrere Angebotsmodelle erhalten. Bitte wählen Sie aus, welches Modell angenommen wurde.</div>
              </div>
              <button onClick={() => setAcceptedOfferDialog(null)} title="Schließen" style={{ background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine, borderRadius: 5, width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={15} />
              </button>
            </div>
            <div style={{ padding: '20px 22px', display: 'grid', gap: 14 }}>
              <Field label="Angenommenes Modell" required>
                <Select value={acceptedOfferModelInput} onChange={(event) => setAcceptedOfferModelInput(event.target.value)}>
                  <option value="">Modell auswählen</option>
                  {acceptedOfferOptions(acceptedOfferDialog.action).map((option) => (
                    <option key={option.model} value={option.model}>{option.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Annahmedatum">
                <Input
                  type="date"
                  value={acceptedOfferDialog.action === 'binding_offer_accepted' ? bindingOfferAcceptedDate : indicativeOfferAcceptedDate}
                  onChange={(event) => acceptedOfferDialog.action === 'binding_offer_accepted' ? setBindingOfferAcceptedDate(event.target.value) : setIndicativeOfferAcceptedDate(event.target.value)}
                />
              </Field>
              <Field label="Interne Notiz">
                <textarea value={acceptedOfferNote} onChange={(event) => setAcceptedOfferNote(event.target.value)} rows={3} placeholder="Optionale Notiz zur Entscheidung des Kunden..." style={{ width: '100%', minHeight: 82, padding: '9px 12px', fontSize: 13.5, border: `1px solid ${theme.border}`, borderRadius: 5, background: 'white', color: theme.ink, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' }} />
              </Field>
            </div>
            <div style={{ padding: '14px 22px 20px', borderTop: `1px solid ${theme.borderSoft}`, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setAcceptedOfferDialog(null)} style={{ background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine, borderRadius: 5, padding: '9px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Abbrechen</button>
              <button onClick={submitAcceptedOfferSelection} disabled={Boolean(busyAction) || !acceptedOfferModelInput} style={{ background: theme.aubergine, border: 'none', color: 'white', borderRadius: 5, padding: '9px 16px', fontSize: 13, fontWeight: 800, cursor: busyAction ? 'wait' : !acceptedOfferModelInput ? 'not-allowed' : 'pointer', opacity: busyAction || !acceptedOfferModelInput ? 0.55 : 1 }}>
                Übernehmen
              </button>
            </div>
          </div>
        </div>
      )}

      {residentStatusAction && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 92, background: 'rgba(42, 26, 53, 0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ width: 'min(560px, 94vw)', background: 'white', borderRadius: 8, border: `1px solid ${theme.border}`, boxShadow: '0 24px 70px rgba(68, 0, 92, 0.18)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', background: theme.goldSoft, borderBottom: `1px solid ${theme.gold}33`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 15, color: theme.aubergine, fontWeight: 800 }}>{residentStatusAction === 'deceased' ? 'Bewohner verstorben melden' : 'Bewohner zieht aus'}</div>
                <div style={{ fontSize: 11.5, color: `${theme.ink}99`, marginTop: 2 }}>Diese Aktion startet den Verkaufsprozess und wird im Aktivitätslog gespeichert.</div>
              </div>
              <button onClick={() => setResidentStatusAction('')} title="Schließen" style={{ background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine, borderRadius: 5, width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={15} />
              </button>
            </div>
            <div style={{ padding: '20px 22px', display: 'grid', gap: 14 }}>
              {residentStatusAction === 'move_out' ? (
                <Field label="Auszugsdatum oder geplantes Auszugsdatum" required>
                  <Input type="date" value={residentStatusForm.moveOutDate} onChange={(event) => setResidentStatusForm({ ...residentStatusForm, moveOutDate: event.target.value })} />
                </Field>
              ) : (
                <>
                  <Field label="Sterbedatum, falls bekannt">
                    <Input type="date" value={residentStatusForm.deathDate} onChange={(event) => setResidentStatusForm({ ...residentStatusForm, deathDate: event.target.value })} />
                  </Field>
                  <Field label="Meldedatum" required>
                    <Input type="date" value={residentStatusForm.reportedAt} onChange={(event) => setResidentStatusForm({ ...residentStatusForm, reportedAt: event.target.value })} />
                  </Field>
                  <Field label="Ansprechpartner Angehörige / Nachlass">
                    <Input value={residentStatusForm.relativesOrEstateContact} onChange={(event) => setResidentStatusForm({ ...residentStatusForm, relativesOrEstateContact: event.target.value })} />
                  </Field>
                </>
              )}
              <Field label="Interne Notiz" required>
                <textarea value={residentStatusForm.note} onChange={(event) => setResidentStatusForm({ ...residentStatusForm, note: event.target.value })} rows={4} placeholder="Kurz dokumentieren, wer informiert hat und was als nächstes zu tun ist." style={{ width: '100%', minHeight: 96, padding: '9px 12px', fontSize: 13.5, border: `1px solid ${theme.border}`, borderRadius: 5, background: 'white', color: theme.ink, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' }} />
              </Field>
            </div>
            <div style={{ padding: '14px 22px 20px', borderTop: `1px solid ${theme.borderSoft}`, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setResidentStatusAction('')} style={{ background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine, borderRadius: 5, padding: '9px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Abbrechen</button>
              <button
                onClick={submitResidentStatusAction}
                disabled={Boolean(busyAction) || !residentStatusForm.note.trim() || (residentStatusAction === 'move_out' && !residentStatusForm.moveOutDate) || (residentStatusAction === 'deceased' && !residentStatusForm.reportedAt)}
                style={{ background: theme.aubergine, border: 'none', color: 'white', borderRadius: 5, padding: '9px 16px', fontSize: 13, fontWeight: 800, cursor: busyAction ? 'wait' : 'pointer', opacity: Boolean(busyAction) || !residentStatusForm.note.trim() || (residentStatusAction === 'move_out' && !residentStatusForm.moveOutDate) || (residentStatusAction === 'deceased' && !residentStatusForm.reportedAt) ? 0.55 : 1 }}
              >
                {busyAction === 'Bewohnerstatus speichern' ? 'Wird gespeichert...' : 'Verkaufsprozess starten'}
              </button>
            </div>
          </div>
        </div>
      )}

      {property?.status === 'REJECTED' && (
        <div style={{ background: '#9B2C2C0F', borderBottom: '1px solid #9B2C2C33', padding: '12px 28px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <AlertTriangle size={17} style={{ color: '#9B2C2C', marginTop: 1 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.8, fontWeight: 800, color: '#9B2C2C' }}>
              Fall abgelehnt: {property.rejectionReasonLabel || labelFrom(rejectionReasonLabels, property.rejectionReasonCode, 'Grund nicht angegeben')}
            </div>
            <div style={{ fontSize: 12, color: `${theme.ink}aa`, marginTop: 3 }}>
              {property.rejectionNote || 'Es wurde kein zusätzlicher Hinweis hinterlegt.'}
              {property.rejectedAt ? ` · abgelehnt am ${dateLabel(property.rejectedAt)}` : ''}
            </div>
          </div>
        </div>
      )}

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

      <div style={{ background: theme.mintLight, padding: '16px 28px 20px' }}>
        <AcquisitionProcessStepper property={property} />
      </div>

      {/* Tabs */}
      <div className="case-tabs-strip" style={{ background: 'white', borderBottom: `1px solid ${theme.border}`, padding: '0 28px', display: 'flex', gap: 4, alignItems: 'stretch', overflowX: 'auto', overflowY: 'hidden', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => {
            if (t.disabled) {
              setNotice?.('Der Verkaufsprozess beginnt erst nach Ende des Wohnrechts oder Rückmietverkaufs.');
              return;
            }
            changeTab(t.id);
          }} style={{
            background: 'transparent', border: 'none',
            padding: '12px 18px',
            fontSize: 13, fontWeight: 600,
            color: t.disabled ? `${theme.ink}55` : activeTab === t.id ? theme.aubergine : `${theme.ink}99`,
            borderBottom: activeTab === t.id ? `2px solid ${theme.aubergine}` : '2px solid transparent',
            cursor: t.disabled ? 'not-allowed' : 'pointer',
            marginBottom: -1,
            marginLeft: t.tool && !tabs[tabs.indexOf(t) - 1]?.tool ? 'auto' : 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            whiteSpace: 'nowrap',
            borderLeft: t.tool && !tabs[tabs.indexOf(t) - 1]?.tool ? `1px solid ${theme.borderSoft}` : 'none',
            backgroundColor: t.tool ? (activeTab === t.id ? `${theme.aubergine}0D` : theme.mintLighter) : 'transparent',
          }}>
            {t.icon ? <t.icon size={14} /> : null}
            <span>{t.label}</span>
            {t.badge ? (
              <span style={{ background: activeTab === t.id ? theme.aubergine : `${theme.aubergine}18`, color: activeTab === t.id ? 'white' : theme.aubergine, fontSize: 10.5, fontWeight: 800, borderRadius: 10, padding: '1px 6px', lineHeight: 1.4 }}>{t.badge}</span>
            ) : null}
          </button>
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

              {inventoryCase && (
                <>
                  <div style={{ height: 1, background: theme.borderSoft, margin: '24px 0' }} />
                  <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Bewohnerstatus</div>
                  <div style={{ display: 'grid', gridTemplateColumns: canManageResidentStatus ? '1fr auto' : '1fr', gap: 16, alignItems: 'start' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 32px' }}>
                      {[
                        ['Status', labelFrom(residentStatusLabels, property?.residentStatus || 'ACTIVE')],
                        ['Bewohner bleibt im Objekt', yesNo(property?.residentStaysInProperty !== false)],
                        ['Auszugsdatum', formatDate(property?.residentMoveOutDate)],
                        ['Sterbedatum', formatDate(property?.residentDeathDate)],
                        ['Letzte Änderung', formatDate(property?.residentStatusChangedAt)],
                        ['Interne Notiz', property?.residentStatusNote || '-'],
                      ].map(([k, v], i) => (
                        <div key={i}>
                          <div style={{ fontSize: 11, color: `${theme.ink}88`, fontWeight: 600, marginBottom: 3 }}>{k}</div>
                          <div style={{ fontSize: 13.5, color: theme.ink }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    {canManageResidentStatus && (
                      <div style={{ display: 'grid', gap: 8, minWidth: 220 }}>
                        <button onClick={() => startResidentStatusAction('move_out')} disabled={Boolean(busyAction)} style={{ background: 'white', border: `1px solid ${theme.aubergine}`, color: theme.aubergine, borderRadius: 5, padding: '8px 12px', fontSize: 12.5, fontWeight: 800, cursor: busyAction ? 'wait' : 'pointer' }}>
                          Bewohner zieht aus
                        </button>
                        <button onClick={() => startResidentStatusAction('deceased')} disabled={Boolean(busyAction)} style={{ background: '#9B2C2C0F', border: '1px solid #9B2C2C55', color: '#9B2C2C', borderRadius: 5, padding: '8px 12px', fontSize: 12.5, fontWeight: 800, cursor: busyAction ? 'wait' : 'pointer' }}>
                          Bewohner verstorben melden
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
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
              {modernizationDetails.length > 0 && (
                <>
                  <div style={{ height: 1, background: theme.borderSoft, margin: '24px 0' }} />
                  <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Modernisierung</div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {modernizationDetails.map((item, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 0.7fr 0.9fr 1.5fr', gap: 12, border: `1px solid ${theme.borderSoft}`, borderRadius: 6, padding: '9px 11px', background: theme.mintLighter }}>
                        <div>
                          <div style={{ fontSize: 11, color: `${theme.ink}88`, fontWeight: 600, marginBottom: 3 }}>Maßnahme</div>
                          <div style={{ fontSize: 13.5, color: theme.ink, fontWeight: 650 }}>{item.label}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: `${theme.ink}88`, fontWeight: 600, marginBottom: 3 }}>Jahr</div>
                          <div style={{ fontSize: 13.5, color: theme.ink }}>{item.year}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: `${theme.ink}88`, fontWeight: 600, marginBottom: 3 }}>Umfang</div>
                          <div style={{ fontSize: 13.5, color: theme.ink }}>{item.scope}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: `${theme.ink}88`, fontWeight: 600, marginBottom: 3 }}>Beschreibung</div>
                          <div style={{ fontSize: 13.5, color: theme.ink }}>{item.note}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {buildingConditionDetails.length > 0 && (
                <>
                  <div style={{ height: 1, background: theme.borderSoft, margin: '24px 0' }} />
                  <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Zustand</div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {buildingConditionDetails.map((item, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 12, border: `1px solid ${theme.borderSoft}`, borderRadius: 6, padding: '9px 11px', background: 'white' }}>
                        <div>
                          <div style={{ fontSize: 11, color: `${theme.ink}88`, fontWeight: 600, marginBottom: 3 }}>Bauteil</div>
                          <div style={{ fontSize: 13.5, color: theme.ink, fontWeight: 650 }}>{item.label}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: `${theme.ink}88`, fontWeight: 600, marginBottom: 3 }}>Zustandsbewertung</div>
                          <div style={{ fontSize: 13.5, color: theme.ink }}>{item.rating}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: `${theme.ink}88`, fontWeight: 600, marginBottom: 3 }}>Zustandsbeschreibung</div>
                          <div style={{ fontSize: 13.5, color: theme.ink }}>{item.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'rating' && role === 'admin' && (
            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, padding: '20px 22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>Objektrating</div>
                    <div style={{ fontSize: 18, color: theme.aubergine, fontWeight: 800 }}>Institutionelle Objektprüfung</div>
                    <div style={{ fontSize: 12.5, color: `${theme.ink}99`, lineHeight: 1.5, marginTop: 4 }}>
                      Das Rating wird aus versionierten Kriterien, Gewichtungen und Mapping-Regeln erzeugt. Freigegebene Ratings bleiben revisionssicher nachvollziehbar.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button onClick={generateObjectRating} disabled={Boolean(busyAction) || objectRating?.status === 'approved'} style={{ background: objectRating ? 'white' : theme.aubergine, color: objectRating ? theme.aubergine : 'white', border: objectRating ? `1px solid ${theme.border}` : 'none', borderRadius: 5, padding: '8px 12px', fontSize: 12.5, fontWeight: 800, cursor: busyAction || objectRating?.status === 'approved' ? 'default' : 'pointer', opacity: busyAction || objectRating?.status === 'approved' ? 0.6 : 1 }}>
                      {objectRating ? 'Rating neu berechnen' : 'Vorläufiges Rating erzeugen'}
                    </button>
                    {objectRating && canManageRating && objectRating.status !== 'approved' && (
                      <button onClick={approveRating} disabled={Boolean(busyAction)} style={{ background: theme.aubergine, color: 'white', border: 'none', borderRadius: 5, padding: '8px 12px', fontSize: 12.5, fontWeight: 800, cursor: busyAction ? 'wait' : 'pointer' }}>
                        Rating freigeben
                      </button>
                    )}
                  </div>
                </div>

                {!objectRating ? (
                  <div style={{ background: theme.mintLighter, border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '14px 16px', fontSize: 13, color: `${theme.ink}99`, lineHeight: 1.5 }}>
                    Für diesen Fall wurde noch kein Objektrating erzeugt. Bei Einreichung eines Objekts passiert das automatisch; für bestehende Demo-Fälle kann es hier manuell erzeugt werden.
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 16 }}>
                      {[
                        ['Gesamtscore', objectRating.totalScore ? Number(objectRating.totalScore).toFixed(2).replace('.', ',') : '-'],
                        ['Ratingklasse', objectRating.ratingClass || '-'],
                        ['Status', labelFrom(ratingStatusLabels, objectRating.status)],
                        ['Zielrendite', formatPercent(objectRating.finalTargetReturn)],
                        ['Korridor', `${formatPercent(objectRating.lowerReturnBound)} - ${formatPercent(objectRating.upperReturnBound)}`],
                      ].map(([label, value]) => (
                        <div key={label} style={{ background: theme.mintLighter, border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '12px 13px' }}>
                          <div style={{ fontSize: 10.5, color: theme.oliv, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
                          <div style={{ fontSize: 16, color: theme.aubergine, fontWeight: 800 }}>{value}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>Finale Zielrendite</div>
                          <div style={{ fontSize: 12.5, color: `${theme.ink}99` }}>Analysten dürfen die finale Zielrendite nur innerhalb des Rating-Korridors setzen.</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input value={ratingReturnPercent} onChange={(event) => setRatingReturnInput(event.target.value)} disabled={ratingReadOnly} placeholder="z.B. 7,25" style={{ width: 110, border: `1px solid ${theme.border}`, borderRadius: 5, padding: '8px 10px', fontSize: 13, color: theme.ink, fontFamily: 'inherit', background: ratingReadOnly ? theme.mintLighter : 'white' }} />
                          <span style={{ fontSize: 13, color: theme.ink, fontWeight: 700 }}>%</span>
                          {canManageRating && objectRating.status !== 'approved' && (
                            <button onClick={saveRatingReturn} disabled={Boolean(busyAction)} style={{ background: theme.aubergine, color: 'white', border: 'none', borderRadius: 5, padding: '8px 12px', fontSize: 12.5, fontWeight: 800, cursor: busyAction ? 'wait' : 'pointer' }}>Speichern</button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '4px 0 10px' }}>Kategorien</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 18 }}>
                      {ratingCategoryRows.map(({ category, score }) => (
                        <div key={category.id} style={{ border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '12px 14px', background: 'white' }}>
                          <div style={{ fontSize: 13, color: theme.aubergine, fontWeight: 800 }}>{category.name}</div>
                          <div style={{ fontSize: 11.5, color: `${theme.ink}88`, marginTop: 4 }}>Gewichtung {formatPercent(category.weight)}</div>
                          <div style={{ fontSize: 22, color: theme.ink, fontWeight: 800, marginTop: 6 }}>{score ? score.toFixed(2).replace('.', ',') : '-'}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '4px 0 10px' }}>Kriterien</div>
                    <div style={{ display: 'grid', gap: 8 }}>
                      {ratingCategoryRows.map(({ category }) => {
                        const categoryScores = ratingScores.filter((score) => score.criterion?.categoryId === category.id);
                        return (
                          <div key={category.id} style={{ border: `1px solid ${theme.borderSoft}`, borderRadius: 8, overflow: 'hidden', background: 'white' }}>
                            <div style={{ padding: '10px 14px', background: theme.mintLighter, borderBottom: `1px solid ${theme.borderSoft}` }}>
                              <div style={{ fontSize: 13, color: theme.aubergine, fontWeight: 900 }}>{category.name}</div>
                            </div>
                            <div style={{ display: 'grid', gap: 0 }}>
                              {categoryScores.map((score) => {
                                const input = ratingScoreInputs[score.id] || {};
                                const effectiveScore = ratingScoreValueWithInput(score);
                                const isRoofPair = score.criterionId === ratingRoofCriterionId || score.criterionId === ratingFlatRoofCriterionId;
                                const disabledByRoofChoice = isRoofPair && selectedRoofCriterionId && selectedRoofCriterionId !== score.criterionId;
                                const effectiveWeight = ratingEffectiveCriterionWeight(score.criterion);
                                const hasInfo = score.criterion?.category?.name === 'Mikrolage' && Boolean(score.criterion?.description);
                                return (
                                  <div key={score.id} style={{ borderTop: `1px solid ${theme.borderSoft}`, padding: '12px 14px', background: disabledByRoofChoice ? theme.mintLighter : Number(score.confidence || 0) < 0.65 ? theme.goldSoft : 'white', opacity: disabledByRoofChoice ? 0.62 : 1 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: canManageRating && objectRating.status !== 'approved' ? '1.25fr 0.65fr 0.45fr 0.95fr 0.55fr 1.1fr auto' : '1.35fr 0.75fr 0.45fr 0.9fr 0.55fr 1.1fr', gap: 10, alignItems: 'center' }}>
                                      <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                          <div style={{ fontSize: 13, color: theme.ink, fontWeight: 800 }}>{score.criterion?.name || score.criterionId}</div>
                                          {hasInfo && (
                                            <button type="button" aria-label="Erklärung anzeigen" onClick={() => setOpenRatingInfo(openRatingInfo === score.id ? '' : score.id)} style={{ width: 20, height: 20, borderRadius: 999, border: `1px solid ${theme.border}`, background: openRatingInfo === score.id ? theme.aubergine : 'white', color: openRatingInfo === score.id ? 'white' : theme.aubergine, fontSize: 12, fontWeight: 900, lineHeight: '18px', cursor: 'pointer' }}>i</button>
                                          )}
                                        </div>
                                        <div style={{ fontSize: 11.5, color: `${theme.ink}88`, marginTop: 2 }}>
                                          Gewichtung {formatPercent(effectiveWeight)}
                                          {disabledByRoofChoice ? ' · ausgegraut, wird nicht mitgerechnet' : ''}
                                        </div>
                                        {hasInfo && openRatingInfo === score.id && (
                                          <div style={{ marginTop: 8, border: `1px solid ${theme.borderSoft}`, background: 'white', borderRadius: 6, padding: '9px 10px', fontSize: 11.5, color: `${theme.ink}99`, lineHeight: 1.45, whiteSpace: 'pre-line' }}>{score.criterion.description}</div>
                                        )}
                                      </div>
                                      <div>
                                        <div style={{ fontSize: 10.5, color: `${theme.ink}77`, fontWeight: 800, marginBottom: 3 }}>Quelle</div>
                                        <div style={{ fontSize: 12.5, color: theme.ink }}>{labelFrom(ratingSourceLabels, score.source || score.criterion?.sourceType)}</div>
                                      </div>
                                      <div>
                                        <div style={{ fontSize: 10.5, color: `${theme.ink}77`, fontWeight: 800, marginBottom: 3 }}>Auto</div>
                                        <div style={{ fontSize: 12.5, color: theme.ink }}>{score.prefilledScore || '-'}</div>
                                      </div>
                                      <div>
                                        <div style={{ fontSize: 10.5, color: `${theme.ink}77`, fontWeight: 800, marginBottom: 3 }}>Final</div>
                                        {canManageRating && objectRating.status !== 'approved' ? (
                                          <select value={effectiveScore} disabled={disabledByRoofChoice} onChange={(event) => {
                                            const nextInputs = { ...ratingScoreInputs, [score.id]: { ...input, analystScore: event.target.value, cleared: false } };
                                            if (score.criterionId === ratingRoofCriterionId && flatRoofScore) nextInputs[flatRoofScore.id] = { ...(nextInputs[flatRoofScore.id] || {}), analystScore: '', cleared: true };
                                            if (score.criterionId === ratingFlatRoofCriterionId && roofScore) nextInputs[roofScore.id] = { ...(nextInputs[roofScore.id] || {}), analystScore: '', cleared: true };
                                            setRatingScoreInputs(nextInputs);
                                          }} style={{ width: '100%', border: `1px solid ${theme.border}`, borderRadius: 5, padding: '7px 8px', fontSize: 12.5, color: theme.ink, background: disabledByRoofChoice ? theme.mintLighter : 'white' }}>
                                            <option value="">-</option>
                                            {ratingScoreDefinitions(score.criterion).map((definition) => <option key={definition.scoreValue} value={definition.scoreValue}>{definition.scoreValue} · {definition.label}</option>)}
                                          </select>
                                        ) : (
                                          <div style={{ fontSize: 12.5, color: theme.ink }}>{disabledByRoofChoice ? '-' : score.finalScore || '-'}</div>
                                        )}
                                        {!disabledByRoofChoice && score.finalScore && (
                                          <div style={{ fontSize: 11, color: `${theme.ink}88`, marginTop: 3 }}>
                                            {ratingScoreDefinitions(score.criterion).find((definition) => Number(definition.scoreValue) === Number(score.finalScore))?.label || ''}
                                          </div>
                                        )}
                                      </div>
                                      <div>
                                        <div style={{ fontSize: 10.5, color: `${theme.ink}77`, fontWeight: 800, marginBottom: 3 }}>Confidence</div>
                                        <div style={{ fontSize: 12.5, color: theme.ink }}>{disabledByRoofChoice ? '-' : formatPercent(score.confidence)}</div>
                                      </div>
                                      <div>
                                        <div style={{ fontSize: 10.5, color: `${theme.ink}77`, fontWeight: 800, marginBottom: 3 }}>Kommentar</div>
                                        {canManageRating && objectRating.status !== 'approved' ? (
                                          <input value={input.comment ?? ''} disabled={disabledByRoofChoice} onChange={(event) => setRatingScoreInputs({ ...ratingScoreInputs, [score.id]: { ...input, comment: event.target.value } })} placeholder="Pflicht bei Änderung" style={{ width: '100%', border: `1px solid ${theme.border}`, borderRadius: 5, padding: '7px 8px', fontSize: 12.5, color: theme.ink, fontFamily: 'inherit', boxSizing: 'border-box', background: disabledByRoofChoice ? theme.mintLighter : 'white' }} />
                                        ) : (
                                          <div style={{ fontSize: 12.5, color: theme.ink }}>{disabledByRoofChoice ? '-' : score.comment || '-'}</div>
                                        )}
                                      </div>
                                      {canManageRating && objectRating.status !== 'approved' && (
                                        <button onClick={() => saveRatingScore(score)} disabled={Boolean(busyAction) || disabledByRoofChoice} style={{ background: theme.aubergine, color: 'white', border: 'none', borderRadius: 5, padding: '8px 10px', fontSize: 12, fontWeight: 800, cursor: busyAction || disabledByRoofChoice ? 'default' : 'pointer', opacity: busyAction || disabledByRoofChoice ? 0.5 : 1 }}>Speichern</button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {objectRating && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, padding: '16px 18px' }}>
                    <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Offene Prüfungen</div>
                    {ratingOpenChecks.length ? ratingOpenChecks.map((score) => (
                      <div key={score.id} style={{ borderTop: `1px solid ${theme.borderSoft}`, padding: '9px 0' }}>
                        <div style={{ fontSize: 12.5, color: theme.ink, fontWeight: 800 }}>{score.criterion?.name || score.criterionId}</div>
                        <div style={{ fontSize: 11.5, color: `${theme.ink}88`, marginTop: 2 }}>Confidence {formatPercent(score.confidence)} · {score.prefilledScore ? 'Analystenprüfung empfohlen' : 'Datenbasis fehlt'}</div>
                      </div>
                    )) : (
                      <div style={{ fontSize: 12.5, color: `${theme.ink}88` }}>Keine offenen Prüfungen.</div>
                    )}
                  </div>
                  <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, padding: '16px 18px' }}>
                    <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Audit Trail</div>
                    {objectRating.auditLogs?.length ? objectRating.auditLogs.map((entry) => (
                      <div key={entry.id} style={{ borderTop: `1px solid ${theme.borderSoft}`, padding: '9px 0' }}>
                        <div style={{ fontSize: 12.5, color: theme.ink, fontWeight: 800 }}>{entry.action}</div>
                        <div style={{ fontSize: 11.5, color: `${theme.ink}88`, marginTop: 2 }}>{formatDate(entry.timestamp)}{entry.comment ? ` · ${entry.comment}` : ''}</div>
                      </div>
                    )) : (
                      <div style={{ fontSize: 12.5, color: `${theme.ink}88` }}>Noch keine Historie vorhanden.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'kvabwicklung' && role === 'admin' && (
            <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>KV-Abwicklung</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: theme.aubergine }}>Von Gutachten und Notar bis Kaufpreiszahlung, Auszahlung und Grundbucheintragung</div>
                </div>
                <StatusBadge status={property?.status || 'DRAFT'} />
              </div>
              <div style={{ padding: '18px 20px', display: 'grid', gap: 18 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  {[
                    ['Gutachten', property?.expertOpinionReceivedAt ? 'eingegangen' : property?.expertOpinionOrderedAt ? 'beauftragt' : 'offen'],
                    ['VA abgegeben', formatDate(property?.bindingOfferSentAt)],
                    ['VA angenommen', formatDate(property?.bindingOfferAcceptedAt)],
                    ['Notartermin', formatDate(property?.notaryAppointmentAt)],
                  ].map(([label, value]) => (
                    <div key={label} style={{ background: theme.mintLighter, border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '11px 13px' }}>
                      <div style={{ fontSize: 10.5, color: theme.oliv, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
                      <div style={{ fontSize: 15, color: theme.aubergine, fontWeight: 800 }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '16px 16px', display: 'grid', gap: 14 }}>
                  <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Notar und Kaufvertrag</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    <Field label="Gutachten beauftragt am"><Input type="date" value={expertOpinionOrderedDate || dateInputValue(property?.expertOpinionOrderedAt)} onChange={(event) => setExpertOpinionOrderedDate(event.target.value)} readOnly={!canManageWorkflow} /></Field>
                    <Field label="Gutachtenfirma"><Input value={expertOpinionCompany || property?.expertOpinionCompany || ''} onChange={(event) => setExpertOpinionCompany(event.target.value)} readOnly={!canManageWorkflow} /></Field>
                    <Field label="Gutachten eingegangen am"><Input type="date" value={expertOpinionReceivedDate || dateInputValue(property?.expertOpinionReceivedAt)} onChange={(event) => setExpertOpinionReceivedDate(event.target.value)} readOnly={!canManageWorkflow} /></Field>
                    <Field label="Kaufvertragsnummer"><Input value={portfolioForm.purchaseContractNumber} onChange={(event) => updatePortfolioForm({ purchaseContractNumber: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Verbindliches Angebot abgegeben am"><Input type="date" value={bindingOfferSentDate} onChange={(event) => setBindingOfferSentDate(event.target.value)} readOnly={!canEditOfferDates} /></Field>
                    <Field label="Verbindliches Angebot angenommen am"><Input type="date" value={bindingOfferAcceptedDate} onChange={(event) => setBindingOfferAcceptedDate(event.target.value)} readOnly={!canEditOfferDates} /></Field>
                    <Field label="Notartermin angefragt am"><Input type="date" value={portfolioForm.notaryAppointmentRequestedAt} onChange={(event) => updatePortfolioForm({ notaryAppointmentRequestedAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Notartermin bestätigt für"><Input type="date" value={notaryAppointmentDate || portfolioForm.notaryAppointmentAt} onChange={(event) => setNotaryAppointmentDate(event.target.value)} readOnly={!canManageWorkflow} /></Field>
                    <Field label="Kaufvertragsentwurf erhalten am"><Input type="date" value={portfolioForm.purchaseContractDraftReceivedAt} onChange={(event) => updatePortfolioForm({ purchaseContractDraftReceivedAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Kaufvertragsentwurf geprüft am"><Input type="date" value={portfolioForm.purchaseContractDraftReviewedAt} onChange={(event) => updatePortfolioForm({ purchaseContractDraftReviewedAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Kaufpreis (€)"><Input type="number" value={portfolioForm.purchasePrice} onChange={(event) => updatePortfolioForm({ purchasePrice: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Frist / Wiedervorlage"><Input type="date" value={portfolioForm.nextPortfolioReviewAt} onChange={(event) => updatePortfolioForm({ nextPortfolioReviewAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                  </div>
                </div>

                <div style={{ border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '16px 16px', display: 'grid', gap: 14 }}>
                  <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Vollzug, Zahlung und Grundbuch</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    <Field label="Kaufvertrag unterschrieben am"><Input type="date" value={portfolioForm.purchaseContractSignedAt} onChange={(event) => updatePortfolioForm({ purchaseContractSignedAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Auflassungsvormerkung eingetragen am"><Input type="date" value={portfolioForm.priorityNoticeRegisteredAt} onChange={(event) => updatePortfolioForm({ priorityNoticeRegisteredAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Kaufpreisfälligkeit eingetreten am"><Input type="date" value={portfolioForm.purchasePriceDueAt} onChange={(event) => updatePortfolioForm({ purchasePriceDueAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Kaufpreis gezahlt am"><Input type="date" value={portfolioForm.purchasePricePaidAt || portfolioForm.payoutPaidAt} onChange={(event) => updatePortfolioForm({ purchasePricePaidAt: event.target.value, payoutPaidAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Auszahlung erfolgt am"><Input type="date" value={portfolioForm.payoutPaidAt} onChange={(event) => updatePortfolioForm({ payoutPaidAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Wohnrecht eingetragen am"><Input type="date" value={portfolioForm.residentialRightRegisteredAt} onChange={(event) => updatePortfolioForm({ residentialRightRegisteredAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Grundbucheintragung abgeschlossen am"><Input type="date" value={portfolioForm.landRegisterEntryAt} onChange={(event) => updatePortfolioForm({ landRegisterEntryAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Vollzugsmeldung"><Input value={portfolioForm.transferNotice || ''} onChange={(event) => updatePortfolioForm({ transferNotice: event.target.value })} readOnly={!canManagePortfolio} placeholder="z.B. offen, gemeldet, abgeschlossen" /></Field>
                    <Field label="Offene Punkte"><Input value={portfolioForm.closingOpenItems || ''} onChange={(event) => updatePortfolioForm({ closingOpenItems: event.target.value })} readOnly={!canManagePortfolio} placeholder="z.B. Fälligkeitsmitteilung, Grundbuchauszug" /></Field>
                  </div>
                  <Field label="Interne Kommentare">
                    <textarea value={portfolioForm.contractClosingNotes || ''} onChange={(event) => updatePortfolioForm({ contractClosingNotes: event.target.value })} readOnly={!canManagePortfolio} rows={3} style={{ width: '100%', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '9px 10px', color: theme.ink, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', background: canManagePortfolio ? 'white' : theme.mintLighter }} />
                  </Field>
                </div>

                {canManagePortfolio ? (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={savePortfolioFile} disabled={Boolean(busyAction)} style={{ background: theme.aubergine, color: 'white', border: 'none', borderRadius: 5, padding: '10px 16px', fontSize: 13, fontWeight: 800, cursor: busyAction ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                      <Save size={14} /> {busyAction === 'Bestandsakte speichern' ? 'Speichert...' : 'KV-Abwicklung speichern'}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {activeTab === 'vertragsvollzug' && role === 'admin' && (
            <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>Vertragsvollzug</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: theme.aubergine }}>Kaufpreisfälligkeit, Zahlung, Grundbuch und Wohnrechtseintragung</div>
                </div>
                <StatusBadge status={property?.status || 'DRAFT'} />
              </div>
              <div style={{ padding: '18px 20px', display: 'grid', gap: 18 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {[
                    ['Kaufpreisfälligkeit', formatDate(property?.purchasePriceDueAt)],
                    ['Kaufpreis gezahlt', formatDate(property?.purchasePricePaidAt || property?.payoutPaidAt)],
                    ['Wohnrecht eingetragen', formatDate(property?.residentialRightRegisteredAt || property?.landRegisterEntryAt)],
                  ].map(([label, value]) => (
                    <div key={label} style={{ background: theme.mintLighter, border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '11px 13px' }}>
                      <div style={{ fontSize: 10.5, color: theme.oliv, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
                      <div style={{ fontSize: 15, color: theme.aubergine, fontWeight: 800 }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '16px 16px', display: 'grid', gap: 14 }}>
                  <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Vertragsvollzug</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    <Field label="Auflassungsvormerkung eingetragen am"><Input type="date" value={portfolioForm.priorityNoticeRegisteredAt} onChange={(event) => updatePortfolioForm({ priorityNoticeRegisteredAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Kaufpreisfälligkeit eingetreten am"><Input type="date" value={portfolioForm.purchasePriceDueAt} onChange={(event) => updatePortfolioForm({ purchasePriceDueAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Kaufpreis gezahlt am"><Input type="date" value={portfolioForm.purchasePricePaidAt} onChange={(event) => updatePortfolioForm({ purchasePricePaidAt: event.target.value, payoutPaidAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Wohnrecht eingetragen am"><Input type="date" value={portfolioForm.residentialRightRegisteredAt} onChange={(event) => updatePortfolioForm({ residentialRightRegisteredAt: event.target.value, landRegisterEntryAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Besitz-/Nutzen-/Lastenwechsel am"><Input type="date" value={portfolioForm.benefitsAndBurdensTransferAt} onChange={(event) => updatePortfolioForm({ benefitsAndBurdensTransferAt: event.target.value, ownershipTransferAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Objektakte vollständig">
                      <input type="checkbox" checked={portfolioForm.propertyFileComplete} onChange={(event) => updatePortfolioForm({ propertyFileComplete: event.target.checked })} disabled={!canManagePortfolio} style={{ accentColor: theme.aubergine }} />
                    </Field>
                    <Field label="Gebäudeversicherung geklärt">
                      <input type="checkbox" checked={portfolioForm.buildingInsuranceClarified} onChange={(event) => updatePortfolioForm({ buildingInsuranceClarified: event.target.checked })} disabled={!canManagePortfolio} style={{ accentColor: theme.aubergine }} />
                    </Field>
                    <Field label="Verwalter informiert">
                      <input type="checkbox" checked={portfolioForm.propertyManagerInformed} onChange={(event) => updatePortfolioForm({ propertyManagerInformed: event.target.checked })} disabled={!canManagePortfolio} style={{ accentColor: theme.aubergine }} />
                    </Field>
                    <Field label="Hausgeldinformationen angefordert">
                      <input type="checkbox" checked={portfolioForm.serviceChargeInfoRequested} onChange={(event) => updatePortfolioForm({ serviceChargeInfoRequested: event.target.checked })} disabled={!canManagePortfolio} style={{ accentColor: theme.aubergine }} />
                    </Field>
                    <Field label="Grundsteuerinformationen vorhanden">
                      <input type="checkbox" checked={portfolioForm.propertyTaxInfoAvailable} onChange={(event) => updatePortfolioForm({ propertyTaxInfoAvailable: event.target.checked })} disabled={!canManagePortfolio} style={{ accentColor: theme.aubergine }} />
                    </Field>
                  </div>
                </div>

                {canManagePortfolio ? (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={savePortfolioFile} disabled={Boolean(busyAction)} style={{ background: theme.aubergine, color: 'white', border: 'none', borderRadius: 5, padding: '10px 16px', fontSize: 13, fontWeight: 800, cursor: busyAction ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                      <Save size={14} /> {busyAction === 'Bestandsakte speichern' ? 'Speichert...' : 'Vollzugsdaten speichern'}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {activeTab === 'bestand' && (
            <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>Bestandsverwaltung</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: theme.aubergine }}>Bewohnerverwaltung, Reparaturen und laufende Abrechnungsthemen</div>
                </div>
                <StatusBadge status={property?.status || 'DRAFT'} />
              </div>
              <div style={{ padding: '18px 20px', display: 'grid', gap: 18 }}>
                {property?.status !== 'IN_PORTFOLIO' && property?.status !== 'WON' && property?.status !== 'PURCHASED' ? (
                  <div style={{ background: theme.goldSoft, border: `1px solid ${theme.gold}55`, borderRadius: 6, padding: '11px 13px', fontSize: 12.5, color: theme.ink, lineHeight: 1.45 }}>
                    Die Bestandsakte wird vollständig relevant, sobald der Kaufvertrag abgeschlossen wurde. Daten können intern bereits vorbereitet werden.
                  </div>
                ) : null}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {[
                    ['Bestandsübernahme', formatDate(property?.portfolioEnteredAt)],
                    ['Bewohner', property?.residentName || property?.customer?.displayName || c.kunde || '-'],
                    ['Nutzungsmodell', labelFrom(usageModelLabels, property?.usageModel || property?.desiredModel)],
                  ].map(([label, value]) => (
                    <div key={label} style={{ background: theme.mintLighter, border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '11px 13px' }}>
                      <div style={{ fontSize: 10.5, color: theme.oliv, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
                      <div style={{ fontSize: 15, color: theme.aubergine, fontWeight: 800 }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '16px 16px', display: 'grid', gap: 14 }}>
                  <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Bestandsübernahme & Bewohnerverwaltung</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    <Field label="Objekt in Bestand übernommen am"><Input type="date" value={portfolioForm.portfolioEnteredAt} onChange={(event) => updatePortfolioForm({ portfolioEnteredAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Bewohner bleibt im Objekt">
                      <input type="checkbox" checked={portfolioForm.residentStaysInProperty} onChange={(event) => updatePortfolioForm({ residentStaysInProperty: event.target.checked })} disabled={!canManagePortfolio} style={{ accentColor: theme.aubergine }} />
                    </Field>
                    <Field label="Bewohnername"><Input value={portfolioForm.residentName} onChange={(event) => updatePortfolioForm({ residentName: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Nutzungsmodell">
                      <Select value={portfolioForm.usageModel} onChange={(event) => updatePortfolioForm({ usageModel: event.target.value })}>
                        {Object.entries(usageModelLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </Select>
                    </Field>
                    <Field label="Wohnrecht / Nutzungsrecht aktiv ab"><Input type="date" value={portfolioForm.usageRightStartsAt} onChange={(event) => updatePortfolioForm({ usageRightStartsAt: event.target.value, residentialRightStartAt: event.target.value, rentStartAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Wohnrecht / Nutzungsrecht befristet bis"><Input type="date" value={portfolioForm.usageRightEndsAt} onChange={(event) => updatePortfolioForm({ usageRightEndsAt: event.target.value, residentialRightEndAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Monatliches Nutzungsentgelt / Miete (€)"><Input type="number" value={portfolioForm.monthlyUsageFee} onChange={(event) => updatePortfolioForm({ monthlyUsageFee: event.target.value, monthlyRent: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Ansprechpartner Bewohner"><Input value={portfolioForm.residentContactName} onChange={(event) => updatePortfolioForm({ residentContactName: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Notfallkontakt / Angehöriger"><Input value={portfolioForm.residentEmergencyContact} onChange={(event) => updatePortfolioForm({ residentEmergencyContact: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Verwalter / WEG-Verwaltung"><Input value={portfolioForm.propertyManagerName} onChange={(event) => updatePortfolioForm({ propertyManagerName: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Gebäudeversicherung"><Input value={portfolioForm.buildingInsurance} onChange={(event) => updatePortfolioForm({ buildingInsurance: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Hausgeld / Nebenkostenstatus"><Input value={portfolioForm.serviceChargeStatus} onChange={(event) => updatePortfolioForm({ serviceChargeStatus: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Reparaturmeldeweg geklärt">
                      <input type="checkbox" checked={portfolioForm.repairReportingChannelClarified} onChange={(event) => updatePortfolioForm({ repairReportingChannelClarified: event.target.checked })} disabled={!canManagePortfolio} style={{ accentColor: theme.aubergine }} />
                    </Field>
                    <Field label="Zustandsdokumentation vorhanden">
                      <input type="checkbox" checked={portfolioForm.conditionDocumentationAvailable} onChange={(event) => updatePortfolioForm({ conditionDocumentationAvailable: event.target.checked })} disabled={!canManagePortfolio} style={{ accentColor: theme.aubergine }} />
                    </Field>
                  </div>
                  <Field label="Hinweise zur Nutzung">
                    <textarea value={portfolioForm.residentialRightNotes} onChange={(event) => updatePortfolioForm({ residentialRightNotes: event.target.value })} readOnly={!canManagePortfolio} rows={3} placeholder="z.B. besondere Vereinbarungen, Ansprechpartner, Bewohnerkommunikation" style={{ width: '100%', boxSizing: 'border-box', border: `1px solid ${theme.border}`, borderRadius: 5, padding: '8px 12px', fontSize: 13.5, color: theme.ink, background: !canManagePortfolio ? theme.mintLighter : 'white', fontFamily: 'inherit', resize: 'vertical' }} />
                  </Field>
                </div>

                <div style={{ border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '16px 16px', display: 'grid', gap: 14 }}>
                  <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Bestandsverwaltung</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    <Field label="Nächste Objektprüfung"><Input type="date" value={portfolioForm.maintenanceNextReviewDate} onChange={(event) => updatePortfolioForm({ maintenanceNextReviewDate: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Zuständig"><Input value={portfolioForm.maintenanceResponsible} onChange={(event) => updatePortfolioForm({ maintenanceResponsible: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Jahresbudget (€)"><Input type="number" value={portfolioForm.maintenanceBudget} onChange={(event) => updatePortfolioForm({ maintenanceBudget: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Nächster Termin"><Input type="date" value={portfolioForm.nextAppointmentDate} onChange={(event) => updatePortfolioForm({ nextAppointmentDate: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Terminart"><Input value={portfolioForm.nextAppointmentType} onChange={(event) => updatePortfolioForm({ nextAppointmentType: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Terminnotiz"><Input value={portfolioForm.nextAppointmentNote} onChange={(event) => updatePortfolioForm({ nextAppointmentNote: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Field label="Instandhaltungshinweise">
                      <textarea value={portfolioForm.maintenanceNotes} onChange={(event) => updatePortfolioForm({ maintenanceNotes: event.target.value })} readOnly={!canManagePortfolio} rows={3} style={{ width: '100%', boxSizing: 'border-box', border: `1px solid ${theme.border}`, borderRadius: 5, padding: '8px 12px', fontSize: 13.5, color: theme.ink, background: !canManagePortfolio ? theme.mintLighter : 'white', fontFamily: 'inherit', resize: 'vertical' }} />
                    </Field>
                    <Field label="Interne Bestandsnotizen">
                      <textarea value={portfolioForm.portfolioNotes} onChange={(event) => updatePortfolioForm({ portfolioNotes: event.target.value })} readOnly={!canManagePortfolio} rows={3} style={{ width: '100%', boxSizing: 'border-box', border: `1px solid ${theme.border}`, borderRadius: 5, padding: '8px 12px', fontSize: 13.5, color: theme.ink, background: !canManagePortfolio ? theme.mintLighter : 'white', fontFamily: 'inherit', resize: 'vertical' }} />
                    </Field>
                  </div>
                </div>

                {canManagePortfolio ? (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={savePortfolioFile} disabled={Boolean(busyAction)} style={{ background: theme.aubergine, color: 'white', border: 'none', borderRadius: 5, padding: '10px 16px', fontSize: 13, fontWeight: 800, cursor: busyAction ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                      <Save size={14} /> {busyAction === 'Bestandsakte speichern' ? 'Speichert...' : 'Bestandsakte speichern'}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {activeTab === 'verwertung' && role === 'admin' && !salesProcessActive && (
            <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, padding: '20px 22px' }}>
              <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Verkaufsprozess</div>
              <div style={{ background: theme.mintLight, border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '14px 16px', fontSize: 13, color: theme.ink, lineHeight: 1.5 }}>
                Der Verkaufsprozess beginnt erst nach Ende des Wohnrechts oder Rückmietverkaufs.
              </div>
            </div>
          )}

          {activeTab === 'verwertung' && role === 'admin' && salesProcessActive && (
            <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>Verkaufsprozess</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: theme.aubergine }}>Exitphase nach Auszug, Tod, Ablauf oder Aufgabe des Nutzungsrechts</div>
                </div>
                <span style={{ background: `${theme.aubergine}12`, color: theme.aubergine, borderRadius: 10, padding: '4px 10px', fontSize: 11, fontWeight: 800 }}>
                  {labelFrom(exitSalesStatusLabels, exitProcessForm.salesStatus)}
                </span>
              </div>
              <div style={{ padding: '18px 20px', display: 'grid', gap: 18 }}>
                <div style={{ background: theme.goldSoft, border: `1px solid ${theme.gold}55`, borderRadius: 6, padding: '11px 13px', fontSize: 12.5, color: theme.ink, lineHeight: 1.45 }}>
                  Dieser Bereich beginnt erst, wenn das Wohnrecht oder Nutzungsrecht endet. Erst hier sind Objektzugang, Schlüssel, Begehung und Räumung fachlich korrekt.
                </div>

                <div style={{ border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '16px 16px', display: 'grid', gap: 14 }}>
                  <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Beendigung Nutzungsrecht</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    <Field label="Wohnrecht / Rückmietverkauf beendet am"><Input type="date" value={exitProcessForm.usageRightEndedAt} onChange={(event) => updateExitProcessForm({ usageRightEndedAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Grund der Beendigung">
                      <Select value={exitProcessForm.terminationReason} onChange={(event) => updateExitProcessForm({ terminationReason: event.target.value })}>
                        {Object.entries(exitTerminationReasonLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </Select>
                    </Field>
                    <Field label="Beendigungsnachweis vorhanden">
                      <input type="checkbox" checked={exitProcessForm.terminationProofAvailable} onChange={(event) => updateExitProcessForm({ terminationProofAvailable: event.target.checked })} disabled={!canManagePortfolio} style={{ accentColor: theme.aubergine }} />
                    </Field>
                    <Field label="Ansprechpartner Angehörige / Nachlass / Betreuer"><Input value={exitProcessForm.relativesOrEstateContact} onChange={(event) => updateExitProcessForm({ relativesOrEstateContact: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Rücksprache mit Angehörigen erfolgt am"><Input type="date" value={exitProcessForm.relativesContactedAt} onChange={(event) => updateExitProcessForm({ relativesContactedAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Wiedervorlage / Frist"><Input type="date" value={exitProcessForm.followUpAt} onChange={(event) => updateExitProcessForm({ followUpAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                  </div>
                </div>

                <div style={{ border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '16px 16px', display: 'grid', gap: 14 }}>
                  <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Objektzugang & Vorbereitung</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    <Field label="Objektzugang geklärt">
                      <input type="checkbox" checked={exitProcessForm.propertyAccessClarified} onChange={(event) => updateExitProcessForm({ propertyAccessClarified: event.target.checked })} disabled={!canManagePortfolio} style={{ accentColor: theme.aubergine }} />
                    </Field>
                    <Field label="Schlüsselübergabe geplant am"><Input type="date" value={exitProcessForm.keyHandoverPlannedAt} onChange={(event) => updateExitProcessForm({ keyHandoverPlannedAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Schlüssel erhalten am"><Input type="date" value={exitProcessForm.keysReceivedAt} onChange={(event) => updateExitProcessForm({ keysReceivedAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Objektbegehung geplant am"><Input type="date" value={exitProcessForm.inspectionPlannedAt} onChange={(event) => updateExitProcessForm({ inspectionPlannedAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Objektbegehung erfolgt am"><Input type="date" value={exitProcessForm.inspectionCompletedAt} onChange={(event) => updateExitProcessForm({ inspectionCompletedAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Zustandsprotokoll nach Auszug vorhanden">
                      <input type="checkbox" checked={exitProcessForm.postMoveOutConditionReportAvailable} onChange={(event) => updateExitProcessForm({ postMoveOutConditionReportAvailable: event.target.checked })} disabled={!canManagePortfolio} style={{ accentColor: theme.aubergine }} />
                    </Field>
                    <Field label="Räumung erforderlich">
                      <input type="checkbox" checked={exitProcessForm.clearanceRequired} onChange={(event) => updateExitProcessForm({ clearanceRequired: event.target.checked })} disabled={!canManagePortfolio} style={{ accentColor: theme.aubergine }} />
                    </Field>
                    <Field label="Räumung beauftragt am"><Input type="date" value={exitProcessForm.clearanceOrderedAt} onChange={(event) => updateExitProcessForm({ clearanceOrderedAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Räumung erledigt am"><Input type="date" value={exitProcessForm.clearanceCompletedAt} onChange={(event) => updateExitProcessForm({ clearanceCompletedAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Verkehrssicherung geprüft">
                      <input type="checkbox" checked={exitProcessForm.safetyInspectionCompleted} onChange={(event) => updateExitProcessForm({ safetyInspectionCompleted: event.target.checked })} disabled={!canManagePortfolio} style={{ accentColor: theme.aubergine }} />
                    </Field>
                    <Field label="Versicherungsschutz geprüft">
                      <input type="checkbox" checked={exitProcessForm.insuranceCoverageChecked} onChange={(event) => updateExitProcessForm({ insuranceCoverageChecked: event.target.checked })} disabled={!canManagePortfolio} style={{ accentColor: theme.aubergine }} />
                    </Field>
                    <Field label="Reparatur-/Sanierungsbedarf erfasst">
                      <input type="checkbox" checked={exitProcessForm.repairNeedCaptured} onChange={(event) => updateExitProcessForm({ repairNeedCaptured: event.target.checked })} disabled={!canManagePortfolio} style={{ accentColor: theme.aubergine }} />
                    </Field>
                  </div>
                </div>

                <div style={{ border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '16px 16px', display: 'grid', gap: 14 }}>
                  <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Vermarktung & Abschluss</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    <Field label="Verkaufsvorbereitung gestartet am"><Input type="date" value={exitProcessForm.salesPreparationStartedAt} onChange={(event) => updateExitProcessForm({ salesPreparationStartedAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Makler beauftragt am"><Input type="date" value={exitProcessForm.brokerMandatedAt} onChange={(event) => updateExitProcessForm({ brokerMandatedAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Vermarktungsstart am"><Input type="date" value={exitProcessForm.marketingStartedAt} onChange={(event) => updateExitProcessForm({ marketingStartedAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Verkaufspreisindikation (€)"><Input type="number" value={exitProcessForm.salePriceIndication} onChange={(event) => updateExitProcessForm({ salePriceIndication: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Verkaufspreis festgelegt (€)"><Input type="number" value={exitProcessForm.salePriceFinal} onChange={(event) => updateExitProcessForm({ salePriceFinal: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Verkaufsstatus">
                      <Select value={exitProcessForm.salesStatus} onChange={(event) => updateExitProcessForm({ salesStatus: event.target.value })}>
                        {Object.entries(exitSalesStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </Select>
                    </Field>
                    <Field label="Verkauf beurkundet am"><Input type="date" value={exitProcessForm.saleNotarizedAt} onChange={(event) => updateExitProcessForm({ saleNotarizedAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Kaufpreis erhalten am"><Input type="date" value={exitProcessForm.salePriceReceivedAt} onChange={(event) => updateExitProcessForm({ salePriceReceivedAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                    <Field label="Verkaufsprozess abgeschlossen am"><Input type="date" value={exitProcessForm.exitCompletedAt} onChange={(event) => updateExitProcessForm({ exitCompletedAt: event.target.value })} readOnly={!canManagePortfolio} /></Field>
                  </div>
                  <Field label="Interne Notiz">
                    <textarea value={exitProcessForm.internalNote} onChange={(event) => updateExitProcessForm({ internalNote: event.target.value })} readOnly={!canManagePortfolio} rows={3} style={{ width: '100%', boxSizing: 'border-box', border: `1px solid ${theme.border}`, borderRadius: 5, padding: '8px 12px', fontSize: 13.5, color: theme.ink, background: !canManagePortfolio ? theme.mintLighter : 'white', fontFamily: 'inherit', resize: 'vertical' }} />
                  </Field>
                </div>

                {canManagePortfolio ? (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={saveExitProcess} disabled={Boolean(busyAction)} style={{ background: theme.aubergine, color: 'white', border: 'none', borderRadius: 5, padding: '10px 16px', fontSize: 13, fontWeight: 800, cursor: busyAction ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                      <Save size={14} /> {busyAction === 'Verkaufsprozess speichern' ? 'Speichert...' : 'Verkaufsprozess speichern'}
                    </button>
                  </div>
                ) : null}
              </div>
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
                    <input type="file" accept="application/pdf,image/*" onChange={(event) => setUploadFile(event.target.files?.[0] || null)} style={{ width: '100%', padding: '7px 10px', fontSize: 13, border: `1px solid ${theme.border}`, borderRadius: 5, background: 'white', color: theme.ink, boxSizing: 'border-box' }} />
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
                      <span> · V{d.currentVersion || 1}</span>
                      <span> · {d.scanStatusLabel}</span>
                      {d.missingReason && <span> · {d.missingReason}</span>}
                      {d.storageUrl && <span> · <a href={d.storageUrl} target="_blank" rel="noreferrer" style={{ color: theme.aubergine, fontWeight: 700 }}>Ansehen</a></span>}
                    </div>
                    {canReviewDocuments && d.storageUrl && !d.id?.startsWith('mock-') && (
                      <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '130px 150px 1fr auto', gap: 7, alignItems: 'center' }}>
                        <select
                          value={documentReviewInputs[d.id]?.status || d.status}
                          onChange={(event) => updateDocumentReviewInput(d.id, { status: event.target.value })}
                          style={{ border: `1px solid ${theme.border}`, borderRadius: 5, padding: '6px 8px', fontSize: 11.5, color: theme.ink, background: 'white' }}
                        >
                          <option value="pending">eingereicht</option>
                          <option value="ok">geprüft</option>
                          <option value="review_required">Prüfung nötig</option>
                          <option value="missing">fehlt</option>
                          <option value="rejected">abgelehnt</option>
                        </select>
                        <select
                          value={documentReviewInputs[d.id]?.scanStatus || d.scanStatus || 'pending'}
                          onChange={(event) => updateDocumentReviewInput(d.id, { scanStatus: event.target.value })}
                          style={{ border: `1px solid ${theme.border}`, borderRadius: 5, padding: '6px 8px', fontSize: 11.5, color: theme.ink, background: 'white' }}
                        >
                          <option value="pending">Scan offen</option>
                          <option value="clean">Scan ok</option>
                          <option value="suspicious">auffällig</option>
                          <option value="failed">Scan fehlgeschlagen</option>
                        </select>
                        <input
                          value={documentReviewInputs[d.id]?.missingReason ?? ''}
                          onChange={(event) => updateDocumentReviewInput(d.id, { missingReason: event.target.value })}
                          placeholder="Prüfhinweis / fehlende Angabe"
                          style={{ minWidth: 0, border: `1px solid ${theme.border}`, borderRadius: 5, padding: '6px 8px', fontSize: 11.5, color: theme.ink, background: 'white' }}
                        />
                        <button onClick={() => reviewDocument(d)} disabled={Boolean(busyAction)} style={{ background: theme.aubergine, border: 'none', color: 'white', borderRadius: 5, padding: '6px 10px', fontSize: 11.5, fontWeight: 800, cursor: busyAction ? 'wait' : 'pointer' }}>
                          Prüfen
                        </button>
                      </div>
                    )}
                    {d.versions?.length ? (
                      <div style={{ fontSize: 10.5, color: `${theme.ink}77`, marginTop: 5 }}>
                        {d.versions.length} gespeicherte Version{d.versions.length === 1 ? '' : 'en'} · letzte Prüfung {d.reviewedAt ? dateLabel(d.reviewedAt) : 'offen'}
                      </div>
                    ) : null}
                  </div>
                  {d.storageUrl && !d.id?.startsWith('mock-') && canDeleteDocuments && (
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

          {activeTab === 'chat' && (
            <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MessageSquare size={15} style={{ color: theme.aubergine }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: theme.aubergine }}>Kommunikation</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {chatReturnTab && (
                    <button onClick={() => onReturnToTab?.(chatReturnTab)} style={{ background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine, borderRadius: 5, padding: '6px 10px', fontSize: 11.5, fontWeight: 800, cursor: 'pointer' }}>
                      Zurück zu {tabs.find((tab) => tab.id === chatReturnTab)?.label || 'vorherigem Reiter'}
                    </button>
                  )}
                  <span style={{ fontSize: 11, color: `${theme.ink}88` }}>fallbezogene Kommunikation</span>
                </div>
              </div>
              <div style={{ padding: '16px 18px', background: theme.mintLighter, borderBottom: `1px solid ${theme.borderSoft}` }}>
                <div style={{ display: 'grid', gap: 10 }}>
                  <textarea
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    placeholder="Nachricht zum Kundenfall schreiben..."
                    rows={4}
                    style={{ width: '100%', resize: 'vertical', padding: '10px 12px', fontSize: 13.5, border: `1px solid ${theme.border}`, borderRadius: 6, background: 'white', color: theme.ink, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', lineHeight: 1.45 }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine, padding: '7px 10px', borderRadius: 5, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
                      <Upload size={13} /> Anhang hinzufügen
                      <input
                        type="file"
                        multiple
                        onChange={(event) => setChatAttachmentFiles(Array.from(event.target.files || []).slice(0, 5))}
                        style={{ display: 'none' }}
                      />
                    </label>
                    {chatAttachmentFiles.length ? (
                      <span style={{ fontSize: 12, color: `${theme.ink}88` }}>
                        {chatAttachmentFiles.map((file) => file.name).join(', ')}
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, color: `${theme.ink}88` }}>Optional: Bild oder Datei zum Fall anhängen.</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    {role === 'admin' ? (
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: theme.ink, fontWeight: 600 }}>
                        <input type="checkbox" checked={chatVisibility === 'internal'} onChange={(event) => setChatVisibility(event.target.checked ? 'internal' : 'shared')} style={{ accentColor: theme.aubergine }} />
                        Nur intern sichtbar
                      </label>
                    ) : (
                      <span style={{ fontSize: 12, color: `${theme.ink}88` }}>Nachrichten sind für WohnKapital und den zuständigen Makler sichtbar.</span>
                    )}
                    <button onClick={sendChatMessage} disabled={Boolean(busyAction) || (!chatInput.trim() && !chatAttachmentFiles.length)} style={{ background: theme.aubergine, color: 'white', border: 'none', padding: '9px 14px', borderRadius: 5, fontSize: 12.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, cursor: busyAction || (!chatInput.trim() && !chatAttachmentFiles.length) ? 'default' : 'pointer', opacity: busyAction || (!chatInput.trim() && !chatAttachmentFiles.length) ? 0.55 : 1 }}>
                      <Send size={13} /> {busyAction === 'Chat-Nachricht senden' ? 'Sendet...' : 'Senden'}
                    </button>
                  </div>
                </div>
              </div>
              <div style={{ padding: '16px 18px', display: 'grid', gap: 10 }}>
                {chatMessages.length ? chatMessages.map((message) => {
                  const isAdminMessage = message.userRole === 'admin' || message.source === 'admin';
                  const isInternal = message.visibility === 'internal';
                  return (
                    <div key={message.id} style={{ border: `1px solid ${isInternal ? `${theme.gold}66` : theme.borderSoft}`, borderRadius: 8, padding: '11px 13px', background: isInternal ? theme.goldSoft : isAdminMessage ? theme.mintLighter : 'white' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 5 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 800, color: theme.aubergine }}>
                          {message.userName || (isAdminMessage ? 'WohnKapital' : 'Makler')}
                          <span style={{ color: `${theme.ink}88`, fontWeight: 600 }}> · {isAdminMessage ? 'Admin' : 'Makler'}</span>
                          {isInternal && <span style={{ marginLeft: 8, color: '#A87308', fontSize: 11, fontWeight: 800 }}>Intern</span>}
                        </div>
                        <div style={{ fontSize: 11, color: `${theme.ink}88`, whiteSpace: 'nowrap' }}>{dateLabel(message.createdAt)}</div>
                      </div>
                      <div style={{ fontSize: 13, color: theme.ink, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{message.message}</div>
                      {message.attachments?.length ? (
                        <div style={{ marginTop: 9, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {message.attachments.map((attachment) => (
                            <a key={attachment.id} href={attachment.storageUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: `1px solid ${theme.border}`, borderRadius: 5, padding: '6px 9px', background: 'white', color: theme.aubergine, fontSize: 11.5, fontWeight: 800, textDecoration: 'none' }}>
                              <FileText size={13} /> {attachment.fileName}
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                }) : (
                  <div style={{ padding: '18px 14px', border: `1px dashed ${theme.border}`, borderRadius: 8, fontSize: 13, color: `${theme.ink}88`, lineHeight: 1.5, background: theme.mintLighter }}>
                    Noch keine Nachrichten zu diesem Kundenfall.
                  </div>
                )}
              </div>
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
            <div style={{ display: 'grid', gap: 16 }}>
              {role !== 'admin' && (
                <div style={{ background: theme.mintLight, border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '10px 12px', fontSize: 12.5, color: theme.ink, lineHeight: 1.45 }}>
                  Lesende Ansicht: WohnKapital berechnet und gibt Angebote intern frei. Als Makler siehst du hier die vorhandenen Angebotsdaten.
                </div>
              )}
              {requestedOfferModels.map((modelRequest, index) => renderIndicativeOfferCard(modelRequest, index))}
              {canManageOffers && (
                <div style={{ ...offerShellStyle, padding: '18px 20px', display: 'grid', gap: 14 }}>
                  <div>
                    <div style={offerSectionTitleStyle}>Gutachtenbeauftragung</div>
                    <div style={{ fontSize: 12.5, color: `${theme.ink}88`, lineHeight: 1.5 }}>
                      Sobald der Kunde das unverbindliche Angebot angenommen hat, kann ein Gutachter beauftragt werden. Nach Eingang des Gutachtens kann das verbindliche Angebot vorbereitet werden.
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(190px, 260px) minmax(260px, 1fr)', gap: 12 }}>
                    <Field label="Beauftragt am" hint="Pflicht beim Speichern der Beauftragung.">
                      <Input
                        type="date"
                        value={expertOpinionOrderedDate || dateInputValue(property?.expertOpinionOrderedAt)}
                        onChange={(event) => setExpertOpinionOrderedDate(event.target.value)}
                        readOnly={!canManageWorkflow}
                      />
                    </Field>
                    <Field label="Gutachter / Gutachterfirma" hint="Pflicht beim Speichern der Beauftragung.">
                      <Input
                        value={expertOpinionCompany || property?.expertOpinionCompany || ''}
                        onChange={(event) => setExpertOpinionCompany(event.target.value)}
                        placeholder="z.B. Sprengnetter, DEKRA, freier Sachverständiger"
                        readOnly={!canManageWorkflow}
                      />
                    </Field>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                    <button onClick={saveExpertOpinionOrderData} disabled={Boolean(busyAction) || !canManageWorkflow} style={offerButtonStyle('secondary', { disabled: Boolean(busyAction) || !canManageWorkflow, busy: busyAction === 'Gutachtenbeauftragung speichern' })}>
                      Gutachtenbeauftragung speichern
                    </button>
                    {property?.expertOpinionOrderedAt && <OfferDonePill>Gutachten beauftragt</OfferDonePill>}
                  </div>
                  <div style={{ borderTop: `1px solid ${theme.borderSoft}`, paddingTop: 14, display: 'grid', gap: 12 }}>
                    <div style={offerSectionTitleStyle}>Eingang des Gutachtens</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(190px, 260px)', gap: 10 }}>
                      <Field label="Gutachten eingegangen am" hint="Pflicht erst beim Markieren des Eingangs." invalid={Boolean((expertOpinionReceivedDate || dateInputValue(property?.expertOpinionReceivedAt)) && (expertOpinionOrderedDate || dateInputValue(property?.expertOpinionOrderedAt)) && isDateBefore(expertOpinionReceivedDate || dateInputValue(property?.expertOpinionReceivedAt), expertOpinionOrderedDate || dateInputValue(property?.expertOpinionOrderedAt)))}>
                        <Input
                          type="date"
                          value={expertOpinionReceivedDate || dateInputValue(property?.expertOpinionReceivedAt)}
                          onChange={(event) => setExpertOpinionReceivedDate(event.target.value)}
                          readOnly={!canManageWorkflow}
                        />
                      </Field>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                      {(() => {
                        const state = workflowActionState('expert_opinion_received');
                        const disabled = Boolean(busyAction) || !state.nextAllowed || !canManageWorkflow;
                        return state.reached ? (
                          <button onClick={() => runWorkflowAction('expert_opinion_received')} disabled={Boolean(busyAction) || !canManageWorkflow} style={offerButtonStyle('secondary', { disabled: Boolean(busyAction) || !canManageWorkflow, busy: Boolean(busyAction) })}>
                            Eingangsdatum speichern
                          </button>
                        ) : (
                          <button onClick={() => runWorkflowAction('expert_opinion_received')} disabled={disabled} style={offerButtonStyle('primary', { disabled })}>
                            Gutachten als eingegangen markieren
                          </button>
                        );
                      })()}
                      {property?.expertOpinionReceivedAt && <OfferDonePill>Gutachten eingegangen</OfferDonePill>}
                    </div>
                  </div>
                  {property?.expertOpinionCompany && (
                    <div style={{ fontSize: 11, color: `${theme.ink}88` }}>
                      Gutachter / Gutachterfirma: {property.expertOpinionCompany}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === '__legacy_indag' && (
            <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, padding: '20px 22px' }}>
              <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Unverbindliches Angebot</div>
              {role !== 'admin' && (
                <div style={{ background: theme.mintLight, border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '10px 12px', fontSize: 12.5, color: theme.ink, lineHeight: 1.45, marginBottom: 14 }}>
                  Lesende Ansicht: WohnKapital berechnet und gibt Angebote intern frei. Als Makler siehst du hier die vorhandenen Angebotsdaten.
                </div>
              )}
              <div style={{ display: 'grid', gap: 12 }}>
                {requestedOfferModels.map((modelRequest, index) => {
                  const offer = indicativeOffers.find((item) => item.model === modelRequest.model);
                  const key = `${modelRequest.key}-${index}`;
                  const params = calculationParams[key] || {};
                  const rentBackMetrics = modelRequest.model === 'sale_and_leaseback' && offer ? rentBackCalculationFromOffer(offer) : null;
                  const calculationActionLabel = modelRequest.model === 'sale_and_leaseback' ? 'Rückmietverkauf-Kalkulation' : 'Wohnrecht-Kalkulation';
                  const quote = rentBackMetrics
                    ? Math.round(rentBackMetrics.payoutRate * 100)
                    : offer?.payoutAmount && offer?.marketValue ? Math.round((offer.payoutAmount / offer.marketValue) * 100) : undefined;
                  const maintenanceValue = offer ? (params.maintenance || offer.companyMargin || offer.assumptions?.components?.maintenancePledge) : null;
                  const indicativeMetricRows = offer ? (modelRequest.model === 'sale_and_leaseback' ? rentBackMetricRows(offer) : role === 'admin' ? [
                    ['Verkehrswert', formatEuro(offer.marketValue)],
                    ['Wohnrechtswert', offer.residentialRightValue ? formatEuro(offer.residentialRightValue) : '-'],
                    ['Instandhaltung', maintenanceValue ? formatEuro(Number(maintenanceValue)) : '-'],
                    ['Interne Verzinsung', params.interestRate ? `${params.interestRate}%` : 'Standard 5,5%'],
                    ['Auszahlungsbetrag (Quote)', `${formatEuro(offer.payoutAmount)}${quote ? ` (${quote}%)` : ''}`],
                  ] : [
                    ['Status', labelFrom(offerStatusLabels, offer.status, offer.status)],
                    ['Verkehrswert', formatEuro(offer.marketValue)],
                    ['Angebotssumme', `${formatEuro(offer.payoutAmount)}${quote ? ` (${quote}%)` : ''}`],
                    ['Modell', labelFrom(productModelLabels, offer.model)],
                    ['Version', `Version ${offer.currentVersion || 1}`],
                  ]) : [];
                  return (
                    <div key={key} style={{ border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '14px 16px', background: theme.mintLighter }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 13.5, color: theme.aubergine, fontWeight: 800 }}>{modelRequest.primary ? 'Hauptmodell' : 'Zweites Angebot'} · {labelFrom(productModelLabels, modelRequest.model)}</div>
                          <div style={{ fontSize: 11.5, color: `${theme.ink}88`, marginTop: 3 }}>
                            {modelRequest.model === 'fixed_residential_right'
                              ? `Laufzeit ${modelRequest.residentialRightYears || '-'} Jahre · ${labelFrom(recipientLabels, modelRequest.recipient)}${modelRequest.recipientPerson ? ` (${labelFrom({ customer_1: 'Kunde 1', customer_2: 'Kunde 2' }, modelRequest.recipientPerson)})` : ''} · ${modelRequest.reason || 'kein Grund angegeben'}`
                              : 'Rückmietverkauf · Miete fällt ab Tag 1 nach Verkauf an'}
                          </div>
                        </div>
                        {offer ? <span style={{ fontSize: 11, color: `${theme.ink}88`, fontWeight: 800, textTransform: 'uppercase' }}>{labelFrom(offerStatusLabels, offer.status, offer.status)}</span> : null}
                      </div>

                      {canManageOffers && (
                        <button onClick={() => setOpenCalculation(openCalculation === key ? '' : key)} style={{ ...offerButtonStyle('primary'), marginBottom: openCalculation === key ? 12 : 0 }}>
                          Unverbindliches Angebot berechnen
                        </button>
                      )}

                      {canManageOffers && openCalculation === key && (
                        <div style={{ background: 'white', border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
                          <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Kalkulationsparameter</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
                            {[
                              ['marketValue', 'Verkehrswert (€)'],
                              ['maintenance', 'Instandhaltung (€)'],
                              ['interestRate', 'Interne Verzinsung (%)'],
                              ['safetyDiscount', 'Sicherheitsabschlag (%)'],
                            ].map(([field, label]) => (
                              <Field key={field} label={label}>
                                <Input type="number" value={params[field] || ''} onChange={(event) => setCalculationParams({ ...calculationParams, [key]: { ...params, [field]: event.target.value } })} />
                              </Field>
                            ))}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <button onClick={() => startValuationAndOffer(modelRequest.model)} disabled={Boolean(busyAction)} style={offerButtonStyle('primary', { disabled: Boolean(busyAction), busy: busyAction === calculationActionLabel })}>
                              {busyAction === calculationActionLabel ? 'Berechnet...' : 'Unverbindliches Angebot berechnen'}
                            </button>
                            <OfferSuccessHint action={calculationActionLabel} />
                          </div>
                        </div>
                      )}

                      {offer ? (
                        <>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(128px, 1fr))', gap: '12px 16px', marginTop: 12 }}>
                            {indicativeMetricRows.map(([k, v], i) => (
                              <div key={i}>
                                <div style={{ fontSize: 11, color: `${theme.ink}88`, fontWeight: 700, marginBottom: 3 }}>{k}</div>
                                <div style={{ fontSize: 13.5, color: theme.ink, fontWeight: k.includes('Auszahlung') || k.includes('Angebot') ? 800 : 500 }}>{v}</div>
                              </div>
                            ))}
                          </div>
                          {modelRequest.model === 'sale_and_leaseback' && (
                            <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${theme.borderSoft}`, fontSize: 11.5, color: `${theme.ink}88`, lineHeight: 1.45 }}>
                              Demo-Kalkulation: Die Auszahlung beträgt pauschal 70 % des Verkehrswerts. Die jährliche Miete beträgt 5 % des Auszahlungsbetrags. Rating-Tool folgt.
                            </div>
                          )}
                          {role === 'partner' && (
                            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${theme.borderSoft}` }}>
                              {renderOfferWorkflowControl('offer_accepted', 'UVA angenommen')}
                              <div style={{ fontSize: 11.5, color: `${theme.ink}88`, marginTop: 6 }}>
                                Sobald du die Annahme bestätigst, wird der Fall intern weiterbearbeitet und das Gutachten kann beauftragt werden.
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div style={{ background: 'white', border: `1px solid ${theme.borderSoft}`, borderRadius: 6, padding: '10px 12px', fontSize: 12.5, color: `${theme.ink}88`, marginTop: 12 }}>
                          Noch keine Berechnung vorhanden.
                        </div>
                      )}
                      {modelRequest.primary && (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Angebotsstatus / Angebotsdaten</div>
                          {indicativeOfferDateFields}
                          {canManageOffers && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                              {renderOfferWorkflowControl('indicative_offer_sent', 'Unverbindliches Angebot abgegeben')}
                              {renderOfferWorkflowControl('offer_accepted', 'UVA angenommen')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {canManageOffers && (
                  <div style={{ border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '14px 16px', background: 'white' }}>
                    <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Gutachtenbeauftragung</div>
                    <div style={{ fontSize: 12.5, color: `${theme.ink}88`, lineHeight: 1.5, marginBottom: 12 }}>
                      Sobald der Kunde das unverbindliche Angebot angenommen hat, kann ein Gutachter beauftragt werden. Nach Eingang des Gutachtens kann das verbindliche Angebot vorbereitet werden.
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(190px, 260px) minmax(260px, 1fr)', gap: 10, marginBottom: 12 }}>
                      <Field label="Beauftragt am" hint="Pflicht beim Speichern der Beauftragung.">
                        <Input
                          type="date"
                          value={expertOpinionOrderedDate || dateInputValue(property?.expertOpinionOrderedAt)}
                          onChange={(event) => setExpertOpinionOrderedDate(event.target.value)}
                          readOnly={!canManageWorkflow}
                        />
                      </Field>
                      <Field label="Gutachter / Gutachterfirma" hint="Pflicht beim Speichern der Beauftragung.">
                        <Input
                          value={expertOpinionCompany || property?.expertOpinionCompany || ''}
                          onChange={(event) => setExpertOpinionCompany(event.target.value)}
                          placeholder="z.B. Sprengnetter, DEKRA, freier Sachverständiger"
                          readOnly={!canManageWorkflow}
                        />
                      </Field>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, alignItems: 'center', marginBottom: 14 }}>
                      <button onClick={saveExpertOpinionOrderData} disabled={Boolean(busyAction) || !canManageWorkflow} style={offerButtonStyle('secondary', { disabled: Boolean(busyAction) || !canManageWorkflow, busy: busyAction === 'Gutachtenbeauftragung speichern' })}>
                        Gutachtenbeauftragung speichern
                      </button>
                      {property?.expertOpinionOrderedAt && <OfferDonePill>Gutachten beauftragt</OfferDonePill>}
                    </div>
                    <div style={{ borderTop: `1px solid ${theme.borderSoft}`, paddingTop: 12 }}>
                      <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Eingang des Gutachtens</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(190px, 260px)', gap: 10, marginBottom: 12 }}>
                        <Field label="Gutachten eingegangen am" hint="Pflicht erst beim Markieren des Eingangs." invalid={Boolean((expertOpinionReceivedDate || dateInputValue(property?.expertOpinionReceivedAt)) && (expertOpinionOrderedDate || dateInputValue(property?.expertOpinionOrderedAt)) && isDateBefore(expertOpinionReceivedDate || dateInputValue(property?.expertOpinionReceivedAt), expertOpinionOrderedDate || dateInputValue(property?.expertOpinionOrderedAt)))}>
                          <Input
                            type="date"
                            value={expertOpinionReceivedDate || dateInputValue(property?.expertOpinionReceivedAt)}
                            onChange={(event) => setExpertOpinionReceivedDate(event.target.value)}
                            readOnly={!canManageWorkflow}
                          />
                        </Field>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, alignItems: 'center' }}>
                        {(() => {
                          const state = workflowActionState('expert_opinion_received');
                          const disabled = Boolean(busyAction) || !state.nextAllowed || !canManageWorkflow;
                          if (state.reached) {
                            return (
                              <button
                                onClick={() => runWorkflowAction('expert_opinion_received')}
                                disabled={Boolean(busyAction) || !canManageWorkflow}
                                style={offerButtonStyle('secondary', { disabled: Boolean(busyAction) || !canManageWorkflow, busy: Boolean(busyAction) })}
                              >
                                Eingangsdatum speichern
                              </button>
                            );
                          }
                          return (
                            <button
                              onClick={() => runWorkflowAction('expert_opinion_received')}
                              disabled={disabled}
                              style={offerButtonStyle('primary', { disabled })}
                            >
                              Gutachten als eingegangen markieren
                            </button>
                          );
                        })()}
                        {property?.expertOpinionReceivedAt && <OfferDonePill>Gutachten eingegangen</OfferDonePill>}
                      </div>
                    </div>
                    {property?.expertOpinionCompany && (
                      <div style={{ fontSize: 11, color: `${theme.ink}88`, marginTop: 10 }}>
                        Gutachter / Gutachterfirma: {property.expertOpinionCompany}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'verbag' && (
            <div style={{ display: 'grid', gap: 16 }}>
              {role !== 'admin' && (
                <div style={{ background: theme.mintLight, border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '10px 12px', fontSize: 12.5, color: theme.ink, lineHeight: 1.45 }}>
                  Lesende Ansicht: Das verbindliche Angebot wird erst nach Gutachten intern berechnet und im Anschluss hier angezeigt.
                </div>
              )}
              <div style={{ background: theme.mintLight, border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '12px 14px', fontSize: 12.5, color: theme.ink, lineHeight: 1.5 }}>
                Nach Eingang des Gutachtens wird das verbindliche Angebot auf Basis des Gutachtenwerts neu berechnet. Die UVA bleibt als eigene Version bestehen.
              </div>
              {!canPrepareBindingOffer && (
                <div style={{ background: theme.goldSoft, border: `1px solid ${theme.gold}55`, borderRadius: 8, padding: '10px 12px', fontSize: 12.5, color: theme.ink }}>
                  Das verbindliche Angebot wird freigeschaltet, sobald im Bereich „Unverbindliches Angebot“ das Gutachten als eingegangen markiert wurde.
                </div>
              )}
              {requestedOfferModels.map((modelRequest, index) => renderBindingOfferCard(modelRequest, index))}
              {canManageOffers && (
                <div style={{ background: 'white', border: `1px solid ${theme.borderSoft}`, borderRadius: 12, padding: '18px 20px', boxShadow: '0 10px 28px rgba(68, 0, 92, 0.035)', display: 'grid', gap: 12 }}>
                  <div style={{ fontSize: 10.5, color: theme.aubergine, fontWeight: 850, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Notartermin und Kaufvertrag</div>
                  {(workflowActionState('notary_appointment_ordered').nextAllowed || workflowActionState('notary_appointment_ordered').reached || workflowActionState('contract_signed').nextAllowed) ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 230px) minmax(190px, 270px) auto auto', gap: 9, alignItems: 'center' }}>
                      <input
                        type="datetime-local"
                        value={notaryAppointmentDate || (property?.notaryAppointmentAt ? property.notaryAppointmentAt.slice(0, 16) : '')}
                        onChange={(event) => setNotaryAppointmentDate(event.target.value)}
                        disabled={workflowActionState('notary_appointment_ordered').reached}
                        title="Notartermin"
                        style={{ width: '100%', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '7px 9px', color: theme.ink, fontSize: 12.5, fontFamily: 'inherit', boxSizing: 'border-box' }}
                      />
                      <input
                        type="text"
                        value={notaryOffice || property?.notaryOffice || ''}
                        onChange={(event) => setNotaryOffice(event.target.value)}
                        disabled={workflowActionState('notary_appointment_ordered').reached}
                        placeholder="Notar / Notariat"
                        title="Notar oder Notariat"
                        style={{ width: '100%', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '7px 9px', color: theme.ink, fontSize: 12.5, fontFamily: 'inherit', boxSizing: 'border-box' }}
                      />
                      {['notary_appointment_ordered', 'contract_signed'].map((action) => {
                        const state = workflowActionState(action);
                        return (
                          <button key={action} onClick={() => runWorkflowAction(action)} disabled={state.disabled} style={workflowButtonStyle(state)}>
                            {state.reached ? <CheckCircle size={13} /> : null}
                            {state.step?.label || action}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12.5, color: `${theme.ink}88` }}>Verfügbar, sobald das verbindliche Angebot angenommen wurde.</div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === '__legacy_verbag' && (
            <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, padding: '20px 22px' }}>
              <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Verbindliches Angebot</div>
              {role !== 'admin' && (
                <div style={{ background: theme.mintLight, border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '10px 12px', fontSize: 12.5, color: theme.ink, lineHeight: 1.45, marginBottom: 14 }}>
                  Lesende Ansicht: Das verbindliche Angebot wird erst nach Gutachten intern berechnet und im Anschluss hier angezeigt.
                </div>
              )}
              <div style={{ background: theme.mintLight, border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '12px 14px', fontSize: 12.5, color: theme.ink, lineHeight: 1.5, marginBottom: 14 }}>
                Nach Eingang des Gutachtens wird das verbindliche Angebot auf Basis des Gutachtenwerts neu berechnet. Die UVA bleibt als eigene Version bestehen.
              </div>
              {!canPrepareBindingOffer && (
                <div style={{ background: theme.goldSoft, border: `1px solid ${theme.gold}55`, borderRadius: 8, padding: '10px 12px', fontSize: 12.5, color: theme.ink, marginBottom: 14 }}>
                  Das verbindliche Angebot wird freigeschaltet, sobald im Bereich „Unverbindliches Angebot“ das Gutachten als eingegangen markiert wurde.
                </div>
              )}
              <div style={{ display: 'grid', gap: 12 }}>
                {requestedOfferModels.map((modelRequest, index) => {
                  const bindingOffer = bindingOffers.find((item) => item.model === modelRequest.model);
                  const indicativeOffer = indicativeOffers.find((item) => item.model === modelRequest.model);
                  const deltaMarket = bindingOffer && indicativeOffer ? bindingOffer.marketValue - indicativeOffer.marketValue : undefined;
                  const bindingRentBackMetrics = modelRequest.model === 'sale_and_leaseback' && bindingOffer ? rentBackCalculationFromOffer(bindingOffer) : null;
                  const indicativeRentBackMetrics = modelRequest.model === 'sale_and_leaseback' && indicativeOffer ? rentBackCalculationFromOffer(indicativeOffer) : null;
                  const deltaPayout = bindingOffer && indicativeOffer
                    ? (bindingRentBackMetrics?.payoutAmount ?? bindingOffer.payoutAmount) - (indicativeRentBackMetrics?.payoutAmount ?? indicativeOffer.payoutAmount)
                    : undefined;
                  const key = `binding-${modelRequest.key}-${index}`;
                  const quote = bindingRentBackMetrics
                    ? Math.round(bindingRentBackMetrics.payoutRate * 100)
                    : bindingOffer?.payoutAmount && bindingOffer?.marketValue ? Math.round((bindingOffer.payoutAmount / bindingOffer.marketValue) * 100) : undefined;
                  const bindingMetricRows = bindingOffer ? (modelRequest.model === 'sale_and_leaseback' ? rentBackMetricRows(bindingOffer) : role === 'admin' ? [
                    ['Gutachtenwert', formatEuro(bindingOffer.marketValue)],
                    ['Wohnrechtswert', bindingOffer.residentialRightValue ? formatEuro(bindingOffer.residentialRightValue) : '-'],
                    ['Risikoabschlag', bindingOffer.riskDiscount ? formatEuro(bindingOffer.riskDiscount) : '-'],
                    ['Marge', bindingOffer.companyMargin ? formatEuro(bindingOffer.companyMargin) : '-'],
                    ['VA-Auszahlung', `${formatEuro(bindingOffer.payoutAmount)}${quote ? ` (${quote}%)` : ''}`],
                  ] : [
                    ['Status', labelFrom(offerStatusLabels, bindingOffer.status, bindingOffer.status)],
                    ['Gutachtenwert', formatEuro(bindingOffer.marketValue)],
                    ['Verbindliche Angebotssumme', `${formatEuro(bindingOffer.payoutAmount)}${quote ? ` (${quote}%)` : ''}`],
                    ['Modell', labelFrom(productModelLabels, bindingOffer.model)],
                    ['Version', `Version ${bindingOffer.currentVersion || 1}`],
                  ]) : [];
                  return (
                    <div key={key} style={{ border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '14px 16px', background: theme.mintLighter }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 13.5, color: theme.aubergine, fontWeight: 800 }}>{modelRequest.primary ? 'Hauptmodell' : 'Zweites Angebot'} · {labelFrom(productModelLabels, modelRequest.model)}</div>
                          <div style={{ fontSize: 11.5, color: `${theme.ink}88`, marginTop: 3 }}>
                            Basis für VA: Gutachtenwert statt erster Schätzung
                          </div>
                        </div>
                        {bindingOffer ? <span style={{ fontSize: 11, color: `${theme.ink}88`, fontWeight: 800, textTransform: 'uppercase' }}>{labelFrom(offerStatusLabels, bindingOffer.status, bindingOffer.status)}</span> : null}
                      </div>
                      {bindingOffer && indicativeOffer && (
                        <div style={{ background: 'white', border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
                          <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>UVA vs. VA</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(128px, 1fr))', gap: '10px 14px' }}>
                            {[
                              ['UVA-Marktwert', formatEuro(indicativeOffer.marketValue)],
                              ['Gutachtenwert', formatEuro(bindingOffer.marketValue)],
                              ['Differenz Wert', `${deltaMarket >= 0 ? '+' : ''}${formatEuro(deltaMarket)}`],
                              ['Differenz Auszahlung', `${deltaPayout >= 0 ? '+' : ''}${formatEuro(deltaPayout)}`],
                            ].map(([k, v]) => (
                              <div key={k}>
                                <div style={{ fontSize: 10.5, color: `${theme.ink}77`, fontWeight: 800, marginBottom: 3 }}>{k}</div>
                                <div style={{ fontSize: 13, color: k.includes('Differenz') ? (String(v).startsWith('-') ? '#9B2C2C' : '#5B8C2B') : theme.ink, fontWeight: 800 }}>{v}</div>
                              </div>
                            ))}
                          </div>
                          <div style={{ fontSize: 11.5, color: `${theme.ink}88`, marginTop: 8 }}>
                            UVA Version {indicativeOffer.currentVersion || 1} · VA Version {bindingOffer.currentVersion || 1} · gespeicherte VA-Snapshots: {offerVersionsCount(bindingOffer)}
                          </div>
                        </div>
                      )}

                      {canManageOffers && (
                        <div style={{ background: 'white', border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 360px)', gap: 10, marginBottom: 12 }}>
                            <Field label="Gutachtenwert (€)" required>
                              <Input type="text" value={expertOpinionValue} onChange={(event) => setExpertOpinionValue(formatGermanIntegerInput(event.target.value))} placeholder="z.B. 520.000" inputMode="numeric" />
                            </Field>
                          </div>
                          <button onClick={() => calculateBindingOffer(modelRequest, index)} disabled={Boolean(busyAction) || !canPrepareBindingOffer} style={{ background: theme.aubergine, color: 'white', border: 'none', borderRadius: 5, padding: '8px 12px', fontSize: 12.5, fontWeight: 800, cursor: busyAction ? 'wait' : canPrepareBindingOffer ? 'pointer' : 'default', opacity: busyAction || !canPrepareBindingOffer ? 0.55 : 1 }}>
                            {busyAction ? 'Berechnet...' : 'Verbindliches Angebot berechnen'}
                          </button>
                        </div>
                      )}

                      {bindingOffer ? (
                        <>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(128px, 1fr))', gap: '12px 16px' }}>
                            {bindingMetricRows.map(([k, v], i) => (
                              <div key={i}>
                                <div style={{ fontSize: 11, color: `${theme.ink}88`, fontWeight: 700, marginBottom: 3 }}>{k}</div>
                                <div style={{ fontSize: 13.5, color: theme.ink, fontWeight: k.includes('Auszahlung') || k.includes('Angebot') ? 800 : 500 }}>{v}</div>
                              </div>
                            ))}
                          </div>
                          {modelRequest.model === 'sale_and_leaseback' && (
                            <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${theme.borderSoft}`, fontSize: 11.5, color: `${theme.ink}88`, lineHeight: 1.45 }}>
                              Demo-Kalkulation: Die Auszahlung beträgt pauschal 70 % des Verkehrswerts. Die jährliche Miete beträgt 5 % des Auszahlungsbetrags. Rating-Tool folgt.
                            </div>
                          )}
                          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${theme.borderSoft}`, fontSize: 12.5, color: `${theme.ink}88`, whiteSpace: 'pre-line' }}>
                            {bindingOffer.aiCustomerText || bindingOffer.bindingOfferText || 'VA-Kalkulation erstellt. Textentwurf noch nicht vorhanden.'}
                          </div>
                          <div style={{ marginTop: 10, fontSize: 11.5, color: `${theme.ink}88` }}>
                            Berechnungsbasis: {bindingOffer.assumptions?.valuationBasis === 'expert_opinion' ? 'Gutachtenwert' : 'Anwendungswert'} · Angebotsversion {bindingOffer.currentVersion || 1}
                          </div>
                          {role === 'partner' && (
                            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${theme.borderSoft}` }}>
                              <button onClick={() => runWorkflowAction('binding_offer_accepted')} disabled={workflowActionState('binding_offer_accepted').disabled} style={workflowButtonStyle(workflowActionState('binding_offer_accepted'))}>
                                {workflowActionState('binding_offer_accepted').reached ? <CheckCircle size={13} /> : null}
                                VA angenommen
                              </button>
                              <div style={{ fontSize: 11.5, color: `${theme.ink}88`, marginTop: 6 }}>
                                Nach der Annahme kann intern der Notartermin vorbereitet und vereinbart werden.
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div style={{ background: 'white', border: `1px solid ${theme.borderSoft}`, borderRadius: 6, padding: '10px 12px', fontSize: 12.5, color: `${theme.ink}88` }}>
                          Noch keine VA-Kalkulation vorhanden.
                        </div>
                      )}
                      {modelRequest.primary && (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Angebotsstatus / Angebotsdaten</div>
                          {bindingOfferDateFields}
                          {canManageOffers && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                              {['binding_offer_sent', 'binding_offer_accepted'].map((action) => {
                                const state = workflowActionState(action);
                                return (
                                  <button key={action} onClick={() => runWorkflowAction(action)} disabled={state.disabled} style={workflowButtonStyle(state)}>
                                    {state.reached ? <CheckCircle size={13} /> : null}
                                    {action === 'binding_offer_sent' ? 'Verbindliches Angebot abgegeben' : 'VA angenommen'}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {canManageOffers && (
                <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${theme.borderSoft}`, display: 'grid', gap: 12 }}>
                  <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Notartermin und Kaufvertrag</div>
                  {(workflowActionState('notary_appointment_ordered').nextAllowed || workflowActionState('notary_appointment_ordered').reached || workflowActionState('contract_signed').nextAllowed) && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 230px) minmax(190px, 270px) auto auto', gap: 9, alignItems: 'center' }}>
                      <input
                        type="datetime-local"
                        value={notaryAppointmentDate || (property?.notaryAppointmentAt ? property.notaryAppointmentAt.slice(0, 16) : '')}
                        onChange={(event) => setNotaryAppointmentDate(event.target.value)}
                        disabled={workflowActionState('notary_appointment_ordered').reached}
                        title="Notartermin"
                        style={{ width: '100%', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '7px 9px', color: theme.ink, fontSize: 12.5, fontFamily: 'inherit', boxSizing: 'border-box' }}
                      />
                      <input
                        type="text"
                        value={notaryOffice || property?.notaryOffice || ''}
                        onChange={(event) => setNotaryOffice(event.target.value)}
                        disabled={workflowActionState('notary_appointment_ordered').reached}
                        placeholder="Notar / Notariat"
                        title="Notar oder Notariat"
                        style={{ width: '100%', border: `1px solid ${theme.border}`, borderRadius: 6, padding: '7px 9px', color: theme.ink, fontSize: 12.5, fontFamily: 'inherit', boxSizing: 'border-box' }}
                      />
                      {['notary_appointment_ordered', 'contract_signed'].map((action) => {
                        const state = workflowActionState(action);
                        return (
                          <button key={action} onClick={() => runWorkflowAction(action)} disabled={state.disabled} style={workflowButtonStyle(state)}>
                            {state.reached ? <CheckCircle size={13} /> : null}
                            {state.step?.label || action}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'grid', gap: 12, height: 'fit-content' }}>
        {activeTab === 'indag' || activeTab === 'verbag' ? (
          <CaseSidePanel
            activities={activities}
            taskRows={taskRows}
            documents={documents}
            onShowTasks={() => changeTab('aufgaben')}
            onShowDocuments={() => changeTab('doks')}
          />
        ) : (
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
        )}
        </div>
      </div>
    </div>
  );
};

// =====================================================================
// SCREEN 4 — ERFASSUNGSBOGEN SCHRITT 1
// =====================================================================
const Erfassung = ({ onBack, onSaved, setNotice, initialCase, role = 'partner', internalRole = 'employee', user }) => {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState('');
  const [draft, setDraft] = useState(() => draftFromCaseView(initialCase));
  const [validation, setValidation] = useState({ fields: [], message: '' });
  const [internalIntakeSource, setInternalIntakeSource] = useState('phone');
  const editMode = Boolean(initialCase?.property?.id);
  const canSubmitCase = !editMode || initialCase?.property?.status === 'DRAFT';
  const isInternalCase = role === 'admin';
  const canNavigateWithIncompleteRequiredFields = role === 'admin' && ['employee', 'advisor', 'admin', 'super_admin'].includes(internalRole);
  const modelLockedForPortfolio = Boolean(editMode && (initialCase?.property?.status === 'IN_PORTFOLIO' || initialCase?.property?.portfolioEnteredAt));
  const steps = [
    { n: 1, label: 'Persönliche Daten' },
    { n: 2, label: 'Wunschmodell' },
    { n: 3, label: 'Immobiliendaten' },
    { n: 4, label: 'Modernisierungen' },
    { n: 5, label: 'Dokumente' },
  ];
  const stepProgressRows = steps.map((item) => {
    const result = validateCaseStep(item.n, draft);
    const total = result.checked.length;
    const missing = result.fields.length;
    return {
      ...item,
      total,
      missing,
      complete: total > 0 && missing === 0,
      missingLabels: result.fields.slice(0, 3).map((field) => validationFieldLabels[field] || field)
    };
  });
  const totalRequiredFields = stepProgressRows.reduce((sum, item) => sum + item.total, 0);
  const missingRequiredFields = stepProgressRows.reduce((sum, item) => sum + item.missing, 0);
  const completedRequiredFields = Math.max(0, totalRequiredFields - missingRequiredFields);
  const progress = totalRequiredFields ? Math.round((completedRequiredFields / totalRequiredFields) * 100) : 0;
  const stepProgress = Math.round((step / steps.length) * 100);
  useEffect(() => {
    setDraft(draftFromCaseView(initialCase));
    setValidation({ fields: [], message: '' });
    setStep(1);
  }, [initialCase?.property?.id]);

  function goToStep(nextStep) {
    if (nextStep <= step) {
      setValidation({ fields: [], message: '' });
      setStep(nextStep);
      return;
    }
    for (let currentStep = step; currentStep < nextStep; currentStep += 1) {
      const result = validateForNavigation(currentStep, draft, { allowIncomplete: canNavigateWithIncompleteRequiredFields });
      if (!result.valid) {
        setValidation({ fields: result.fields, message: result.message });
        setStep(currentStep);
        setNotice?.(result.message);
        return;
      }
    }
    setValidation({ fields: [], message: '' });
    setStep(nextStep);
  }
  async function saveCase(submit = false) {
    if (draft.leasehold || draft.monumentProtection) {
      setNotice?.('Erbbaurecht oder Denkmalschutz ist ein Ausschlusskriterium. Der Fall kann so nicht eingereicht werden.');
      return;
    }
    if (submit) {
      const result = validateForSubmit(draft);
      if (!result.valid) {
        setValidation({ fields: result.fields, message: result.message });
        setStep(result.step);
        setNotice?.(result.message);
        return;
      }
    } else {
      const result = validateForDraftSave(draft, { allowIncomplete: canNavigateWithIncompleteRequiredFields });
      if (!result.valid) {
        setValidation({ fields: result.fields, message: result.message });
        setNotice?.(result.message);
        return;
      }
    }
    setValidation({ fields: [], message: '' });
    setSaving(submit ? 'submit' : 'draft');
    try {
      const incompleteDraftSave = !submit && canNavigateWithIncompleteRequiredFields;
      const payloadPropertyType = draft.propertyType || (incompleteDraftSave ? 'single_family' : '');
      const payloadDesiredModel = modelLockedForPortfolio
        ? (initialCase?.property?.desiredModel || 'fixed_residential_right')
        : draft.desiredModel || (incompleteDraftSave ? 'fixed_residential_right' : '');
      const payloadStreet = draft.street || (incompleteDraftSave ? 'Noch offen' : '');
      const payloadPostalCode = draft.postalCode || (incompleteDraftSave ? '00000' : '');
      const payloadCity = draft.city || (incompleteDraftSave ? 'Ort offen' : '');
      const payloadLivingAreaSqm = Number(draft.livingAreaSqm) || (incompleteDraftSave ? 1 : 0);
      const payloadPlotAreaSqm = Number(draft.plotAreaSqm) || 0;
      const customerPayload = {
        partnerId: isInternalCase ? undefined : 'partner_heimwert',
        assignedAdvisorUserId: isInternalCase ? user?.id : undefined,
        title: draft.title,
        firstName: draft.firstName || (incompleteDraftSave ? 'Entwurf' : ''),
        lastName: draft.lastName || (incompleteDraftSave ? 'Neukunde' : ''),
        displayName: [draft.title, draft.firstName || (incompleteDraftSave ? 'Entwurf' : ''), draft.lastName || (incompleteDraftSave ? 'Neukunde' : '')].filter(Boolean).join(' '),
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
        street: draft.street || undefined,
        postalCode: draft.postalCode || undefined,
        city: draft.city || undefined,
        addressText: [draft.street, [draft.postalCode, draft.city].filter(Boolean).join(' ')].filter(Boolean).join(', '),
        consentDataProcessing: Boolean(draft.consentDataProcessing),
      };
      const customerResult = editMode
        ? await patchJson(`/api/customers/${initialCase.customer.id}`, customerPayload)
        : await postJson('/api/customers', customerPayload);
      const propertyPayload = {
        customerId: customerResult.customer.id,
        caseSource: isInternalCase ? 'INTERNAL' : 'PARTNER',
        objectTitle: `${propertyTypeLabel(payloadPropertyType)} ${payloadCity}`.trim(),
        propertyType: payloadPropertyType,
        street: payloadStreet,
        postalCode: payloadPostalCode,
        city: payloadCity,
        livingAreaSqm: payloadLivingAreaSqm,
        plotAreaSqm: payloadPlotAreaSqm,
        yearBuilt: Number(draft.yearBuilt) || undefined,
        condition: draft.condition || 'average',
        desiredModel: payloadDesiredModel,
        residentialRightRecipients: payloadDesiredModel === 'fixed_residential_right' ? (draft.residentialRightRecipients || 'one_person') : undefined,
        residentialRightPerson: payloadDesiredModel === 'fixed_residential_right' && draft.residentialRightRecipients === 'one_person' ? draft.residentialRightPerson || undefined : undefined,
        desiredResidentialRightYears: payloadDesiredModel === 'fixed_residential_right' ? Number(draft.desiredResidentialRightYears) || undefined : undefined,
        rentalModelDisclosureAccepted: Boolean(draft.rentalModelDisclosureAccepted),
        additionalOfferRequested: Boolean(draft.additionalOfferRequested),
        additionalOfferModel: draft.additionalOfferRequested ? draft.additionalOfferModel : undefined,
        additionalOfferResidentialRightRecipients: draft.additionalOfferRequested ? draft.additionalOfferResidentialRightRecipients || undefined : undefined,
        additionalOfferResidentialRightPerson: draft.additionalOfferRequested && draft.additionalOfferResidentialRightRecipients === 'one_person' ? draft.additionalOfferResidentialRightPerson || undefined : undefined,
        additionalOfferResidentialRightYears: draft.additionalOfferRequested ? Number(draft.additionalOfferResidentialRightYears) || undefined : undefined,
        additionalOfferReason: draft.additionalOfferRequested ? draft.additionalOfferReason : undefined,
        additionalOfferRentalModelDisclosureAccepted: draft.additionalOfferRequested ? Boolean(draft.additionalOfferRentalModelDisclosureAccepted) : false,
        secondResidentialRightWanted: false,
        secondResidentialRightYears: undefined,
        fixedTermReason: draft.fixedTermReason,
        rentalOptionDeselected: false,
        usableAreaSqm: Number(draft.usableAreaSqm) || undefined,
        coOwnershipShares: payloadPropertyType === 'apartment' ? draft.coOwnershipShares || undefined : undefined,
        hasElevator: payloadPropertyType === 'apartment' && (draft.hasElevator === true || draft.hasElevator === false) ? draft.hasElevator : undefined,
        parkingAvailable: Boolean(draft.parkingType && draft.parkingType !== 'none'),
        parkingType: draft.parkingType && draft.parkingType !== 'none' ? draft.parkingType || undefined : undefined,
        parkingCount: draft.parkingType && draft.parkingType !== 'none' ? Number(draft.parkingCount) || undefined : undefined,
        basementType: draft.basementType || undefined,
        heatingType: draft.heatingType,
        heatingEnergySource: draft.heatingEnergySource,
        heatingEnergySourceOther: draft.heatingEnergySource === 'other' ? draft.heatingEnergySourceOther : undefined,
        heatingYear: Number(draft.heatingYear) || undefined,
        energyCarriers: draft.energyCarriers,
        windowMaterial: draft.windowMaterial,
        windowInstallationYear: Number(draft.windowInstallationYear) || undefined,
        asbestosRoofKnown: draft.asbestosRoofKnown === 'yes',
        energyCertificateAvailable: draft.energyCertificateAvailable === true,
        energyCertificateType: draft.energyCertificateAvailable ? draft.energyCertificateType : undefined,
        energyClass: draft.energyCertificateAvailable ? draft.energyClass : undefined,
        visualConditionRating: draft.visualConditionRating,
        leasehold: Boolean(draft.leasehold),
        monumentProtection: Boolean(draft.monumentProtection),
        leaseholdOrMonument: Boolean(draft.leasehold || draft.monumentProtection),
        knownDefects: draft.knownDefects,
        knownMajorMaintenanceOrSpecialAssessments: draft.knownMajorMaintenanceOrSpecialAssessments === true,
        knownMajorMaintenanceOrSpecialAssessmentsDescription: draft.knownMajorMaintenanceOrSpecialAssessments === true ? draft.knownMajorMaintenanceOrSpecialAssessmentsDescription : undefined,
        moistureDamageStatus: draft.moistureDamageStatus,
        moistureDamageDescription: draft.moistureDamageStatus === 'MINOR' || draft.moistureDamageStatus === 'SIGNIFICANT' ? draft.moistureDamageDescription : undefined,
        accessibilityAssessment: draft.accessibilityAssessment,
        remainingDebtKnown: draft.remainingDebtKnown === true,
        remainingDebtAmount: draft.remainingDebtKnown ? Number(draft.remainingDebtAmount) || undefined : undefined,
        modernization: draft.modernization,
        buildingCondition: draft.buildingCondition,
        generalPropertyNotes: draft.generalPropertyNotes,
        notes: isInternalCase ? `Direkterfassung intern · Quelle: ${labelFrom(internalIntakeSourceLabels, internalIntakeSource)}` : undefined,
      };
      const propertyResult = editMode
        ? await patchJson(`/api/properties/${initialCase.property.id}`, propertyPayload)
        : await postJson('/api/properties', propertyPayload);
      const documentUploads = Object.entries(draft.documentUploads || {});
      if (documentUploads.length) {
        for (const [category, files] of documentUploads) {
          for (const file of files || []) {
            const documentForm = new FormData();
            documentForm.append('file', file);
            documentForm.append('category', category);
            const isRequired = getRequiredDocumentsForPropertyType(draft.propertyType).some((item) => item.category === category)
              || (category === 'power_of_attorney' && !hasUploadedDocument(draft, 'land_register'));
            documentForm.append('requirementLevel', isRequired ? 'required' : 'optional');
            documentForm.append('status', 'pending');
            await postFormData(`/api/properties/${propertyResult.property.id}/documents`, documentForm);
          }
        }
      }
      if (submit) {
        await postJson(`/api/properties/${propertyResult.property.id}/submit`);
      }
      setNotice?.(submit ? 'Fall wurde gespeichert und eingereicht.' : editMode ? 'Entwurf wurde aktualisiert.' : 'Entwurf wurde angelegt.');
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
          <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{editMode ? `${initialCase.property.caseNumber || 'Entwurf'} · Entwurf bearbeiten` : isInternalCase ? 'Neuer interner Fall · Entwurf' : 'Neuer Fall · Entwurf'}</div>
          <div style={{ fontSize: 17, fontWeight: 600, color: theme.ink, marginTop: 2 }}>{editMode ? 'Erfassung ergänzen' : isInternalCase ? 'Direktberatung erfassen' : 'Erfassung'}</div>
        </div>
        <button onClick={() => saveCase(false)} disabled={Boolean(saving)} style={{ background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine, fontSize: 12.5, fontWeight: 600, padding: '8px 14px', borderRadius: 5, cursor: saving ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Save size={13} /> {saving === 'draft' ? 'Speichert...' : editMode ? 'Änderungen speichern' : 'Entwurf speichern'}
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
                <button onClick={() => goToStep(s.n)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
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
          {isInternalCase && !editMode && (
            <div style={{ background: theme.mintLight, border: `1px solid ${theme.borderSoft}`, borderLeft: `4px solid ${theme.aubergine}`, borderRadius: 8, padding: '12px 14px', marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Interne Direkterfassung</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 14, alignItems: 'end' }}>
                <Field label="Kontaktquelle">
                  <Select value={internalIntakeSource} onChange={(event) => setInternalIntakeSource(event.target.value)}>
                    {Object.entries(internalIntakeSourceLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </Select>
                </Field>
                <div style={{ fontSize: 12.5, color: `${theme.ink}99`, lineHeight: 1.45 }}>
                  Für Kunden aus Telefonaten, Empfehlungen oder Offline-Anzeigen wird kein Vertriebspartner hinterlegt. Der Fall bleibt intern und kann direkt beraten und kalkuliert werden.
                </div>
              </div>
            </div>
          )}
          {validation.message && (
            <div style={{ background: '#fff7f5', border: '1px solid #efc0b9', borderLeft: '4px solid #9B2C2C', borderRadius: 8, padding: '11px 13px', marginBottom: 18, fontSize: 12.5, color: '#7A1D1D', fontWeight: 650 }}>
              {validation.message}
            </div>
          )}
          {step === 1 && <FormStep1 draft={draft} setDraft={setDraft} errors={validation.fields} />}
          {step === 2 && <FormStep2 draft={draft} setDraft={setDraft} errors={validation.fields} modelLocked={modelLockedForPortfolio} />}
          {step === 3 && <FormStep3 draft={draft} setDraft={setDraft} errors={validation.fields} />}
          {step === 4 && <FormStep4 draft={draft} setDraft={setDraft} errors={validation.fields} />}
          {step === 5 && <FormStep5 draft={draft} setDraft={setDraft} errors={validation.fields} />}

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
                {saving === 'draft' ? 'Speichert...' : editMode ? 'Änderungen speichern' : 'Entwurf speichern'}
              </button>
              {step < 5 ? (
                <button onClick={() => goToStep(Math.min(5, step + 1))} style={{ background: theme.aubergine, color: 'white', border: 'none', fontSize: 13, fontWeight: 600, padding: '9px 18px', borderRadius: 5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Weiter <ChevronRight size={15} />
                </button>
              ) : canSubmitCase ? (
                <button onClick={() => saveCase(true)} disabled={Boolean(saving)} style={{ background: theme.aubergine, color: 'white', border: 'none', fontSize: 13, fontWeight: 600, padding: '9px 18px', borderRadius: 5, cursor: saving ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Send size={13} /> {saving === 'submit' ? 'Reicht ein...' : 'Einreichen'}
                </button>
              ) : (
                <button onClick={() => saveCase(false)} disabled={Boolean(saving)} style={{ background: theme.aubergine, color: 'white', border: 'none', fontSize: 13, fontWeight: 600, padding: '9px 18px', borderRadius: 5, cursor: saving ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Save size={13} /> {saving === 'draft' ? 'Speichert...' : 'Änderungen speichern'}
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
              <span style={{ fontSize: 12, color: `${theme.ink}88` }}>Pflichtfelder</span>
            </div>
            <div style={{ height: 6, background: theme.borderSoft, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: theme.aubergine, borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 11.5, color: `${theme.ink}88`, marginTop: 8, lineHeight: 1.4 }}>
              {completedRequiredFields} von {totalRequiredFields} relevanten Pflichtpunkten erledigt · Schritt {step} von 5 ({stepProgress}%)
            </div>
            <div style={{ display: 'grid', gap: 8, marginTop: 14 }}>
              {stepProgressRows.map((item) => (
                <button
                  key={item.n}
                  type="button"
                  onClick={() => goToStep(item.n)}
                  style={{
                    textAlign: 'left',
                    background: item.n === step ? `${theme.aubergine}0A` : item.complete ? theme.mintLighter : 'white',
                    border: `1px solid ${item.n === step ? `${theme.aubergine}44` : item.complete ? `${theme.oliv}33` : theme.borderSoft}`,
                    borderRadius: 7,
                    padding: '9px 10px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 12.5, color: item.n === step ? theme.aubergine : theme.ink, fontWeight: 800 }}>{item.label}</span>
                    <span style={{
                      fontSize: 10.5,
                      fontWeight: 800,
                      color: item.complete ? '#3D6B1F' : item.missing ? '#9B2C2C' : `${theme.ink}88`,
                      background: item.complete ? '#3D6B1F14' : item.missing ? '#9B2C2C12' : theme.mintLight,
                      borderRadius: 999,
                      padding: '2px 7px',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.complete ? 'vollständig' : `${item.missing} offen`}
                    </span>
                  </div>
                  {!item.complete && item.missingLabels.length ? (
                    <div style={{ fontSize: 11, color: `${theme.ink}88`, marginTop: 5, lineHeight: 1.35 }}>
                      {item.missingLabels.join(' · ')}{item.missing > item.missingLabels.length ? ` · +${item.missing - item.missingLabels.length}` : ''}
                    </div>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Form-Felder als wiederverwendbare Komponenten
const Field = ({ label, required, children, hint, width = '100%', invalid = false }) => (
  <div style={{ width, border: invalid ? '1px solid #9B2C2C55' : 'none', background: invalid ? '#9B2C2C08' : 'transparent', borderRadius: 6, padding: invalid ? 7 : 0, boxSizing: 'border-box' }}>
    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: theme.ink, marginBottom: 6, letterSpacing: '0.01em' }}>
      {label}{required && <span style={{ color: theme.gold, marginLeft: 2 }}>*</span>}
    </label>
    {children}
    {hint && <div style={{ fontSize: 11, color: `${theme.ink}88`, marginTop: 4 }}>{hint}</div>}
    {invalid && <div style={{ fontSize: 11, color: '#9B2C2C', fontWeight: 700, marginTop: 5 }}>Bitte ausfüllen.</div>}
  </div>
);
const Input = ({ placeholder, defaultValue, type = 'text', value, onChange, checked, readOnly, disabled, inputRef, inputMode }) => (
  <input ref={inputRef} type={type} placeholder={placeholder} defaultValue={defaultValue} value={value} onChange={onChange} onInput={onChange} checked={checked} readOnly={readOnly} disabled={disabled} inputMode={inputMode} style={{
    width: '100%', padding: '8px 12px', fontSize: 13.5, border: `1px solid ${theme.border}`,
    borderRadius: 5, background: readOnly || disabled ? theme.mintLighter : 'white', color: theme.ink, outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box', cursor: disabled ? 'not-allowed' : 'text'
  }} />
);
const Select = ({ children, defaultValue, value, onChange, disabled = false }) => (
  <div style={{ position: 'relative' }}>
    <select defaultValue={defaultValue} value={value} onChange={onChange} disabled={disabled} style={{
      width: '100%', padding: '8px 32px 8px 12px', fontSize: 13.5, border: `1px solid ${theme.border}`,
      borderRadius: 5, background: disabled ? theme.mintLighter : 'white', color: theme.ink, outline: 'none', fontFamily: 'inherit',
      appearance: 'none', cursor: disabled ? 'not-allowed' : 'pointer'
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

const FormStep1 = ({ draft, setDraft, errors = [] }) => (
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
      <Field label="Vorname" required invalid={errors.includes('firstName')}><Input placeholder="Vorname" value={draft.firstName} onChange={(event) => setDraft({ ...draft, firstName: event.target.value })} /></Field>
      <Field label="Nachname" required invalid={errors.includes('lastName')}><Input placeholder="Nachname" value={draft.lastName} onChange={(event) => setDraft({ ...draft, lastName: event.target.value })} /></Field>
      <Field label="Geschlecht" required invalid={errors.includes('gender')}>
        <Select value={draft.gender} onChange={(event) => setDraft({ ...draft, gender: event.target.value })}>
          <option value="">Bitte wählen</option>
          <option value="female">weiblich</option>
          <option value="male">männlich</option>
          <option value="diverse">divers</option>
        </Select>
      </Field>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
      <Field label="Geburtsdatum" required invalid={errors.includes('dateOfBirth')}><Input type="date" value={draft.dateOfBirth} onChange={(event) => setDraft({ ...draft, dateOfBirth: event.target.value, ageAtSubmission: calculateAgeFromBirthDate(event.target.value) })} /></Field>
      <Field label="Alter">
        <Input placeholder="wird berechnet" value={draft.ageAtSubmission} readOnly />
      </Field>
      <Field label="Familienstand" required invalid={errors.includes('maritalStatus')}>
        <Select value={draft.maritalStatus} onChange={(event) => setDraft({
          ...draft,
          maritalStatus: event.target.value,
          propertyOwnership: event.target.value === 'married' ? draft.propertyOwnership : 'customer_1',
          residentialRightRecipients: event.target.value === 'married' ? draft.residentialRightRecipients : (draft.residentialRightRecipients === 'both' ? 'one_person' : draft.residentialRightRecipients),
          residentialRightPerson: event.target.value === 'married' ? draft.residentialRightPerson : '',
          additionalOfferResidentialRightRecipients: event.target.value === 'married' ? draft.additionalOfferResidentialRightRecipients : (draft.additionalOfferResidentialRightRecipients === 'both' ? 'one_person' : draft.additionalOfferResidentialRightRecipients),
          additionalOfferResidentialRightPerson: event.target.value === 'married' ? draft.additionalOfferResidentialRightPerson : '',
        })}>
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
          <Field label="Vorname Kunde 2" required invalid={errors.includes('spouseFirstName')}><Input value={draft.spouseFirstName} onChange={(event) => setDraft({ ...draft, spouseFirstName: event.target.value })} /></Field>
          <Field label="Nachname Kunde 2" required invalid={errors.includes('spouseLastName')}><Input value={draft.spouseLastName} onChange={(event) => setDraft({ ...draft, spouseLastName: event.target.value })} /></Field>
          <Field label="Geschlecht Kunde 2" required invalid={errors.includes('spouseGender')}>
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
          <Field label="Geburtsdatum Kunde 2" required invalid={errors.includes('spouseDateOfBirth')}><Input type="date" value={draft.spouseDateOfBirth} onChange={(event) => setDraft({ ...draft, spouseDateOfBirth: event.target.value, spouseAgeAtSubmission: calculateAgeFromBirthDate(event.target.value) })} /></Field>
          <Field label="Alter Kunde 2"><Input placeholder="wird berechnet" value={draft.spouseAgeAtSubmission} readOnly /></Field>
          <Field label="Eigentümer-Auswahl" required invalid={errors.includes('propertyOwnership')}>
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
      <Field label="Straße" required invalid={errors.includes('street')}><Input placeholder="Straße und Hausnr." value={draft.street} onChange={(event) => setDraft({ ...draft, street: event.target.value })} /></Field>
      <Field label="PLZ" required invalid={errors.includes('postalCode')}><Input placeholder="PLZ" value={draft.postalCode} onChange={(event) => setDraft({ ...draft, postalCode: event.target.value })} /></Field>
      <Field label="Ort" required invalid={errors.includes('city')}><Input placeholder="Ort" value={draft.city} onChange={(event) => setDraft({ ...draft, city: event.target.value })} /></Field>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: 16, marginBottom: 16 }}>
      <Field label="Telefon" required invalid={errors.includes('phone')}><Input placeholder="z.B. 0711 / 23 45 67" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} /></Field>
      <Field label="Mobil"><Input placeholder="z.B. 0172 / 12 34 567" value={draft.mobile} onChange={(event) => setDraft({ ...draft, mobile: event.target.value })} /></Field>
      <Field label="E-Mail" required invalid={errors.includes('email')}><Input type="email" placeholder="adresse@example.com" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></Field>
    </div>

    <div style={{ marginBottom: 20 }}>
      <Field label="Monatliche Einkünfte" required invalid={errors.includes('monthlyIncomeRange')}>
        <RadioGroup name="income" value={draft.monthlyIncomeRange} onChange={(value) => setDraft({ ...draft, monthlyIncomeRange: value })} options={[
          { value: 'under_1000', label: 'unter 1.000 €' },
          { value: 'from_1000_to_2000', label: '1.000 – 2.000 €' },
          { value: 'from_2000_to_3000', label: '2.000 – 3.000 €' },
          { value: 'over_3000', label: 'über 3.000 €' },
        ]} />
      </Field>
    </div>

    <div style={{ background: errors.includes('consentDataProcessing') ? '#fff7f5' : theme.mintLight, border: `1px solid ${errors.includes('consentDataProcessing') ? '#efc0b9' : 'transparent'}`, borderRadius: 6, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <input type="checkbox" checked={Boolean(draft.consentDataProcessing)} onChange={(event) => setDraft({ ...draft, consentDataProcessing: event.target.checked })} style={{ marginTop: 2, accentColor: theme.aubergine }} />
      <div>
        <div style={{ fontSize: 12.5, color: theme.ink, fontWeight: 500 }}>Einwilligung zur Datenverarbeitung <span style={{ color: theme.gold }}>*</span></div>
        <div style={{ fontSize: 11.5, color: `${theme.ink}99`, marginTop: 3, lineHeight: 1.5 }}>Der Kunde willigt ein, dass seine Daten zum Zweck der Angebotserstellung verarbeitet und an WohnKapital übermittelt werden.</div>
      </div>
    </div>
  </div>
);

const FormStep2 = ({ draft, setDraft, errors = [], modelLocked = false }) => (
  <div>
    <h2 style={{ fontSize: 18, fontWeight: 600, color: theme.aubergine, margin: '0 0 4px' }}>Wunschmodell</h2>
    <div style={{ fontSize: 12.5, color: `${theme.ink}99`, marginBottom: 22 }}>Bitte wähle zunächst das gewünschte Hauptmodell. Danach erscheinen nur die passenden Felder.</div>
    {modelLocked && (
      <div style={{ background: theme.goldSoft, border: `1px solid ${theme.gold}55`, borderRadius: 8, padding: '10px 12px', fontSize: 12.5, color: theme.ink, lineHeight: 1.45, marginBottom: 14 }}>
        Das Modell kann bei Bestandskunden nicht mehr geändert werden.
      </div>
    )}

    <Field label="Hauptmodell" required invalid={errors.includes('desiredModel')}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
        {[
          { value: 'fixed_residential_right', title: 'Wohnrecht', text: 'Kunde verkauft und behält ein vertraglich geregeltes Wohnrecht.' },
          { value: 'sale_and_leaseback', title: 'Rückmietverkauf', text: 'Kunde verkauft und bleibt anschließend als Mieter/Bewohner im Objekt.' },
        ].map((option) => {
          const active = draft.desiredModel === option.value;
          return (
            <button key={option.value} type="button" disabled={modelLocked} onClick={() => {
              if (modelLocked) return;
              setDraft({
              ...draft,
              desiredModel: option.value,
              desiredResidentialRightYears: option.value === 'fixed_residential_right' ? (draft.desiredResidentialRightYears || 10) : '',
              residentialRightRecipients: option.value === 'fixed_residential_right' ? (draft.residentialRightRecipients || 'one_person') : '',
              residentialRightPerson: option.value === 'fixed_residential_right' ? draft.residentialRightPerson : '',
              fixedTermReason: option.value === 'fixed_residential_right' ? draft.fixedTermReason : '',
              rentalModelDisclosureAccepted: option.value === 'sale_and_leaseback' ? draft.rentalModelDisclosureAccepted : false,
            });
            }} style={{
              textAlign: 'left',
              border: `1px solid ${active ? theme.aubergine : theme.border}`,
              background: modelLocked ? theme.mintLighter : active ? `${theme.aubergine}0A` : 'white',
              borderRadius: 8,
              padding: '14px 16px',
              cursor: modelLocked ? 'not-allowed' : 'pointer',
              color: theme.ink,
              opacity: modelLocked && !active ? 0.55 : 1
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: active ? theme.aubergine : theme.ink, marginBottom: 5 }}>{option.title}</div>
              <div style={{ fontSize: 12.5, lineHeight: 1.45, color: `${theme.ink}99` }}>{option.text}</div>
            </button>
          );
        })}
      </div>
    </Field>

    {!draft.desiredModel && (
      <div style={{ background: theme.mintLight, borderRadius: 6, padding: '12px 14px', fontSize: 12.5, color: `${theme.ink}99`, marginBottom: 18 }}>
        Bitte wähle ein Modell, damit die passenden Angaben geöffnet werden.
      </div>
    )}

    {draft.desiredModel === 'sale_and_leaseback' && (
      <div style={{ background: theme.goldSoft, border: `1px solid ${errors.includes('rentalModelDisclosureAccepted') ? '#9B2C2C66' : `${theme.gold}66`}`, borderLeft: `4px solid ${errors.includes('rentalModelDisclosureAccepted') ? '#9B2C2C' : theme.gold}`, borderRadius: 8, padding: '13px 15px', marginBottom: 18 }}>
        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', color: theme.ink, fontSize: 12.5, lineHeight: 1.45 }}>
          <input type="checkbox" checked={draft.rentalModelDisclosureAccepted} onChange={(event) => setDraft({ ...draft, rentalModelDisclosureAccepted: event.target.checked })} style={{ marginTop: 2, accentColor: theme.aubergine }} />
          <span><strong>Belehrung Rückmietverkauf:</strong> Beim Rückmietverkauf fällt ab Tag 1 nach Verkauf eine laufende Miete an. Diese Information muss vor Einreichung mit dem Kunden besprochen werden.</span>
        </label>
      </div>
    )}

    {draft.desiredModel === 'fixed_residential_right' && (
      <div style={{ background: theme.mintLighter, border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '16px 18px', marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Wohnrecht</div>
    <div style={{ marginBottom: 18 }}>
      <Field label="Wer soll das Wohnrecht bekommen?" required invalid={errors.includes('residentialRightRecipients')}>
        <RadioGroup name="recipient" value={draft.residentialRightRecipients} onChange={(value) => setDraft({ ...draft, residentialRightRecipients: value, residentialRightPerson: value === 'one_person' ? draft.residentialRightPerson : '' })} options={[
          { value: 'one_person', label: 'Eine Person' },
          ...(draft.maritalStatus === 'married' ? [{ value: 'both', label: 'Beide Personen' }] : []),
        ]} />
      </Field>
    </div>

    {draft.maritalStatus === 'married' && draft.residentialRightRecipients === 'one_person' && (
      <div style={{ marginBottom: 18 }}>
        <Field label="Welche Person erhält das Wohnrecht?" required invalid={errors.includes('residentialRightPerson')}>
          <Select value={draft.residentialRightPerson} onChange={(event) => setDraft({ ...draft, residentialRightPerson: event.target.value })}>
            <option value="">Bitte wählen</option>
            <option value="customer_1">{customerOneName(draft)}</option>
            <option value="customer_2">{customerTwoName(draft)}</option>
          </Select>
        </Field>
      </div>
    )}

    <div style={{ marginBottom: 18 }}>
      <Field label="Dauer des Wohnrechts" required hint="Zwischen 5 und 15 Jahren wählbar." invalid={errors.includes('desiredResidentialRightYears')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input type="range" min="5" max="15" value={draft.desiredResidentialRightYears || 10} onChange={(event) => setDraft({ ...draft, desiredResidentialRightYears: Number(event.target.value) })} style={{ flex: 1, accentColor: theme.aubergine }} />
          <div style={{ minWidth: 80, padding: '6px 12px', background: theme.aubergine, color: 'white', borderRadius: 5, fontSize: 13, fontWeight: 600, textAlign: 'center' }}>{draft.desiredResidentialRightYears || 10} Jahre</div>
        </div>
      </Field>
    </div>

        <Field label="Grund der Befristung" required invalid={errors.includes('fixedTermReason')}>
          <Input placeholder="z.B. Familienplanung, gesundheitliche Gründe" value={draft.fixedTermReason} onChange={(event) => setDraft({ ...draft, fixedTermReason: event.target.value })} />
        </Field>
      </div>
    )}

    <div style={{ background: 'white', border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '14px 16px' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: theme.ink, fontWeight: 700 }}>
        <input type="checkbox" checked={draft.additionalOfferRequested} disabled={modelLocked} onChange={(event) => setDraft({ ...draft, additionalOfferRequested: event.target.checked })} style={{ accentColor: theme.aubergine }} />
        Zweites Angebot zusätzlich erstellen
      </label>
      {draft.additionalOfferRequested && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 16, marginTop: 14 }}>
          <Field label="Zweites Modell" required invalid={errors.includes('additionalOfferModel')}>
            <Select value={draft.additionalOfferModel} disabled={modelLocked} onChange={(event) => setDraft({
              ...draft,
              additionalOfferModel: event.target.value,
              additionalOfferResidentialRightRecipients: event.target.value === 'fixed_residential_right' ? (draft.additionalOfferResidentialRightRecipients || 'one_person') : '',
              additionalOfferResidentialRightPerson: event.target.value === 'fixed_residential_right' ? draft.additionalOfferResidentialRightPerson : '',
              additionalOfferRentalModelDisclosureAccepted: event.target.value === 'sale_and_leaseback' ? draft.additionalOfferRentalModelDisclosureAccepted : false,
            })}>
              <option value="">Bitte wählen</option>
              <option value="fixed_residential_right">Wohnrecht</option>
              <option value="sale_and_leaseback">Rückmietverkauf</option>
            </Select>
          </Field>
          {draft.additionalOfferModel === 'fixed_residential_right' && (
            <>
              <Field label="Wer soll das Wohnrecht bekommen?" required invalid={errors.includes('additionalOfferResidentialRightRecipients')}>
                <RadioGroup name="additionalRecipient" value={draft.additionalOfferResidentialRightRecipients} onChange={(value) => setDraft({ ...draft, additionalOfferResidentialRightRecipients: value, additionalOfferResidentialRightPerson: value === 'one_person' ? draft.additionalOfferResidentialRightPerson : '' })} options={[
                  { value: 'one_person', label: 'Eine Person' },
                  ...(draft.maritalStatus === 'married' ? [{ value: 'both', label: 'Beide Personen' }] : []),
                ]} />
              </Field>
              <Field label="Laufzeit" required invalid={errors.includes('additionalOfferResidentialRightYears')}>
                <Select value={String(draft.additionalOfferResidentialRightYears || 10)} onChange={(event) => setDraft({ ...draft, additionalOfferResidentialRightYears: Number(event.target.value) })}>
                  <option value="5">5 Jahre</option>
                  <option value="10">10 Jahre</option>
                  <option value="15">15 Jahre</option>
                </Select>
              </Field>
            </>
          )}
          {draft.additionalOfferModel === 'fixed_residential_right' && draft.maritalStatus === 'married' && draft.additionalOfferResidentialRightRecipients === 'one_person' && (
            <Field label="Welche Person erhält das Wohnrecht?" required invalid={errors.includes('additionalOfferResidentialRightPerson')}>
              <Select value={draft.additionalOfferResidentialRightPerson} onChange={(event) => setDraft({ ...draft, additionalOfferResidentialRightPerson: event.target.value })}>
                <option value="">Bitte wählen</option>
                <option value="customer_1">{customerOneName(draft)}</option>
                <option value="customer_2">{customerTwoName(draft)}</option>
              </Select>
            </Field>
          )}
          {draft.additionalOfferModel === 'sale_and_leaseback' && (
            <div style={{ gridColumn: '1 / -1', background: theme.goldSoft, border: `1px solid ${errors.includes('additionalOfferRentalModelDisclosureAccepted') ? '#9B2C2C66' : `${theme.gold}66`}`, borderLeft: `4px solid ${errors.includes('additionalOfferRentalModelDisclosureAccepted') ? '#9B2C2C' : theme.gold}`, borderRadius: 8, padding: '12px 14px' }}>
              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', color: theme.ink, fontSize: 12.5, lineHeight: 1.45 }}>
                <input type="checkbox" checked={draft.additionalOfferRentalModelDisclosureAccepted} onChange={(event) => setDraft({ ...draft, additionalOfferRentalModelDisclosureAccepted: event.target.checked })} style={{ marginTop: 2, accentColor: theme.aubergine }} />
                <span><strong>Belehrung Rückmietverkauf:</strong> Beim Rückmietverkauf fällt ab Tag 1 nach Verkauf eine laufende Miete an.</span>
              </label>
            </div>
          )}
          <Field label={draft.additionalOfferModel === 'fixed_residential_right' ? 'Grund / Hinweis' : 'Hinweis zum zweiten Angebot'} required={draft.additionalOfferModel === 'fixed_residential_right'} invalid={errors.includes('additionalOfferReason')}>
            <Input value={draft.additionalOfferReason} onChange={(event) => setDraft({ ...draft, additionalOfferReason: event.target.value })} placeholder="z.B. Vergleich für Kundengespräch" />
          </Field>
        </div>
      )}
    </div>
  </div>
);

const FormStep3 = ({ draft, setDraft, errors = [] }) => (
  <div>
    <h2 style={{ fontSize: 18, fontWeight: 600, color: theme.aubergine, margin: '0 0 4px' }}>Immobiliendaten</h2>
    <div style={{ fontSize: 12.5, color: `${theme.ink}99`, marginBottom: 22 }}>Erfasse die wesentlichen Eigenschaften der Immobilie.</div>

    <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Grunddaten</div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
      <Field label="Immobilientyp" required invalid={errors.includes('propertyType')}>
        <Select value={draft.propertyType} onChange={(event) => setDraft({ ...draft, propertyType: event.target.value, hasElevator: event.target.value === 'apartment' ? draft.hasElevator : '' })}><option value="">Bitte wählen</option><option value="single_family">Einfamilienhaus</option><option value="semi_detached">Doppelhaushälfte</option><option value="row_house">Reihenhaus</option><option value="apartment">Eigentumswohnung</option></Select>
      </Field>
      <Field label="Baujahr" required invalid={errors.includes('yearBuilt')}><Input type="number" placeholder="z.B. 1978" value={draft.yearBuilt} onChange={(event) => setDraft({ ...draft, yearBuilt: event.target.value })} /></Field>
      <Field label="Wohnfläche (m²)" required invalid={errors.includes('livingAreaSqm')}><Input type="number" placeholder="142" value={draft.livingAreaSqm} onChange={(event) => setDraft({ ...draft, livingAreaSqm: event.target.value })} /></Field>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: draft.propertyType === 'apartment' ? '1fr 1fr 1fr 1fr' : '1fr 1fr', gap: 16, marginBottom: 16 }}>
      <Field label="Grundstück (m²)" required invalid={errors.includes('plotAreaSqm')}><Input type="number" placeholder="380" value={draft.plotAreaSqm} onChange={(event) => setDraft({ ...draft, plotAreaSqm: event.target.value })} /></Field>
      <Field label="Nutzfläche (m²)" invalid={errors.includes('usableAreaSqm')}><Input type="number" value={draft.usableAreaSqm} onChange={(event) => setDraft({ ...draft, usableAreaSqm: event.target.value })} /></Field>
      {draft.propertyType === 'apartment' && (
        <>
          <Field label="Miteigentumsanteile" required hint="Nur bei Eigentumswohnungen" invalid={errors.includes('coOwnershipShares')}><Input placeholder="z.B. 124/1000" value={draft.coOwnershipShares} onChange={(event) => setDraft({ ...draft, coOwnershipShares: event.target.value })} /></Field>
          <Field label="Aufzug vorhanden" required invalid={errors.includes('hasElevator')}>
            <RadioGroup name="hasElevator" value={draft.hasElevator === true ? 'yes' : draft.hasElevator === false ? 'no' : ''} onChange={(value) => setDraft({ ...draft, hasElevator: value === 'yes' })} options={[
              { value: 'yes', label: 'Ja' },
              { value: 'no', label: 'Nein' },
            ]} />
          </Field>
        </>
      )}
    </div>

    <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Objekteindruck</div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 16 }}>
      <Field label="Optik" required invalid={errors.includes('visualConditionRating')}>
        <Select value={draft.visualConditionRating} onChange={(event) => setDraft({ ...draft, visualConditionRating: event.target.value })}>
          <option value="">Bitte wählen</option>
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
      <Field label="Heizungsart" required invalid={errors.includes('heatingType')}>
        <Select value={draft.heatingType} onChange={(event) => setDraft({ ...draft, heatingType: event.target.value })}>
          <option value="">Bitte wählen</option>
          <option value="central">Zentralheizung</option>
          <option value="floor">Etagenheizung</option>
          <option value="electric">Elektroheizung</option>
          <option value="single_stove">Einzelofen</option>
          <option value="none">Keine</option>
        </Select>
      </Field>
      <Field label="Energieträger / Wärmeerzeuger" required invalid={errors.includes('heatingEnergySource')}>
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
      <Field label="Heizungsjahr" required invalid={errors.includes('heatingYear')}><Input type="number" value={draft.heatingYear} onChange={(event) => setDraft({ ...draft, heatingYear: event.target.value })} /></Field>
    </div>
    {draft.heatingEnergySource === 'other' && (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Field label="Beschreibung Energieträger" required invalid={errors.includes('heatingEnergySourceOther')}>
          <Input value={draft.heatingEnergySourceOther || ''} onChange={(event) => setDraft({ ...draft, heatingEnergySourceOther: event.target.value })} />
        </Field>
      </div>
    )}

    <div style={{ display: 'grid', gridTemplateColumns: draft.energyCertificateAvailable ? '1fr 1fr 1fr' : '1fr 2fr', gap: 16, marginBottom: 16 }}>
      <Field label="Energieausweis" required invalid={errors.includes('energyCertificateAvailable')}>
        <Select value={draft.energyCertificateAvailable === true ? 'yes' : draft.energyCertificateAvailable === false ? 'no' : ''} onChange={(event) => setDraft({ ...draft, energyCertificateAvailable: event.target.value === '' ? '' : event.target.value === 'yes' })}>
          <option value="">Bitte wählen</option>
          <option value="no">nicht vorhanden</option>
          <option value="yes">vorhanden</option>
        </Select>
      </Field>
      {draft.energyCertificateAvailable && (
        <>
          <Field label="Typ Energieausweis" required invalid={errors.includes('energyCertificateType')}>
            <Select value={draft.energyCertificateType} onChange={(event) => setDraft({ ...draft, energyCertificateType: event.target.value })}>
              <option value="">Bitte wählen</option>
              <option value="demand">Bedarfsausweis</option>
              <option value="consumption">Verbrauchsausweis</option>
            </Select>
          </Field>
          <Field label="Energieklasse" required invalid={errors.includes('energyClass')}><Input value={draft.energyClass} onChange={(event) => setDraft({ ...draft, energyClass: event.target.value })} /></Field>
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
      <Field label="Keller" required invalid={errors.includes('basementType')}>
        <Select value={draft.basementType} onChange={(event) => setDraft({ ...draft, basementType: event.target.value })}>
          <option value="">Bitte wählen</option>
          <option value="none">kein Keller</option>
          <option value="partial">teilunterkellert</option>
          <option value="full">vollunterkellert</option>
        </Select>
      </Field>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
      <Field label="Fenstermaterial" required invalid={errors.includes('windowMaterial')}>
        <Select value={draft.windowMaterial} onChange={(event) => setDraft({ ...draft, windowMaterial: event.target.value })}>
          <option value="">Bitte wählen</option>
          <option value="wood">Holz</option>
          <option value="aluminium">Aluminium</option>
          <option value="plastic">Kunststoff</option>
        </Select>
      </Field>
      <Field label="Fensterjahr" required invalid={errors.includes('windowInstallationYear')}><Input type="number" value={draft.windowInstallationYear} onChange={(event) => setDraft({ ...draft, windowInstallationYear: event.target.value })} /></Field>
      <Field label="Asbest im Dach bekannt?" required invalid={errors.includes('asbestosRoofKnown')}>
        <Select value={draft.asbestosRoofKnown || ''} onChange={(event) => setDraft({ ...draft, asbestosRoofKnown: event.target.value })}>
          <option value="">Bitte wählen</option>
          <option value="no">nein</option>
          <option value="yes">ja</option>
        </Select>
      </Field>
    </div>

    <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Außenbereich</div>
    <div style={{ display: 'grid', gridTemplateColumns: draft.parkingType && draft.parkingType !== 'none' ? '1fr 1fr 1fr' : '1fr 2fr', gap: 16, marginBottom: 16 }}>
      <Field label="Parkplatz" required invalid={errors.includes('parkingType')}>
        <Select value={draft.parkingType} onChange={(event) => setDraft({ ...draft, parkingType: event.target.value, parkingAvailable: Boolean(event.target.value && event.target.value !== 'none'), parkingCount: event.target.value && event.target.value !== 'none' ? draft.parkingCount : '' })}>
          <option value="">Bitte wählen</option>
          <option value="none">kein Parkplatz</option>
          <option value="garage">Garage</option>
          <option value="carport">Carport</option>
          <option value="outdoor_space">Stellplatz</option>
          <option value="duplex">Doppelparker</option>
        </Select>
      </Field>
      {draft.parkingType && draft.parkingType !== 'none' && (
        <Field label="Anzahl Parkplätze" required invalid={errors.includes('parkingCount')}><Input type="number" value={draft.parkingCount} onChange={(event) => setDraft({ ...draft, parkingCount: event.target.value })} /></Field>
      )}
    </div>

    <div style={{ background: 'white', border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Restschuld</div>
      <div style={{ display: 'grid', gridTemplateColumns: draft.remainingDebtKnown === true ? '1fr 1fr' : '1fr', gap: 16 }}>
        <Field label="Ist eine Restschuld bekannt?" required invalid={errors.includes('remainingDebtKnown')}>
          <RadioGroup name="remainingDebtKnown" value={draft.remainingDebtKnown === true ? 'yes' : draft.remainingDebtKnown === false ? 'no' : ''} onChange={(value) => setDraft({ ...draft, remainingDebtKnown: value === 'yes', remainingDebtAmount: value === 'yes' ? draft.remainingDebtAmount : '' })} options={[
            { value: 'no', label: 'Nein' },
            { value: 'yes', label: 'Ja' },
          ]} />
        </Field>
        {draft.remainingDebtKnown === true && (
          <Field label="Restschuld (€)" required invalid={errors.includes('remainingDebtAmount')}>
            <Input type="number" value={draft.remainingDebtAmount} onChange={(event) => setDraft({ ...draft, remainingDebtAmount: event.target.value })} />
          </Field>
        )}
      </div>
    </div>

    <div style={{ background: theme.mintLighter, border: `1px solid ${theme.borderSoft}`, borderLeft: `4px solid ${theme.oliv}`, borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: theme.ink, marginBottom: 4 }}>Allgemeiner Hinweis</div>
      <div style={{ fontSize: 12, color: `${theme.ink}99`, lineHeight: 1.45 }}>
        Bitte Besonderheiten früh dokumentieren, zum Beispiel Wohnungsbindung, größere Schäden, laufende Teilungserklärungsänderungen oder absehbare Instandhaltungen.
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
  ['windows', 'Fenster'],
  ['basement', 'Keller'],
  ['electric', 'Elektrik'],
  ['sanitary', 'Sanitär'],
  ['interior', 'Innenausbau'],
  ['outdoor', 'Außenanlagen'],
  ['other', 'Sonstiges'],
];

const FormStep4 = ({ draft, setDraft, errors = [] }) => {
  const setModernization = (key, patch) => setDraft({
    ...draft,
    modernization: {
      ...draft.modernization,
      [key]: { ...(draft.modernization?.[key] || {}), ...patch },
    },
  });
  const setBuildingCondition = (key, patch) => setDraft({
    ...draft,
    buildingCondition: {
      ...draft.buildingCondition,
      [key]: { ...buildingConditionValue(draft.buildingCondition?.[key]), ...patch },
    },
  });
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: theme.aubergine, margin: '0 0 4px' }}>Modernisierungen</h2>
      <div style={{ fontSize: 12.5, color: `${theme.ink}99`, marginBottom: 22 }}>Bitte erfasse zuerst die durchgeführten Modernisierungen. Der aktuelle Zustand der Bauteile folgt separat darunter.</div>

      <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Modernisierung</div>
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
            <Field label="Jahr" required={draft.modernization?.[key]?.scope && draft.modernization[key].scope !== 'none'} invalid={errors.includes(`modernizationYear${key.charAt(0).toUpperCase()}${key.slice(1)}`)}>
              <Input value={draft.modernization?.[key]?.year || ''} onChange={(event) => setModernization(key, { year: event.target.value })} placeholder="z.B. 2018" />
            </Field>
            <Field label="Hinweis">
              <Input value={draft.modernization?.[key]?.note || ''} onChange={(event) => setModernization(key, { note: event.target.value })} placeholder="kurzer Hinweis" />
            </Field>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Zustand</div>
      <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
        {buildingConditionFields.map(([key, label]) => {
          const value = buildingConditionValue(draft.buildingCondition?.[key]);
          const errorKey = `buildingCondition${key.charAt(0).toUpperCase()}${key.slice(1)}`;
          return (
            <div key={key} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 10, alignItems: 'end', background: 'white', border: `1px solid ${theme.borderSoft}`, borderRadius: 6, padding: '10px 12px' }}>
              <div style={{ fontSize: 12.5, color: theme.ink, fontWeight: 700, paddingBottom: 9 }}>{label}</div>
              <Field label="Zustandsbewertung" required={key !== 'other'} invalid={errors.includes(errorKey)}>
                <Select value={value.rating} onChange={(event) => setBuildingCondition(key, { rating: event.target.value })}>
                  <option value="">Bitte wählen</option>
                  <option value="very_good">sehr gut</option>
                  <option value="good">gut</option>
                  <option value="medium">mittel</option>
                  <option value="moderate">mäßig</option>
                  <option value="bad">schlecht</option>
                  <option value="very_bad">sehr schlecht</option>
                  <option value="unknown">unbekannt</option>
                </Select>
              </Field>
              <Field label="Zustandsbeschreibung">
                <Input value={value.description} onChange={(event) => setBuildingCondition(key, { description: event.target.value })} placeholder="z.B. keine sichtbaren Schäden" />
              </Field>
            </div>
          );
        })}
      </div>

      <div style={{ background: theme.mintLighter, border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '14px 16px', marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Objektprüfung</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <Field label="Sind größere Instandhaltungen oder Sonderumlagen bekannt?" required invalid={errors.includes('knownMajorMaintenanceOrSpecialAssessments')}>
            <RadioGroup name="knownMajorMaintenanceOrSpecialAssessments" value={draft.knownMajorMaintenanceOrSpecialAssessments === true ? 'yes' : draft.knownMajorMaintenanceOrSpecialAssessments === false ? 'no' : ''} onChange={(value) => setDraft({ ...draft, knownMajorMaintenanceOrSpecialAssessments: value === 'yes', knownMajorMaintenanceOrSpecialAssessmentsDescription: value === 'yes' ? draft.knownMajorMaintenanceOrSpecialAssessmentsDescription : '' })} options={[
              { value: 'no', label: 'Nein' },
              { value: 'yes', label: 'Ja' },
            ]} />
          </Field>
          <Field label="Sind Feuchtigkeit, Schimmel oder Wasserschäden bekannt?" required invalid={errors.includes('moistureDamageStatus')}>
            <Select value={draft.moistureDamageStatus || ''} onChange={(event) => setDraft({ ...draft, moistureDamageStatus: event.target.value, moistureDamageDescription: event.target.value === 'NONE' ? '' : draft.moistureDamageDescription })}>
              <option value="">Bitte wählen</option>
              <option value="NONE">Nein</option>
              <option value="MINOR">Ja, geringfügig</option>
              <option value="SIGNIFICANT">Ja, erheblich</option>
            </Select>
          </Field>
        </div>
        {draft.knownMajorMaintenanceOrSpecialAssessments === true && (
          <div style={{ marginBottom: 16 }}>
            <Field label="Bitte bekannte Instandhaltungen oder Sonderumlagen beschreiben" required invalid={errors.includes('knownMajorMaintenanceOrSpecialAssessmentsDescription')}>
              <textarea value={draft.knownMajorMaintenanceOrSpecialAssessmentsDescription || ''} onChange={(event) => setDraft({ ...draft, knownMajorMaintenanceOrSpecialAssessmentsDescription: event.target.value })} rows={3} style={{ width: '100%', padding: '8px 12px', fontSize: 13.5, border: `1px solid ${theme.border}`, borderRadius: 5, background: 'white', color: theme.ink, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' }} />
            </Field>
          </div>
        )}
        {(draft.moistureDamageStatus === 'MINOR' || draft.moistureDamageStatus === 'SIGNIFICANT') && (
          <div style={{ marginBottom: 16 }}>
            <Field label="Bitte Feuchtigkeit, Schimmel oder Wasserschäden beschreiben" required invalid={errors.includes('moistureDamageDescription')}>
              <textarea value={draft.moistureDamageDescription || ''} onChange={(event) => setDraft({ ...draft, moistureDamageDescription: event.target.value })} rows={3} style={{ width: '100%', padding: '8px 12px', fontSize: 13.5, border: `1px solid ${theme.border}`, borderRadius: 5, background: 'white', color: theme.ink, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' }} />
            </Field>
          </div>
        )}
        <Field label="Einschätzung Zugänglichkeit" required invalid={errors.includes('accessibilityAssessment')}>
          <RadioGroup name="accessibilityAssessment" value={draft.accessibilityAssessment || ''} onChange={(value) => setDraft({ ...draft, accessibilityAssessment: value })} options={[
            { value: 'LOW_BARRIER', label: 'Barrierearm' },
            { value: 'PARTIALLY_RESTRICTED', label: 'Teilweise eingeschränkt' },
            { value: 'STRONGLY_RESTRICTED', label: 'Stark eingeschränkt' },
          ]} />
        </Field>
      </div>
    </div>
  );
};

const FormStep5 = ({ draft, setDraft, errors = [] }) => {
  const requiredDocuments = getRequiredDocumentsForPropertyType(draft.propertyType);
  const optionalDocuments = getOptionalDocumentsForPropertyType(draft.propertyType).filter((item) => item.category !== 'power_of_attorney');
  const uploads = draft.documentUploads || {};
  const appendFiles = (category, fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setDraft({
      ...draft,
      documentUploads: {
        ...uploads,
        [category]: [...(uploads[category] || []), ...files],
      },
    });
  };
  const removeFile = (category, index) => {
    const nextFiles = [...(uploads[category] || [])];
    nextFiles.splice(index, 1);
    setDraft({
      ...draft,
      documentUploads: {
        ...uploads,
        [category]: nextFiles,
      },
    });
  };
  const row = (item, level = 'required', customErrorKey) => {
    const files = uploads[item.category] || [];
    const existing = draft.existingDocumentCategories?.includes(item.category);
    const missing = level === 'required' && (customErrorKey ? errors.includes(customErrorKey) : errors.includes(`document:${item.category}`));
    return (
      <div key={`${level}-${item.category}`} style={{ background: 'white', border: `1px solid ${missing ? '#9B2C2C66' : theme.borderSoft}`, borderRadius: 8, padding: '12px 14px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'start' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            {files.length || existing ? <CheckCircle size={15} style={{ color: '#5B8C2B' }} /> : <FileText size={15} style={{ color: missing ? '#9B2C2C' : theme.aubergine }} />}
            <div style={{ fontSize: 12.5, color: theme.ink, fontWeight: 800 }}>{item.label}</div>
            <span style={{ fontSize: 10.5, fontWeight: 800, color: level === 'required' ? theme.gold : `${theme.ink}77`, background: level === 'required' ? theme.goldSoft : theme.mintLight, borderRadius: 12, padding: '2px 8px' }}>
              {level === 'required' ? 'Pflicht' : 'Optional'}
            </span>
          </div>
          {item.note && <div style={{ fontSize: 11.5, color: `${theme.ink}88`, lineHeight: 1.4 }}>{item.note}</div>}
          {existing && <div style={{ fontSize: 11.5, color: '#5B8C2B', fontWeight: 800, marginTop: 6 }}>Bereits im Kundenordner vorhanden.</div>}
          {missing && <div style={{ fontSize: 11.5, color: '#9B2C2C', fontWeight: 800, marginTop: 6 }}>Diese Unterlage fehlt noch.</div>}
          {files.length > 0 && (
            <div style={{ display: 'grid', gap: 5, marginTop: 9 }}>
              {files.map((file, index) => (
                <div key={`${file.name}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: theme.ink, background: theme.mintLighter, borderRadius: 5, padding: '5px 7px' }}>
                  <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                  <button type="button" onClick={() => removeFile(item.category, index)} style={{ background: 'transparent', border: 'none', color: '#9B2C2C', cursor: 'pointer', display: 'flex', padding: 1 }} aria-label="Datei entfernen">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <label style={{ background: theme.aubergine, color: 'white', borderRadius: 5, padding: '7px 11px', fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
          <Upload size={13} /> Datei hochladen
          <input type="file" multiple accept="application/pdf,image/*" onChange={(event) => {
            appendFiles(item.category, event.target.files);
            event.target.value = '';
          }} style={{ display: 'none' }} />
        </label>
      </div>
    );
  };

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: theme.aubergine, margin: '0 0 4px' }}>Dokumente</h2>
      <div style={{ fontSize: 12.5, color: `${theme.ink}99`, marginBottom: 22 }}>Bitte lade die Unterlagen direkt in der jeweiligen Zeile hoch. Pro Unterlage sind beliebig viele Dateien möglich.</div>

      <div style={{ background: theme.mintLighter, border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '14px 16px', marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Pflichtdokumente</div>
        <div style={{ display: 'grid', gap: 10 }}>
          {requiredDocuments.map((item) => row(item, 'required', item.category === 'land_register' ? 'document:land_register_or_power' : undefined))}
          {!hasUploadedDocument(draft, 'land_register') && row({
            category: 'power_of_attorney',
            label: 'Vollmacht Grundbuch',
            note: 'Nur erforderlich, solange kein aktueller Grundbuchauszug hochgeladen wurde.'
          }, 'required', 'document:land_register_or_power')}
        </div>
        {draft.propertyType === 'apartment' && (
          <div style={{ marginTop: 10, background: theme.goldSoft, border: `1px solid ${theme.gold}55`, borderRadius: 6, padding: '9px 11px', fontSize: 11.5, color: theme.ink, lineHeight: 1.45 }}>
            Wohnungssonderfälle: Teilungserklärung, Hausgeld, Protokolle und Instandhaltungsrücklage sind für Eigentumswohnungen verpflichtend zu prüfen.
          </div>
        )}
      </div>

      <div style={{ background: 'white', border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '14px 16px' }}>
        <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Weitere Unterlagen</div>
        <div style={{ display: 'grid', gap: 10 }}>
          {optionalDocuments.map((item) => row(item, 'optional'))}
        </div>
      </div>
    </div>
  );
};

// =====================================================================
// SCREEN — LEADS
// =====================================================================
const adminLeadBucketKeys = ['new-leads', 'qualification', 'assignment', 'follow-up', 'completed'];
const partnerLeadBucketKeys = ['assigned', 'contacted', 'converted'];

function readLeadBucketFromUrl(role) {
  if (typeof window === 'undefined') return '';
  const bucket = new URLSearchParams(window.location.search).get('leadBucket') || new URLSearchParams(window.location.search).get('bucket');
  const allowed = role === 'admin' ? adminLeadBucketKeys : partnerLeadBucketKeys;
  return allowed.includes(bucket) ? bucket : '';
}

function writeLeadBucketToUrl(bucket) {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  params.set('screen', 'leads');
  params.delete('case');
  params.delete('caseId');
  params.delete('tab');
  params.delete('returnTab');
  if (bucket) params.set('leadBucket', bucket);
  else params.delete('leadBucket');
  const query = params.toString();
  window.history.pushState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
}

function leadPriority(lead) {
  const rank = { NEW: 1, IN_REVIEW: 2, QUALIFIED: 2, ASSIGNED: 3, ASSIGNED_TO_PARTNER: 3, CONTACTED: 4, PARTNER_CONTACT_PENDING: 4, CONVERTED: 5, CONVERTED_TO_CASE: 5, REJECTED: 6, CLOSED: 7 };
  return rank[lead.status] || 9;
}

const LeadWorkBuckets = ({ buckets, activeBucket, onSelect, columns = 4 }) => (
  <div className="lead-kpi-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: 12, marginBottom: 16 }}>
    {buckets.map((bucket) => {
      const active = activeBucket === bucket.key;
      return (
        <button
          key={bucket.key}
          onClick={() => onSelect(active ? '' : bucket.key)}
          style={{
            background: active ? theme.aubergine : 'white',
            border: `1px solid ${active ? theme.aubergine : theme.borderSoft}`,
            borderRadius: 8,
            padding: '14px 16px',
            minHeight: 132,
            textAlign: 'left',
            cursor: 'pointer',
            boxShadow: active ? '0 12px 28px rgba(68,0,92,0.14)' : 'none',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 9 }}>
            <div style={{ fontSize: 10.5, color: active ? theme.gold : theme.oliv, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{bucket.label}</div>
            <bucket.icon size={14} style={{ color: active ? theme.gold : `${theme.aubergine}66` }} />
          </div>
          <div style={{ fontSize: 27, lineHeight: 1, fontWeight: 800, color: active ? 'white' : theme.aubergine, marginBottom: 7 }}>{bucket.value}</div>
          <div style={{ fontSize: 11.5, color: active ? 'rgba(255,255,255,0.82)' : `${theme.ink}88`, lineHeight: 1.4, flex: 1 }}>{bucket.sub}</div>
          <div style={{ fontSize: 12, color: active ? theme.gold : theme.aubergine, fontWeight: 800, marginTop: 10 }}>{bucket.action}</div>
        </button>
      );
    })}
  </div>
);

const emptyLeadDraft = {
  source: 'phone',
  firstName: '',
  lastName: '',
  phone: '',
  mobilePhone: '',
  email: '',
  street: '',
  postalCode: '',
  city: '',
  federalState: '',
  preferredContactMethod: 'phone',
  contactConsent: true,
  message: '',
  propertyStreet: '',
  propertyPostalCode: '',
  propertyCity: '',
  propertyType: '',
  livingAreaSqm: '',
  plotAreaSqm: '',
  yearBuilt: '',
  propertyNote: '',
  productInterest: '',
  region: '',
  assignedPartnerId: '',
  routingReason: '',
  internalNote: ''
};

const LeadCreatePanel = ({ draft, setDraft, partners = [], onSubmit, onCancel, submitting }) => {
  const set = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const field = (label, key, props = {}) => (
    <label style={{ display: 'grid', gap: 5 }}>
      <span style={{ fontSize: 11.5, color: theme.ink, fontWeight: 700 }}>{label}</span>
      <input value={draft[key] || ''} onChange={(event) => set(key, event.target.value)} {...props} style={{ border: `1px solid ${theme.border}`, borderRadius: 5, padding: '8px 10px', color: theme.ink, fontSize: 13, fontFamily: 'inherit', ...props.style }} />
    </label>
  );
  return (
    <div style={{ background: 'white', border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '18px 20px', marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>Interne Lead-Erfassung</div>
          <h2 style={{ margin: 0, color: theme.aubergine, fontSize: 20 }}>Lead erfassen</h2>
          <p style={{ margin: '6px 0 0', color: `${theme.ink}99`, fontSize: 12.5, lineHeight: 1.45 }}>
            Dieser Interessent ist noch kein Kundenfall. Nach Prüfung kann der Lead einem Makler zugewiesen oder in einen Kundenfall umgewandelt werden.
          </p>
        </div>
        <button type="button" onClick={onCancel} style={{ alignSelf: 'start', background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine, borderRadius: 5, padding: '7px 10px', cursor: 'pointer', fontWeight: 800 }}>Schließen</button>
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        <section>
          <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Interessent</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
            {field('Vorname', 'firstName')}
            {field('Nachname', 'lastName')}
            {field('Telefon', 'phone')}
            {field('Mobil', 'mobilePhone')}
            {field('E-Mail', 'email', { type: 'email' })}
            {field('Straße', 'street')}
            {field('PLZ', 'postalCode')}
            {field('Ort', 'city')}
            {field('Bundesland', 'federalState')}
            <label style={{ display: 'grid', gap: 5 }}>
              <span style={{ fontSize: 11.5, color: theme.ink, fontWeight: 700 }}>Bevorzugte Kontaktart</span>
              <select value={draft.preferredContactMethod || ''} onChange={(event) => set('preferredContactMethod', event.target.value)} style={{ border: `1px solid ${theme.border}`, borderRadius: 5, padding: '8px 10px', color: theme.ink, fontSize: 13 }}>
                <option value="phone">Telefon</option>
                <option value="mobile">Mobil</option>
                <option value="email">E-Mail</option>
              </select>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 21, fontSize: 12.5, color: theme.ink, fontWeight: 650 }}>
              <input type="checkbox" checked={Boolean(draft.contactConsent)} onChange={(event) => set('contactConsent', event.target.checked)} style={{ accentColor: theme.aubergine }} />
              Einwilligung zur Kontaktaufnahme
            </label>
          </div>
          <label style={{ display: 'grid', gap: 5, marginTop: 12 }}>
            <span style={{ fontSize: 11.5, color: theme.ink, fontWeight: 700 }}>Notiz zum Gespräch</span>
            <textarea value={draft.message || ''} onChange={(event) => set('message', event.target.value)} rows={3} style={{ border: `1px solid ${theme.border}`, borderRadius: 5, padding: '8px 10px', color: theme.ink, fontSize: 13, fontFamily: 'inherit' }} />
          </label>
        </section>

        <section>
          <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Objekt, soweit bekannt</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
            {field('Objektadresse, falls abweichend', 'propertyStreet')}
            {field('PLZ Objekt', 'propertyPostalCode')}
            {field('Ort Objekt', 'propertyCity')}
            <label style={{ display: 'grid', gap: 5 }}>
              <span style={{ fontSize: 11.5, color: theme.ink, fontWeight: 700 }}>Objekttyp</span>
              <select value={draft.propertyType || ''} onChange={(event) => set('propertyType', event.target.value)} style={{ border: `1px solid ${theme.border}`, borderRadius: 5, padding: '8px 10px', color: theme.ink, fontSize: 13 }}>
                <option value="">Noch offen</option>
                <option value="single_family">Einfamilienhaus</option>
                <option value="semi_detached">Doppelhaushälfte</option>
                <option value="row_house">Reihenhaus</option>
                <option value="apartment">Eigentumswohnung</option>
              </select>
            </label>
            {field('Wohnfläche', 'livingAreaSqm', { type: 'number' })}
            {field('Grundstücksfläche', 'plotAreaSqm', { type: 'number' })}
            {field('Baujahr', 'yearBuilt', { type: 'number' })}
            <label style={{ display: 'grid', gap: 5 }}>
              <span style={{ fontSize: 11.5, color: theme.ink, fontWeight: 700 }}>Gewünschtes Modell</span>
              <select value={draft.productInterest || ''} onChange={(event) => set('productInterest', event.target.value)} style={{ border: `1px solid ${theme.border}`, borderRadius: 5, padding: '8px 10px', color: theme.ink, fontSize: 13 }}>
                <option value="">Noch unklar</option>
                <option value="fixed_residential_right">Wohnrecht</option>
                <option value="sale_and_leaseback">Rückmietverkauf</option>
                <option value="other">Sonstiges</option>
              </select>
            </label>
          </div>
          <label style={{ display: 'grid', gap: 5, marginTop: 12 }}>
            <span style={{ fontSize: 11.5, color: theme.ink, fontWeight: 700 }}>Grober Zustand / Notiz</span>
            <textarea value={draft.propertyNote || ''} onChange={(event) => set('propertyNote', event.target.value)} rows={2} style={{ border: `1px solid ${theme.border}`, borderRadius: 5, padding: '8px 10px', color: theme.ink, fontSize: 13, fontFamily: 'inherit' }} />
          </label>
        </section>

        <section>
          <div style={{ fontSize: 11, color: theme.oliv, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Lead-Quelle und Routing</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
            <label style={{ display: 'grid', gap: 5 }}>
              <span style={{ fontSize: 11.5, color: theme.ink, fontWeight: 700 }}>Lead-Quelle</span>
              <select value={draft.source || 'phone'} onChange={(event) => set('source', event.target.value)} style={{ border: `1px solid ${theme.border}`, borderRadius: 5, padding: '8px 10px', color: theme.ink, fontSize: 13 }}>
                <option value="phone">Telefon</option>
                <option value="website">Website</option>
                <option value="referral">Empfehlung</option>
                <option value="partner">Makler</option>
                <option value="other">Sonstiges</option>
              </select>
            </label>
            {field('Region', 'region')}
            <label style={{ display: 'grid', gap: 5 }}>
              <span style={{ fontSize: 11.5, color: theme.ink, fontWeight: 700 }}>Zuständiger Partner/Makler</span>
              <select value={draft.assignedPartnerId || ''} onChange={(event) => set('assignedPartnerId', event.target.value)} style={{ border: `1px solid ${theme.border}`, borderRadius: 5, padding: '8px 10px', color: theme.ink, fontSize: 13 }}>
                <option value="">Noch nicht zuweisen</option>
                {partners.map((partner) => <option key={partner.id} value={partner.id}>{partner.contactName || partner.companyName}</option>)}
              </select>
            </label>
            {field('Routing-Grund', 'routingReason')}
          </div>
          <label style={{ display: 'grid', gap: 5, marginTop: 12 }}>
            <span style={{ fontSize: 11.5, color: theme.ink, fontWeight: 700 }}>Interne Notiz</span>
            <textarea value={draft.internalNote || ''} onChange={(event) => set('internalNote', event.target.value)} rows={2} style={{ border: `1px solid ${theme.border}`, borderRadius: 5, padding: '8px 10px', color: theme.ink, fontSize: 13, fontFamily: 'inherit' }} />
          </label>
        </section>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
        <button type="button" onClick={onCancel} style={{ background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine, borderRadius: 5, padding: '9px 14px', cursor: 'pointer', fontWeight: 800 }}>Abbrechen</button>
        <button type="button" disabled={submitting} onClick={() => onSubmit(draft)} style={{ background: theme.aubergine, border: 'none', color: 'white', borderRadius: 5, padding: '9px 16px', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 800, opacity: submitting ? 0.6 : 1 }}>Lead speichern</button>
      </div>
    </div>
  );
};

const LeadBoard = ({ role, leads = [], partners = [], staff = [], canAssignLeads = role === 'admin', initialCreateOpen = false, initialSelectedLeadId = null, onCreate, onAssign, onConvert, onMarkContacted, onUpdateStatus, loading }) => {
  const [partnerSelection, setPartnerSelection] = useState({});
  const [partnerFilter, setPartnerFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [activeBucket, setActiveBucket] = useState(() => readLeadBucketFromUrl(role));
  const [selectedLeadId, setSelectedLeadId] = useState(initialSelectedLeadId || readLeadIdFromUrl());
  const [createOpen, setCreateOpen] = useState(() => Boolean(initialCreateOpen) || readLeadCreateFromUrl());
  const [leadDraft, setLeadDraft] = useState(emptyLeadDraft);
  const [savingLead, setSavingLead] = useState(false);
  useEffect(() => {
    const allowed = role === 'admin' ? adminLeadBucketKeys : partnerLeadBucketKeys;
    if (activeBucket && !allowed.includes(activeBucket)) {
      setActiveBucket('');
    }
  }, [role, activeBucket]);
  useEffect(() => {
    if (initialCreateOpen) {
      setCreateOpen(true);
    }
  }, [initialCreateOpen]);
  useEffect(() => {
    const nextLeadId = initialSelectedLeadId || readLeadIdFromUrl();
    if (nextLeadId) {
      setCreateOpen(false);
      setSelectedLeadId(nextLeadId);
    }
  }, [initialSelectedLeadId]);
  const visibleLeads = role === 'admin'
    ? leads
    : leads.filter((lead) => !['CONVERTED', 'CONVERTED_TO_CASE', 'REJECTED', 'CLOSED'].includes(lead.status));
  const leadStats = {
    new: visibleLeads.filter((lead) => lead.status === 'NEW').length,
    qualified: visibleLeads.filter((lead) => ['IN_REVIEW', 'QUALIFIED'].includes(lead.status)).length,
    assigned: visibleLeads.filter((lead) => ['ASSIGNED', 'ASSIGNED_TO_PARTNER'].includes(lead.status)).length,
    contacted: visibleLeads.filter((lead) => ['CONTACTED', 'PARTNER_CONTACT_PENDING'].includes(lead.status)).length,
    converted: leads.filter((lead) => ['CONVERTED', 'CONVERTED_TO_CASE'].includes(lead.status)).length,
    rejected: leads.filter((lead) => ['REJECTED', 'CLOSED'].includes(lead.status)).length
  };
  const activePartnerCount = partners.filter((partner) => partner.status === 'active').length;
  const advisorOptions = staff.filter((member) => ['advisor', 'admin', 'super_admin'].includes(member.internalRole));
  const assigneeOptions = [
    ...partners.map((partner) => ({ value: `partner:${partner.id}`, label: `Partner · ${partner.contactName || partner.companyName}` })),
    ...advisorOptions.map((member) => ({ value: `advisor:${member.id}`, label: `Intern · ${member.name}` })),
  ];
  const adminBuckets = [
    { key: 'new-leads', label: 'Neue Leads', value: leadStats.new, sub: 'Neue Homepage-Leads und Kontaktanfragen.', action: 'Leads prüfen', icon: TrendingUp },
    { key: 'qualification', label: 'Qualifizieren', value: leadStats.qualified, sub: 'Geprüfte Leads für die nächste Entscheidung.', action: 'Qualifizierung prüfen', icon: CheckCircle2 },
    { key: 'assignment', label: 'Zuweisen', value: leadStats.assigned, sub: `${activePartnerCount} aktive Partner und interne Berater.`, action: 'Zuweisungen prüfen', icon: Users },
    { key: 'follow-up', label: 'Nachfassen', value: leadStats.contacted, sub: 'Kontaktierte Leads mit offenem nächsten Schritt.', action: 'Nachfassen', icon: Phone },
    { key: 'completed', label: 'Erledigt', value: leadStats.converted + leadStats.rejected, sub: 'Umgewandelte oder abgelehnte Leads.', action: 'Erledigte ansehen', icon: Archive },
  ];
  const partnerBuckets = [
    { key: 'assigned', label: 'Neue Leads', value: leadStats.assigned, sub: 'Zugewiesene Leads prüfen und kontaktieren.', action: 'Leads prüfen', icon: TrendingUp },
    { key: 'contacted', label: 'Nachfassen', value: leadStats.contacted, sub: 'Kontaktierte Leads als Kundenfall übernehmen.', action: 'Nachfassen', icon: Phone },
    { key: 'converted', label: 'Umgewandelt', value: leadStats.converted, sub: 'Bereits als Kundenfall angelegte Leads.', action: 'Umgewandelte ansehen', icon: CheckCircle2 },
  ];
  const buckets = role === 'admin' ? adminBuckets : partnerBuckets;
  const rowsByBucket = role === 'admin'
    ? {
        'new-leads': visibleLeads.filter((lead) => lead.status === 'NEW'),
        qualification: visibleLeads.filter((lead) => ['IN_REVIEW', 'QUALIFIED'].includes(lead.status)),
        assignment: visibleLeads.filter((lead) => ['ASSIGNED', 'ASSIGNED_TO_PARTNER'].includes(lead.status)),
        'follow-up': visibleLeads.filter((lead) => ['CONTACTED', 'PARTNER_CONTACT_PENDING'].includes(lead.status)),
        completed: visibleLeads.filter((lead) => ['CONVERTED', 'CONVERTED_TO_CASE', 'REJECTED', 'CLOSED'].includes(lead.status)),
      }
    : {
        assigned: visibleLeads.filter((lead) => ['ASSIGNED', 'ASSIGNED_TO_PARTNER'].includes(lead.status)),
        contacted: visibleLeads.filter((lead) => ['CONTACTED', 'PARTNER_CONTACT_PENDING'].includes(lead.status)),
        converted: leads.filter((lead) => ['CONVERTED', 'CONVERTED_TO_CASE'].includes(lead.status)),
      };
  const activeBucketLabel = buckets.find((bucket) => bucket.key === activeBucket)?.label;
  const changeBucket = (bucket) => {
    setActiveBucket(bucket);
    setSelectedLeadId(null);
    writeLeadBucketToUrl(bucket);
  };
  const openCreateForm = () => {
    setCreateOpen(true);
    updateLeadCreateUrl(role, true);
  };
  const closeCreateForm = () => {
    setCreateOpen(false);
    updateLeadCreateUrl(role, false);
  };
  const searchNeedle = search.trim().toLowerCase();
  const baseLeads = activeBucket ? (rowsByBucket[activeBucket] || []) : visibleLeads;
  const filteredLeads = baseLeads
    .filter((lead) => {
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
        propertyTypeLabel(lead.propertyType),
        lead.propertyPostalCode,
        lead.propertyCity,
        lead.region
      ].filter(Boolean).join(' ').toLowerCase();
      const matchesSearch = !searchNeedle || haystack.includes(searchNeedle);
      const matchesPartner = role !== 'admin' || !canAssignLeads
        || partnerFilter === 'ALL'
        || (partnerFilter === 'UNASSIGNED' ? !lead.assignedPartnerId && !lead.assignedAdvisorUserId : partnerFilter.startsWith('advisor:') ? lead.assignedAdvisorUserId === partnerFilter.replace('advisor:', '') : lead.assignedPartnerId === partnerFilter);
      return matchesSearch && matchesPartner;
    })
    .sort((left, right) => leadPriority(left) - leadPriority(right) || String(right.updatedAt || right.createdAt || '').localeCompare(String(left.updatedAt || left.createdAt || ''), 'de'));
  const selectedLead = filteredLeads.find((lead) => lead.id === selectedLeadId) || filteredLeads[0];

  const leadName = leadDisplayName;
  const partnerName = (partnerId) => {
    const partner = partners.find((item) => item.id === partnerId);
    return partner ? `${partner.contactName || partner.companyName}` : 'nicht zugewiesen';
  };
  const assigneeName = (lead) => {
    if (lead.assignedPartnerId) return partnerName(lead.assignedPartnerId);
    const advisor = staff.find((item) => item.id === lead.assignedAdvisorUserId);
    return advisor ? `${advisor.name} (intern)` : 'nicht zugewiesen';
  };
  const submitLead = async (draft) => {
    setSavingLead(true);
    try {
      await onCreate?.(draft);
      setLeadDraft(emptyLeadDraft);
      closeCreateForm();
    } finally {
      setSavingLead(false);
    }
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 12, color: `${theme.ink}88` }}>
            {loading ? 'Leads werden geladen...' : `${filteredLeads.length} von ${visibleLeads.length} Einträgen`}
          </div>
        </div>
      </div>

      {createOpen && (
        <LeadCreatePanel
          draft={leadDraft}
          setDraft={setLeadDraft}
          partners={partners}
          submitting={savingLead}
          onSubmit={submitLead}
          onCancel={closeCreateForm}
        />
      )}

      <LeadWorkBuckets buckets={buckets} activeBucket={activeBucket} onSelect={changeBucket} columns={role === 'admin' ? 5 : 3} />

      <div className="lead-workspace-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 16, alignItems: 'start' }}>
        <div style={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.borderSoft}`, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 600, color: theme.aubergine }}>
                {activeBucketLabel || (role === 'admin' ? 'Leadverteilung' : 'Zur Bearbeitung')}
              </span>
              <div style={{ fontSize: 11.5, color: `${theme.ink}88`, marginTop: 2 }}>
                {activeBucket ? 'Gefilterte Lead-Arbeitsliste.' : role === 'admin' ? 'Homepage-Leads qualifizieren, Partner auswählen und übergeben.' : 'Lead kontaktieren und als Kundenfall übernehmen.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: theme.mintLighter, border: `1px solid ${theme.borderSoft}`, borderRadius: 5, padding: '6px 10px', minWidth: 220 }}>
                <Search size={14} style={{ color: `${theme.aubergine}88`, marginRight: 8 }} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Lead, Ort, Kontakt suchen" style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: 12.5, color: theme.ink }} />
              </div>
              {role === 'admin' && canAssignLeads && (
                <select value={partnerFilter} onChange={(event) => setPartnerFilter(event.target.value)} style={{ padding: '7px 10px', border: `1px solid ${theme.border}`, borderRadius: 5, color: theme.ink, background: 'white', fontSize: 12 }}>
                  <option value="ALL">Alle Zuweisungen</option>
                  <option value="UNASSIGNED">Nicht zugewiesen</option>
                  {partners.map((partner) => <option key={partner.id} value={partner.id}>{partner.contactName || partner.companyName}</option>)}
                  {advisorOptions.map((member) => <option key={member.id} value={`advisor:${member.id}`}>{member.name} (intern)</option>)}
                </select>
              )}
            </div>
          </div>

          {filteredLeads.length === 0 ? (
            <div style={{ padding: 28, color: `${theme.ink}88`, fontSize: 13 }}>{activeBucket ? 'Keine Vorgänge in diesem Arbeitskorb.' : 'Keine Leads für diesen Filter.'}</div>
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
                  const assignedAdvisor = staff.find((member) => member.id === lead.assignedAdvisorUserId);
                  const currentAssigneeValue = lead.assignedAdvisorUserId ? `advisor:${lead.assignedAdvisorUserId}` : lead.assignedPartnerId ? `partner:${lead.assignedPartnerId}` : '';
                  const selectedAssigneeValue = partnerSelection[lead.id] || currentAssigneeValue || assigneeOptions[0]?.value || '';
                  const assignmentLocked = ['CONVERTED', 'CONVERTED_TO_CASE', 'REJECTED', 'CLOSED'].includes(lead.status);
                  const canConvertLead = ['CONTACTED', 'PARTNER_CONTACT_PENDING'].includes(lead.status);
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
                        <div>{propertyTypeLabel(lead.propertyType)} {lead.propertyCity || lead.city || ''}</div>
                        <div style={{ color: `${theme.ink}88`, fontSize: 12, marginTop: 2 }}>
                          {[lead.propertyPostalCode || lead.postalCode, lead.region, lead.estimatedPropertyValueRange && `${lead.estimatedPropertyValueRange} Tsd.`, lead.youngestOwnerAgeRange && `${lead.youngestOwnerAgeRange} Jahre`].filter(Boolean).join(' · ') || '-'}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}><LeadStatusBadge status={lead.status} /></td>
                      <td style={{ padding: '12px 16px' }} onClick={(event) => event.stopPropagation()}>
                        {role === 'admin' && canAssignLeads ? (
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                            <select
                              value={selectedAssigneeValue}
                              onChange={(event) => setPartnerSelection((current) => ({ ...current, [lead.id]: event.target.value }))}
                              disabled={assignmentLocked}
                              style={{ minWidth: 180, padding: '7px 10px', border: `1px solid ${theme.border}`, borderRadius: 5, color: theme.ink, background: assignmentLocked ? theme.mintLighter : 'white', opacity: assignmentLocked ? 0.65 : 1 }}
                            >
                              {assigneeOptions.length === 0 && <option value="">Keine Zuweisung möglich</option>}
                              {assigneeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                            </select>
                            <button
                              onClick={() => onAssign(lead.id, selectedAssigneeValue)}
                              disabled={!selectedAssigneeValue || assignmentLocked}
                              style={{ background: theme.aubergine, color: 'white', border: 'none', padding: '7px 12px', borderRadius: 5, fontSize: 12, fontWeight: 700, cursor: !selectedAssigneeValue || assignmentLocked ? 'not-allowed' : 'pointer', opacity: !selectedAssigneeValue || assignmentLocked ? 0.45 : 1 }}
                            >
                              {['CONVERTED', 'CONVERTED_TO_CASE'].includes(lead.status) ? 'Umgewandelt' : lead.status === 'REJECTED' ? 'Abgelehnt' : assignedPartner || assignedAdvisor ? 'Neu zuweisen' : 'Zuweisen'}
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button onClick={() => onMarkContacted(lead.id)} disabled={['CONVERTED', 'CONVERTED_TO_CASE'].includes(lead.status)} style={{ background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine, padding: '7px 12px', borderRadius: 5, fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: ['CONVERTED', 'CONVERTED_TO_CASE'].includes(lead.status) ? 0.45 : 1 }}>
                              Kontaktiert
                            </button>
                            <button onClick={() => onConvert(lead.id)} disabled={!canConvertLead} style={{ background: theme.aubergine, color: 'white', border: 'none', padding: '7px 12px', borderRadius: 5, fontSize: 12, fontWeight: 700, cursor: canConvertLead ? 'pointer' : 'not-allowed', opacity: canConvertLead ? 1 : 0.45 }}>
                              {['ASSIGNED', 'ASSIGNED_TO_PARTNER'].includes(lead.status) ? 'Erst Kontakt markieren' : 'In Kundenfall umwandeln'}
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
                  ['Quelle', leadSourceLabels[selectedLead.source] || selectedLead.source || 'Homepage'],
                  ['Erfasst', formatDate(selectedLead.createdAt)],
                  ['Kontakt', [selectedLead.email, selectedLead.phone, selectedLead.mobilePhone].filter(Boolean).join(' · ') || 'offen'],
                  ['Objekt', `${propertyTypeLabel(selectedLead.propertyType)} ${selectedLead.propertyCity || selectedLead.city || ''}`.trim()],
                  ['PLZ', selectedLead.postalCode || '-'],
                  ['Region', selectedLead.region || '-'],
                  ['Wertindikation', selectedLead.estimatedPropertyValueRange ? `${selectedLead.estimatedPropertyValueRange} Tsd.` : '-'],
                  ['Jüngster Eigentümer', selectedLead.youngestOwnerAgeRange ? `${selectedLead.youngestOwnerAgeRange} Jahre` : '-'],
                  ['Interesse', productModelLabels[selectedLead.productInterest] || '-'],
                  ['Zuweisung', assigneeName(selectedLead)]
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

              {role === 'admin' && canAssignLeads ? (
                <div style={{ borderTop: `1px solid ${theme.borderSoft}`, marginTop: 16, paddingTop: 14, display: 'grid', gap: 8 }}>
                  <button disabled={['CONVERTED', 'CONVERTED_TO_CASE'].includes(selectedLead.status)} onClick={() => onUpdateStatus(selectedLead.id, 'IN_REVIEW')} style={{ background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine, borderRadius: 5, padding: '8px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: ['CONVERTED', 'CONVERTED_TO_CASE'].includes(selectedLead.status) ? 0.45 : 1 }}>In Prüfung markieren</button>
                  <button disabled={['CONVERTED', 'CONVERTED_TO_CASE'].includes(selectedLead.status)} onClick={() => onUpdateStatus(selectedLead.id, 'REJECTED')} style={{ background: '#9B2C2C0F', border: '1px solid #9B2C2C33', color: '#9B2C2C', borderRadius: 5, padding: '8px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: ['CONVERTED', 'CONVERTED_TO_CASE'].includes(selectedLead.status) ? 0.45 : 1 }}>Lead ablehnen</button>
                </div>
              ) : (
                <div style={{ borderTop: `1px solid ${theme.borderSoft}`, marginTop: 16, paddingTop: 14, display: 'grid', gap: 8 }}>
                  <div style={{ background: theme.mintLighter, border: `1px solid ${theme.borderSoft}`, borderRadius: 8, padding: '10px 12px', display: 'grid', gap: 8 }}>
                    {[
                      { label: 'Kontakt aufnehmen', done: ['CONTACTED', 'PARTNER_CONTACT_PENDING', 'CONVERTED', 'CONVERTED_TO_CASE'].includes(selectedLead.status), active: ['ASSIGNED', 'ASSIGNED_TO_PARTNER'].includes(selectedLead.status) },
                      { label: 'Kundenfall anlegen', done: ['CONVERTED', 'CONVERTED_TO_CASE'].includes(selectedLead.status), active: ['CONTACTED', 'PARTNER_CONTACT_PENDING'].includes(selectedLead.status) }
                    ].map((step, index) => (
                      <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: 8, color: step.done ? '#5B8C2B' : step.active ? theme.aubergine : `${theme.ink}88`, fontSize: 12.5, fontWeight: step.active ? 800 : 650 }}>
                        <span style={{ width: 20, height: 20, borderRadius: '50%', background: step.done ? '#5B8C2B' : step.active ? theme.aubergine : 'white', color: step.done || step.active ? 'white' : `${theme.ink}88`, border: step.done || step.active ? 'none' : `1px solid ${theme.border}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>
                          {step.done ? <CheckCircle size={12} /> : index + 1}
                        </span>
                        {step.label}
                      </div>
                    ))}
                  </div>
                  <button disabled={['CONVERTED', 'CONVERTED_TO_CASE'].includes(selectedLead.status)} onClick={() => onMarkContacted(selectedLead.id)} style={{ background: 'white', border: `1px solid ${theme.border}`, color: theme.aubergine, borderRadius: 5, padding: '8px 10px', fontSize: 12, fontWeight: 700, cursor: ['CONVERTED', 'CONVERTED_TO_CASE'].includes(selectedLead.status) ? 'not-allowed' : 'pointer', opacity: ['CONVERTED', 'CONVERTED_TO_CASE'].includes(selectedLead.status) ? 0.45 : 1 }}>Kontaktiert markieren</button>
                  <button disabled={!['CONTACTED', 'PARTNER_CONTACT_PENDING'].includes(selectedLead.status)} onClick={() => onConvert(selectedLead.id)} style={{ background: theme.aubergine, border: 'none', color: 'white', borderRadius: 5, padding: '9px 10px', fontSize: 12, fontWeight: 700, cursor: ['CONTACTED', 'PARTNER_CONTACT_PENDING'].includes(selectedLead.status) ? 'pointer' : 'not-allowed', opacity: ['CONTACTED', 'PARTNER_CONTACT_PENDING'].includes(selectedLead.status) ? 1 : 0.45 }}>{['ASSIGNED', 'ASSIGNED_TO_PARTNER'].includes(selectedLead.status) ? 'Erst Kontakt markieren' : 'In Kundenfall umwandeln'}</button>
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
export default function App({ initialRole = 'partner', initialUser, initialCaseId, initialTab, initialReturnTab, initialScreen, initialLeadCreate = false } = {}) {
  const urlCaseLocation = parseCaseLocation('kunde');
  const initialCaseLocation = {
    caseId: initialCaseId || urlCaseLocation.caseId,
    tab: normalizeCaseTab(initialTab || urlCaseLocation.tab),
    returnTab: normalizeCaseTab(initialReturnTab || urlCaseLocation.returnTab, ''),
  };
  const initialAppScreen = normalizeAppScreen(initialScreen || parseAppLocation('dashboard'));
  const [role, setRole] = useState(initialRole);
  const [screen, setScreen] = useState(initialCaseLocation.caseId ? 'case' : initialAppScreen);
  const [caseId, setCaseId] = useState(initialCaseLocation.caseId);
  const [caseInitialTab, setCaseInitialTab] = useState(initialCaseLocation.tab);
  const [caseReturnTab, setCaseReturnTab] = useState(initialCaseLocation.returnTab);
  const [editingCaseId, setEditingCaseId] = useState(null);
  const [cases, setCases] = useState(mockCases);
  const [leads, setLeads] = useState([]);
  const [partners, setPartners] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [staff, setStaff] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notice, setNotice] = useState('');
  const [loadingCases, setLoadingCases] = useState(false);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [profiles, setProfiles] = useState(() => ({
    ...defaultProfiles,
    [initialRole]: profileFromSessionUser(initialUser, defaultProfiles[initialRole] || {}),
  }));
  const [profileOpen, setProfileOpen] = useState(false);

  const rawUser = profiles[role] || defaultProfiles[role];
  const user = { ...rawUser, name: profileDisplayName(rawUser), initials: initialsFromName(profileDisplayName(rawUser)).toUpperCase() };
  const authenticatedRole = initialUser?.role || initialRole;
  const canUseAdminData = authenticatedRole === 'admin';
  const currentInternalRole = role === 'admin' ? (user.internalRole || 'employee') : undefined;
  const canViewStaff = role === 'admin' && ['admin', 'super_admin'].includes(currentInternalRole);
  const canManageStaff = role === 'admin' && currentInternalRole === 'super_admin';

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

      if (nextRole === 'admin' && canUseAdminData) {
        const partnerResponse = await fetch('/api/partners');
        const partnerPayload = await partnerResponse.json();
        if (partnerResponse.ok) {
          setPartners(partnerPayload.partners || []);
          setRegistrations(partnerPayload.registrations || []);
        }
      }
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Leads konnten nicht geladen werden');
    } finally {
      setLoadingLeads(false);
    }
  }

  async function loadStaff(nextRole = role) {
    if (nextRole !== 'admin' || !canUseAdminData) return;
    setLoadingStaff(true);
    try {
      await ensureDemoSession(nextRole);
      const response = await fetch('/api/staff');
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Mitarbeiter konnten nicht geladen werden');
      setStaff(payload.staff || []);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Mitarbeiter konnten nicht geladen werden');
    } finally {
      setLoadingStaff(false);
    }
  }

  async function loadNotifications(nextRole = role) {
    try {
      await ensureDemoSession(nextRole);
      const response = await fetch('/api/notifications');
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Benachrichtigungen konnten nicht geladen werden');
      setNotifications(payload.notifications || []);
    } catch {
      setNotifications([]);
    }
  }

  useEffect(() => {
    loadCases(initialRole);
    loadLeads(initialRole);
    loadStaff(initialRole);
    loadNotifications(initialRole);
  }, [initialRole]);

  useEffect(() => {
    const syncFromUrl = () => {
      const locationState = parseCaseLocation('kunde');
      if (locationState.caseId) {
        setCaseId(locationState.caseId);
        setCaseInitialTab(locationState.tab);
        setCaseReturnTab(locationState.returnTab);
        setEditingCaseId(null);
        setScreen('case');
      } else {
        setCaseId(null);
        setCaseInitialTab('kunde');
        setCaseReturnTab('');
        setScreen(parseAppLocation('dashboard'));
      }
    };
    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  useEffect(() => {
    try {
      const storedProfiles = window.localStorage.getItem('wohnkapital_profiles');
      if (storedProfiles) {
        setProfiles({
          ...defaultProfiles,
          ...JSON.parse(storedProfiles),
          [initialRole]: profileFromSessionUser(initialUser, JSON.parse(storedProfiles)[initialRole] || defaultProfiles[initialRole] || {}),
        });
      }
    } catch {
      // Profil bleibt im MVP in der laufenden Sitzung.
    }
  }, []);

  const handleNavigate = (s) => {
    if (s === 'staff' && !canViewStaff) {
      setNotice('Der Mitarbeiterbereich ist nur für Admins und Super-Admins sichtbar.');
      setScreen('dashboard');
      updateScreenUrl(role, 'dashboard');
      return;
    }
    const nextScreen = normalizeAppScreen(s);
    setScreen(nextScreen);
    setCaseId(null);
    setCaseInitialTab('kunde');
    setCaseReturnTab('');
    setEditingCaseId(null);
    updateScreenUrl(role, nextScreen, 'push');
    if (nextScreen === 'leads' || nextScreen === 'partners') loadLeads(role);
    if (nextScreen === 'staff') loadStaff(role);
  };
  const handleOpenCase = (id, tab = 'kunde', options = {}) => {
    const nextTab = normalizeCaseTab(tab);
    const nextReturnTab = options.returnTab ? normalizeCaseTab(options.returnTab, '') : '';
    setCaseId(id);
    setCaseInitialTab(nextTab);
    setCaseReturnTab(nextReturnTab);
    setEditingCaseId(null);
    setScreen('case');
    updateCaseUrl(role, id, nextTab, nextReturnTab, options.replace ? 'replace' : 'push');
  };
  const handleOpenLead = (id) => {
    setCaseId(null);
    setCaseInitialTab('kunde');
    setCaseReturnTab('');
    setEditingCaseId(null);
    setScreen('leads');
    const params = new URLSearchParams();
    params.set('screen', 'leads');
    params.set('lead', String(id));
    window.history.pushState({}, '', `${basePathForRole(role)}?${params.toString()}`);
    loadLeads(role);
  };
  const handleOpenSearchResult = (result) => {
    if (result?.type === 'lead') {
      handleOpenLead(result.id);
      return;
    }
    handleOpenCase(result.id, 'kunde');
  };
  const handleCaseTabChange = (tab) => {
    const nextTab = normalizeCaseTab(tab);
    setCaseInitialTab(nextTab);
    setCaseReturnTab('');
    if (caseId) updateCaseUrl(role, caseId, nextTab, '', 'replace');
  };
  const handleReturnToCaseTab = (tab) => {
    const nextTab = normalizeCaseTab(tab);
    setCaseInitialTab(nextTab);
    setCaseReturnTab('');
    if (caseId) updateCaseUrl(role, caseId, nextTab, '', 'push');
  };
  const handleOpenCurrentCaseChat = ({ caseId: currentCaseId, tab }) => {
    const sourceTab = normalizeCaseTab(tab || caseInitialTab);
    handleOpenCase(currentCaseId, 'chat', { returnTab: sourceTab === 'chat' ? '' : sourceTab });
  };
  const handleOpenNotification = async (item) => {
    handleOpenCase(item.propertyId || item.caseNumber, 'kunde');
    try {
      await postJson('/api/notifications/read', { notificationId: item.id, kind: 'process' });
      await loadNotifications(role);
    } catch {
      // Der Sprung in den Fall ist wichtiger als der Lesestatus.
    }
  };
  const handleOpenChatNotification = async (item) => {
    handleOpenCase(item.propertyId || item.caseNumber, 'chat', {
      returnTab: screen === 'case' && caseId === (item.propertyId || item.caseNumber) ? caseInitialTab : '',
    });
    try {
      await postJson('/api/notifications/read', { notificationId: item.id, kind: 'chat' });
      if (item.propertyId) await postJson(`/api/properties/${item.propertyId}/chat/read`, {});
      await loadNotifications(role);
      await loadCases(role);
    } catch {
      // Der Chat wird trotzdem geöffnet.
    }
  };
  const handleNewCase = () => {
    setEditingCaseId(null);
    setScreen('erfassung');
    updateScreenUrl(role, 'erfassung', 'push');
  };
  const handleEditCase = (id) => {
    setEditingCaseId(id);
    setCaseInitialTab('kunde');
    setCaseReturnTab('');
    setScreen('erfassung');
    updateScreenUrl(role, 'erfassung', 'push');
  };
  const handleBack = () => {
    setCaseInitialTab('kunde');
    setCaseReturnTab('');
    setEditingCaseId(null);
    setScreen('dashboard');
    updateScreenUrl(role, 'dashboard', 'push');
  };
  const handleSavedCase = async (id) => {
    await loadCases(role);
    setCaseId(id);
    setCaseInitialTab('kunde');
    setCaseReturnTab('');
    setEditingCaseId(null);
    setScreen('case');
    updateCaseUrl(role, id, 'kunde', '', 'push');
  };
  const handleNewLead = () => {
    if (role !== 'admin') {
      setNotice('Lead-Erfassung ist nur für interne Nutzer verfügbar.');
      return;
    }
    setCaseId(null);
    setEditingCaseId(null);
    setScreen('leads');
    updateLeadCreateUrl(role, true, 'push');
  };
  const handleSidebarQuickAction = (item) => {
    if (!item) return;
    if (item.key === 'new-lead') {
      handleNewLead();
      return;
    }
    if (item.key === 'new-case') {
      handleNewCase();
      return;
    }
    setNotice(`${item.label}: Die Erfassungsmaske wird im nächsten Schritt angebunden. Der Bereich "Sonstiges" ist geöffnet.`);
    setCaseId(null);
    setEditingCaseId(null);
    setScreen('other');
    updateScreenUrl(role, 'other', 'push');
  };
  const toggleRole = () => {
    if (!canUseAdminData) {
      setNotice('Für die Admin-Ansicht sind interne Rechte erforderlich.');
      return;
    }
    const nextRole = role === 'admin' ? 'partner' : 'admin';
    setRole(nextRole);
    setScreen('dashboard');
    setCaseId(null);
    setCaseInitialTab('kunde');
    setCaseReturnTab('');
    setEditingCaseId(null);
    setProfileOpen(false);
    updateScreenUrl(nextRole, 'dashboard');
    loadCases(nextRole);
    loadLeads(nextRole);
    loadStaff(nextRole);
    loadNotifications(nextRole);
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
  const handleAssignLead = async (leadId, assigneeValue) => {
    try {
      const [type, id] = String(assigneeValue || '').split(':');
      await postJson(`/api/leads/${leadId}/assign`, type === 'advisor' ? { advisorUserId: id } : { partnerId: id });
      setNotice('Lead wurde zugewiesen.');
      await loadLeads(role);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Lead konnte nicht zugewiesen werden');
    }
  };
  const handleCreateLead = async (leadDraft) => {
    try {
      const payload = Object.fromEntries(Object.entries(leadDraft).map(([key, value]) => [key, value === '' ? undefined : value]));
      if (payload.assignedPartnerId && !payload.routingReason) {
        throw new Error('Bitte erfassen Sie den Routing-Grund, wenn der Lead direkt an einen Makler weitergeleitet wird.');
      }
      await postJson('/api/leads', payload);
      setNotice(payload.assignedPartnerId ? 'Lead wurde erfasst und an den Makler weitergeleitet.' : 'Lead wurde erfasst.');
      await loadLeads(role);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Lead konnte nicht erfasst werden');
      throw err;
    }
  };
  const handleMarkLeadContacted = async (leadId) => {
    try {
      await patchJson(`/api/leads/${leadId}/status`, { status: 'PARTNER_CONTACT_PENDING' });
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
      setCaseInitialTab('kunde');
      setCaseReturnTab('');
      setScreen('case');
      updateCaseUrl(role, payload.case?.property?.caseNumber || payload.case?.property?.id || null, 'kunde', '', 'push');
      setNotice('Lead wurde in einen Kundenfall umgewandelt.');
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Lead konnte nicht umgewandelt werden');
    }
  };
  const handleSetPartnerStatus = async (partnerId, status) => {
    try {
      await patchJson(`/api/partners/${partnerId}`, { status });
      setNotice(status === 'active' ? 'Maklerzugang wurde freigeschaltet.' : 'Maklerzugang wurde gesperrt.');
      await loadLeads('admin');
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Maklerzugang konnte nicht aktualisiert werden');
    }
  };
  const handleDeletePartner = async (partner) => {
    if (!window.confirm(`Partner "${partner.companyName || partner.contactName}" wirklich löschen? Wenn bereits Fälle oder Leads verknüpft sind, wird das Löschen blockiert.`)) return;
    try {
      const response = await fetch(`/api/partners/${partner.id}`, { method: 'DELETE' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Partner konnte nicht gelöscht werden');
      setNotice('Partner wurde gelöscht.');
      await loadLeads('admin');
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Partner konnte nicht gelöscht werden');
    }
  };
  const handleCreateStaff = async (staffInput) => {
    try {
      await postJson('/api/staff', staffInput);
      setNotice('Mitarbeiter wurde angelegt.');
      await loadStaff('admin');
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Mitarbeiter konnte nicht angelegt werden');
    }
  };
  const handleUpdateStaffRole = async (staffId, internalRole) => {
    try {
      await patchJson(`/api/staff/${staffId}`, { internalRole });
      setNotice('Mitarbeiterrolle wurde aktualisiert.');
      await loadStaff('admin');
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Mitarbeiterrolle konnte nicht geändert werden');
    }
  };
  const handleDeleteStaff = async (member) => {
    if (!window.confirm(`Mitarbeiter "${member.name}" wirklich löschen? Bestehende Aktivitäten bleiben aus Nachvollziehbarkeitsgründen im Verlauf erhalten.`)) return;
    try {
      const response = await fetch(`/api/staff/${member.id}`, { method: 'DELETE' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Mitarbeiter konnte nicht gelöscht werden');
      setNotice('Mitarbeiter wurde gelöscht.');
      await loadStaff('admin');
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Mitarbeiter konnte nicht gelöscht werden');
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
  const unreadNotifications = notifications.filter((item) => !item.readByCurrentUser && item.entityType !== 'chat');
  const unreadChatNotifications = notifications
    .filter((item) => !item.readByCurrentUser && item.entityType === 'chat')
    .map((item) => ({
      ...item,
      authorName: item.actorName || (item.source === 'admin' ? 'Admin' : item.source === 'partner' ? 'Makler' : 'System'),
    }));
  const processNotifications = unreadNotifications.length ? unreadNotifications : buildProcessNotifications(cases).slice(0, 0);
  const chatNotifications = unreadChatNotifications.length ? unreadChatNotifications : buildChatNotifications(cases).slice(0, 0);
  const editingCase = editingCaseId ? cases.find((item) => item.propertyId === editingCaseId || item.id === editingCaseId)?.raw : null;

  return (
    <div style={{ background: theme.mint, fontFamily: '"Inter", "Aptos", "Segoe UI", system-ui, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        role={role}
        user={user}
        onRoleToggle={toggleRole}
        canToggleRole={canUseAdminData}
        onLogout={handleLogout}
        onProfileOpen={() => setProfileOpen(true)}
        notifications={processNotifications}
        chatNotifications={chatNotifications}
        currentCaseContext={screen === 'case' && caseId ? { caseId, tab: caseInitialTab } : null}
        onOpenCase={handleOpenCase}
        onOpenSearchResult={handleOpenSearchResult}
        onOpenNotification={handleOpenNotification}
        onOpenChatNotification={handleOpenChatNotification}
        onOpenCurrentCaseChat={handleOpenCurrentCaseChat}
      />
      {profileOpen && <ProfileModal user={user} role={role} onClose={() => setProfileOpen(false)} onSave={handleSaveProfile} />}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Sidebar
          role={role}
          internalRole={currentInternalRole}
          currentScreen={screen}
          onNavigate={handleNavigate}
          onQuickAction={handleSidebarQuickAction}
          leadCount={leads.filter((lead) => role === 'admin' ? ['NEW', 'IN_REVIEW'].includes(lead.status) : !['CONVERTED', 'CONVERTED_TO_CASE', 'REJECTED', 'CLOSED'].includes(lead.status)).length}
          draftCount={filterCasesForScreen(cases, 'drafts').length}
          inProgressCount={filterCasesForScreen(cases, 'in_progress').length}
          portfolioCount={filterCasesForScreen(cases, 'portfolio').length}
          rejectedCount={cases.filter((item) => item.status === 'REJECTED' || item.status === 'LOST').length}
        />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {(notice || loadingCases || loadingLeads || loadingStaff) && (
            <div style={{ margin: '14px 28px 0', background: loadingCases ? theme.mintLight : theme.goldSoft, border: `1px solid ${loadingCases ? theme.border : `${theme.gold}55`}`, borderRadius: 6, padding: '9px 12px', fontSize: 12.5, color: theme.ink }}>
              {loadingCases ? 'Fälle werden geladen...' : loadingLeads ? 'Leads werden geladen...' : loadingStaff ? 'Mitarbeiter werden geladen...' : notice}
            </div>
          )}
          {screen === 'dashboard' && role === 'partner' && <BrokerDashboard cases={cases} leads={leads} user={user} onOpenCase={handleOpenCase} onNewCase={handleNewCase} onOpenLeads={() => handleNavigate('leads')} onShowAllCases={() => handleNavigate('in_progress')} />}
          {screen === 'dashboard' && role === 'admin' && <AdminDashboard cases={cases} leads={leads} onOpenCase={handleOpenCase} onNewCase={handleNewCase} onNewLead={handleNewLead} onOpenLeads={() => handleNavigate('leads')} canCreateCase={['admin', 'super_admin'].includes(currentInternalRole)} />}
          {screen === 'leads' && <LeadBoard role={role} leads={leads} partners={partners} staff={staff} canAssignLeads={['employee', 'advisor', 'admin', 'super_admin'].includes(currentInternalRole)} initialCreateOpen={initialLeadCreate || readLeadCreateFromUrl()} initialSelectedLeadId={readLeadIdFromUrl()} onCreate={handleCreateLead} onAssign={handleAssignLead} onConvert={handleConvertLead} onMarkContacted={handleMarkLeadContacted} onUpdateStatus={handleUpdateLeadStatus} loading={loadingLeads} />}
          {screen === 'portfolio' && <PortfolioScreen cases={cases} onOpenCase={handleOpenCase} role={role} />}
          {['drafts', 'in_progress', 'sold', 'rejected'].includes(screen) && <CaseMenuScreen screen={screen} cases={cases} onOpenCase={handleOpenCase} role={role} />}
          {screen === 'partners' && role === 'admin' && <PartnerDirectory partners={partners} registrations={registrations} leads={leads} onSetPartnerStatus={handleSetPartnerStatus} onDeletePartner={handleDeletePartner} />}
          {screen === 'staff' && canViewStaff && <StaffDirectory staff={staff} canManageStaff={canManageStaff} onCreateStaff={handleCreateStaff} onUpdateStaffRole={handleUpdateStaffRole} onDeleteStaff={handleDeleteStaff} />}
          {screen === 'other' && <SimpleMenuScreen title="Sonstiges" text="Hier bündeln wir später Sonderfälle, interne Notizen, nicht zuordenbare Vorgänge und administrative Ablagen. Für das MVP ist die Ansicht als sauberer Sammelpunkt vorbereitet." />}
          {screen === 'knowledge_brochure' && <SimpleMenuScreen title="Broschüre" eyebrow="Wissen" text="Hier kann später die aktuelle WohnKapital-Broschüre als Download, Vorschau oder Link hinterlegt werden." />}
          {screen === 'knowledge_atlas' && <PostbankWohnatlasScreen />}
          {screen === 'knowledge_guide' && <SimpleMenuScreen title="Leitfaden" eyebrow="Wissen" text="Hier entsteht der interne Leitfaden für Makler: Datenerfassung, Pflichtunterlagen, Rückfragen und strukturierte Einreichung an WohnKapital." />}
          {screen === 'knowledge_faq' && <SimpleMenuScreen title="FAQs" eyebrow="Wissen" text="Hier sammeln wir die häufigsten Fragen von Maklern, Kunden und internen Mitarbeitern mit kurzen, freigegebenen Antworten." />}
          {screen === 'case' && <FallDetail caseId={caseId} initialTab={caseInitialTab} returnTab={caseReturnTab} onTabChange={handleCaseTabChange} onReturnToTab={handleReturnToCaseTab} onBack={handleBack} role={role} internalRole={currentInternalRole} cases={cases} onRefresh={() => loadCases(role)} onNotificationsRefresh={() => loadNotifications(role)} setNotice={setNotice} onEdit={handleEditCase} />}
          {screen === 'erfassung' && <Erfassung onBack={handleBack} onSaved={handleSavedCase} setNotice={setNotice} initialCase={editingCase} role={role} internalRole={currentInternalRole} user={user} />}
        </div>
      </div>
    </div>
  );
}

