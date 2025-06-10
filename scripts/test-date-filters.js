const { PrismaClient } = require('@prisma/client');
const { 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  subDays, 
  subWeeks, 
  subMonths,
  format 
} = require('date-fns');

const prisma = new PrismaClient();

async function getSalesReport(startDate, endDate) {
  try {
    console.log(`🔍 Fetching sales from ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    const orderCount = await prisma.lineOrder.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'DELIVERED'
      }
    });
    
    console.log(`📊 Found ${orderCount} DELIVERED orders in this period`);
    return orderCount;
  } catch (error) {
    console.error("❌ Error in getSalesReport:", error);
    return 0;
  }
}

async function testDateFilters() {
  const now = new Date();
  console.log(`🚀 Testing Date Filters - Current time: ${now.toISOString()}\n`);

  const filters = [
    {
      name: "Today",
      startDate: startOfDay(now),
      endDate: endOfDay(now)
    },
    {
      name: "Yesterday",
      startDate: startOfDay(subDays(now, 1)),
      endDate: endOfDay(subDays(now, 1))
    },
    {
      name: "This Week (Mon-Today)",
      startDate: startOfWeek(now, { weekStartsOn: 1 }),
      endDate: endOfDay(now)
    },
    {
      name: "Last Week",
      startDate: startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }),
      endDate: endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })
    },
    {
      name: "This Month",
      startDate: startOfMonth(now),
      endDate: endOfDay(now)
    },
    {
      name: "Last Month",
      startDate: startOfMonth(subMonths(now, 1)),
      endDate: endOfMonth(subMonths(now, 1))
    },
    {
      name: "Last 7 Days",
      startDate: startOfDay(subDays(now, 6)),
      endDate: endOfDay(now)
    },
    {
      name: "Last 30 Days",
      startDate: startOfDay(subDays(now, 29)),
      endDate: endOfDay(now)
    }
  ];

  for (const filter of filters) {
    console.log(`\n=== ${filter.name} ===`);
    console.log(`📅 From: ${format(filter.startDate, 'PPP p')}`);
    console.log(`📅 To: ${format(filter.endDate, 'PPP p')}`);
    
    const count = await getSalesReport(filter.startDate, filter.endDate);
    console.log(`📈 Orders found: ${count}`);
  }
}

async function main() {
  try {
    console.log('🔧 Testing Sales Date Filter Functionality\n');
    await testDateFilters();
    console.log('\n✅ All date filter tests completed!');
  } catch (error) {
    console.error('❌ Test script failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 