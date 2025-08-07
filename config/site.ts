export const siteConfig = {
  name: "Africa Pharmacy",
  title:
    "Africa Pharmacy Online",
  url:
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://inventory-app-ten-gilt.vercel.app/",
  ogImage:
    "https://res.cloudinary.com/jbwebdeveloper/image/upload/v1721451545/MMA_ECOMMERCE_erwber.png",
  description:
    "Shop online for prescription medications, over-the-counter drugs, health and wellness products, personal care items, and medical supplies. Africa Pharmacy offers a wide range of pharmaceutical products with expert advice, fast shipping, and reliable service. Your trusted online pharmacy for all your healthcare needs.",
  links: {
    twitter: "https://twitter.com/Africa Pharmacy",
    github: "https://github.com/Africa Pharmacy",
  },
};

export type SiteConfig = typeof siteConfig;
