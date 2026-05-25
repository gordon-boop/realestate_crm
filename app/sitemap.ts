import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-content";

const routes = [
  "/",
  "/haus-verkaufen-wohnen-bleiben",
  "/wohnrecht-auf-zeit",
  "/sale-leaseback",
  "/alternative-zum-teilverkauf",
  "/sicherheit",
  "/so-funktioniert-es",
  "/faq",
  "/ueber-uns",
  "/partner",
  "/impressum",
  "/datenschutz",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return routes.map((route) => ({
    url: absoluteUrl(route),
    lastModified: now,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
