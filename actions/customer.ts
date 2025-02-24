"use server";

import prisma from "@/lib/db";
import { createUser, updateUserById } from "./users";
import { revalidatePath } from "next/cache";
import { ICustomer } from "@/types/types";
export interface CustomerDataProps {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  profileImage: string;
  billingAddress: string;
  shippingAddress: string;
  additionalInfo?: string;
  roleId: string;
  status: boolean;
}

export async function createCustomer(customerData: CustomerDataProps) {
  try {
    return await prisma.$transaction(async (transaction) => {
      // Create User
      const userData = {
        email: customerData.email,
        password: customerData.password,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        name: `${customerData.firstName} ${customerData.lastName}`,
        phone: customerData.phone,
        profileImage: customerData.profileImage,
        roleId: customerData.roleId,
        status: customerData.status,
      };
      const user = await createUser(userData);

      // Create Customer
      const customer = await transaction.customer.create({
        data: {
          userId: user.data!.id,
          billingAddress: customerData.billingAddress,
          shippingAddress: customerData.shippingAddress,
          additionalInfo: customerData.additionalInfo,
        },
        include: {
          user: true,
        },
      });
      console.log(customer);
      revalidatePath("/dashboard/users");
      revalidatePath("/dashboard/sales/customers");
      return customer;
    });
  } catch (error) {
    console.log(error);
  }
}
export async function updateCustomerById(
  customerId: string,
  userId: string,
  customerData: CustomerDataProps
) {
  try {
    return await prisma.$transaction(async (transaction) => {
      // Update User
      const userData = {
        email: customerData.email,
        password: customerData.password,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        name: `${customerData.firstName} ${customerData.lastName}`,
        phone: customerData.phone,
        profileImage: customerData.profileImage,
        roleId: customerData.roleId,
        status: customerData.status,
      };
      const updatedUser = await updateUserById(userId, userData);

      // Update Customer
      const updatedCustomer = await transaction.customer.update({
        where: {
          id: customerId,
        },
        data: {
          billingAddress: customerData.billingAddress,
          shippingAddress: customerData.shippingAddress,
          additionalInfo: customerData.additionalInfo,
        },
      });
      // console.log(updatedCustomer);
      return updatedCustomer;
    });
  } catch (error) {
    console.log(error);
  }
}

export async function getAllCustomers() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
      },
    });

    return customers as ICustomer[];
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getCustomerById(id: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
      },
    });
    return customer as ICustomer;
  } catch (error) {
    console.log(error);
  }
}
