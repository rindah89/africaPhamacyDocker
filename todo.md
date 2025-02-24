//EPISODE 1

- Install a new Next JS app
- Darkmode
- Footer
- Shop Header
- Layout (Front/backoffice)
- Deploy

//EPISODE 2

- Login Page
- Signup Page
- Forgot Password Page
- Change Password Page
- Verify Email Page
- Integrate Dashboard from Shad
- Integrated the Charts from Tremor
- Deploy

//EPISODE 3

- Identify the Modules
- Identify Pages
- Group Pages
- Add Dropdown on the Sidebar
- Start on Design Some
- Deploy

//EPISODE 4

- Build out the sidebar Navigation
- Build out the Navbar
- Customized the Quick Access Menu
- Start Building Some Pages and Modules
- Deploy

//EPISODE 5

- Install and Set up Prisma and Mongodb
- Create Category Model
- Design Form and Form Inputs

// EPISODE 6 and 7

- Design Form and Form Inputs
- React Hook Forms/Zod
- Create with Server Actions
- Design Our Table
- Fetch the Records
- Deploy

// EPISODE 8

- Integrating Data Table with Pagination
- Implement Import and Export Functionality
- Deploy

https://dribbble.com/shots/20409248-Login-Sign-In-Page
https://dribbble.com/shots/24012078-E-commerce-platform-of-technical-products
https://dribbble.com/shots/23936074-Website-footer-UI

model Role {
id Int @id @default(autoincrement())
displayName String // Human-friendly name for UI
roleName String @unique // Programmatic name for code
description String?

// Permissions
permissions Permissions

// Relationships
users User[]
}

model Permissions {
id Int @id @default(autoincrement())
roleId Int @unique
role Role @relation(fields: [roleId], references: [id])

// Module Permissions
viewBrands Boolean @default(false)
addBrands Boolean @default(false)
editBrands Boolean @default(false)
deleteBrands Boolean @default(false)

viewCategories Boolean @default(false)
addCategories Boolean @default(false)
editCategories Boolean @default(false)
deleteCategories Boolean @default(false)

viewVariations Boolean @default(false)
addVariations Boolean @default(false)
editVariations Boolean @default(false)
deleteVariations Boolean @default(false)

viewProducts Boolean @default(false)
addProducts Boolean @default(false)
editProducts Boolean @default(false)
deleteProducts Boolean @default(false)

viewExpenseCategories Boolean @default(false)
addExpenseCategories Boolean @default(false)
editExpenseCategories Boolean @default(false)
deleteExpenseCategories Boolean @default(false)

viewExpenses Boolean @default(false)
addExpenses Boolean @default(false)
editExpenses Boolean @default(false)
deleteExpenses Boolean @default(false)

viewPurchases Boolean @default(false)
addPurchases Boolean @default(false)
editPurchases Boolean @default(false)
deletePurchases Boolean @default(false)
}

model User {
id Int @id @default(autoincrement())
email String @unique
password String
name String?

// Foreign key to Role
roleId Int
role Role @relation(fields: [roleId], references: [id])

@@index([roleId], name: "idx_roleId")
}

const role = await prisma.role.create({
data: {
displayName: 'Content Manager',
roleName: 'content_manager',
description: 'Role for managing content on the site',
permissions: {
create: {
viewBrands: true,
addBrands: true,
editBrands: true,
deleteBrands: false,
// other permissions
}
}
}
})

"use server";

import { prismaClient } from "@/prisma/db";
import { Resend } from "resend";
import bcrypt from "bcrypt";
import EmailTemplate from "@/components/Emails/EmailTemplate";
import { RegisterInputProps } from "@/types/types";
export async function createUser(formData: RegisterInputProps) {
const resend = new Resend(process.env.RESEND_API_KEY);
const { name, email, password } = formData;
try {
const existingUser = await prismaClient.user.findUnique({
where: {
email,
},
});
if (existingUser) {
return {
data: null,
error: `User with this email ( ${email})  already exists in the Database`,
status: 409,
};
}
// Encrypt the Password =>bcrypt
const hashedPassword = await bcrypt.hash(password, 10);
//Generate Token
const generateToken = () => {
const min = 100000; // Minimum 6-figure number
const max = 999999; // Maximum 6-figure number
return Math.floor(Math.random() \* (max - min + 1)) + min;
};
const userToken = generateToken();
const newUser = await prismaClient.user.create({
data: {
name,
email,
password: hashedPassword,
token: userToken,
},
});
//Send an Email with the Token on the link as a search param
const token = newUser.token;
const userId = newUser.id;
const firstName = newUser?.name ?? "".split(" ")[0];
const linkText = "Verify your Account ";
const message =
"Thank you for registering with Gecko. To complete your registration and verify your email address, please enter the following 6-digit verification code on our website :";
const sendMail = await resend.emails.send({
from: "Medical App <info@jazzafricaadventures.com>",
to: email,
subject: "Verify Your Email Address",
react: EmailTemplate({ firstName, token, linkText, message }),
});
console.log(token);
console.log(sendMail);
console.log(newUser);
return {
data: newUser,
error: null,
status: 200,
};
} catch (error) {
console.log(error);
return {
error: "Something went wrong",
};
}
}

https://dribbble.com/shots/22962315-mixmatch-Payment-Pop-up-Cashier-POS-Dashboard
https://dribbble.com/shots/22801035-mixmatch-Cashier-POS-Dashboard
https://dribbble.com/shots/20647111-Dashboard-POS-System
