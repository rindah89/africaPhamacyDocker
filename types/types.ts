import { LucideIcon } from "lucide-react";
import {
  User as PrismaUser,
  Customer as PrismaCustomer,
  Product as PrismaProduct,
  Category as PrismaCategory,
  SubCategory as PrismaSubCategory,
  LineOrder as PrismaLineOrder,
  PurchaseOrder as PrismaPurchaseOrder,
  Category,
  Role,
  MainCategory,
  SubCategory,
  AdvertSize,
  LineOrderItem,
  Sale,
  PurchaseOrderStatus,
  PurchaseOrderItem,
  Supplier,
} from "@prisma/client";
export interface ISidebarLink {
  title: string;
  href?: string;
  icon: LucideIcon;
  dropdown: boolean;
  access: string;
  dropdownMenu?: MenuItem[];
}
export interface LoginProps {
  email: string;
  password: string;
}

type MenuItem = {
  title: string;
  href: string;
  access: string;
};

export type CategoryProps = {
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  mainCategoryId: string;
  status: boolean;
};
export type AdjustmentProps = {
  reason: string;
};
export type BannerProps = {
  title: string;
  bannerLink: string;
  imageUrl: string;
  status: boolean;
};
export type AdvertProps = {
  title: string;
  link: string;
  imageUrl: string;
  status: boolean;
  size: AdvertSize;
};
export type MainCategoryProps = {
  title: string;
  slug: string;
};
export type SubCategoryProps = {
  title: string;
  slug: string;
  categoryId: string;
};
export type ExcelCategoryProps = {
  Image: string;
  Title: string;
  Description: string;
};

export type SelectOption = {
  label: string;
  value: number | string | boolean;
};

export type BrandProps = {
  title: string;
  slug: string;
  status: boolean;
  logo: string;
};
export type UnitProps = {
  title: string;
  abbreviation: string;
};
export type WarehouseProps = {
  name: string;
  slug: string;
  logo: string;
  country: string;
  city: string;
  phone: string;
  email: string;
  zipCode: string;
  contactPerson: string;
  status: boolean;
};
export type SupplierProps = {
  name: string;
  imageUrl: string;
  companyName: string;
  vatNumber: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  status: boolean;
};

export type ProductProps = {
  name: string;
  slug: string;
  productCode: string;
  stockQty: number;
  brandId: string;
  supplierId: string;
  subCategoryId: string;
  unitId: string;
  productCost: number;
  productPrice: number;
  supplierPrice: number;
  alertQty: number;
  productTax: number;
  productThumbnail: string;
  taxMethod: string;
  batchNumber: string;
  content?: string;
  expiryDate: string;
  isFeatured: boolean;
  status: boolean;
  productImages: string[];
  productDetails: string;
};

export interface RoleProps {
  displayName: string;
  roleName: string;
  description: string;

  canViewDashboard: boolean;
  canViewUsers: boolean;
  canAddUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canViewRoles: boolean;
  canAddRoles: boolean;
  canEditRoles: boolean;
  canDeleteRoles: boolean;
  canViewSales: boolean;
  canAddSales: boolean;
  canEditSales: boolean;
  canDeleteSales: boolean;
  canViewCustomers: boolean;
  canAddCustomers: boolean;
  canEditCustomers: boolean;
  canDeleteCustomers: boolean;
  canViewOrders: boolean;
  canAddOrders: boolean;
  canEditOrders: boolean;
  canDeleteOrders: boolean;
  canViewPos: boolean;
  canViewStockPurchase: boolean;
  canAddStockTransfer: boolean;
  canEditStockTransfer: boolean;
  canDeleteStockTransfer: boolean;
  canViewStockAdjustment: boolean;
  canAddStockAdjustment: boolean;
  canEditStockAdjustment: boolean;
  canDeleteStockAdjustment: boolean;
  canViewApi: boolean;
  canViewReports: boolean;
  canViewSettings: boolean;
  canViewMainCategories: boolean;
  canAddMainCategories: boolean;
  canEditMainCategories: boolean;
  canDeleteMainCategories: boolean;
  canViewCategories: boolean;
  canAddCategories: boolean;
  canEditCategories: boolean;
  canDeleteCategories: boolean;
  canViewSubCategories: boolean;
  canAddSubCategories: boolean;
  canEditSubCategories: boolean;
  canDeleteSubCategories: boolean;
  canViewBrands: boolean;
  canAddBrands: boolean;
  canEditBrands: boolean;
  canDeleteBrands: boolean;
  canViewAdverts: boolean;
  canAddAdverts: boolean;
  canEditAdverts: boolean;
  canDeleteAdverts: boolean;
  canViewBanners: boolean;
  canAddBanners: boolean;
  canEditBanners: boolean;
  canDeleteBanners: boolean;
  canViewUnits: boolean;
  canAddUnits: boolean;
  canEditUnits: boolean;
  canDeleteUnits: boolean;
  canViewProducts: boolean;
  canAddProducts: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;
  canViewWarehouses: boolean;
  canAddWarehouses: boolean;
  canEditWarehouses: boolean;
  canDeleteWarehouses: boolean;
  canViewSuppliers: boolean;
  canAddSuppliers: boolean;
  canEditSuppliers: boolean;
  canDeleteSuppliers: boolean;
}

export interface UserProps {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  name: string;
  phone: string;
  profileImage: string;
  // plainPassword: string;
  // Foreign key to Role
  roleId: string;

  status: boolean;
}

export interface IUser extends PrismaUser {
  role: Role;
}
export interface ICustomer extends PrismaCustomer {
  user: IUser;
}
export interface IPurchaseOrder extends PrismaPurchaseOrder {
  supplier: Supplier;
  items: PurchaseOrderItem[];
}
export interface IProduct extends PrismaProduct {
  subCategory: SubCategory;
}
export interface SalesProduct extends PrismaProduct {
  sales: Sale[];
}
export interface ICategory extends PrismaCategory {
  mainCategory: MainCategory;
}
export interface ISubCategory extends PrismaSubCategory {
  category: Category;
}
export interface ILineOrder extends PrismaLineOrder {
  lineOrderItems: LineOrderItem[];
}
export type ProductResult = {
  id: string;
  name: string;
  slug: string;
  stockQty: number;
  productCost: number;
  productPrice: number;
  productThumbnail: string;
};
export interface FeedbackProps {
  title: string;
  message: string;
  orderItemIds: string[];
  userId: string;
}
export type CheckoutProductProps = {};
//RELATIONSHIPS
/**
 * Category => one to Many =>category has Many Products
 * warehouse=> many to Many =>warehouse has many products  and product can be many warehouses
 * brand =>one to many => a brand has many products
 * unit => one to Many => a unit has many products
 * supplier => one to Many => a unit has many products
 * */
export interface OrderCustomer {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  profileImage: string | null;
  createdAt: Date;
  id: string;
}

export interface PurchaseItem {
  productId: string;
  quantity: number;
  currentStock: number;
  productName: string;
  productCost: number;
  subTotal: number;
}
export type PurchaseOrderProps = {
  status: PurchaseOrderStatus;
  discount: number;
  tax: number;
  shippingCost: number;
  totalAmount: number;
  balanceAmount: number;
  notes: string; // You can update this as needed
  items: PurchaseItem[];
  supplierId: string;
};
