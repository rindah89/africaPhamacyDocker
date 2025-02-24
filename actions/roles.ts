"use server";

import { RoleProps } from "@/types/types";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
export async function createRole(data: RoleProps) {
  const roleName = data.roleName;
  try {
    const existingRole = await prisma.role.findUnique({
      where: {
        roleName,
      },
    });
    if (existingRole) {
      return existingRole;
    }
    const newRole = await prisma.role.create({
      data,
    });
    revalidatePath("/dashboard/user/roles");
    // console.log(newRole);
    return newRole;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function getAllRoles() {
  try {
    const roles = await prisma.role.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return roles;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getRoleById(id: string) {
  try {
    const role = await prisma.role.findUnique({
      where: {
        id,
      },
    });
    return role;
  } catch (error) {
    console.log(error);
  }
}
export async function updateRoleById(id: string, data: RoleProps) {
  try {
    const updatedRole = await prisma.role.update({
      where: {
        id,
      },
      data,
    });
    revalidatePath("/dashboard/users/roles");
    return updatedRole;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteRole(id: string) {
  try {
    const deletedRole = await prisma.role.delete({
      where: {
        id,
      },
    });

    return {
      ok: true,
      data: deletedRole,
    };
  } catch (error) {
    console.log(error);
  }
}
