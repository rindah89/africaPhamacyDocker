import { ISidebarLink } from "@/types/types";

export function filterLinks(links: ISidebarLink[], user: any) {
  return links.filter((link) => {
    // Always show Insurance Partners
    if (link.title === "Insurance Partners") {
      return true;
    }
    
    if (link.access === "public") {
      return true; // Always show public links
    }
    
    const hasAccess = user?.role?.[link.access];
    
    if (link.dropdown && link.dropdownMenu) {
      link.dropdownMenu = link.dropdownMenu.filter((subLink) => {
        if (subLink.access === "public") {
          return true; // Always show public sub-links
        }
        return user?.role?.[subLink.access];
      });
    }
    return hasAccess;
  });
}
