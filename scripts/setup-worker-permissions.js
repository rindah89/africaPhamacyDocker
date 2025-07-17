// Script to create or update worker roles with comprehensive permissions
// Run this with: node scripts/setup-worker-permissions.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupWorkerPermissions() {
  try {
    console.log('🚀 Setting up worker permissions...');

    // Define comprehensive permissions for all workers (non-customers)
    const workerPermissions = {
      canViewDashboard: true,
      canViewUsers: true,
      canViewRoles: true,
      canViewSales: true,
      canViewCustomers: true,
      canViewOrders: true,
      canViewPos: true,
      canViewStockPurchase: true,
      canViewStockAdjustment: true,
      canViewApi: true,
      canViewReports: true,
      canViewSettings: true,
      canViewMainCategories: true,
      canViewCategories: true,
      canViewSubCategories: true,
      canViewBrands: true,
      canViewAdverts: true,
      canViewBanners: true,
      canViewUnits: true,
      canViewProducts: true,
      canViewStockAnalytics: true,
      canViewSuppliers: true,
      canViewInsurancePartners: true,
    };

    // Create or update common worker roles
    const rolesToSetup = [
      {
        displayName: 'Manager',
        roleName: 'manager',
        description: 'Full access manager role',
        ...workerPermissions
      },
      {
        displayName: 'Pharmacist',
        roleName: 'pharmacist',
        description: 'Pharmacist with full system access',
        ...workerPermissions
      },
      {
        displayName: 'Cashier',
        roleName: 'cashier',
        description: 'Cashier with full system access',
        ...workerPermissions
      },
      {
        displayName: 'Stock Clerk',
        roleName: 'stock_clerk',
        description: 'Stock management with full system access',
        ...workerPermissions
      },
      {
        displayName: 'Admin',
        roleName: 'admin',
        description: 'Administrator with full system access',
        ...workerPermissions
      }
    ];

    // Ensure Customer role exists with limited permissions
    const customerRole = {
      displayName: 'Customer',
      roleName: 'customer',
      description: 'Customer with limited access',
      canViewDashboard: false,
      canViewUsers: false,
      canViewRoles: false,
      canViewSales: false,
      canViewCustomers: false,
      canViewOrders: true, // Customers can view their own orders
      canViewPos: false,
      canViewStockPurchase: false,
      canViewStockAdjustment: false,
      canViewApi: false,
      canViewReports: false,
      canViewSettings: false,
      canViewMainCategories: false,
      canViewCategories: false,
      canViewSubCategories: false,
      canViewBrands: false,
      canViewAdverts: false,
      canViewBanners: false,
      canViewUnits: false,
      canViewProducts: true, // Customers can view products
      canViewStockAnalytics: false,
      canViewSuppliers: false,
      canViewInsurancePartners: false,
    };

    // Add customer role to the list
    rolesToSetup.push(customerRole);

    console.log(`📋 Setting up ${rolesToSetup.length} roles...`);

    for (const roleData of rolesToSetup) {
      try {
        // Try to find existing role
        const existingRole = await prisma.role.findUnique({
          where: { roleName: roleData.roleName }
        });

        if (existingRole) {
          // Update existing role
          const updatedRole = await prisma.role.update({
            where: { roleName: roleData.roleName },
            data: roleData
          });
          console.log(`✅ Updated role: ${updatedRole.displayName}`);
        } else {
          // Create new role
          const newRole = await prisma.role.create({
            data: roleData
          });
          console.log(`🆕 Created role: ${newRole.displayName}`);
        }
      } catch (error) {
        console.error(`❌ Error with role ${roleData.displayName}:`, error.message);
      }
    }

    console.log('\n🎉 Permission setup completed!');
    console.log('\n📝 Summary:');
    console.log('- All worker roles (Manager, Pharmacist, Cashier, Stock Clerk, Admin) have full access');
    console.log('- Customer role has limited access (can only view products and their orders)');
    console.log('- Permission system now works: Non-customers see everything, customers see limited content');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupWorkerPermissions(); 