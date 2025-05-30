"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createInsuranceProvider, updateInsuranceProvider } from "@/actions/insurance";
import { toast } from "sonner";

interface Provider {
  id: string;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  logoUrl?: string;
  website?: string;
  status: boolean;
}

interface ProviderDialogProps {
  provider: Provider | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProviderDialog({ provider, open, onOpenChange }: ProviderDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    email: "",
    phone: "",
    address: "",
    contactPerson: "",
    logoUrl: "",
    website: "",
    status: true,
  });

  const isEditing = !!provider;

  useEffect(() => {
    if (provider) {
      setFormData({
        name: provider.name,
        code: provider.code,
        email: provider.email || "",
        phone: provider.phone || "",
        address: provider.address || "",
        contactPerson: provider.contactPerson || "",
        logoUrl: provider.logoUrl || "",
        website: provider.website || "",
        status: provider.status,
      });
    } else {
      setFormData({
        name: "",
        code: "",
        email: "",
        phone: "",
        address: "",
        contactPerson: "",
        logoUrl: "",
        website: "",
        status: true,
      });
    }
  }, [provider]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = {
        name: formData.name,
        code: formData.code,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        contactPerson: formData.contactPerson || undefined,
        logoUrl: formData.logoUrl || undefined,
        website: formData.website || undefined,
        status: formData.status,
      };

      let result;
      if (isEditing) {
        result = await updateInsuranceProvider(provider.id, data);
      } else {
        result = await createInsuranceProvider(data);
      }

      if (result.success) {
        toast.success(`Provider ${isEditing ? 'updated' : 'created'} successfully`);
        onOpenChange(false);
      } else {
        toast.error(result.error || `Failed to ${isEditing ? 'update' : 'create'} provider`);
      }
    } catch (error) {
      toast.error("An error occurred while saving the provider");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Insurance Provider' : 'Add New Insurance Provider'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the provider information below.' : 'Fill in the details to add a new insurance provider.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Provider Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Blue Cross Blue Shield"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Provider Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                placeholder="e.g., BCBS"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contact@provider.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input
              id="contactPerson"
              value={formData.contactPerson}
              onChange={(e) => handleInputChange('contactPerson', e.target.value)}
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Street address, city, state, zip code"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://www.provider.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                value={formData.logoUrl}
                onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="status"
              checked={formData.status}
              onCheckedChange={(checked) => handleInputChange('status', checked)}
            />
            <Label htmlFor="status">Active</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (isEditing ? 'Update Provider' : 'Create Provider')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 