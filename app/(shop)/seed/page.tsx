"use client";
import { seedData } from "@/actions/seed";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  async function handleClick() {
    setLoading(true);
    try {
      const res = await seedData();
      toast.success("Database seed complete");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }
  return (
    <div className="md:container px-4 md:px-0">
      <div className="border-gray-200 dark:border-gray-700 grid grid-cols-1 max-w-md mx-auto border my-3 shadow-2xl rounded-md ">
        <div className="w-full py-5 lg:px-8 px-6">
          <div className="">
            <div className="py-4">
              <h2 className=" text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100">
                Database Seeding
              </h2>
              <p className="text-xs">
                Before seeding you can first edit the sample data in
                actions/seed.ts
              </p>
            </div>
          </div>
          <div className="">
            <form className="space-y-3 pb-4">
              <div>
                {loading ? (
                  <button
                    disabled
                    type="button"
                    className="flex items-center w-full justify-center rounded-md bg-indigo-600/50 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Seeding please wait ...
                  </button>
                ) : (
                  <button
                    onClick={handleClick}
                    type="button"
                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Seed Data
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
