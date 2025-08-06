import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Minus, Plus, Trash } from "lucide-react";
import TextArea from "@/components/global/FormInputs/TextArea";
import TextInput from "@/components/global/FormInputs/TextInput";
import { getPurchaseOrderById } from "@/actions/purchases";
import { getNormalDate } from "@/lib/getNormalDate";
import PurchaseOrderStatus from "@/components/frontend/orders/PurchaseOrderStatus";
import { IPurchaseOrder } from "@/types/types";
import PurchaseDetails from "@/components/PurchaseDetails";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const purchase = await getPurchaseOrderById(id);

  return <PurchaseDetails purchase={purchase} />;
}
