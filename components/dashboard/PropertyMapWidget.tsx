"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Marker = {
  id: string;
  caseNumber: string;
  objectTitle: string | null;
  address: string;
  status: string;
  desiredModel: string;
  customerName: string | null;
  partnerName: string | null;
  marketValue: number | null;
  payoutAmount: number | null;
  latitude: number;
  longitude: number;
  geocodingSource: string;
};

type ApiResponse = {
  markers: Marker[];
  statusFilter: string[];
};

type PropertyMapWidgetProps = {
  fillHeight?: boolean;
  height?: number;
};

const STATUS_GROUPS: { label: string; statuses: string[] }[] = [
  {
    label: "In Bearbeitung",
    statuses: [
      "SUBMITTED",
      "DATA_INCOMPLETE",
      "VALUATION_PENDING",
      "VALUATED",
      "OFFER_CALCULATED",
      "OFFER_DRAFTED",
      "INTERNAL_REVIEW",
      "APPROVED",
    ],
  },
  {
    label: "Angebote und Gutachten",
    statuses: [
      "SENT",
      "INDICATIVE_OFFER_SENT",
      "OFFER_ACCEPTED",
      "EXPERT_OPINION_ORDERED",
      "EXPERT_OPINION_RECEIVED",
      "BINDING_OFFER_SENT",
      "BINDING_OFFER_ACCEPTED",
    ],
  },
  {
    label: "Ankauf / Bestand",
    statuses: ["PURCHASE_STARTED", "NOTARY_APPOINTMENT", "PURCHASED", "IN_PORTFOLIO", "WON"],
  },
  {
    label: "Abgeschlossen / Verloren",
    statuses: ["APPOINTMENT_SCHEDULED", "REJECTED", "SOLD", "LOST", "DRAFT"],
  },
];

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "#3B82F6",
  DATA_INCOMPLETE: "#F59E0B",
  VALUATION_PENDING: "#8B5CF6",
  VALUATED: "#8B5CF6",
  OFFER_CALCULATED: "#10B981",
  OFFER_DRAFTED: "#10B981",
  INTERNAL_REVIEW: "#F59E0B",
  APPROVED: "#10B981",
  SENT: "#10B981",
  INDICATIVE_OFFER_SENT: "#10B981",
  OFFER_ACCEPTED: "#059669",
  EXPERT_OPINION_ORDERED: "#0EA5E9",
  EXPERT_OPINION_RECEIVED: "#0EA5E9",
  BINDING_OFFER_SENT: "#059669",
  BINDING_OFFER_ACCEPTED: "#047857",
  PURCHASE_STARTED: "#A855F7",
  NOTARY_APPOINTMENT: "#A855F7",
  PURCHASED: "#7C3AED",
  IN_PORTFOLIO: "#7C3AED",
  WON: "#7C3AED",
  SOLD: "#6B7280",
  LOST: "#EF4444",
  REJECTED: "#EF4444",
  DRAFT: "#9CA3AF",
  APPOINTMENT_SCHEDULED: "#3B82F6",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Entwurf",
  SUBMITTED: "Eingereicht",
  DATA_INCOMPLETE: "Daten unvollständig",
  VALUATION_PENDING: "Bewertung läuft",
  VALUATED: "Bewertung fertig",
  OFFER_CALCULATED: "Angebot berechnet",
  OFFER_DRAFTED: "Angebotsentwurf",
  INTERNAL_REVIEW: "Interne Prüfung",
  APPROVED: "Freigegeben",
  SENT: "Versendet",
  INDICATIVE_OFFER_SENT: "Unverbindliches Angebot abgegeben",
  OFFER_ACCEPTED: "Unverbindliches Angebot angenommen",
  EXPERT_OPINION_ORDERED: "Gutachten beauftragt",
  EXPERT_OPINION_RECEIVED: "Gutachten eingegangen",
  BINDING_OFFER_SENT: "Verbindliches Angebot abgegeben",
  BINDING_OFFER_ACCEPTED: "Verbindliches Angebot angenommen",
  PURCHASE_STARTED: "Ankauf gestartet",
  NOTARY_APPOINTMENT: "Notartermin vereinbart",
  PURCHASED: "Kaufvertrag abgeschlossen",
  IN_PORTFOLIO: "Im Bestand",
  APPOINTMENT_SCHEDULED: "Termin vereinbart",
  REJECTED: "Abgelehnt",
  WON: "Gewonnen",
  SOLD: "Verkauft",
  LOST: "Verloren",
};

