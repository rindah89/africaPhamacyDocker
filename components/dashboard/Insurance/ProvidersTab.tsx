"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
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
import ProviderDialog from "./ProviderDialog";
import { deleteInsuranceProvider } from "@/actions/insurance";
import { toast } from "sonner";

interface Provider {
  id: string;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  status: boolean;
  _count: {
    claims: number;
    reports: number;
  };
  createdAt: Date;
}

interface ProvidersTabProps {
  providers: Provider[];
}

export default function ProvidersTab({ providers }: ProvidersTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filteredProviders = providers.filter(provider =>
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (provider: Provider) => {
    setSelectedProvider(provider);
    setDialogOpen(true);
  };

  const handleDelete = async (providerId: string) => {
    if (!confirm("Are you sure you want to delete this provider?")) return;
    
    setIsLoading(true);
    try {
      const result = await deleteInsuranceProvider(providerId);
      if (result.success) {
        toast.success("Provider deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete provider");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the provider");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    setSelectedProvider(null);
    setDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Insurance Providers</CardTitle>
              <CardDescription>
                Manage insurance companies operating in Cameroon
              </CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add Provider
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search providers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Claims</TableHead>
                  <TableHead>Reports</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProviders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-3">
                        <Plus className="h-12 w-12 text-muted-foreground/50" />
                        <div>
                          <h3 className="text-lg font-medium">No Insurance Providers</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Add insurance companies operating in Cameroon to start processing claims
                          </p>
                        </div>
                        <Button onClick={handleAddNew} className="mt-4">
                          <Plus className="mr-2 h-4 w-4" />
                          Add First Provider
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProviders.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{provider.name}</div>
                          {provider.email && (
                            <div className="text-sm text-muted-foreground">{provider.email}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{provider.code}</Badge>
                      </TableCell>
                      <TableCell>
                        {provider.phone && (
                          <div className="text-sm">{provider.phone}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{provider._count.claims}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{provider._count.reports}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={provider.status ? "default" : "secondary"}>
                          {provider.status ? "Active" : "Inactive"}
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
                            <DropdownMenuItem onClick={() => handleEdit(provider)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(provider.id)}
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

      <ProviderDialog
        provider={selectedProvider}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
} 