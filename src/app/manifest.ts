import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LeadCRM - Lead Management Software",
    short_name: "LeadCRM",
    description: "AI-Powered Lead Management CRM",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      { src: "/icons/icon.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
  };
}