// Default-Filter spiegelt das Backend wider (alles außer DRAFT, REJECTED, LOST).
const DEFAULT_ENABLED = STATUS_GROUPS.flatMap((g) => g.statuses).filter(
  (s) => !["DRAFT", "REJECTED", "LOST"].includes(s)
);

export function PropertyMapWidget({ fillHeight = false, height = 288 }: PropertyMapWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const clusterRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);

  const [markers, setMarkers] = useState<Marker[]>([]);
  const [enabledStatuses, setEnabledStatuses] = useState<string[]>(DEFAULT_ENABLED);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Leaflet dynamisch laden (kein SSR).
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const leafletModule = await import("leaflet");
      const L = leafletModule.default ?? leafletModule;
      (window as any).L = L;
      await import("leaflet.markercluster");
      // Leaflet CSS muss zur Laufzeit zusätzlich eingebunden werden — siehe README.

      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        center: [51.16, 10.45],
        zoom: 6,
        scrollWheelZoom: false,
        zoomControl: true,
      });

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende',
        maxZoom: 18,
      }).addTo(map);

      const cluster = (L as any).markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 50,
      });
      map.addLayer(cluster);

      leafletRef.current = L;
      mapRef.current = map;
      clusterRef.current = cluster;
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Daten laden, wenn Filter wechselt.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const statusParam = enabledStatuses.join(",");
    fetch(`/api/properties/map?status=${encodeURIComponent(statusParam)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json() as Promise<ApiResponse>;
      })
      .then((data) => {
        if (cancelled) return;
        setMarkers(data.markers);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Unbekannter Fehler");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabledStatuses]);

  // Marker neu zeichnen, wenn sich Daten oder Karte ändern.
  useEffect(() => {
    const L = leafletRef.current;
    const cluster = clusterRef.current;
    if (!L || !cluster) return;

    cluster.clearLayers();

    markers.forEach((m) => {
      const color = STATUS_COLORS[m.status] ?? "#6B7280";
      const icon = L.divIcon({
        className: "wk-map-marker",
        html: `<span style="display:block;width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4)"></span>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const marker = L.marker([m.latitude, m.longitude], { icon });
      marker.bindPopup(buildPopupHtml(m), { maxWidth: 280 });
      cluster.addLayer(marker);
    });
  }, [markers]);

  const totalCount = markers.length;
  const grouped = useMemo(() => groupMarkersByStatus(markers), [markers]);

  const toggleStatus = (status: string) => {
    setEnabledStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const toggleGroup = (groupStatuses: string[]) => {
    const allEnabled = groupStatuses.every((s) => enabledStatuses.includes(s));
    setEnabledStatuses((prev) =>
      allEnabled ? prev.filter((s) => !groupStatuses.includes(s)) : Array.from(new Set([...prev, ...groupStatuses]))
    );
  };

  return (
    <div
      className="panel panel-pad"
      style={{
        padding: 0,
        overflow: "hidden",
        height: fillHeight ? "100%" : undefined,
        display: fillHeight ? "flex" : undefined,
        flexDirection: fillHeight ? "column" : undefined,
      }}
    >
      <div
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid var(--border, #E5E7EB)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Eingereichte Objekte</h3>
          <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "#6B7280" }}>
            {loading ? "Lädt…" : error ? `Fehler: ${error}` : `${totalCount} Objekte sichtbar`}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 220px",
          flex: fillHeight ? 1 : undefined,
          minHeight: fillHeight ? 0 : undefined,
        }}
      >
        <div
          ref={containerRef}
          style={{ height: fillHeight ? "100%" : height, minHeight: height, width: "100%", background: "#F3F4F6" }}
          aria-label="Deutschlandkarte der eingereichten Objekte"
        />
        <aside
          style={{
            borderLeft: "1px solid var(--border, #E5E7EB)",
            padding: "12px 14px",
            overflowY: "auto",
            maxHeight: fillHeight ? "none" : height,
            fontSize: 12,
          }}
        >
          {STATUS_GROUPS.map((group) => {
            const allEnabled = group.statuses.every((s) => enabledStatuses.includes(s));
            const someEnabled = group.statuses.some((s) => enabledStatuses.includes(s));
            return (
              <div key={group.label} style={{ marginBottom: 10 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontWeight: 700,
                    cursor: "pointer",
                    marginBottom: 4,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={allEnabled}
                    ref={(el) => {
                      if (el) el.indeterminate = !allEnabled && someEnabled;
                    }}
                    onChange={() => toggleGroup(group.statuses)}
                  />
                  {group.label}
                </label>
                <div style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 2 }}>
                  {group.statuses.map((status) => (
                    <label
                      key={status}
                      style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
                    >
                      <input
                        type="checkbox"
                        checked={enabledStatuses.includes(status)}
                        onChange={() => toggleStatus(status)}
                      />
                      <span
                        style={{
                          display: "inline-block",
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: STATUS_COLORS[status] ?? "#6B7280",
                        }}
                      />
                      <span style={{ color: "#374151" }}>{labelForStatus(status)}</span>
                      <span style={{ marginLeft: "auto", color: "#9CA3AF" }}>
                        {grouped[status] ?? 0}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </aside>
      </div>
    </div>
  );
}

function buildPopupHtml(m: Marker): string {
  const lines: string[] = [];
  lines.push(`<div style="font-size:12px;line-height:1.45">`);
  lines.push(
    `<div style="font-weight:700;font-size:13px;margin-bottom:4px">${escapeHtml(m.caseNumber)}</div>`
  );
  if (m.objectTitle) {
    lines.push(`<div style="color:#6B7280;margin-bottom:4px">${escapeHtml(m.objectTitle)}</div>`);
  }
  lines.push(`<div><strong>Status:</strong> ${escapeHtml(labelForStatus(m.status))}</div>`);
  lines.push(`<div><strong>Modell:</strong> ${labelForModel(m.desiredModel)}</div>`);
  if (m.customerName) {
    lines.push(`<div><strong>Kunde:</strong> ${escapeHtml(m.customerName)}</div>`);
  }
  if (m.partnerName) {
    lines.push(`<div><strong>Partner:</strong> ${escapeHtml(m.partnerName)}</div>`);
  }
  lines.push(`<div><strong>Adresse:</strong> ${escapeHtml(m.address)}</div>`);
  if (m.marketValue !== null) {
    lines.push(`<div><strong>Marktwert:</strong> ${formatEuro(m.marketValue)}</div>`);
  }
  if (m.payoutAmount !== null) {
    lines.push(`<div><strong>Auszahlung:</strong> ${formatEuro(m.payoutAmount)}</div>`);
  }
  if (m.geocodingSource === "plz_region") {
    lines.push(
      `<div style="color:#9CA3AF;font-size:10px;margin-top:6px">Position: ungefähr (PLZ-Region)</div>`
    );
  }
  lines.push(`</div>`);
  return lines.join("");
}

function groupMarkersByStatus(markers: Marker[]): Record<string, number> {
  return markers.reduce<Record<string, number>>((acc, m) => {
    acc[m.status] = (acc[m.status] ?? 0) + 1;
    return acc;
  }, {});
}

function labelForStatus(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

function labelForModel(model: string): string {
  if (model === "sale_and_leaseback") return "Rückmietverkauf";
  if (model === "fixed_residential_right") return "Wohnrecht";
  return model;
}

function formatEuro(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
