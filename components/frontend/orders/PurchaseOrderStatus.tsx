"use client";
import { LineOrder } from "@prisma/client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FormSelectInput from "@/components/global/FormInputs/FormSelectInput";
import { Button } from "@/components/ui/button";
import SubmitButton from "@/components/global/FormInputs/SubmitButton";
import { Pencil } from "lucide-react";
import { changeOrderStatusById, StatusData } from "@/actions/orders";
import toast from "react-hot-toast";
import { IPurchaseOrder } from "@/types/types";
import {
  changePurchaseOrderStatusById,
  PurchaseStatusData,
} from "@/actions/purchases";
export default function PurchaseOrderStatus({
  order,
}: {
  order: IPurchaseOrder;
}) {
  const orderStatus = [
    {
      label: "PAID",
      value: "PAID",
    },
    {
      label: "PARTIAL",
      value: "PARTIAL",
    },
    {
      label: "UNPAID",
      value: "UNPAID",
    },
  ];
  const initialOrderStatus = {
    label: order.status,
    value: order.status,
  };
  const [selectedStatus, setSelectedStatus] = useState<any>(initialOrderStatus);
  const [loading, setLoading] = useState(false);
  async function handleChangeStatus(e: React.FormEvent<HTMLFormElement>) {
    setLoading(true);
    e.preventDefault();
    console.log(selectedStatus);
    const data: PurchaseStatusData = {
      status: selectedStatus.value,
    };
    try {
      const res = await changePurchaseOrderStatusById(order.id, data);
      if (res?.status === 200) {
        setSelectedStatus({
          label: res.data?.status,
          value: res.data?.status,
        });
        setLoading(false);
        toast.success("Status Updated Successfully");
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error("Something went wrong , Try again");
    }
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="">
          {selectedStatus.value === "PAID" ? (
            <button className="dark:text-slate-800 py-1.5 px-3 bg-green-200 rounded-full">
              {selectedStatus.value}
            </button>
          ) : selectedStatus.value === "PARTIAL" ? (
            <button className="dark:text-slate-800 py-1.5 px-3 bg-yellow-200 rounded-full">
              {selectedStatus.value}
            </button>
          ) : (
            <button className="dark:text-slate-800 py-1.5 px-3 bg-red-200 rounded-full">
              {selectedStatus.value}
            </button>
          )}
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {" "}
            <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0">
              Change Order Status
            </h2>
          </DialogTitle>
          <DialogDescription>
            <form className="space-y-4" onSubmit={handleChangeStatus}>
              <FormSelectInput
                label="Order Status"
                options={orderStatus}
                option={selectedStatus}
                setOption={setSelectedStatus}
              />
              <DialogFooter>
                <SubmitButton
                  title="Update Status"
                  loadingTitle="Updating please wait"
                  loading={loading}
                  buttonIcon={Pencil}
                />
              </DialogFooter>
            </form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
