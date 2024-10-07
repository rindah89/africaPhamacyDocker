"use server";

import { AdvertProps } from "@/types/types";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createBulkUsers } from "./users";
async function seedDatabase() {
  // Seed MainCategory
  const mainCategory1 = await prisma.mainCategory.create({
    data: {
      title: "Electronics",
      slug: "electronics",
      categories: {
        create: [
          {
            title: "Phones",
            slug: "phones",
            description: "Various kinds of phones",
            imageUrl: "/placeholder.svg",
            status: true,
            subCategories: {
              create: [
                {
                  title: "Smartphones",
                  slug: "smartphones",
                  products: {
                    create: [
                      {
                        name: "iPhone 12",
                        slug: "iphone-12",
                        productCode: "IP12",
                        stockQty: 50,
                        productCost: 699.99,
                        productPrice: 999.99,
                        alertQty: 5,
                        productTax: 7.5,
                        taxMethod: "inclusive",
                        productImages: ["/placeholder.svg"],
                        status: true,
                        productThumbnail: "/placeholder.svg",
                        productDetails: "Latest iPhone model",
                        batchNumber: "12345",
                        expiryDate: new Date("2025-01-01"),
                        brand: {
                          create: {
                            title: "Apple",
                            slug: "apple",
                            status: true,
                            logo: "/placeholder.svg",
                          },
                        },
                        unit: {
                          create: {
                            title: "Piece",
                            abbreviation: "pc",
                          },
                        },
                        supplier: {
                          create: {
                            name: "Apple Supplier",
                            imageUrl: "/placeholder.svg",
                            companyName: "Apple Inc",
                            vatNumber: "123456789",
                            email: "apple@supplier.com",
                            phone: "1234567890",
                            address: "1 Apple Park Way",
                            city: "Cupertino",
                            state: "CA",
                            postalCode: "95014",
                            country: "USA",
                            status: true,
                          },
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  const mainCategory2 = await prisma.mainCategory.create({
    data: {
      title: "Fashion",
      slug: "fashion",
      categories: {
        create: [
          {
            title: "Men",
            slug: "men",
            description: "Men's clothing and accessories",
            imageUrl: "/placeholder.svg",
            status: true,
            subCategories: {
              create: [
                {
                  title: "Shirts",
                  slug: "shirts",
                  products: {
                    create: [
                      {
                        name: "Formal Shirt",
                        slug: "formal-shirt",
                        productCode: "FS001",
                        stockQty: 100,
                        productCost: 20.0,
                        productPrice: 40.0,
                        alertQty: 10,
                        productTax: 5.0,
                        taxMethod: "exclusive",
                        productImages: ["/placeholder.svg"],
                        status: true,
                        productThumbnail: "/placeholder.svg",
                        productDetails: "Men's formal shirt",
                        batchNumber: "54321",
                        expiryDate: new Date("2026-01-01"),
                        brand: {
                          create: {
                            title: "Brand X",
                            slug: "brand-x",
                            status: true,
                            logo: "/placeholder.svg",
                          },
                        },
                        unit: {
                          create: {
                            title: "Piece",
                            abbreviation: "pc",
                          },
                        },
                        supplier: {
                          create: {
                            name: "Fashion Supplier",
                            imageUrl: "/placeholder.svg",
                            companyName: "Fashion Inc",
                            vatNumber: "987654321",
                            email: "fashion@supplier.com",
                            phone: "0987654321",
                            address: "123 Fashion St",
                            city: "New York",
                            state: "NY",
                            postalCode: "10001",
                            country: "USA",
                            status: true,
                          },
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Seed Banner
  await prisma.banner.createMany({
    data: [
      {
        title: "Big Sale",
        imageUrl: "/placeholder.svg",
        bannerLink: "https://example.com/big-sale",
        status: true,
      },
      {
        title: "New Arrivals",
        imageUrl: "/placeholder.svg",
        bannerLink: "https://example.com/new-arrivals",
        status: true,
      },
    ],
  });

  // Seed Advert
  await prisma.advert.createMany({
    data: [
      {
        title: "Ad 1",
        imageUrl: "/placeholder.svg",
        status: true,
        link: "https://example.com/ad-1",
        size: "QUARTER",
      },
      {
        title: "Ad 2",
        imageUrl: "/placeholder.svg",
        status: true,
        link: "https://example.com/ad-2",
        size: "HALF",
      },
    ],
  });

  // Seed Brand
  await prisma.brand.createMany({
    data: [
      {
        title: "Nike",
        slug: "nike",
        status: true,
        logo: "/placeholder.svg",
      },
      {
        title: "Adidas",
        slug: "adidas",
        status: true,
        logo: "/placeholder.svg",
      },
    ],
  });

  // Seed Unit
  await prisma.unit.createMany({
    data: [
      {
        title: "Kilogram",
        abbreviation: "kg",
      },
      {
        title: "Liter",
        abbreviation: "l",
      },
    ],
  });
  // Seed Warehouse
  await prisma.warehouse.createMany({
    data: [
      {
        name: "Main Warehouse",
        slug: "main-warehouse",
        country: "USA",
        city: "New York",
        phone: "1234567890",
        logo: "/placeholder.svg",
        contactPerson: "John Doe",
        email: "john.doe@example.com",
        status: true,
        zipCode: "10001",
      },
      {
        name: "Secondary Warehouse",
        slug: "secondary-warehouse",
        country: "USA",
        city: "Los Angeles",
        phone: "0987654321",
        logo: "/placeholder.svg",
        contactPerson: "Jane Doe",
        email: "jane.doe@example.com",
        status: true,
        zipCode: "90001",
      },
    ],
  });
  // Seed Supplier
  await prisma.supplier.createMany({
    data: [
      {
        name: "Tech Supplies",
        imageUrl: "/placeholder.svg",
        companyName: "Tech Supplies Inc",
        vatNumber: "123456789",
        email: "techsupplies@example.com",
        phone: "1234567890",
        address: "123 Tech St",
        city: "San Francisco",
        state: "CA",
        postalCode: "94103",
        country: "USA",
        status: true,
      },
      {
        name: "Fashion Supplies",
        imageUrl: "/placeholder.svg",
        companyName: "Fashion Supplies Inc",
        vatNumber: "987654321",
        email: "fashionsupplies@example.com",
        phone: "0987654321",
        address: "456 Fashion Ave",
        city: "New York",
        state: "NY",
        postalCode: "10018",
        country: "USA",
        status: true,
      },
    ],
  });
  // Seed Role
  await prisma.role.createMany({
    data: [
      {
        displayName: "Admin",
        roleName: "admin",
        description: "Administrator with full access",
        canViewBrands: true,

        canViewCategories: true,

        canViewProducts: true,

        canViewDashboard: true,
        canViewRoles: true,
        canViewUnits: true,
        canViewUsers: true,

        canViewWarehouses: true,

        canViewSuppliers: true,
      },
      {
        displayName: "Customer",
        roleName: "customer",
        description: "Regular user with limited access",
        canViewDashboard: true,
        canViewOrders: true,
      },
    ],
  });
  // Seed User
  const adminRole = await prisma.role.findUnique({
    where: { roleName: "admin" },
  });
  const userRole = await prisma.role.findUnique({
    where: { roleName: "user" },
  });

  const users = await createBulkUsers([
    {
      email: "admin@example.com",
      password: "AdminPassword@123",
      firstName: "Admin",
      lastName: "User",
      name: "Admin User",
      phone: "1234567890",
      profileImage: "/placeholder.svg",
      roleId: adminRole!.id,
      status: true,
    },
    {
      email: "user@example.com",
      password: "UserPassword@123",
      firstName: "Regular",
      lastName: "User",
      name: "Regular User",
      phone: "0987654321",
      roleId: userRole!.id,
      profileImage: "/placeholder.svg",
      status: true,
    },
  ]);
  // console.log(users);

  // Seed LineOrderItem
  // Note: We'll need to create a LineOrder and Product first to associate with LineOrderItem.
  const product = await prisma.product.findFirst();
  const lineOrder = await prisma.lineOrder.create({
    data: {
      customerName: "John Doe",
      orderNumber: "ORDER001",
      customerId: "exampleCustomerId",
      status: "DELIVERED",
    },
  });

  await prisma.lineOrderItem.createMany({
    data: [
      {
        productId: product!.id,
        orderId: lineOrder.id,
        name: product!.name,
        price: product!.productPrice,
        qty: 1,
        productThumbnail: product!.productThumbnail,
      },
    ],
  });

  // Seed LineOrder
  await prisma.lineOrder.createMany({
    data: [
      {
        customerId: "exampleCustomerId",
        customerName: "John Doe",
        orderNumber: "ORDER002",
        status: "PENDING",
      },
      {
        customerId: "exampleCustomerId",
        customerName: "Jane Doe",
        orderNumber: "ORDER003",
        status: "PROCESSING",
      },
    ],
  });

  // Seed Sale
  await prisma.sale.createMany({
    data: [
      {
        orderId: lineOrder.id,
        productId: product!.id,
        qty: 1,
        salePrice: product!.productPrice,
        productName: product!.name,
        productImage: product!.productThumbnail,
        customerName: "John Doe",
      },
    ],
  });
  // Seed Customer
  const user = await prisma.user.findFirst();
  await prisma.customer.createMany({
    data: [
      {
        userId: user!.id,
        additionalInfo: "Preferred customer",
        billingAddress: "Billing address",
        shippingAddress: "Shipping address",
      },
    ],
  });
  await prisma.feedback.createMany({
    data: [
      {
        title: "Great product",
        message: "I really liked the product!",
        orderItemIds: ["exampleOrderItemId1", "exampleOrderItemId2"],
        userId: user!.id,
      },
      {
        title: "Not satisfied",
        message: "The product did not meet my expectations.",
        orderItemIds: ["exampleOrderItemId3", "exampleOrderItemId4"],
        userId: user!.id,
      },
    ],
  });
}
export async function seedData() {
  try {
    await seedDatabase();
  } catch (error) {
    console.log(error);
    return null;
  }
}
