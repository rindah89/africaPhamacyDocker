'use client';

import { useEffect, useState, Suspense } from "react";
import { getAllCategories } from "@/actions/category";
import { getAllCustomers } from "@/actions/customer";
import { getProductsByCategoryId} from "@/actions/products";
import { getAllUsers } from "@/actions/users";
import AuthorizePageWrapper from "@/components/dashboard/Auth/AuthorizePageWrapper";
import PointOfSale from "@/components/POS/PointOfSale";
import { permissionsObj } from "@/config/permissions";
import { useSearchParams } from "next/navigation";

function LoadingState() {
  return (
    <div className="w-full h-full min-h-screen flex items-center justify-center">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-32 bg-gray-200 rounded"></div>
        <div className="h-64 w-96 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

export default function POSPage() {
  const searchParams = useSearchParams();
  const cat = searchParams.get('cat') || 'all';
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    customers: [],
    categories: [],
    products: []
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [allCategories, products, allCustomers] = await Promise.all([
          getAllCategories(),
          getProductsByCategoryId(cat),
          getAllUsers()
        ]);

        const formattedCustomers = (allCustomers || []).map((item) => ({
          label: item.name,
          value: item.id,
          email: item.email,
        }));

        setData({
          customers: formattedCustomers,
          categories: allCategories || [],
          products: products || []
        });
      } catch (error) {
        console.error('Error loading POS data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [cat]);

  return (
    <AuthorizePageWrapper requiredPermission={permissionsObj.canViewPos}>
      <Suspense fallback={<LoadingState />}>
        <div className="">
          {isLoading ? (
            <LoadingState />
          ) : (
            <PointOfSale
              customers={data.customers}
              categories={data.categories}
              products={data.products}
              selectedCatId={cat}
            />
          )}
        </div>
      </Suspense>
    </AuthorizePageWrapper>
  );
}
