"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MoreHorizontal, Download, Send, CheckCircle, Calendar } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { generateMonthlyReport, updateReportStatus } from "@/actions/insurance";
import { toast } from "sonner";
import { ReportStatus } from "@prisma/client";

interface MonthlyReport {
  id: string;
  reportNumber: string;
  month: number;
  year: number;
  totalClaims: number;
  totalAmount: number;
  insuranceAmount: number;
  generatedDate: Date;
  submittedDate?: Date;
  paidDate?: Date;
  status: ReportStatus;
  notes?: string;
  provider: {
    id: string;
    name: string;
    code: string;
  };
  claims: Array<{
    claimNumber: string;
    customerName: string;
    totalAmount: number;
    insuranceAmount: number;
  }>;
}

interface Provider {
  id: string;
  name: string;
  code: string;
}

interface ReportsTabProps {
  reports: MonthlyReport[];
  providers: Provider[];
}

export default function ReportsTab({ reports, providers }: ReportsTabProps) {
  console.log("🔍 ReportsTab: Component rendering");
  console.log("🔍 ReportsTab: Received reports:", reports?.length || 0);
  console.log("🔍 ReportsTab: Received providers:", providers?.length || 0);
  console.log("🔍 ReportsTab: Reports data:", reports);
  console.log("🔍 ReportsTab: Providers data:", providers);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString());
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");

  console.log("🔍 ReportsTab: About to filter reports");
  
  let filteredReports = [];
  try {
    filteredReports = reports.filter(report => {
      console.log("🔍 ReportsTab: Filtering report:", report?.reportNumber);
      const matchesSearch = 
        report.reportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.provider.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || report.status === statusFilter;
      const matchesProvider = selectedProvider === "all" || report.provider.id === selectedProvider;
      
      return matchesSearch && matchesStatus && matchesProvider;
    });

    console.log("🔍 ReportsTab: Filtered reports count:", filteredReports.length);
  } catch (error: any) {
    console.error("❌ ReportsTab: Error in filteredReports:", error);
    console.error("❌ ReportsTab: Error stack:", error.stack);
    filteredReports = []; // Fallback to empty array
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.DRAFT:
        return <Calendar className="h-4 w-4 text-gray-500" />;
      case ReportStatus.SUBMITTED:
        return <Send className="h-4 w-4 text-blue-500" />;
      case ReportStatus.PAID:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: ReportStatus): "default" | "secondary" | "outline" => {
    switch (status) {
      case ReportStatus.PAID:
        return "default";
      case ReportStatus.SUBMITTED:
        return "secondary";
      case ReportStatus.DRAFT:
        return "outline";
      default:
        return "outline";
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedProviderId) {
      toast.error("Please select a provider");
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateMonthlyReport(
        selectedProviderId,
        parseInt(selectedMonth),
        parseInt(selectedYear)
      );
      
      if (result.success) {
        toast.success("Monthly report generated successfully");
        setGenerateDialogOpen(false);
        setSelectedProviderId("");
      } else {
        toast.error(result.error || "Failed to generate report");
      }
    } catch (error) {
      toast.error("An error occurred while generating the report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId: string, newStatus: ReportStatus) => {
    setIsLoading(true);
    try {
      const result = await updateReportStatus(reportId, newStatus);
      if (result.success) {
        toast.success("Report status updated successfully");
      } else {
        toast.error(result.error || "Failed to update report status");
      }
    } catch (error) {
      toast.error("An error occurred while updating the report status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = (report: MonthlyReport) => {
    // Create CSV content
    const headers = [
      'Claim Number',
      'Customer Name',
      'Policy Number',
      'Total Amount',
      'Insurance Amount',
      'Customer Amount'
    ];

    const csvContent = [
      headers.join(','),
      ...report.claims.map(claim => [
        claim.claimNumber,
        `"${claim.customerName}"`,
        '', // Policy number not available in this data structure
        claim.totalAmount,
        claim.insuranceAmount,
        claim.totalAmount - claim.insuranceAmount
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.reportNumber}-${getMonthName(report.month)}-${report.year}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success("Report downloaded successfully");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Monthly Insurance Reports</CardTitle>
              <CardDescription>
                Generate and manage monthly reports for insurance companies
              </CardDescription>
            </div>
            <Button onClick={() => setGenerateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Claims</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Insurance Amount</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-3">
                        <Calendar className="h-12 w-12 text-muted-foreground/50" />
                        <div>
                          <h3 className="text-lg font-medium">No Monthly Reports</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Generate your first monthly report to track insurance claims for submission
                          </p>
                        </div>
                        <Button onClick={() => setGenerateDialogOpen(true)} className="mt-4">
                          <Plus className="mr-2 h-4 w-4" />
                          Generate First Report
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{report.reportNumber}</div>
                          {report.submittedDate && (
                            <div className="text-xs text-blue-600">
                              Submitted: {formatDate(report.submittedDate)}
                            </div>
                          )}
                          {report.paidDate && (
                            <div className="text-xs text-green-600">
                              Paid: {formatDate(report.paidDate)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{report.provider.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {report.provider.code}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {getMonthName(report.month)} {report.year}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{report.totalClaims}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(report.totalAmount)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-blue-600">
                          {formatCurrency(report.insuranceAmount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(report.generatedDate)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(report.status)}
                          <Badge variant={getStatusVariant(report.status)}>
                            {report.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDownloadReport(report)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download CSV
                            </DropdownMenuItem>
                            {report.status === ReportStatus.DRAFT && (
                              <DropdownMenuItem 
                                onClick={() => handleStatusUpdate(report.id, ReportStatus.SUBMITTED)}
                                disabled={isLoading}
                              >
                                <Send className="mr-2 h-4 w-4" />
                                Mark as Submitted
                              </DropdownMenuItem>
                            )}
                            {report.status === ReportStatus.SUBMITTED && (
                              <DropdownMenuItem 
                                onClick={() => handleStatusUpdate(report.id, ReportStatus.PAID)}
                                disabled={isLoading}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Paid
                              </DropdownMenuItem>
                            )}
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

      {/* Generate Report Dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Monthly Report</DialogTitle>
            <DialogDescription>
              Generate a monthly report for an insurance provider to submit for payment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Insurance Provider</Label>
              <Select value={selectedProviderId} onValueChange={setSelectedProviderId}>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <SelectItem key={month} value={month.toString()}>
                        {getMonthName(month)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateReport} disabled={isLoading || !selectedProviderId}>
              {isLoading ? 'Generating...' : 'Generate Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 