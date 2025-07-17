import { ISidebarLink } from "@/types/types";

export function filterLinks(links: ISidebarLink[], user: any) {
  return links.filter((link) => {
    // Always show public links
    if (link.access === "public") {
      return true;
    }
    
    // If user role is NOT "Customer", show everything
    if (user?.role?.roleName !== "customer") {
      // Filter dropdown menu items for non-customers (show all)
      if (link.dropdown && link.dropdownMenu) {
        link.dropdownMenu = link.dropdownMenu.filter((subLink) => {
          if (subLink.access === "public") {
            return true;
          }
          // Show all dropdown items to non-customers
          return user?.role?.roleName !== "customer";
        });
      }
      return true; // Show all main links to non-customers
    }
    
    // For customers, only show specific links if they have explicit access
    const hasAccess = user?.role?.[link.access];
    
    if (link.dropdown && link.dropdownMenu) {
      link.dropdownMenu = link.dropdownMenu.filter((subLink) => {
        if (subLink.access === "public") {
          return true;
        }
        return user?.role?.[subLink.access];
      });
    }
    return hasAccess;
  });
}
