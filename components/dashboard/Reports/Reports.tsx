import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralReports } from "./GeneralReports";

export default function Reports() {
  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList>
        <TabsTrigger value="general">General Reports</TabsTrigger>
        <TabsTrigger value="users">User Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        <GeneralReports />
      </TabsContent>
      <TabsContent value="users">
        <h2>User Reports</h2>
      </TabsContent>
    </Tabs>
  );
}
