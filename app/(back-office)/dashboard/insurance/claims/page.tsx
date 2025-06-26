import React from 'react';
import { getInsuranceOrders, getAllInsuranceProviders } from '@/actions/insurance';
import InsuranceClaimsTable from '@/components/dashboard/Insurance/InsuranceClaimsTable';
import InsuranceClaimsHeader from '@/components/dashboard/Insurance/InsuranceClaimsHeader';

export default async function page() {
  // Get all orders with their providers included
  const claims = await getInsuranceOrders();
  const providers = await getAllInsuranceProviders();
  
  return (
    <div className="space-y-4">
      <InsuranceClaimsHeader providers={providers} />
      <InsuranceClaimsTable initialClaims={claims} providers={providers} />
    </div>
  );
} 