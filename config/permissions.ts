export const permissions = [
  {
    display: "Dashboard",
    name: "canViewDashboard",
  },
  {
    display: "Users",
    name: "canViewUsers",
  },
  {
    display: "Roles",
    name: "canViewRoles",
  },
  {
    display: "Sales",
    name: "canViewSales",
  },
  {
    display: "Customers",
    name: "canViewCustomers",
  },
  {
    display: "Orders",
    name: "canViewOrders",
  },
  {
    display: "POS",
    name: "canViewPos",
  },
  {
    display: "Stock Purchase",
    name: "canViewStockPurchase",
  },
  {
    display: "Stock Adjustment",
    name: "canViewStockAdjustment",
  },

  {
    display: "API Integration",
    name: "canViewApi",
  },
  {
    display: "Reports",
    name: "canViewReports",
  },
  {
    display: "Settings",
    name: "canViewSettings",
  },
  {
    display: "Main Categories",
    name: "canViewMainCategories",
  },
  {
    display: "Categories",
    name: "canViewCategories",
  },
  {
    display: "Sub Categories",
    name: "canViewSubCategories",
  },
  {
    display: "Brands",
    name: "canViewBrands",
  },
  {
    display: "Adverts",
    name: "canViewAdverts",
  },
  {
    display: "Banners",
    name: "canViewBanners",
  },
  {
    display: "Units",
    name: "canViewUnits",
  },
  {
    display: "Products",
    name: "canViewProducts",
  },
  {
    display: "Warehouses",
    name: "canViewWarehouses",
  },
  {
    display: "Suppliers",
    name: "canViewSuppliers",
  },
];

// permissions.ts
export const permissionsObj = {
  canViewDashboard: "canViewDashboard",
  canViewUsers: "canViewUsers",
  canViewRoles: "canViewRoles",
  canViewSales: "canViewSales",
  canViewCustomers: "canViewCustomers",
  canViewOrders: "canViewOrders",
  canViewPos: "canViewPos",
  canViewStockPurchase: "canViewStockPurchase",
  canViewStockAdjustment: "canViewStockAdjustment",
  canViewApi: "canViewApi",
  canViewReports: "canViewReports",
  canViewSettings: "canViewSettings",
  canViewMainCategories: "canViewMainCategories",
  canViewCategories: "canViewCategories",
  canViewSubCategories: "canViewSubCategories",
  canViewBrands: "canViewBrands",
  canViewAdverts: "canViewAdverts",
  canViewBanners: "canViewBanners",
  canViewUnits: "canViewUnits",
  canViewProducts: "canViewProducts",
  canViewWarehouses: "canViewWarehouses",
  canViewSuppliers: "canViewSuppliers",
} as const;

export type PermissionKey = keyof typeof permissionsObj;
