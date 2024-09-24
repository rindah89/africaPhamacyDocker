import { ISidebarLink } from "@/types/types";

export function filterLinks(links: ISidebarLink[], user: any) {
  return links.filter((link) => {
    const hasAccess = user.role[link.access];
    if (link.dropdown && link.dropdownMenu) {
      link.dropdownMenu = link.dropdownMenu.filter(
        (subLink) => user.role[subLink.access]
      );
    }
    return hasAccess;
  });
}
