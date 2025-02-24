import { getAllProducts } from "@/actions/products";
import { getAllUsers } from "@/actions/users";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await getAllUsers();
    const filteredUsers = users?.map((user) => {
      const { password, plainPassword, ...others } = user;
      return others;
    });
    return NextResponse.json(
      {
        data: filteredUsers,
        success: true,
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        success: false,
        error,
      },
      { status: 500 }
    );
  }
}
