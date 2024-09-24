"use server";

import { InviteEmailTemplate } from "@/emails/index";
import { Resend } from "resend";
import { InviteEmailTemplateProps } from "@/emails";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import PasswordRest from "@/emails/PasswordReset";
const resend = new Resend(process.env.RESEND_API_KEY);
export async function inviteUser(data: InviteEmailTemplateProps) {
  const {
    firstName,
    password,
    invitedByUsername,
    invitedByEmail,
    loginEmail,
    role,
    inviteLink,
  } = data;
  try {
    const res = await resend.emails.send({
      from: "MMA <jb@jazzafricaadventures.com>",
      to: loginEmail,
      subject: `Join MMA Inventory Management System as${role}`,
      react: (
        <InviteEmailTemplate
          firstName={firstName}
          password={password}
          invitedByUsername={invitedByUsername}
          invitedByEmail={invitedByEmail}
          loginEmail={loginEmail}
          role={role}
          inviteLink={inviteLink}
        />
      ),
    });
    //Update the user
    const updatedUser = await prisma.user.update({
      where: {
        email: loginEmail,
      },
      data: {
        inviteSent: true,
      },
    });
    console.log(res, updatedUser);
    revalidatePath("/dashboard/users");
    return updatedUser;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function sendPasswordResetToken(email: string) {
  console.log(email);
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!existingUser) {
      return {
        data: null,
        error: `User with email (${email}) is not Found`,
        status: 404,
      };
    }
    const generateSixDigitNumber = () => {
      return Math.floor(100000 + Math.random() * 900000);
    };

    // if (existingUser.passwordResetCount >= 3) {
    //   return {
    //     data: null,
    //     error: "Many Trials, please wait after 30 Minutes",
    //     status: 429,
    //   };
    // }
    const token = generateSixDigitNumber();
    console.log(token);

    //Update the user
    const updatedUser = await prisma.user.update({
      where: {
        email,
      },
      data: {
        resetToken: token,
        passwordResetCount: existingUser.passwordResetCount + 1,
      },
    });
    const res = await resend.emails.send({
      from: "MMA <jb@jazzafricaadventures.com>",
      to: email,
      subject: `Reset Token`,
      react: <PasswordRest token={token} />,
    });
    console.log(res, updatedUser);
    return {
      data: {
        id: updatedUser.id,
      },
      error: null,
      status: 200,
    };
  } catch (error) {
    console.log(error);
    return {
      data: null,
      error: "Something went wrong",
      status: 500,
    };
  }
}

export async function verifyResetToken(userId: string, resetToken: number) {
  try {
    // Fetch the user by userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        status: 404,
        error: "No User Found",
        data: {
          id: null,
        },
      };
    }

    // Check if the user exists and the reset token matches
    if (user && user.resetToken === resetToken) {
      return {
        status: 200,
        error: null,
        data: {
          id: user.id,
        },
      };
    } else {
      return {
        status: 403,
        error: "Invalid Code, Please check ur email and try again",
        data: {
          id: null,
        },
      };
    }
  } catch (error) {
    console.error("Error verifying reset token:", error);
    return {
      status: 500,
      error: "Something Went wrong please try again",
      data: {
        id: null,
      },
    };
  }
}
