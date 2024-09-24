import { siteConfig } from "@/config/site";

export default function robots() {
  const baseUrl = siteConfig.url;
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/product", "/categories", "/brands"],
      disallow: [],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
