"use client";
import { Fragment } from "react";
import { Popover, Transition } from "@headlessui/react";
import {
  ChevronDownIcon,
  PhoneIcon,
  PlayCircleIcon,
} from "@heroicons/react/20/solid";
import {
  ArrowPathIcon,
  ChartPieIcon,
  CursorArrowRaysIcon,
  FingerPrintIcon,
  SquaresPlusIcon,
} from "@heroicons/react/24/outline";
import { Home, LayoutGrid, Plus } from "lucide-react";
import Link from "next/link";
import { sidebarLinks } from "@/config/sidebar";

const generalMenu = [];
export default function QuickAccessMenuButton() {
  return (
    <Popover className="relative">
      <Popover.Button
        type="button"
        className="inline-flex items-center gap-x-1 text-sm font-semibold border border-gray-600 text-gray-50 bg-slate-900 py-2 px-2 rounded-sm"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className="absolute right-0 left-0 z-10 mt-5 flex w-screen max-w-max -translate-x-2/3 px-4 ">
          <div className="w-screen max-w-md flex-auto overflow-hidden rounded-md bg-white dark:bg-slate-800 text-sm leading-6 shadow-lg ring-1 ring-gray-900/5 px-4">
            <div className="p-4 grid grid-cols-2 lg:grid-cols-3 ">
              {/* <div className="">
                <div className="flex text-gray-500">
                  <Home className="w-4 h-4 mr-1" />
                  <h2 className="uppercase text-sm">General</h2>
                </div>
                {sidebarLinks
                  .filter(
                    (item) => !item.dropdown && item.href !== "/dashboard"
                  )
                  .map((item, i) => {
                    return (
                      <Link
                        key={i}
                        href={item.href ?? "#"}
                        className="flex items-center px-2 py-2"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        <span className="text-xs">{item.title}</span>
                      </Link>
                    );
                  })}
              </div> */}
              {sidebarLinks
                .filter((item) => item.dropdown)
                .map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="">
                      <div className="flex text-gray-500">
                        <Icon className="w-4 h-4 mr-1" />
                        <h2 className="uppercase text-sm">{item.title}</h2>
                      </div>
                      {item.dropdownMenu &&
                        item.dropdownMenu.map((item) => (
                          <Link
                            key={item.title}
                            href={item.href}
                            className="flex items-center px-2 py-2"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            <span className="text-xs">{item.title}</span>
                          </Link>
                        ))}
                    </div>
                  );
                })}
            </div>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}
