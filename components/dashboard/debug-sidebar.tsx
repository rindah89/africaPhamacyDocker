"use client";

import { useState } from "react";
import { sidebarLinks } from "@/config/sidebar";
import { filterLinks } from "@/lib/filterLinks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugSidebar({ session }: { session: any }) {
  const [showDebug, setShowDebug] = useState(false);
  
  const user = session?.user;
  const filteredLinks = user ? filterLinks(sidebarLinks, user) : [];
  
  // Find the inventory link
  const inventoryLink = filteredLinks.find(link => link.title === "Inventory");
  const stockAnalyticsItem = inventoryLink?.dropdownMenu?.find(item => item.title === "Stock Analytics");
  
  if (!showDebug) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        Debug Sidebar
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-y-auto">
      <CardHeader>
        <CardTitle>Sidebar Debug</CardTitle>
        <CardDescription>Permission diagnostics</CardDescription>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowDebug(false)}
        >
          Hide Debug
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div><strong>User:</strong> {user?.name || "Not found"}</div>
          <div><strong>Role:</strong> {user?.role?.roleName || "Not found"}</div>
          <div><strong>Role Display Name:</strong> {user?.role?.displayName || "Not found"}</div>
          
          <div className="mt-4">
            <strong>Key Permissions:</strong>
            <ul className="ml-4 space-y-1">
              <li>canViewProducts: {user?.role?.canViewProducts ? "✅" : "❌"}</li>
              <li>canViewStockAnalytics: {user?.role?.canViewStockAnalytics ? "✅" : "❌"}</li>
              <li>canViewDashboard: {user?.role?.canViewDashboard ? "✅" : "❌"}</li>
            </ul>
          </div>
          
          <div className="mt-4">
            <strong>Filtering Results:</strong>
            <ul className="ml-4 space-y-1">
              <li>Total filtered links: {filteredLinks.length}</li>
              <li>Inventory link found: {inventoryLink ? "✅" : "❌"}</li>
              <li>Inventory dropdown items: {inventoryLink?.dropdownMenu?.length || 0}</li>
              <li>Stock Analytics item found: {stockAnalyticsItem ? "✅" : "❌"}</li>
              <li>Stock Analytics permission: {stockAnalyticsItem?.access || "Not found"}</li>
            </ul>
          </div>
          
          <div className="mt-4">
            <strong>Inventory Dropdown Items:</strong>
            <ul className="ml-4 space-y-1">
              {inventoryLink?.dropdownMenu?.map((item, i) => (
                <li key={i} className="text-xs">
                  {item.title} ({item.access})
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 