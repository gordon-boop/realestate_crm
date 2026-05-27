// PLZ-Leitregionen (zweistellig) → ungefährer Mittelpunkt in Deutschland.
// Reichweite je Region ca. 30–80 km. Für ein Dashboard-Widget (Übersicht
// "wo liegen unsere Objekte") absolut ausreichend, ohne externe Geocoding-API.
//
// Quelle: OpenStreetMap-Centroids der deutschen Postleitregionen.
// Lizenz: ODbL (OpenStreetMap), zulässig zur Nutzung mit Attribution.
//
// Erweiterungsoption: Wer feinere Auflösung will, ersetzt diese Datei durch
// eine 3-stellige Lookup-Tabelle (~720 Einträge) oder rüstet echtes Geocoding
// via Nominatim/Photon nach. Die API in lib/postal-code-geocoding.ts bleibt
// dabei stabil.

export const PLZ_REGION_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  "01": { lat: 51.05, lng: 13.74 }, // Dresden
  "02": { lat: 51.18, lng: 14.43 }, // Bautzen / Görlitz
  "03": { lat: 51.76, lng: 14.33 }, // Cottbus
  "04": { lat: 51.34, lng: 12.37 }, // Leipzig
  "06": { lat: 51.48, lng: 11.97 }, // Halle / Sachsen-Anhalt-Süd
  "07": { lat: 50.93, lng: 11.59 }, // Gera / Jena
  "08": { lat: 50.72, lng: 12.49 }, // Zwickau / Vogtland
  "09": { lat: 50.83, lng: 12.92 }, // Chemnitz
  "10": { lat: 52.52, lng: 13.40 }, // Berlin Mitte
  "12": { lat: 52.45, lng: 13.45 }, // Berlin Süd
  "13": { lat: 52.58, lng: 13.40 }, // Berlin Nord
  "14": { lat: 52.40, lng: 12.99 }, // Potsdam / Brandenburg
  "15": { lat: 52.34, lng: 14.55 }, // Frankfurt (Oder)
  "16": { lat: 52.83, lng: 13.24 }, // Oranienburg / Eberswalde
  "17": { lat: 53.56, lng: 13.26 }, // Neubrandenburg
  "18": { lat: 54.09, lng: 12.13 }, // Rostock
  "19": { lat: 53.62, lng: 11.41 }, // Schwerin
  "20": { lat: 53.55, lng: 9.99 },  // Hamburg
  "21": { lat: 53.45, lng: 10.13 }, // Hamburg Süd / Lüneburg
  "22": { lat: 53.60, lng: 9.99 },  // Hamburg Nord
  "23": { lat: 53.87, lng: 10.69 }, // Lübeck / Ostholstein
  "24": { lat: 54.32, lng: 10.13 }, // Kiel / Rendsburg
  "25": { lat: 54.19, lng: 9.10 },  // Itzehoe / Heide
  "26": { lat: 53.14, lng: 7.97 },  // Oldenburg / Emden
  "27": { lat: 53.18, lng: 8.65 },  // Bremerhaven / Verden
  "28": { lat: 53.08, lng: 8.80 },  // Bremen
  "29": { lat: 52.85, lng: 10.55 }, // Celle / Uelzen
  "30": { lat: 52.37, lng: 9.74 },  // Hannover
  "31": { lat: 52.15, lng: 9.95 },  // Hildesheim / Hameln
  "32": { lat: 52.02, lng: 8.53 },  // Bielefeld / Minden
  "33": { lat: 51.72, lng: 8.75 },  // Paderborn
  "34": { lat: 51.31, lng: 9.49 },  // Kassel
  "35": { lat: 50.80, lng: 8.77 },  // Marburg / Gießen
  "36": { lat: 50.55, lng: 9.68 },  // Fulda
  "37": { lat: 51.53, lng: 9.93 },  // Göttingen
  "38": { lat: 52.27, lng: 10.52 }, // Braunschweig / Wolfsburg
  "39": { lat: 52.13, lng: 11.62 }, // Magdeburg
  "40": { lat: 51.23, lng: 6.78 },  // Düsseldorf
  "41": { lat: 51.18, lng: 6.44 },  // Mönchengladbach
  "42": { lat: 51.26, lng: 7.15 },  // Wuppertal / Solingen
  "44": { lat: 51.51, lng: 7.47 },  // Dortmund
  "45": { lat: 51.46, lng: 7.01 },  // Essen
  "46": { lat: 51.55, lng: 6.62 },  // Oberhausen / Wesel
  "47": { lat: 51.43, lng: 6.76 },  // Duisburg / Krefeld
  "48": { lat: 51.96, lng: 7.63 },  // Münster
  "49": { lat: 52.28, lng: 8.05 },  // Osnabrück
  "50": { lat: 50.94, lng: 6.96 },  // Köln
  "51": { lat: 50.96, lng: 7.12 },  // Köln Ost / Bergisches Land
  "52": { lat: 50.78, lng: 6.08 },  // Aachen
  "53": { lat: 50.74, lng: 7.10 },  // Bonn
  "54": { lat: 49.75, lng: 6.64 },  // Trier
  "55": { lat: 49.99, lng: 8.27 },  // Mainz / Bingen
  "56": { lat: 50.36, lng: 7.59 },  // Koblenz
  "57": { lat: 50.88, lng: 8.02 },  // Siegen
  "58": { lat: 51.36, lng: 7.46 },  // Hagen / Iserlohn
  "59": { lat: 51.58, lng: 7.96 },  // Hamm / Soest
  "60": { lat: 50.11, lng: 8.68 },  // Frankfurt Mitte
  "61": { lat: 50.32, lng: 8.61 },  // Bad Homburg / Wetterau
  "63": { lat: 50.10, lng: 8.95 },  // Offenbach / Hanau
  "64": { lat: 49.87, lng: 8.65 },  // Darmstadt
  "65": { lat: 50.08, lng: 8.24 },  // Wiesbaden
  "66": { lat: 49.24, lng: 7.00 },  // Saarbrücken
  "67": { lat: 49.45, lng: 8.30 },  // Ludwigshafen / Kaiserslautern
  "68": { lat: 49.49, lng: 8.47 },  // Mannheim
  "69": { lat: 49.40, lng: 8.69 },  // Heidelberg
  "70": { lat: 48.78, lng: 9.18 },  // Stuttgart
  "71": { lat: 48.86, lng: 9.20 },  // Ludwigsburg / Böblingen
  "72": { lat: 48.52, lng: 9.05 },  // Tübingen / Reutlingen
  "73": { lat: 48.80, lng: 9.78 },  // Schwäbisch Gmünd / Aalen
  "74": { lat: 49.14, lng: 9.22 },  // Heilbronn
  "75": { lat: 48.89, lng: 8.70 },  // Pforzheim
  "76": { lat: 49.01, lng: 8.40 },  // Karlsruhe
  "77": { lat: 48.46, lng: 7.94 },  // Offenburg
  "78": { lat: 47.99, lng: 8.46 },  // Tuttlingen / Konstanz
  "79": { lat: 47.99, lng: 7.85 },  // Freiburg
  "80": { lat: 48.14, lng: 11.58 }, // München Mitte
  "81": { lat: 48.10, lng: 11.60 }, // München Süd
  "82": { lat: 47.96, lng: 11.30 }, // Starnberg / Garmisch
  "83": { lat: 47.86, lng: 12.12 }, // Rosenheim / Traunstein
  "84": { lat: 48.55, lng: 12.15 }, // Landshut
  "85": { lat: 48.45, lng: 11.50 }, // Ingolstadt / Freising
  "86": { lat: 48.37, lng: 10.90 }, // Augsburg
  "87": { lat: 47.73, lng: 10.31 }, // Kempten / Allgäu
  "88": { lat: 47.78, lng: 9.61 },  // Ravensburg / Friedrichshafen
  "89": { lat: 48.40, lng: 9.99 },  // Ulm
  "90": { lat: 49.45, lng: 11.08 }, // Nürnberg
  "91": { lat: 49.58, lng: 10.99 }, // Erlangen / Ansbach
  "92": { lat: 49.45, lng: 12.13 }, // Amberg / Weiden
  "93": { lat: 49.02, lng: 12.10 }, // Regensburg
  "94": { lat: 48.57, lng: 13.46 }, // Passau / Deggendorf
  "95": { lat: 50.08, lng: 11.95 }, // Hof / Bayreuth
  "96": { lat: 50.26, lng: 10.96 }, // Bamberg / Coburg
  "97": { lat: 49.79, lng: 9.95 },  // Würzburg
  "98": { lat: 50.68, lng: 10.71 }, // Suhl / Meiningen
  "99": { lat: 50.98, lng: 11.03 }, // Erfurt / Weimar
};

// Wenn keine Region matched, fallback auf geografische Mitte Deutschlands.
export const GERMANY_CENTER = { lat: 51.16, lng: 10.45 };
