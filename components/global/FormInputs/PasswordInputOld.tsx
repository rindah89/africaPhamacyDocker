"use client";
import { cn } from "@/lib/utils";
import React, { useState } from "react";

import { Eye, EyeOff, RefreshCw } from "lucide-react";
import { generatePassword } from "@/lib/generatePassword";

type TextInputProps = {
  register: any;
  errors: any;
  label: string;
  type?: string;
  name: string;
  toolTipText?: string;
  unit?: string;
};

export default function PasswordInputOld({
  register,
  errors,
  label,
  type = "text",
  name,
  toolTipText,
  unit,
}: TextInputProps) {
  const [passType, setPassType] = useState(type);
  const [generatedPassword, setGeneratedPassword] = useState("");

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setGeneratedPassword(newPassword);
    // console.log(generatePassword);
  };

  // console.log(generatePassword);

  return (
    <div>
      <div className="flex space-x-2 items-center justify-between">
        <label
          htmlFor={name}
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          {label}
        </label>

        <button
          type="button"
          onClick={handleGeneratePassword}
          className="bg-white  rounded-tl-md rounded-bl-md pr-8 flex items-center"
        >
          <RefreshCw className="w-4 h-4 text-slate-600" />
        </button>
      </div>
      <div className="mt-2">
        <div className="relative rounded-md ">
          <input
            id={name}
            type={passType}
            {...register(name, {
              required: true,
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                message:
                  "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
              },
              // setValueAs: (value: string) =>
              //   value === "" ? generatedPassword : value,
            })}
            className={cn(
              "block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 text-sm",
              errors[name] && "focus:ring-red-500"
            )}
            defaultValue={generatedPassword}
          />
          <button
            type="button"
            onClick={() =>
              setPassType((prev) => (prev === "password" ? "text" : "password"))
            }
            className="bg-white py-2 px-3 rounded-tr-md rounded-br-md absolute inset-y-0 right-1 my-[2px] flex items-center"
          >
            {passType === "password" ? (
              <Eye className="w-4 h-4 text-slate-600" />
            ) : (
              <EyeOff className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
        {errors[name] && (
          <span className="text-xs text-red-600">{errors[name].message}</span>
        )}
      </div>
    </div>
  );
}
