"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/lib/utils';
import { Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CartProps {
  customers: { label: string; value: string; email: string }[];
  currentShift: any;
}

export default function Cart({ customers, currentShift }: CartProps) {
  const { items, removeFromCart, updateQuantity, clearCart, total } = useCart();
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity >= 0) {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    // Implement checkout logic here
  };

  return (
    <div className="h-full flex flex-col bg-background rounded-lg p-4">
      <div className="mb-4 space-y-4">
        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
          <SelectTrigger>
            <SelectValue placeholder="Select customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.value} value={customer.value}>
                {customer.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger>
            <SelectValue placeholder="Payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CASH">Cash</SelectItem>
            <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
            <SelectItem value="ORANGE_MONEY">Orange Money</SelectItem>
            <SelectItem value="INSURANCE">Insurance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 p-3 border rounded-lg">
            <div className="relative w-16 h-16">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover rounded-md"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(item.price)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                  className="w-16 h-8 text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 ml-auto text-destructive"
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={clearCart}>
            Clear Cart
          </Button>
          <Button onClick={handleCheckout} disabled={items.length === 0}>
            Checkout
          </Button>
        </div>
      </div>
    </div>
  );
} 