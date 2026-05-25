import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-content";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/partner/dashboard", "/partner/cases", "/api"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
