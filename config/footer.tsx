import Logo from "@/components/global/Logo";
import { Headset, Mail, MapPin } from "lucide-react";

export const footer = {
  logo: <Logo />,
  summary:
    "Welcome to MMA, Cameroon’s leading e-commerce platform specializing in premium interior décor, stylish furniture, luxurious textiles, and exclusive luxury car rentals. At MMA, we bring elegance and convenience together, offering you the finest products to enhance your living spaces and premium vehicles to elevate your travel experiences. Shop with MMA for sophistication, comfort, and style, all in one place!",
  contacts: [
    {
      label: "(+237) 699 78 30 99 / 699 00 00 24",
      icon: Headset,
    },
    {
      label: "info@cebmeublerie.com",
      icon: Mail,
    },
    {
      label: "ZI Douala Bassa BP 2362",
      icon: MapPin,
    },
  ],
  navigation: [
    {
      title: "Our Businesses",
      links: [
        {
          title: "Buisness Cars",
          path: "https://www.buisnesscars.net",
        },
        {
          title: "MMA Digital Agency",
          path: "https://www.mmadigitalagency.com",
        },
       
       
        {
          title: "Easy Ride",
          path: "https://www.easyride.cm",
        },

        {
          title: "Proclean",
          path: "https://www.proclean-cmr.com",
        },
      ],
    },
    {
      title: "MMA",
      links: [
        {
          title: "About Us",
          path: "/about-us",
        },
        {
          title: "Careers",
          path: "/careers",
        },
        {
          title: "Community",
          path: "/community",
        },
        {
          title: "Contact Us",
          path: "/contact-us",
        },
        {
          title: "Blogs",
          path: "/blogs",
        },
      ],
    },
    
    {
      title: "Company",
      links: [
        {
          title: "About Us",
          path: "/about-us",
        },
        {
          title: "Careers",
          path: "/careers",
        },
        {
          title: "Community",
          path: "/community",
        },
        {
          title: "Contact Us",
          path: "/contact-us",
        },
        {
          title: "Blogs",
          path: "/blogs",
        },
      ],
    },
  ],
};
