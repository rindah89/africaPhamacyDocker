"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Percent, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PlanDialog from "./PlanDialog";
import { deleteInsurancePlan } from "@/actions/insurance";
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
    code: string;
  };
  _count: {
    customerInsurance: number;
    claims: number;
  };
}

interface Provider {
  id: string;
  name: string;
  code: string;
}

interface PlansTabProps {
  plans: Plan[];
  providers: Provider[];
}

export default function PlansTab({ plans, providers }: PlansTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = 
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.planCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.provider.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProvider = selectedProvider === "all" || plan.provider.id === selectedProvider;
    
    return matchesSearch && matchesProvider;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleEdit = (plan: Plan) => {
    setSelectedPlan(plan);
    setDialogOpen(true);
  };

  const handleDelete = async (planId: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    
    setIsLoading(true);
    try {
      const result = await deleteInsurancePlan(planId);
      if (result.success) {
        toast.success("Plan deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete plan");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the plan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    setSelectedPlan(null);
    setDialogOpen(true);
  };

  const getCopayDisplay = (plan: Plan) => {
    if (plan.copayPercentage > 0) {
      return (
        <div className="flex items-center">
          <Percent className="h-3 w-3 mr-1" />
          {plan.copayPercentage}%
        </div>
      );
    } else if (plan.copayFixedAmount > 0) {
      return (
        <div className="flex items-center">
          <DollarSign className="h-3 w-3 mr-1" />
          {formatCurrency(plan.copayFixedAmount)}
        </div>
      );
    }
    return "No copay";
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Insurance Plans</CardTitle>
              <CardDescription>
                Manage insurance plans with copay and coverage settings
              </CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Copay</TableHead>
                  <TableHead>Coverage Limit</TableHead>
                  <TableHead>Deductible</TableHead>
                  <TableHead>Customers</TableHead>
                  <TableHead>Claims</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No plans found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{plan.name}</div>
                          <div className="text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs">{plan.planCode}</Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{plan.provider.name}</div>
                          <div className="text-xs text-muted-foreground">{plan.provider.code}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {getCopayDisplay(plan)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {plan.coverageLimit ? formatCurrency(plan.coverageLimit) : "Unlimited"}
                      </TableCell>
                      <TableCell>
                        {plan.deductible > 0 ? formatCurrency(plan.deductible) : "None"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{plan._count.customerInsurance}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{plan._count.claims}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={plan.status ? "default" : "secondary"}>
                          {plan.status ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(plan)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(plan.id)}
                              className="text-red-600"
                              disabled={isLoading}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <PlanDialog
        plan={selectedPlan}
        providers={providers}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
} 