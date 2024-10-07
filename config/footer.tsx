import Logo from "@/components/global/Logo";
import { Headset, Mail, MapPin } from "lucide-react";

export const footer = {
  logo: <Logo />,
  summary:
    "Your trusted partner in health. Karen Pharmacy: Quality medications and expert care, all in one place!",
  contacts: [
    {
      label: "(+237) 675 708 688",
      icon: Headset,
    },
    {
      label: "kpharmdla@gmail.com",
      icon: Mail,
    },
    {
      label: "Bojongo, Petrolex Douala",
      icon: MapPin,
    },
  ],
  navigation: [
   
    {
      title: "Karen Pharmacy",
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
