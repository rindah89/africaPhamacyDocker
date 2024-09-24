import { ISidebarLink } from "@/types/types";
import {
  BaggageClaim,
  BarChart2,
  BarChart4,
  Bell,
  Cable,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  FolderTree,
  Home,
  LineChart,
  Package,
  Package2,
  Plus,
  Power,
  Presentation,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";

export const sidebarLinks: ISidebarLink[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    dropdown: false,
    access: "canViewDashboard",
  },
  {
    title: "Users",
    icon: Users,
    href: "/dashboard/users",
    dropdown: true,
    access: "canViewUsers",
    dropdownMenu: [
      {
        title: "Users",
        href: "/dashboard/users",
        access: "canViewUsers",
      },
      {
        title: "Roles",
        href: "/dashboard/users/roles",
        access: "canViewRoles",
      },
    ],
  },
  {
    title: "Inventory",
    icon: BaggageClaim,
    dropdown: true,
    href: "/dashboard/inventory/products",
    access: "canViewProducts",
    dropdownMenu: [
      {
        title: "Main Categories",
        href: "/dashboard/inventory/main-categories",
        access: "canViewMainCategories",
      },
      {
        title: "Categories",
        href: "/dashboard/inventory/categories",
        access: "canViewCategories",
      },
      {
        title: "Sub Categories",
        href: "/dashboard/inventory/sub-categories",
        access: "canViewSubCategories",
      },
      {
        title: "Brands",
        href: "/dashboard/inventory/brands",
        access: "canViewBrands",
      },
      {
        title: "Adverts",
        href: "/dashboard/inventory/adverts",
        access: "canViewAdverts",
      },
      {
        title: "Banners",
        href: "/dashboard/inventory/banners",
        access: "canViewBanners",
      },
      {
        title: "Units",
        href: "/dashboard/inventory/units",
        access: "canViewUnits",
      },
      {
        title: "Products",
        href: "/dashboard/inventory/products",
        access: "canViewProducts",
      },
      {
        title: "Warehouse",
        href: "/dashboard/inventory/warehouse",
        access: "canViewWarehouses",
      },
      {
        title: "Suppliers",
        href: "/dashboard/inventory/suppliers",
        access: "canViewSuppliers",
      },
    ],
  },
  {
    title: "Sales",
    icon: CircleDollarSign,
    dropdown: true,
    href: "/dashboard/sales",
    access: "canViewSales",
    dropdownMenu: [
      {
        title: "Sales",
        href: "/dashboard/sales",
        access: "canViewSales",
      },
      {
        title: "Customers",
        href: "/dashboard/sales/customers",
        access: "canViewCustomers",
      },
    ],
  },
  {
    title: "Orders",
    href: "/dashboard/orders",
    icon: BarChart2,
    dropdown: false,
    access: "canViewOrders",
  },
  {
    title: "POS",
    href: "/pos",
    icon: Presentation,
    dropdown: false,
    access: "canViewPos",
  },
  {
    title: "Stock",
    icon: FolderTree,
    dropdown: true,
    href: "/dashboard/stock/purchase",
    access: "canViewStockPurchase",
    dropdownMenu: [
      {
        title: "Stock Purchase",
        href: "/dashboard/stock/purchase",
        access: "canViewStockPurchase",
      },
      {
        title: "Stock Adjustment",
        href: "/dashboard/stock/adjustment",
        access: "canViewStockAdjustment",
      },
    ],
  },
  {
    title: "API Integrations",
    href: "/dashboard/api",
    icon: Cable,
    dropdown: false,
    access: "canViewApi",
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    dropdown: false,
    access: "canViewSettings",
  },

  {
    title: "Reports",
    icon: BarChart4,
    dropdown: true,
    href: "/dashboard/reports/products",
    access: "canViewReports",
    dropdownMenu: [
      {
        title: "Product Report",
        href: "/dashboard/reports/products",
        access: "canViewProducts",
      },
      {
        title: "Inventory Report",
        href: "/dashboard/reports/inventory",
        access: "canViewProducts",
      },
      {
        title: "Customers Report",
        href: "/dashboard/reports/customers",
        access: "canViewCustomers",
      },
    ],
  },
];
