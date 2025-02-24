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

};
