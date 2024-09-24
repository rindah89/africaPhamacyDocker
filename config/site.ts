export const siteConfig = {
  name: "MMA",
  title:
    "Buy Luxury Furniture, Fashion, Electronics in Cameroon | MMA Online Shopping",
  url:
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://inventory-app-ten-gilt.vercel.app/",
  ogImage:
    "https://res.cloudinary.com/jbwebdeveloper/image/upload/v1721451545/MMA_ECOMMERCE_erwber.png",
  description:
    "Shop Online for Electronics, Phones, Computers, Accessories, Fashion, Shoes, Household Equipments, Wines, Babies, Toys, Furnitures, Groceries, Sport and Fitness, Books and more in Nigeria from top brands with 100% satisfaction and fast shipping. Easy Online Shopping.",
  links: {
    twitter: "https://twitter.com/MMA",
    github: "https://github.com/MMA",
  },
};

export type SiteConfig = typeof siteConfig;
