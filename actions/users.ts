"use server";

import bcrypt from "bcrypt";
import { RoleProps, UserProps } from "@/types/types";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
export async function createUser(data: UserProps) {
  const {
    email,
    password,
    firstName,
    lastName,
    name,
    phone,
    profileImage,
    roleId,
    status,
  } = data;
  try {
    // Hash the PAASWORD
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      return {
        error: `User with this email(${email}) already exists`,
        status: 409,
        data: null,
      };
    }
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        plainPassword: password,
        firstName,
        lastName,
        name,
        phone,
        profileImage,
        roleId,
        status,
      },
    });
    revalidatePath("/dashboard/users");
    // console.log(newUser);
    return {
      error: null,
      status: 200,
      data: newUser,
    };
  } catch (error) {
    console.log(error);
    return {
      error: `Something Went wrong, Please try again`,
      status: 500,
      data: null,
    };
  }
}
export async function createBulkUsers(users: UserProps[]) {
  try {
    for (const user of users) {
      await createUser(user);
    }
  } catch (error) {
    console.log(error);
  }
}
export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        role: true,
      },
    });

    return users;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  } catch (error) {
    console.log(error);
  }
}
export async function updateUserById(id: string, data: UserProps) {
  try {
    // const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data,
    });
    revalidatePath("/dashboard/users");
    return updatedUser;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteUser(id: string) {
  try {
    const deletedUser = await prisma.user.delete({
      where: {
        id,
      },
    });

    return {
      ok: true,
      data: deletedUser,
    };
  } catch (error) {
    console.log(error);
  }
}
export async function updateUserPassword(id: string, password: string) {
  if (id) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const updatedUser = await prisma.user.update({
        where: {
          id,
        },
        data: {
          password: hashedPassword,
          plainPassword: password,
        },
      });
      revalidatePath("/dashboard/users");
      return {
        status: 200,
        error: null,
        data: {
          id: updatedUser.id,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        status: 500,
        error: "Something Went wrong",
        data: null,
      };
    }
  } else {
    return {
      status: 404,
      error: "Invalid User ID provided",
      data: null,
    };
  }
}
export async function updateUserRole(userId: string, roleId: string) {
  if (userId) {
    try {
      const updatedUser = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          roleId,
        },
      });
      revalidatePath("/dashboard/users");
      return {
        status: 200,
        error: null,
        data: {
          id: updatedUser.id,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        status: 500,
        error: "Something Went wrong",
        data: null,
      };
    }
  } else {
    return {
      status: 404,
      error: "Invalid User ID provided",
      data: null,
    };
  }
}
