"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { deleteCategory } from "@/actions/category";
import toast from "react-hot-toast";
import Link from "next/link";
import { deleteBrand } from "@/actions/brand";
import { deleteWarehouse } from "@/actions/warehouse";
import { deleteSupplier } from "@/actions/supplier";
import { deleteUnit } from "@/actions/unit";
import { deleteProduct } from "@/actions/products";
import { deleteRole } from "@/actions/roles";
import { deleteUser } from "@/actions/users";
import { deleteMainCategory } from "@/actions/main-category";
import { deleteSubCategory } from "@/actions/sub-category";
import { deleteBanner } from "@/actions/banner";
import { deleteAdvert } from "@/actions/advert";
import { deletePurchaseOrder } from "@/actions/purchases";

type ActionColumnProps = {
  row: any;
  model: any;
  editEndpoint: string;
  id: string | undefined;
  revPath: string;
};
export default function ActionColumn({
  row,
  model,
  editEndpoint,
  id = "",
}: ActionColumnProps) {
  const isActive = row.isActive;
  async function handleDelete() {
    try {
      if (model === "category") {
        const res = await deleteCategory(id);
        if (res?.ok) {
          window.location.reload();
        }
        toast.success(`${model} Deleted Successfully`);
      } else if (model === "brand") {
        const res = await deleteBrand(id);
        if (res?.ok) {
          window.location.reload();
        }
        toast.success(`${model} Deleted Successfully`);
      } else if (model === "warehouse") {
        const res = await deleteWarehouse(id);
        if (res?.ok) {
          window.location.reload();
        }
        toast.success(`${model} Deleted Successfully`);
      } else if (model === "supplier") {
        const res = await deleteSupplier(id);
        if (res?.ok) {
          window.location.reload();
        }
        toast.success(`${model} Deleted Successfully`);
      } else if (model === "unit") {
        const res = await deleteUnit(id);
        if (res?.ok) {
          window.location.reload();
        }
        toast.success(`${model} Deleted Successfully`);
      } else if (model === "product") {
        const res = await deleteProduct(id);
        if (res?.ok) {
          window.location.reload();
        }
        toast.success(`${model} Deleted Successfully`);
      } else if (model === "role") {
        const res = await deleteRole(id);
        if (res?.ok) {
          window.location.reload();
        }
        toast.success(`${model} Deleted Successfully`);
      } else if (model === "user") {
        const res = await deleteUser(id);
        if (res?.ok) {
          window.location.reload();
        }
        toast.success(`${model} Deleted Successfully`);
      } else if (model === "mainCategory") {
        const res = await deleteMainCategory(id);
        if (res?.ok) {
          window.location.reload();
        }
        toast.success(`${model} Deleted Successfully`);
      } else if (model === "subCategory") {
        const res = await deleteSubCategory(id);
        if (res?.ok) {
          window.location.reload();
        }
        toast.success(`${model} Deleted Successfully`);
      } else if (model === "banner") {
        const res = await deleteBanner(id);
        if (res?.ok) {
          window.location.reload();
        }
        toast.success(`${model} Deleted Successfully`);
      } else if (model === "advert") {
        const res = await deleteAdvert(id);
        if (res?.ok) {
          window.location.reload();
        }
        toast.success(`${model} Deleted Successfully`);
      } else if (model === "purchaseOrder") {
        const res = await deletePurchaseOrder(id);
        if (res?.ok) {
          window.location.reload();
        }
        toast.success(`${model} Deleted Successfully`);
      }
    } catch (error) {
      console.log(error);
      toast.error("Category Couldn't be deleted");
    }
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            {/* <DropdownMenuItem className="text-red-600 hover:text-red-700 transition-all duration-500 cursor-pointer">
              
            </DropdownMenuItem> */}
            <Button
              variant={"ghost"}
              size={"sm"}
              className="text-red-600 hover:text-red-700 transition-all duration-500 cursor-pointer "
            >
              <Trash className="w-4 h-4  mr-2 flex-shrink-0" />
              <span>Delete</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this{" "}
                {model}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button variant={"destructive"} onClick={() => handleDelete()}>
                Permanently Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {/* <DropdownMenuItem
          className="text-red-600 hover:text-red-700 transition-all duration-500 cursor-pointer"
          onClick={() => handleDelete()}
        >
          <Trash className="w-4 h-4  mr-2 flex-shrink-0" />
          <span>Delete</span>
        </DropdownMenuItem> */}
        <DropdownMenuItem>
          <Link href={editEndpoint} className="flex item gap-2">
            <Pencil className="w-4 h-4 " />
            <span>Edit</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
