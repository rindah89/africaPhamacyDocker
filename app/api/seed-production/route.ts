import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  // Get secret from query params
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  
  // Check if secret matches to prevent unauthorized seeding
  if (secret !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if already seeded
    const roleCount = await prisma.role.count();
    if (roleCount > 0) {
      return NextResponse.json({ 
        message: 'Database already seeded',
        stats: {
          roles: await prisma.role.count(),
          users: await prisma.user.count(),
          products: await prisma.product.count(),
          categories: await prisma.category.count(),
        }
      });
    }

    // If you want to proceed with seeding, you'll need to run the seed script locally
    // with the production DATABASE_URL or use a different approach
    
    return NextResponse.json({ 
      message: 'Database needs seeding',
      instruction: 'Please run: DATABASE_URL="your-prod-url" npx prisma db seed',
      note: 'Remove this endpoint after use'
    });
  } catch (error) {
    console.error('Database check error:', error);
    return NextResponse.json({ 
      error: 'Failed to check database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}