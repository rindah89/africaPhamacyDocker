import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Roles
  const adminRole = await prisma.role.create({
    data: {
      displayName: 'Administrateur',
      roleName: 'admin',
      description: 'Accès complet au système',
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
      displayName: 'Pharmacien',
      roleName: 'pharmacist',
      description: 'Gestion des ventes et du stock',
      canViewDashboard: true,
      canViewSales: true,
      canViewCustomers: true,
      canViewOrders: true,
      canViewPos: true,
      canViewStockPurchase: true,
      canViewStockAdjustment: true,
      canViewReports: true,
      canViewProducts: true,
      canViewStockAnalytics: true,
      canViewSuppliers: true,
    },
  });

  const cashierRole = await prisma.role.create({
    data: {
      displayName: 'Caissier',
      roleName: 'cashier',
      description: 'Point de vente uniquement',
      canViewPos: true,
      canViewSales: true,
      canViewCustomers: true,
      canViewOrders: true,
      canViewProducts: true,
    },
  });

  const stockManagerRole = await prisma.role.create({
    data: {
      displayName: 'Gestionnaire de Stock',
      roleName: 'stock_manager',
      description: 'Gestion des stocks et inventaire',
      canViewDashboard: true,
      canViewStockPurchase: true,
      canViewStockAdjustment: true,
      canViewProducts: true,
      canViewStockAnalytics: true,
      canViewSuppliers: true,
      canViewReports: true,
    },
  });

  console.log('✅ Roles created');

  // Create Users
  const hashedPassword = await bcrypt.hash('Pharmacy@2024', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@pharmaciedouala.cm',
      password: hashedPassword,
      plainPassword: 'Pharmacy@2024',
      firstName: 'Jean-Pierre',
      lastName: 'Mbarga',
      name: 'Jean-Pierre Mbarga',
      phone: '+237650123456',
      roleId: adminRole.id,
      status: true,
      inviteSent: true,
    },
  });

  const pharmacist1 = await prisma.user.create({
    data: {
      email: 'marie.ngo@pharmaciedouala.cm',
      password: hashedPassword,
      plainPassword: 'Pharmacy@2024',
      firstName: 'Marie',
      lastName: 'Ngo',
      name: 'Marie Ngo',
      phone: '+237670234567',
      roleId: pharmacistRole.id,
      status: true,
      inviteSent: true,
    },
  });

  const pharmacist2 = await prisma.user.create({
    data: {
      email: 'paul.kamga@pharmaciedouala.cm',
      password: hashedPassword,
      plainPassword: 'Pharmacy@2024',
      firstName: 'Paul',
      lastName: 'Kamga',
      name: 'Paul Kamga',
      phone: '+237690345678',
      roleId: pharmacistRole.id,
      status: true,
      inviteSent: true,
    },
  });

  const cashier1 = await prisma.user.create({
    data: {
      email: 'sandrine.fotso@pharmaciedouala.cm',
      password: hashedPassword,
      plainPassword: 'Pharmacy@2024',
      firstName: 'Sandrine',
      lastName: 'Fotso',
      name: 'Sandrine Fotso',
      phone: '+237655456789',
      roleId: cashierRole.id,
      status: true,
      inviteSent: true,
    },
  });

  const cashier2 = await prisma.user.create({
    data: {
      email: 'eric.tchinda@pharmaciedouala.cm',
      password: hashedPassword,
      plainPassword: 'Pharmacy@2024',
      firstName: 'Eric',
      lastName: 'Tchinda',
      name: 'Eric Tchinda',
      phone: '+237675567890',
      roleId: cashierRole.id,
      status: true,
      inviteSent: true,
    },
  });

  const stockManager = await prisma.user.create({
    data: {
      email: 'georges.essomba@pharmaciedouala.cm',
      password: hashedPassword,
      plainPassword: 'Pharmacy@2024',
      firstName: 'Georges',
      lastName: 'Essomba',
      name: 'Georges Essomba',
      phone: '+237695678901',
      roleId: stockManagerRole.id,
      status: true,
      inviteSent: true,
    },
  });

  console.log('✅ Users created');

  // Create Main Categories
  const medicamentsMainCat = await prisma.mainCategory.create({
    data: {
      title: 'Médicaments',
      slug: 'medicaments',
    },
  });

  const soinsSanteMainCat = await prisma.mainCategory.create({
    data: {
      title: 'Soins et Santé',
      slug: 'soins-sante',
    },
  });

  const beauteHygieneMainCat = await prisma.mainCategory.create({
    data: {
      title: 'Beauté et Hygiène',
      slug: 'beaute-hygiene',
    },
  });

  console.log('✅ Main Categories created');

  // Create Categories
  const antibiotiques = await prisma.category.create({
    data: {
      title: 'Antibiotiques',
      slug: 'antibiotiques',
      description: 'Médicaments antibiotiques',
      status: true,
      mainCategoryId: medicamentsMainCat.id,
    },
  });

  const analgesiques = await prisma.category.create({
    data: {
      title: 'Analgésiques',
      slug: 'analgesiques',
      description: 'Médicaments contre la douleur',
      status: true,
      mainCategoryId: medicamentsMainCat.id,
    },
  });

  const antipaludiques = await prisma.category.create({
    data: {
      title: 'Antipaludiques',
      slug: 'antipaludiques',
      description: 'Médicaments contre le paludisme',
      status: true,
      mainCategoryId: medicamentsMainCat.id,
    },
  });

  const vitamines = await prisma.category.create({
    data: {
      title: 'Vitamines et Suppléments',
      slug: 'vitamines-supplements',
      description: 'Vitamines et compléments alimentaires',
      status: true,
      mainCategoryId: soinsSanteMainCat.id,
    },
  });

  const premiersSecours = await prisma.category.create({
    data: {
      title: 'Premiers Secours',
      slug: 'premiers-secours',
      description: 'Matériel de premiers secours',
      status: true,
      mainCategoryId: soinsSanteMainCat.id,
    },
  });

  const soinsVisage = await prisma.category.create({
    data: {
      title: 'Soins du Visage',
      slug: 'soins-visage',
      description: 'Produits pour le soin du visage',
      status: true,
      mainCategoryId: beauteHygieneMainCat.id,
    },
  });

  console.log('✅ Categories created');

  // Create SubCategories
  const penicillines = await prisma.subCategory.create({
    data: {
      title: 'Pénicillines',
      slug: 'penicillines',
      categoryId: antibiotiques.id,
    },
  });

  const cephalosporines = await prisma.subCategory.create({
    data: {
      title: 'Céphalosporines',
      slug: 'cephalosporines',
      categoryId: antibiotiques.id,
    },
  });

  const paracetamol = await prisma.subCategory.create({
    data: {
      title: 'Paracétamol',
      slug: 'paracetamol',
      categoryId: analgesiques.id,
    },
  });

  const ibuprofene = await prisma.subCategory.create({
    data: {
      title: 'Ibuprofène',
      slug: 'ibuprofene',
      categoryId: analgesiques.id,
    },
  });

  const artemisinine = await prisma.subCategory.create({
    data: {
      title: 'Artémisinine',
      slug: 'artemisinine',
      categoryId: antipaludiques.id,
    },
  });

  const chloroquine = await prisma.subCategory.create({
    data: {
      title: 'Chloroquine',
      slug: 'chloroquine',
      categoryId: antipaludiques.id,
    },
  });

  const vitamineC = await prisma.subCategory.create({
    data: {
      title: 'Vitamine C',
      slug: 'vitamine-c',
      categoryId: vitamines.id,
    },
  });

  const vitamineD = await prisma.subCategory.create({
    data: {
      title: 'Vitamine D',
      slug: 'vitamine-d',
      categoryId: vitamines.id,
    },
  });

  const pansements = await prisma.subCategory.create({
    data: {
      title: 'Pansements',
      slug: 'pansements',
      categoryId: premiersSecours.id,
    },
  });

  const cremes = await prisma.subCategory.create({
    data: {
      title: 'Crèmes Hydratantes',
      slug: 'cremes-hydratantes',
      categoryId: soinsVisage.id,
    },
  });

  console.log('✅ SubCategories created');

  // Create Brands
  const sandoz = await prisma.brand.create({
    data: {
      title: 'Sandoz',
      slug: 'sandoz',
      status: true,
      logo: '/brands/sandoz.png',
    },
  });

  const sanofi = await prisma.brand.create({
    data: {
      title: 'Sanofi',
      slug: 'sanofi',
      status: true,
      logo: '/brands/sanofi.png',
    },
  });

  const gsk = await prisma.brand.create({
    data: {
      title: 'GSK',
      slug: 'gsk',
      status: true,
      logo: '/brands/gsk.png',
    },
  });

  const novartis = await prisma.brand.create({
    data: {
      title: 'Novartis',
      slug: 'novartis',
      status: true,
      logo: '/brands/novartis.png',
    },
  });

  const cinpharm = await prisma.brand.create({
    data: {
      title: 'Cinpharm',
      slug: 'cinpharm',
      status: true,
      logo: '/brands/cinpharm.png',
    },
  });

  console.log('✅ Brands created');

  // Create Units
  const comprime = await prisma.unit.create({
    data: {
      title: 'Comprimé',
      abbreviation: 'cp',
    },
  });

  const gelule = await prisma.unit.create({
    data: {
      title: 'Gélule',
      abbreviation: 'gél',
    },
  });

  const sirop = await prisma.unit.create({
    data: {
      title: 'Sirop',
      abbreviation: 'flac',
    },
  });

  const creme = await prisma.unit.create({
    data: {
      title: 'Crème',
      abbreviation: 'tube',
    },
  });

  const injectable = await prisma.unit.create({
    data: {
      title: 'Injectable',
      abbreviation: 'amp',
    },
  });

  console.log('✅ Units created');

  // Create Suppliers
  const promopharma = await prisma.supplier.create({
    data: {
      name: 'Promopharma',
      companyName: 'Promopharma Cameroun SA',
      email: 'contact@promopharma.cm',
      phone: '+237233456789',
      address: 'Zone Industrielle Bassa',
      city: 'Douala',
      status: true,
    },
  });

  const laborex = await prisma.supplier.create({
    data: {
      name: 'Laborex',
      companyName: 'Laborex Cameroun',
      email: 'info@laborex.cm',
      phone: '+237233567890',
      address: 'Rue des Pharmaciens',
      city: 'Douala',
      status: true,
    },
  });

  const dpml = await prisma.supplier.create({
    data: {
      name: 'DPML',
      companyName: 'Distribution Pharmaceutique du Marché Local',
      email: 'contact@dpml.cm',
      phone: '+237233678901',
      address: 'Avenue de la Liberté',
      city: 'Douala',
      status: true,
    },
  });

  console.log('✅ Suppliers created');

  // Create Banners
  await prisma.banner.create({
    data: {
      title: 'Bienvenue à Africa Pharmacy',
      imageUrl: '/banners/slider1.gif',
      bannerLink: '/shop',
      status: true,
    },
  });

  await prisma.banner.create({
    data: {
      title: 'Promotions Spéciales',
      imageUrl: '/banners/slider1.gif',
      bannerLink: '/categories/medicaments',
      status: true,
    },
  });

  await prisma.banner.create({
    data: {
      title: 'Livraison Gratuite',
      imageUrl: '/banners/slider1.gif',
      bannerLink: '/shop',
      status: true,
    },
  });

  console.log('✅ Banners created');

  // Create Insurance Providers
  const cnps = await prisma.insuranceProvider.create({
    data: {
      name: 'CNPS',
      code: 'CNPS',
      email: 'contact@cnps.cm',
      phone: '+237233445566',
      address: 'Boulevard de la République',
      contactPerson: 'Mme Ngono Christine',
      status: true,
      website: 'www.cnps.cm',
    },
  });

  const allianzInsurance = await prisma.insuranceProvider.create({
    data: {
      name: 'Allianz Cameroun',
      code: 'ALLIANZ',
      email: 'info@allianz.cm',
      phone: '+237233556677',
      address: 'Rue Joss',
      contactPerson: 'M. Fouda Pierre',
      status: true,
      website: 'www.allianz.cm',
    },
  });

  const sahamInsurance = await prisma.insuranceProvider.create({
    data: {
      name: 'Saham Assurance',
      code: 'SAHAM',
      email: 'contact@saham.cm',
      phone: '+237233667788',
      address: 'Boulevard du 20 Mai',
      contactPerson: 'M. Njoya Samuel',
      status: true,
      website: 'www.saham.cm',
    },
  });

  console.log('✅ Insurance Providers created');

  // Create Products with realistic Cameroonian pharmacy data
  const products = [
    // Antibiotics
    {
      name: 'Amoxicilline 500mg',
      slug: 'amoxicilline-500mg',
      productCode: 'AMX500',
      stockQty: 500,
      productCost: 1200,
      productPrice: 1800,
      supplierPrice: 1300,
      alertQty: 50,
      productTax: 19.25,
      taxMethod: 'inclusive',
      productImages: ['/drugbottle.jpeg'],
      status: true,
      productThumbnail: '/drugbottle.jpeg',
      productDetails: 'Antibiotique à large spectre pour infections bactériennes',
      content: 'Boîte de 16 comprimés',
      subCategoryId: penicillines.id,
      brandId: sandoz.id,
      unitId: comprime.id,
      supplierId: promopharma.id,
    },
    {
      name: 'Ceftriaxone 1g Injectable',
      slug: 'ceftriaxone-1g-injectable',
      productCode: 'CEF1000',
      stockQty: 200,
      productCost: 2500,
      productPrice: 3500,
      supplierPrice: 2700,
      alertQty: 30,
      productTax: 19.25,
      taxMethod: 'inclusive',
      productImages: ['/drugbottle.jpeg'],
      status: true,
      productThumbnail: '/drugbottle.jpeg',
      productDetails: 'Antibiotique injectable pour infections sévères',
      content: 'Flacon + solvant',
      subCategoryId: cephalosporines.id,
      brandId: sanofi.id,
      unitId: injectable.id,
      supplierId: laborex.id,
    },
    // Analgesics
    {
      name: 'Doliprane 500mg',
      slug: 'doliprane-500mg',
      productCode: 'DOL500',
      stockQty: 1000,
      productCost: 800,
      productPrice: 1200,
      supplierPrice: 900,
      alertQty: 100,
      productTax: 19.25,
      taxMethod: 'inclusive',
      productImages: ['/drugbottle.jpeg'],
      status: true,
      productThumbnail: '/drugbottle.jpeg',
      productDetails: 'Paracétamol pour douleur et fièvre',
      content: 'Boîte de 16 comprimés',
      subCategoryId: paracetamol.id,
      brandId: sanofi.id,
      unitId: comprime.id,
      supplierId: dpml.id,
    },
    {
      name: 'Ibuprofène 400mg',
      slug: 'ibuprofene-400mg',
      productCode: 'IBU400',
      stockQty: 800,
      productCost: 1000,
      productPrice: 1500,
      supplierPrice: 1100,
      alertQty: 80,
      productTax: 19.25,
      taxMethod: 'inclusive',
      productImages: ['/drugbottle.jpeg'],
      status: true,
      productThumbnail: '/drugbottle.jpeg',
      productDetails: 'Anti-inflammatoire non stéroïdien',
      content: 'Boîte de 20 comprimés',
      subCategoryId: ibuprofene.id,
      brandId: gsk.id,
      unitId: comprime.id,
      supplierId: promopharma.id,
    },
    // Antimalarials
    {
      name: 'Coartem (Artémether/Luméfantrine)',
      slug: 'coartem',
      productCode: 'COART',
      stockQty: 600,
      productCost: 2000,
      productPrice: 3000,
      supplierPrice: 2200,
      alertQty: 60,
      productTax: 0, // Often tax-exempt for essential medicines
      taxMethod: 'exclusive',
      productImages: ['/drugbottle.jpeg'],
      status: true,
      productThumbnail: '/drugbottle.jpeg',
      productDetails: 'Traitement antipaludique de première ligne',
      content: 'Boîte de 24 comprimés',
      subCategoryId: artemisinine.id,
      brandId: novartis.id,
      unitId: comprime.id,
      supplierId: laborex.id,
    },
    {
      name: 'Quinine 300mg',
      slug: 'quinine-300mg',
      productCode: 'QUI300',
      stockQty: 400,
      productCost: 1500,
      productPrice: 2200,
      supplierPrice: 1700,
      alertQty: 40,
      productTax: 0,
      taxMethod: 'exclusive',
      productImages: ['/drugbottle.jpeg'],
      status: true,
      productThumbnail: '/drugbottle.jpeg',
      productDetails: 'Traitement du paludisme sévère',
      content: 'Boîte de 20 comprimés',
      subCategoryId: chloroquine.id,
      brandId: cinpharm.id,
      unitId: comprime.id,
      supplierId: dpml.id,
    },
    // Vitamins
    {
      name: 'Vitamine C 500mg',
      slug: 'vitamine-c-500mg',
      productCode: 'VITC500',
      stockQty: 500,
      productCost: 1000,
      productPrice: 1600,
      supplierPrice: 1100,
      alertQty: 50,
      productTax: 19.25,
      taxMethod: 'inclusive',
      productImages: ['/drugbottle.jpeg'],
      status: true,
      productThumbnail: '/drugbottle.jpeg',
      productDetails: 'Complément en vitamine C',
      content: 'Boîte de 30 comprimés effervescents',
      subCategoryId: vitamineC.id,
      brandId: sandoz.id,
      unitId: comprime.id,
      supplierId: promopharma.id,
    },
    {
      name: 'Vitamine D3 1000 UI',
      slug: 'vitamine-d3-1000ui',
      productCode: 'VITD1000',
      stockQty: 300,
      productCost: 2000,
      productPrice: 3000,
      supplierPrice: 2200,
      alertQty: 30,
      productTax: 19.25,
      taxMethod: 'inclusive',
      productImages: ['/drugbottle.jpeg'],
      status: true,
      productThumbnail: '/drugbottle.jpeg',
      productDetails: 'Supplément de vitamine D3',
      content: 'Boîte de 60 gélules',
      subCategoryId: vitamineD.id,
      brandId: gsk.id,
      unitId: gelule.id,
      supplierId: laborex.id,
    },
    // First Aid
    {
      name: 'Pansements Adhésifs Assortis',
      slug: 'pansements-adhesifs',
      productCode: 'PANS001',
      stockQty: 200,
      productCost: 1500,
      productPrice: 2500,
      supplierPrice: 1700,
      alertQty: 20,
      productTax: 19.25,
      taxMethod: 'inclusive',
      productImages: ['/drugbottle.jpeg'],
      status: true,
      productThumbnail: '/drugbottle.jpeg',
      productDetails: 'Boîte de pansements de différentes tailles',
      content: 'Boîte de 50 pansements',
      subCategoryId: pansements.id,
      brandId: gsk.id,
      unitId: comprime.id,
      supplierId: dpml.id,
    },
    // Skin Care
    {
      name: 'Nivea Crème Hydratante',
      slug: 'nivea-creme-hydratante',
      productCode: 'NIV001',
      stockQty: 150,
      productCost: 2000,
      productPrice: 3500,
      supplierPrice: 2300,
      alertQty: 15,
      productTax: 19.25,
      taxMethod: 'inclusive',
      productImages: ['/drugbottle.jpeg'],
      status: true,
      productThumbnail: '/drugbottle.jpeg',
      productDetails: 'Crème hydratante pour tous types de peau',
      content: 'Pot de 200ml',
      subCategoryId: cremes.id,
      brandId: gsk.id,
      unitId: creme.id,
      supplierId: promopharma.id,
    },
  ];

  // Create products
  for (const productData of products) {
    const product = await prisma.product.create({
      data: productData,
    });

    // Create batches for each product
    const batchCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < batchCount; i++) {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + Math.floor(Math.random() * 24) + 6);

      await prisma.productBatch.create({
        data: {
          batchNumber: `${productData.productCode}-${new Date().getFullYear()}-${String(i + 1).padStart(3, '0')}`,
          quantity: Math.floor(productData.stockQty / batchCount),
          expiryDate,
          deliveryDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          costPerUnit: productData.productCost,
          notes: `Lot reçu de ${productData.supplierId}`,
          status: true,
          productId: product.id,
        },
      });
    }
  }

  console.log('✅ Products and batches created');

  // Create sample customers
  const customerUser1 = await prisma.user.create({
    data: {
      email: 'jean.durand@example.com',
      password: hashedPassword,
      firstName: 'Jean',
      lastName: 'Durand',
      name: 'Jean Durand',
      phone: '+237670000001',
      roleId: cashierRole.id,
      status: true,
    },
  });

  const customerUser2 = await prisma.user.create({
    data: {
      email: 'marie.belle@example.com',
      password: hashedPassword,
      firstName: 'Marie',
      lastName: 'Belle',
      name: 'Marie Belle',
      phone: '+237670000002',
      roleId: cashierRole.id,
      status: true,
    },
  });

  await prisma.customer.create({
    data: {
      userId: customerUser1.id,
      billingAddress: 'Bonapriso, Douala',
      shippingAddress: 'Bonapriso, Douala',
      additionalInfo: 'Client régulier',
    },
  });

  await prisma.customer.create({
    data: {
      userId: customerUser2.id,
      billingAddress: 'Akwa, Douala',
      shippingAddress: 'Akwa, Douala',
      additionalInfo: 'Client avec assurance CNPS',
    },
  });

  console.log('✅ Customers created');

  // Create sample orders and sales
  const productsInDb = await prisma.product.findMany();
  
  // Regular cash sale
  const order1 = await prisma.lineOrder.create({
    data: {
      customerId: customerUser1.id,
      customerName: 'Jean Durand',
      orderNumber: 'ORD-2024-001',
      customerEmail: 'jean.durand@example.com',
      orderAmount: 5500,
      amountPaid: 5500,
      orderType: 'walk-in',
      source: 'pos',
      status: 'DELIVERED',
      paymentMethod: 'CASH',
      firstName: 'Jean',
      lastName: 'Durand',
      phone: '+237670000001',
    },
  });

  // Insurance order (70% covered by CNPS)
  const insuranceClaim = await prisma.insuranceClaim.create({
    data: {
      claimNumber: 'CLM-2024-001',
      orderNumber: 'ORD-2024-002',
      customerName: 'Marie Belle',
      customerPhone: '+237670000002',
      policyNumber: 'CNPS-12345',
      totalAmount: 10000,
      insurancePercentage: 70,
      insuranceAmount: 7000,
      customerAmount: 3000,
      status: 'PENDING',
      providerId: cnps.id,
    },
  });

  const order2 = await prisma.lineOrder.create({
    data: {
      customerId: customerUser2.id,
      customerName: 'Marie Belle',
      orderNumber: 'ORD-2024-002',
      customerEmail: 'marie.belle@example.com',
      orderAmount: 10000,
      amountPaid: 3000,
      orderType: 'insurance',
      source: 'pos',
      status: 'DELIVERED',
      paymentMethod: 'INSURANCE',
      insuranceClaimId: insuranceClaim.id,
      insuranceAmount: 7000,
      customerPaidAmount: 3000,
      insurancePercentage: 70,
      insuranceProviderName: 'CNPS',
      insurancePolicyNumber: 'CNPS-12345',
      firstName: 'Marie',
      lastName: 'Belle',
      phone: '+237670000002',
    },
  });

  // Create some line items and sales
  if (productsInDb.length > 0) {
    // Order 1 items
    await prisma.lineOrderItem.create({
      data: {
        productId: productsInDb[0].id,
        orderId: order1.id,
        name: productsInDb[0].name,
        price: productsInDb[0].productPrice,
        qty: 2,
        productThumbnail: productsInDb[0].productThumbnail,
      },
    });

    await prisma.sale.create({
      data: {
        orderId: order1.id,
        productId: productsInDb[0].id,
        qty: 2,
        salePrice: productsInDb[0].productPrice,
        productName: productsInDb[0].name,
        orderNumber: 'ORD-2024-001',
        total: productsInDb[0].productPrice * 2,
        productImage: productsInDb[0].productThumbnail,
        customerName: 'Jean Durand',
        customerEmail: 'jean.durand@example.com',
        paymentMethod: 'CASH',
      },
    });

    await prisma.lineOrderItem.create({
      data: {
        productId: productsInDb[2].id,
        orderId: order1.id,
        name: productsInDb[2].name,
        price: productsInDb[2].productPrice,
        qty: 1,
        productThumbnail: productsInDb[2].productThumbnail,
      },
    });

    await prisma.sale.create({
      data: {
        orderId: order1.id,
        productId: productsInDb[2].id,
        qty: 1,
        salePrice: productsInDb[2].productPrice,
        productName: productsInDb[2].name,
        orderNumber: 'ORD-2024-001',
        total: productsInDb[2].productPrice,
        productImage: productsInDb[2].productThumbnail,
        customerName: 'Jean Durand',
        customerEmail: 'jean.durand@example.com',
        paymentMethod: 'CASH',
      },
    });

    // Order 2 items (insurance)
    const item1 = await prisma.lineOrderItem.create({
      data: {
        productId: productsInDb[4].id,
        orderId: order2.id,
        name: productsInDb[4].name,
        price: productsInDb[4].productPrice,
        qty: 2,
        productThumbnail: productsInDb[4].productThumbnail,
      },
    });

    await prisma.sale.create({
      data: {
        orderId: order2.id,
        productId: productsInDb[4].id,
        qty: 2,
        salePrice: productsInDb[4].productPrice,
        productName: productsInDb[4].name,
        orderNumber: 'ORD-2024-002',
        total: productsInDb[4].productPrice * 2,
        productImage: productsInDb[4].productThumbnail,
        customerName: 'Marie Belle',
        customerEmail: 'marie.belle@example.com',
        paymentMethod: 'INSURANCE',
        insuranceClaimId: insuranceClaim.id,
        insuranceAmount: (productsInDb[4].productPrice * 2) * 0.7,
        customerPaidAmount: (productsInDb[4].productPrice * 2) * 0.3,
        insurancePercentage: 70,
      },
    });

    await prisma.insuranceClaimItem.create({
      data: {
        productName: productsInDb[4].name,
        productCode: productsInDb[4].productCode,
        quantity: 2,
        unitPrice: productsInDb[4].productPrice,
        totalPrice: productsInDb[4].productPrice * 2,
        claimId: insuranceClaim.id,
      },
    });

    const item2 = await prisma.lineOrderItem.create({
      data: {
        productId: productsInDb[5].id,
        orderId: order2.id,
        name: productsInDb[5].name,
        price: productsInDb[5].productPrice,
        qty: 1,
        productThumbnail: productsInDb[5].productThumbnail,
      },
    });

    await prisma.sale.create({
      data: {
        orderId: order2.id,
        productId: productsInDb[5].id,
        qty: 1,
        salePrice: productsInDb[5].productPrice,
        productName: productsInDb[5].name,
        orderNumber: 'ORD-2024-002',
        total: productsInDb[5].productPrice,
        productImage: productsInDb[5].productThumbnail,
        customerName: 'Marie Belle',
        customerEmail: 'marie.belle@example.com',
        paymentMethod: 'INSURANCE',
        insuranceClaimId: insuranceClaim.id,
        insuranceAmount: productsInDb[5].productPrice * 0.7,
        customerPaidAmount: productsInDb[5].productPrice * 0.3,
        insurancePercentage: 70,
      },
    });

    await prisma.insuranceClaimItem.create({
      data: {
        productName: productsInDb[5].name,
        productCode: productsInDb[5].productCode,
        quantity: 1,
        unitPrice: productsInDb[5].productPrice,
        totalPrice: productsInDb[5].productPrice,
        claimId: insuranceClaim.id,
      },
    });
  }

  console.log('✅ Orders and sales created');

  // Create sample notifications
  await prisma.notification.create({
    data: {
      message: 'Stock faible: Amoxicilline 500mg',
      status: 'WARNING',
      statusText: 'Alerte de stock',
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      message: 'Produit expiré dans 30 jours: Coartem Lot COART-2024-001',
      status: 'DANGER',
      statusText: 'Expiration proche',
      read: false,
    },
  });

  console.log('✅ Notifications created');

  // Create counters for order numbers
  await prisma.counter.create({
    data: {
      name: 'orderNumber',
      value: 3, // Starting from 3 since we created 2 orders
    },
  });

  await prisma.counter.create({
    data: {
      name: 'claimNumber',
      value: 2, // Starting from 2 since we created 1 claim
    },
  });

  console.log('✅ Counters created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('Admin: admin@pharmaciedouala.cm / Pharmacy@2024');
  console.log('Pharmacist: marie.ngo@pharmaciedouala.cm / Pharmacy@2024');
  console.log('Cashier: sandrine.fotso@pharmaciedouala.cm / Pharmacy@2024');
  console.log('Stock Manager: georges.essomba@pharmaciedouala.cm / Pharmacy@2024');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });