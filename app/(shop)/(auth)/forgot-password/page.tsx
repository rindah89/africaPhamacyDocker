import ForgotPasswordForm from "@/components/frontend/ForgotPasswordForm";
import LoginForm from "@/components/frontend/LoginForm";
import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function page() {
  return (
    <section>
      <div className="md:container px-4 md:px-0">
        <div className="border-gray-200 dark:border-gray-700 grid grid-cols-1 max-w-md mx-auto border my-3 shadow rounded-md ">
          <ForgotPasswordForm />
        </div>
      </div>
    </section>
  );
}
