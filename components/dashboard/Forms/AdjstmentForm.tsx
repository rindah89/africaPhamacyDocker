"use client";

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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IProduct } from "@/types/types";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createAdjustment } from "@/actions/adjustments";
import { toast } from "sonner";
import { Combobox } from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdjustmentItem {
  productId: string;
  productName: string;
  currentStock: number;
  quantity: number;
  type: "Addition" | "Subtraction";
  batchId?: string;
}

interface ProductBatch {
  id: string;
  batchNumber: string;
  quantity: number;
}

export default function AdjustmentForm({ products }: { products: IProduct[] }) {
  const [items, setItems] = useState<AdjustmentItem[]>([]);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [productBatches, setProductBatches] = useState<Record<string, ProductBatch[]>>({});
  const router = useRouter();

  // Fetch batches when a product is selected
  useEffect(() => {
    const fetchBatches = async (productId: string) => {
      try {
        const response = await fetch(`/api/products/${productId}/batches`);
        const data = await response.json();
        setProductBatches(prev => ({
          ...prev,
          [productId]: data
        }));
      } catch (error) {
        console.error('Error fetching batches:', error);
        toast.error('Failed to fetch product batches');
      }
    };

    if (selectedProduct) {
      fetchBatches(selectedProduct.value);
    }
  }, [selectedProduct]);

  const handleAddProduct = () => {
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }

    const product = products.find((p) => p.id === selectedProduct.value);
    if (!product) return;

    const existingItem = items.find((item) => item.productId === product.id);
    if (existingItem) {
      toast.error("Product already added");
      return;
    }

    setItems([
      ...items,
      {
        productId: product.id,
        productName: product.name,
        currentStock: product.stockQty,
        quantity: 1,
        type: "Addition",
      },
    ]);
    setSelectedProduct(null);
  };

  const handleRemoveProduct = (productId: string) => {
    setItems(items.filter((item) => item.productId !== productId));
  };

  const handleQtyChange = (productId: string, value: number) => {
    setItems(
      items.map((item) =>
        item.productId === productId ? { ...item, quantity: value } : item
      )
    );
  };

  const handleQtyIncrement = (productId: string) => {
    setItems(
      items.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const handleQtyDecrement = (productId: string) => {
    setItems(
      items.map((item) =>
        item.productId === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const handleTypeChange = (productId: string, type: "Addition" | "Subtraction") => {
    setItems(
      items.map((item) =>
        item.productId === productId ? { ...item, type } : item
      )
    );
  };

  const handleBatchChange = (productId: string, batchId: string) => {
    setItems(
      items.map((item) =>
        item.productId === productId ? { ...item, batchId } : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Please add at least one product");
      return;
    }
    if (!reason) {
      toast.error("Please enter a reason");
      return;
    }

    // Validate batch selection for subtractions
    const invalidItems = items.filter(
      item => item.type === "Subtraction" && !item.batchId
    );
    if (invalidItems.length > 0) {
      toast.error("Please select a batch for items being subtracted");
      return;
    }

    try {
      setLoading(true);
      const res = await createAdjustment({
        reason,
        items,
      });
      if (res) {
        toast.success("Adjustment created successfully");
        router.push("/dashboard/stock/adjustment");
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create adjustment");
    } finally {
      setLoading(false);
    }
  };

  const productOptions = products
    .filter((product) => !items.find((item) => item.productId === product.id))
    .map((product) => ({
      value: product.id,
      label: `${product.name} (${product.productCode})`,
    }));

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Stock Adjustment</CardTitle>
          <CardDescription>
            Add or subtract stock from your inventory
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Reason</Label>
            <Textarea
              placeholder="Enter reason for adjustment"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Add Product</Label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Combobox
                  items={productOptions}
                  value={selectedProduct}
                  onChange={setSelectedProduct}
                  placeholder="Select a product"
                />
              </div>
              <Button type="button" onClick={handleAddProduct}>
                Add
              </Button>
            </div>
          </div>

          {items.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Current Stock
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Quantity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const product = products.find(
                    (p) => p.id === item.productId
                  );
                  const batches = productBatches[item.productId] || [];
                  return (
                    <TableRow key={item.productId}>
                      <TableCell className="font-medium">
                        {product?.productCode}
                      </TableCell>
                      <TableCell className="font-medium">
                        {product?.name}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {product?.stockQty}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleQtyDecrement(item.productId)}
                            className="border shadow rounded flex items-center justify-center w-10 h-7"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            className="inline-block border-0 outline-0 w-16 text-slate-900 rounded"
                            onChange={(e) =>
                              handleQtyChange(item.productId, +e.target.value)
                            }
                          />
                          <button
                            type="button"
                            onClick={() => handleQtyIncrement(item.productId)}
                            className="border shadow rounded flex items-center justify-center w-10 h-7 bg-slate-800 text-white"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={item.type}
                          onValueChange={(value: "Addition" | "Subtraction") =>
                            handleTypeChange(item.productId, value)
                          }
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Addition">Addition</SelectItem>
                            <SelectItem value="Subtraction">Subtraction</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {item.type === "Subtraction" && (
                          <Select
                            value={item.batchId}
                            onValueChange={(value) =>
                              handleBatchChange(item.productId, value)
                            }
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue placeholder="Select batch" />
                            </SelectTrigger>
                            <SelectContent>
                              {batches.map((batch) => (
                                <SelectItem key={batch.id} value={batch.id}>
                                  {batch.batchNumber} ({batch.quantity})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveProduct(item.productId)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Adjustment"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
