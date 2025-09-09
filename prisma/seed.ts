import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data in the correct order
  console.log('🧹 Clearing existing data...');
  try {
    await prisma.sale.deleteMany({});
    await prisma.lineOrderItem.deleteMany({});
    await prisma.lineOrder.deleteMany({});
    await prisma.purchaseOrderItem.deleteMany({});
    await prisma.purchaseOrder.deleteMany({});
    await prisma.adjustmentItem.deleteMany({});
    await prisma.adjustment.deleteMany({});
    await prisma.productBatch.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.unit.deleteMany({});
    await prisma.brand.deleteMany({});
    await prisma.supplier.deleteMany({});
    await prisma.subCategory.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.mainCategory.deleteMany({});
    await prisma.banner.deleteMany({});
    await prisma.advert.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.role.deleteMany({});
    await prisma.feedback.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.insuranceClaimItem.deleteMany({});
    await prisma.insuranceClaim.deleteMany({});
    await prisma.monthlyInsuranceReport.deleteMany({});
    await prisma.insuranceProvider.deleteMany({});
    await prisma.counter.deleteMany({});
  } catch (error: any) {
    console.log('⚠️  Could not clear all data (this is normal for first run):', error.message);
  }

  // Create Roles
  console.log('👥 Creating roles...');
  const adminRole = await prisma.role.create({
    data: {
      displayName: 'Administrator',
      roleName: 'admin',
      description: 'Full system access',
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
    },
  });

  const pharmacistRole = await prisma.role.create({
    data: {
      displayName: 'Pharmacist',
      roleName: 'pharmacist',
      description: 'Sales and stock management',
      canViewDashboard: true,
      canViewSales: true,
      canViewCustomers: true,
      canViewOrders: true,
      canViewPos: true,
      canViewProducts: true,
      canViewStockAnalytics: true,
      canViewReports: true,
    },
  });

  const cashierRole = await prisma.role.create({
    data: {
      displayName: 'Cashier',
      roleName: 'cashier',
      description: 'Point of Sale access only',
      canViewPos: true,
      canViewCustomers: true,
      canViewOrders: true,
    },
  });

  const managerRole = await prisma.role.create({
    data: {
      displayName: 'Manager',
      roleName: 'manager',
      description: 'Management and reports access',
      canViewDashboard: true,
      canViewSales: true,
      canViewOrders: true,
      canViewReports: true,
      canViewProducts: true,
      canViewStockAnalytics: true,
      canViewSuppliers: true,
      canViewStockPurchase: true,
      canViewStockAdjustment: true,
    },
  });

  // Create Admin User
  console.log('👤 Creating admin user...');
  const hashedPassword = await bcrypt.hash('P@ssw0rd2025!', 12);
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@africapharmacy.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      name: 'Admin User',
      phone: '+237600000000',
      roleId: adminRole.id,
      status: true,
    },
  });

  // Create Units
  console.log('📏 Creating units...');
  const units = [
    { title: 'Comprimé', abbreviation: 'CP' },
    { title: 'Boîte', abbreviation: 'BTE' },
    { title: 'Flacon', abbreviation: 'FL' },
    { title: 'Ampoule', abbreviation: 'AMP' },
    { title: 'Tube', abbreviation: 'TUBE' },
    { title: 'Sachet', abbreviation: 'SACH' },
    { title: 'Gélule', abbreviation: 'GEL' },
    { title: 'Seringue', abbreviation: 'SER' },
    { title: 'Millilitre', abbreviation: 'ML' },
    { title: 'Gramme', abbreviation: 'G' },
  ];

  const unitMap = new Map();
  for (const unit of units) {
    const createdUnit = await prisma.unit.create({ data: unit });
    unitMap.set(unit.abbreviation, createdUnit.id);
  }

  // Create Brands
  console.log('🏷️ Creating brands...');
  const brands = [
    { title: 'Denk Pharma', slug: 'denk-pharma', status: true, logo: '/brands/denk.png' },
    { title: 'Laborex', slug: 'laborex', status: true, logo: '/brands/laborex.png' },
    { title: 'GSK', slug: 'gsk', status: true, logo: '/brands/gsk.png' },
    { title: 'Sanofi', slug: 'sanofi', status: true, logo: '/brands/sanofi.png' },
    { title: 'Generic', slug: 'generic', status: true, logo: '/brands/generic.png' },
  ];

  const brandMap = new Map();
  for (const brand of brands) {
    const createdBrand = await prisma.brand.create({ data: brand });
    brandMap.set(brand.title, createdBrand.id);
  }

  // Create Suppliers
  console.log('🚚 Creating suppliers...');
  const suppliers = [
    {
      name: 'Laborex Cameroun',
      companyName: 'Laborex Cameroun SA',
      email: 'contact@laborex.cm',
      phone: '+237233000000',
      address: 'Zone Industrielle Bassa',
      city: 'Douala',
      status: true,
    },
    {
      name: 'Pharmaspress',
      companyName: 'Pharmaspress Ltd',
      email: 'info@pharmaspress.cm',
      phone: '+237233111111',
      address: 'Rue de la Pharmacie',
      city: 'Yaoundé',
      status: true,
    },
    {
      name: 'Polypharma',
      companyName: 'Polypharma SARL',
      email: 'contact@polypharma.cm',
      phone: '+237233222222',
      address: 'Avenue Kennedy',
      city: 'Douala',
      status: true,
    },
    {
      name: 'Supermont',
      companyName: 'Supermont Distribution',
      email: 'info@supermont.cm',
      phone: '+237233333333',
      address: 'Boulevard de la Liberté',
      city: 'Douala',
      status: true,
    },
    {
      name: 'Other Suppliers',
      companyName: 'Various Suppliers Group',
      email: 'contact@various.cm',
      phone: '+237233444444',
      address: 'Multiple Locations',
      city: 'Cameroon',
      status: true,
    },
  ];

  const supplierMap = new Map();
  for (const supplier of suppliers) {
    const createdSupplier = await prisma.supplier.create({ data: supplier });
    supplierMap.set(supplier.name, createdSupplier.id);
    // Also map the company name from JSON
    if (supplier.name === 'Laborex Cameroun') {
      supplierMap.set('Laborex', createdSupplier.id);
    }
  }

  // Create Main Categories, Categories, and SubCategories
  console.log('📁 Creating categories structure...');
  
  // Main categories based on the product families in JSON
  const categoryStructure = {
    'Médicaments': {
      slug: 'medicaments',
      categories: {
        'Comprimés et Gélules': {
          slug: 'comprimes-gelules',
          subCategories: ['Antibiotiques', 'Analgésiques', 'Antipaludiques', 'Vitamines', 'Autres Comprimés']
        },
        'Sirops et Solutions': {
          slug: 'sirops-solutions',
          subCategories: ['Sirops Pédiatriques', 'Solutions Orales', 'Suspensions']
        },
        'Injectables': {
          slug: 'injectables',
          subCategories: ['Ampoules', 'Flacons Injectables', 'Perfusions']
        },
        'Pommades et Crèmes': {
          slug: 'pommades-cremes',
          subCategories: ['Crèmes Dermatologiques', 'Pommades', 'Gels']
        },
        'Collyres': {
          slug: 'collyres',
          subCategories: ['Collyres Antibiotiques', 'Collyres Anti-inflammatoires']
        }
      }
    },
    'Parapharmacie': {
      slug: 'parapharmacie',
      categories: {
        'Bébé et Maternité': {
          slug: 'bebe-maternite',
          subCategories: ['Laits Infantiles', 'Céréales', 'Accessoires Bébé', 'Hygiène Bébé']
        },
        'Hygiène et Beauté': {
          slug: 'hygiene-beaute',
          subCategories: ['Savons', 'Dentifrices', 'Soins du Corps', 'Cosmétiques']
        },
        'Matériel Médical': {
          slug: 'materiel-medical',
          subCategories: ['Seringues', 'Thermomètres', 'Tensiomètres', 'Glucomètres']
        },
        'Divers': {
          slug: 'divers',
          subCategories: ['Accessoires', 'Consommables', 'Autres']
        }
      }
    }
  };

  const categoryMap = new Map();
  const subCategoryMap = new Map();

  for (const [mainCatTitle, mainCatData] of Object.entries(categoryStructure)) {
    const mainCategory = await prisma.mainCategory.create({
      data: {
        title: mainCatTitle,
        slug: mainCatData.slug,
      },
    });

    for (const [catTitle, catData] of Object.entries(mainCatData.categories)) {
      const category = await prisma.category.create({
        data: {
          title: catTitle,
          slug: catData.slug,
          mainCategoryId: mainCategory.id,
          status: true,
        },
      });
      categoryMap.set(catTitle, category.id);

      for (const subCatTitle of catData.subCategories) {
        const subCategory = await prisma.subCategory.create({
          data: {
            title: subCatTitle,
            slug: subCatTitle.toLowerCase().replace(/ /g, '-').replace(/[éè]/g, 'e').replace(/[à]/g, 'a'),
            categoryId: category.id,
          },
        });
        subCategoryMap.set(subCatTitle, subCategory.id);
      }
    }
  }

  // Map product families to subcategories
  const familleToSubCategory: Record<string, any> = {
    'CP': subCategoryMap.get('Autres Comprimés'),
    'CO': subCategoryMap.get('Autres Comprimés'),
    'SIR': subCategoryMap.get('Sirops Pédiatriques'),
    'AMI': subCategoryMap.get('Ampoules'),
    'AMB': subCategoryMap.get('Ampoules'),
    'POM': subCategoryMap.get('Pommades'),
    'CY': subCategoryMap.get('Collyres Antibiotiques'),
    'BEB': subCategoryMap.get('Laits Infantiles'),
    'BDB': subCategoryMap.get('Dentifrices'),
    'PAR': subCategoryMap.get('Savons'),
    'DIV': subCategoryMap.get('Accessoires'),
    'ACC': subCategoryMap.get('Glucomètres'),
    'SOE': subCategoryMap.get('Solutions Orales'),
    'FR': subCategoryMap.get('Autres'),
    'GRA': subCategoryMap.get('Autres'),
    'TMP': subCategoryMap.get('Autres'),
  };

  // Load and process products from JSON
  console.log('📦 Loading products from JSON...');
  const jsonPath = path.join(process.cwd(), 'public', 'ARTICLE2TOTALAPPRO_Updated_compact.json');
  const productsData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  console.log(`📦 Creating ${productsData.length} products...`);
  
  let productCount = 0;
  const batchSize = 100;
  
  for (let i = 0; i < productsData.length; i += batchSize) {
    const batch = productsData.slice(i, Math.min(i + batchSize, productsData.length));
    
    await Promise.all(batch.map(async (item: any) => {
      try {
        const supplierId = supplierMap.get(item.FOUNISSEUR) || supplierMap.get('Other Suppliers');
        const subCategoryId = familleToSubCategory[item.FAMILLE] || subCategoryMap.get('Autres');
        const brandId = brandMap.get('Generic');
        const unitId = unitMap.get('BTE');

        if (supplierId && subCategoryId && brandId && unitId) {
          const slug = item.DESIGNATION.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 100) + '-' + item['CODE ARTICLE'];

          await prisma.product.create({
            data: {
              name: item.DESIGNATION,
              slug: slug,
              productCode: String(item['CODE ARTICLE']),
              stockQty: Math.floor(Math.random() * 100) + 10,
              productCost: item['PRIX REVIENT'] || item['PRIX BASE'],
              productPrice: item['PRIX VENTE'],
              supplierPrice: item['PRIX BASE'],
              alertQty: 10,
              productTax: 0,
              taxMethod: 'exclusive',
              status: true,
              productThumbnail: '/products/default.jpg',
              productImages: ['/products/default.jpg'],
              productDetails: `${item.FAMILLE} - ${item['SOUS FAM']}`,
              content: item.DESIGNATION,
              supplierId,
              subCategoryId,
              brandId,
              unitId,
            },
          });
          productCount++;
        }
      } catch (error) {
        console.error(`Error creating product ${item.DESIGNATION}:`, error);
      }
    }));
    
    console.log(`Progress: ${Math.min(i + batchSize, productsData.length)}/${productsData.length} products`);
  }

  console.log(`✅ Created ${productCount} products`);

  // Create sample banners
  console.log('🎨 Creating banners...');
  await prisma.banner.create({
    data: {
      title: 'Welcome to Africa Pharmacy',
      imageUrl: '/banners/welcome.jpg',
      bannerLink: '/',
      status: true,
    },
  });

  await prisma.banner.create({
    data: {
      title: 'Special Offers',
      imageUrl: '/banners/offers.jpg',
      bannerLink: '/offers',
      status: true,
    },
  });

  // Create counters for order numbers
  console.log('🔢 Creating counters...');
  await prisma.counter.create({
    data: {
      name: 'orderNumber',
      value: 1000,
    },
  });

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });