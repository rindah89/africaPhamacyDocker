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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createInsurancePlan, updateInsurancePlan } from "@/actions/insurance";
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  planCode: string;
  description?: string;
  copayPercentage: number;
  copayFixedAmount: number;
  coverageLimit?: number;
  deductible: number;
  status: boolean;
  provider: {
    id: string;
    name: string;
  };
}

interface Provider {
  id: string;
  name: string;
  code: string;
}

interface PlanDialogProps {
  plan: Plan | null;
  providers: Provider[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PlanDialog({ plan, providers, open, onOpenChange }: PlanDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    planCode: "",
    description: "",
    providerId: "",
    copayType: "none", // none, percentage, fixed
    copayPercentage: 0,
    copayFixedAmount: 0,
    coverageLimit: "",
    deductible: 0,
    status: true,
  });

  const isEditing = !!plan;

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        planCode: plan.planCode,
        description: plan.description || "",
        providerId: plan.provider.id,
        copayType: plan.copayPercentage > 0 ? "percentage" : plan.copayFixedAmount > 0 ? "fixed" : "none",
        copayPercentage: plan.copayPercentage,
        copayFixedAmount: plan.copayFixedAmount,
        coverageLimit: plan.coverageLimit ? plan.coverageLimit.toString() : "",
        deductible: plan.deductible,
        status: plan.status,
      });
    } else {
      setFormData({
        name: "",
        planCode: "",
        description: "",
        providerId: "",
        copayType: "none",
        copayPercentage: 0,
        copayFixedAmount: 0,
        coverageLimit: "",
        deductible: 0,
        status: true,
      });
    }
  }, [plan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = {
        name: formData.name,
        planCode: formData.planCode,
        description: formData.description || undefined,
        providerId: formData.providerId,
        copayPercentage: formData.copayType === "percentage" ? formData.copayPercentage : 0,
        copayFixedAmount: formData.copayType === "fixed" ? formData.copayFixedAmount : 0,
        coverageLimit: formData.coverageLimit ? parseFloat(formData.coverageLimit) : undefined,
        deductible: formData.deductible,
        status: formData.status,
      };

      let result;
      if (isEditing) {
        result = await updateInsurancePlan(plan.id, data);
      } else {
        result = await createInsurancePlan(data);
      }

      if (result.success) {
        toast.success(`Plan ${isEditing ? 'updated' : 'created'} successfully`);
        onOpenChange(false);
      } else {
        toast.error(result.error || `Failed to ${isEditing ? 'update' : 'create'} plan`);
      }
    } catch (error) {
      toast.error("An error occurred while saving the plan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Insurance Plan' : 'Add New Insurance Plan'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the plan information below.' : 'Fill in the details to add a new insurance plan.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Gold Plus Plan"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="planCode">Plan Code *</Label>
              <Input
                id="planCode"
                value={formData.planCode}
                onChange={(e) => handleInputChange('planCode', e.target.value.toUpperCase())}
                placeholder="e.g., GOLD-PLUS"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="providerId">Insurance Provider *</Label>
            <Select value={formData.providerId} onValueChange={(value) => handleInputChange('providerId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name} ({provider.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the plan benefits"
              rows={3}
            />
          </div>

          {/* Copay Configuration */}
          <div className="space-y-3">
            <Label>Copay Configuration</Label>
            <RadioGroup
              value={formData.copayType}
              onValueChange={(value) => handleInputChange('copayType', value)}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="copay-none" />
                <Label htmlFor="copay-none">No Copay</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="percentage" id="copay-percentage" />
                <Label htmlFor="copay-percentage">Percentage-based Copay</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="copay-fixed" />
                <Label htmlFor="copay-fixed">Fixed Amount Copay</Label>
              </div>
            </RadioGroup>

            {formData.copayType === "percentage" && (
              <div className="space-y-2">
                <Label htmlFor="copayPercentage">Copay Percentage (%)</Label>
                <Input
                  id="copayPercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.copayPercentage}
                  onChange={(e) => handleInputChange('copayPercentage', parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 20"
                />
                <p className="text-xs text-muted-foreground">
                  Patient pays {formData.copayPercentage}% of the total bill
                </p>
              </div>
            )}

            {formData.copayType === "fixed" && (
              <div className="space-y-2">
                <Label htmlFor="copayFixedAmount">Fixed Copay Amount ($)</Label>
                <Input
                  id="copayFixedAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.copayFixedAmount}
                  onChange={(e) => handleInputChange('copayFixedAmount', parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 25.00"
                />
                <p className="text-xs text-muted-foreground">
                  Patient pays a fixed amount of ${formData.copayFixedAmount} per visit
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="coverageLimit">Coverage Limit ($)</Label>
              <Input
                id="coverageLimit"
                type="number"
                min="0"
                step="0.01"
                value={formData.coverageLimit}
                onChange={(e) => handleInputChange('coverageLimit', e.target.value)}
                placeholder="e.g., 100000 (leave empty for unlimited)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deductible">Deductible ($)</Label>
              <Input
                id="deductible"
                type="number"
                min="0"
                step="0.01"
                value={formData.deductible}
                onChange={(e) => handleInputChange('deductible', parseFloat(e.target.value) || 0)}
                placeholder="e.g., 500"
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
            <Button type="submit" disabled={isLoading || !formData.providerId}>
              {isLoading ? 'Saving...' : (isEditing ? 'Update Plan' : 'Create Plan')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 