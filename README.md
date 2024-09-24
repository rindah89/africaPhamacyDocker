# Modern Next.js & TypeScript 3 Systems in 1 Application Source Code: Ecommerce, POS, and Inventory Management

## Getting Started

Follow these steps to set up and run the project on your local machine.

## Preview the read Me

Use the following command to preview the readme file : `Ctr + shift + V `

### Prerequisites

Ensure your machine has the following installed:

- Git
- Node.js

### Installation

1. **Download and Unzip the Source Code**

   - Download the source code from the provided link.
   - Unzip the file and open the source code in Visual Studio Code.

2. **Install Dependencies**

   - Open the terminal in VS Code.
   - Run the following command to install all necessary dependencies:
     ```bash
     npm install
     ```

3. **Set Up Environment Variables**

   - Open the `.env.example` file.
   - Create a new file named `.env` in the root directory.
   - Copy all the variables from `.env.example` to `.env`.
   - Populate the variables with your credentials:

     ```env
     # Environment variables declared in this file are automatically made available to Prisma.
     # See the documentation for more detail: https://pris.ly/d/prisma-schema#accessing-environment-variables-from-the-schema

     STRIPE_SECRET_API_KEY=""
     # Guide: Obtain this key from your Stripe account dashboard under Developers > API keys.

     DATABASE_URL=""
     # Guide: This should be your MongoDB connection string. You can get this from your MongoDB Atlas account.

     NEXTAUTH_URL="http://localhost:3000"
     NEXT_PUBLIC_BASE_URL="http://localhost:3000"

     NEXTAUTH_SECRET=""
     # Guide: Run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` to generate this key.

     RESEND_API_KEY=""
     # Guide: Obtain this key from your Resend account.

     UPLOADTHING_SECRET=""
     # Guide: Obtain this secret from your Uploadthing account.

     UPLOADTHING_APP_ID=""
     # Guide: Obtain this app ID from your Uploadthing account.
     ```

4. **Start the Development Server**

   - After adding all the environment variables, run the following commands in the terminal:
     ```bash
     npx prisma db push && npx prisma generate && npm run dev
     ```
   - This should start the server on `http://localhost:3000`.

5. **Seed Initial Data**

   - Locate the file `actions/seed.ts`. This file is responsible for seeding initial data to the database.
   - Ensure that you have added a MongoDB database URL in your `.env` file.
   - Review and update the sample data in `seed.ts` as needed (e.g., users, products). Confirm that the placeholder image `placeholder.svg` exists in the `public` directory.
   - In your browser, go to `http://localhost:3000` and navigate to the footer. Click on the "Database seeding" link to route to the seed page.
   - On the seed page, click the "Seed Data" button and wait for the notification indicating that the database seeding is complete.

6. **Login and Set Up Roles and Users**

   - Click the login button located at the top right of the navigation bar.
   - Use the email and password specified in the seed file to log in.
   - Start by creating a role called "Customer". This role will be assigned to new ecommerce users upon registration.
   - Create a user called "Walk-in Customer" and assign them the "Customer" role. This user will be used in the Point of Sale system.
   - Run the following command to open Prisma Studio:
     ```bash
     npx prisma studio
     ```
   - From Prisma Studio, copy the user ID of the "Walk-in Customer" you created.
   - Locate the `PointOfSale` component in `/components/PointOfSale.tsx` and replace the user ID in the variable `const initialCustomerId = "666679618a65b2eadc3fe772";` with the user ID you copied.
   - Go back to Prisma Studio and copy the role ID of the "Customer" role you created. In the `RegisterForm.tsx` component, replace the variable `data.roleId = "666679228a65b2eadc3fe771";` with the role ID you copied.

7. **Add Additional Data**

   - Take your time to fill in the necessary data such as categories and products.

8. **Push to GitHub**

   - Once you're happy with the UI and data, push the project to GitHub.

9. **Deploy to Vercel**
   - After setting up the project on GitHub, head to Vercel to deploy your project.
   - Remember to add your environment variables on Vercel before deployment.
   - If you encounter errors during deployment, try troubleshooting before seeking further assistance.

## Troubleshooting

If you encounter any issues, try the following steps:

- Ensure all environment variables are correctly set.
- Check for any typos or missing files.
- Review the error messages in the terminal or browser console.
- Consult the documentation for Next.js, Prisma, or other libraries used in the project.

If you need further assistance, please reach out for support.

Happy coding!
