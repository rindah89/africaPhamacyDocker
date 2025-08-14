# Vercel + MongoDB Production Fix

## Common Issues with Vercel:

### 1. **Serverless Function Timeout**
Vercel has a 10-second timeout for serverless functions on the free/pro plan. Your order creation might be timing out.

### 2. **MongoDB Connection Issues**
MongoDB connections in serverless environments need special handling.

## Immediate Fixes:

### Fix 1: Update your MongoDB Connection String
In Vercel dashboard, update your `DATABASE_URL`:

```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority&maxPoolSize=10&serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&socketTimeoutMS=20000
```

Add these parameters:
- `maxPoolSize=10` - Limits connections
- `serverSelectionTimeoutMS=5000` - 5 second server selection timeout
- `connectTimeoutMS=10000` - 10 second connection timeout
- `socketTimeoutMS=20000` - 20 second socket timeout

### Fix 2: Add Vercel Environment Variables
In your Vercel project settings, add:

```
NODE_ENV=production
MONGODB_DIRECT_CONNECTION=false
```

### Fix 3: Optimize the Prisma Client
Update `/lib/db.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Add connection pool settings for Vercel
    datasourceUrl: process.env.DATABASE_URL,
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

export default prisma
```

### Fix 4: Add API Route for Order Creation
Create `/app/api/orders/create/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { processPaymentAndOrder } from '@/actions/pos';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderData, customerData, orderNumber, amountPaid, insuranceData } = body;
    
    const result = await processPaymentAndOrder(
      orderData,
      customerData,
      orderNumber,
      amountPaid,
      insuranceData
    );
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

### Fix 5: Update ReceiptPrint2 to use API
In `components/POS/ReceiptPrint2.tsx`, replace the direct server action call:

```typescript
// Instead of:
const result = await processPaymentAndOrder(...)

// Use:
const response = await fetch('/api/orders/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderData,
    customerData,
    orderNumber,
    amountPaid,
    insuranceData
  })
});

const result = await response.json();
```

## Quick Debug Steps:

1. **Check Vercel Function Logs**:
   - Go to Vercel Dashboard
   - Select your project
   - Go to "Functions" tab
   - Look for errors in the logs

2. **Test Database Connection**:
   Create a test API route `/app/api/test-db/route.ts`:
   ```typescript
   import { NextResponse } from 'next/server';
   import prisma from '@/lib/db';

   export async function GET() {
     try {
       const count = await prisma.lineOrder.count();
       return NextResponse.json({ success: true, count });
     } catch (error) {
       return NextResponse.json({ success: false, error: error.message });
     }
   }
   ```

   Then visit: `https://your-site.vercel.app/api/test-db`

3. **Check Vercel Limits**:
   - Free plan: 10 second timeout
   - Pro plan: 60 second timeout
   - Your order creation might need optimization

## Most Likely Issue:
The transaction in `processPaymentAndOrder` is too complex for Vercel's timeout. Consider:
1. Breaking it into smaller transactions
2. Using background jobs for complex operations
3. Upgrading to Vercel Pro for longer timeouts