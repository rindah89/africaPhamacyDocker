"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { ClaimStatus, ReportStatus } from "@prisma/client";

// ===================
// PROVIDER ACTIONS
// ===================

export async function createInsuranceProvider(data: {
  name: string;
  code: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  logoUrl?: string;
  website?: string;
  status: boolean;
}) {
  try {
    const provider = await prisma.insuranceProvider.create({
      data,
    });

    revalidatePath("/dashboard/insurance-partners");
    return { success: true, data: provider };
  } catch (error: any) {
    console.error("Error creating insurance provider:", error);
    return { success: false, error: error.message };
  }
}

export async function getInsuranceProviders() {
  try {
    const providers = await prisma.insuranceProvider.findMany({
      include: {
        _count: {
          select: {
            claims: true,
            reports: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: providers };
  } catch (error: any) {
    console.error("Error fetching insurance providers:", error);
    return { success: false, error: error.message };
  }
}

export async function updateInsuranceProvider(
  id: string,
  data: {
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
) {
  try {
    const provider = await prisma.insuranceProvider.update({
      where: { id },
      data,
    });

    revalidatePath("/dashboard/insurance-partners");
    return { success: true, data: provider };
  } catch (error: any) {
    console.error("Error updating insurance provider:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteInsuranceProvider(id: string) {
  try {
    await prisma.insuranceProvider.delete({
      where: { id },
    });

    revalidatePath("/dashboard/insurance-partners");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting insurance provider:", error);
    return { success: false, error: error.message };
  }
}

// ===================
// CLAIM ACTIONS
// ===================

export async function createInsuranceClaim(data: {
  orderNumber?: string;
  customerName: string;
  customerPhone?: string;
  policyNumber: string;
  totalAmount: number;
  insurancePercentage: number;
  providerId: string;
  claimItems: Array<{
    productName: string;
    productCode?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  notes?: string;
}) {
  try {
    // Calculate insurance and customer amounts
    const insuranceAmount = (data.totalAmount * data.insurancePercentage) / 100;
    const customerAmount = data.totalAmount - insuranceAmount;

    // Generate claim number
    const claimNumber = `CLM-${Date.now()}`;

    const claim = await prisma.insuranceClaim.create({
      data: {
        claimNumber,
        orderNumber: data.orderNumber,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        policyNumber: data.policyNumber,
        totalAmount: data.totalAmount,
        insurancePercentage: data.insurancePercentage,
        insuranceAmount,
        customerAmount,
        providerId: data.providerId,
        notes: data.notes,
        claimItems: {
          create: data.claimItems,
        },
      },
      include: {
        provider: true,
        claimItems: true,
      },
    });

    revalidatePath("/dashboard/insurance-partners");
    return { success: true, data: claim };
  } catch (error: any) {
    console.error("Error creating insurance claim:", error);
    return { success: false, error: error.message };
  }
}

export async function getInsuranceClaims() {
  try {
    const claims = await prisma.insuranceClaim.findMany({
      include: {
        provider: true,
        claimItems: true,
        monthlyReport: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: claims };
  } catch (error: any) {
    console.error("Error fetching insurance claims:", error);
    return { success: false, error: error.message };
  }
}

export async function updateClaimStatus(id: string, status: ClaimStatus) {
  try {
    const claim = await prisma.insuranceClaim.update({
      where: { id },
      data: { 
        status,
        paidDate: status === ClaimStatus.PAID ? new Date() : undefined,
      },
      include: {
        provider: true,
      },
    });

    revalidatePath("/dashboard/insurance-partners");
    return { success: true, data: claim };
  } catch (error: any) {
    console.error("Error updating claim status:", error);
    return { success: false, error: error.message };
  }
}

// ===================
// MONTHLY REPORT ACTIONS
// ===================

export async function generateMonthlyReport(providerId: string, month: number, year: number) {
  try {
    // Check if report already exists
    const existingReport = await prisma.monthlyInsuranceReport.findUnique({
      where: {
        providerId_month_year: {
          providerId,
          month,
          year,
        },
      },
    });

    if (existingReport) {
      return { success: false, error: "Report already exists for this month" };
    }

    // Get all pending claims for this provider in the specified month/year
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const claims = await prisma.insuranceClaim.findMany({
      where: {
        providerId,
        status: ClaimStatus.PENDING,
        claimDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        claimItems: true,
      },
    });

    if (claims.length === 0) {
      return { success: false, error: "No pending claims found for this period" };
    }

    // Calculate totals
    const totalAmount = claims.reduce((sum, claim) => sum + claim.totalAmount, 0);
    const insuranceAmount = claims.reduce((sum, claim) => sum + claim.insuranceAmount, 0);

    // Generate report number
    const reportNumber = `RPT-${providerId.slice(-6)}-${month.toString().padStart(2, '0')}${year}`;

    // Create report
    const report = await prisma.monthlyInsuranceReport.create({
      data: {
        reportNumber,
        month,
        year,
        totalClaims: claims.length,
        totalAmount,
        insuranceAmount,
        providerId,
      },
      include: {
        provider: true,
      },
    });

    // Update claims to link to this report
    await prisma.insuranceClaim.updateMany({
      where: {
        id: {
          in: claims.map(claim => claim.id),
        },
      },
      data: {
        monthlyReportId: report.id,
        processedDate: new Date(),
      },
    });

    revalidatePath("/dashboard/insurance-partners");
    return { success: true, data: report };
  } catch (error: any) {
    console.error("Error generating monthly report:", error);
    return { success: false, error: error.message };
  }
}

export async function getMonthlyReports() {
  try {
    const reports = await prisma.monthlyInsuranceReport.findMany({
      include: {
        provider: true,
        claims: {
          include: {
            claimItems: true,
          },
        },
      },
      orderBy: [
        { year: "desc" },
        { month: "desc" },
        { createdAt: "desc" },
      ],
    });

    return { success: true, data: reports };
  } catch (error: any) {
    console.error("Error fetching monthly reports:", error);
    return { success: false, error: error.message };
  }
}

export async function updateReportStatus(id: string, status: ReportStatus) {
  try {
    const report = await prisma.monthlyInsuranceReport.update({
      where: { id },
      data: { 
        status,
        submittedDate: status === ReportStatus.SUBMITTED ? new Date() : undefined,
        paidDate: status === ReportStatus.PAID ? new Date() : undefined,
      },
      include: {
        provider: true,
        claims: true,
      },
    });

    // If report is marked as paid, update all associated claims
    if (status === ReportStatus.PAID) {
      await prisma.insuranceClaim.updateMany({
        where: {
          monthlyReportId: id,
        },
        data: {
          status: ClaimStatus.PAID,
          paidDate: new Date(),
        },
      });
    } else if (status === ReportStatus.SUBMITTED) {
      await prisma.insuranceClaim.updateMany({
        where: {
          monthlyReportId: id,
        },
        data: {
          status: ClaimStatus.SUBMITTED,
        },
      });
    }

    revalidatePath("/dashboard/insurance-partners");
    return { success: true, data: report };
  } catch (error: any) {
    console.error("Error updating report status:", error);
    return { success: false, error: error.message };
  }
}

// ===================
// ANALYTICS
// ===================

export async function getInsuranceAnalytics() {
  try {
    const [
      totalClaims,
      pendingClaims,
      submittedClaims,
      paidClaims,
      totalClaimAmount,
      totalInsuranceAmount,
      totalReports,
      paidReports,
    ] = await Promise.all([
      prisma.insuranceClaim.count(),
      prisma.insuranceClaim.count({ where: { status: ClaimStatus.PENDING } }),
      prisma.insuranceClaim.count({ where: { status: ClaimStatus.SUBMITTED } }),
      prisma.insuranceClaim.count({ where: { status: ClaimStatus.PAID } }),
      prisma.insuranceClaim.aggregate({
        _sum: { totalAmount: true },
      }),
      prisma.insuranceClaim.aggregate({
        _sum: { insuranceAmount: true },
      }),
      prisma.monthlyInsuranceReport.count(),
      prisma.monthlyInsuranceReport.count({ where: { status: ReportStatus.PAID } }),
    ]);

    const analytics = {
      claims: {
        total: totalClaims,
        pending: pendingClaims,
        submitted: submittedClaims,
        paid: paidClaims,
        totalAmount: totalClaimAmount._sum.totalAmount || 0,
        insuranceAmount: totalInsuranceAmount._sum.insuranceAmount || 0,
      },
      reports: {
        total: totalReports,
        paid: paidReports,
        paymentRate: totalReports > 0 ? (paidReports / totalReports * 100) : 0,
      },
    };

    return { success: true, data: analytics };
  } catch (error: any) {
    console.error("Error fetching insurance analytics:", error);
    return { success: false, error: error.message };
  }
} 