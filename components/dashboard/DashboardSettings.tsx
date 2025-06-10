"use client";

import { useState } from "react";
import { Settings, RefreshCw, Layout, Clock, Save, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "./DashboardProvider";
import { useDashboardMutations } from "@/hooks/use-dashboard-data";

export function DashboardSettings() {
  const {
    autoRefresh,
    setAutoRefresh,
    refreshInterval,
    setRefreshInterval,
    compactView,
    setCompactView,
  } = useDashboard();
  
  const { updateSettings } = useDashboardMutations();
  const [isOpen, setIsOpen] = useState(false);

  const handleSaveSettings = async () => {
    try {
      await updateSettings.mutateAsync({
        autoRefresh,
        refreshInterval,
        compactView,
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const refreshIntervalOptions = [
    { value: "10000", label: "10 seconds" },
    { value: "30000", label: "30 seconds" },
    { value: "60000", label: "1 minute" },
    { value: "300000", label: "5 minutes" },
    { value: "600000", label: "10 minutes" },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Dashboard Settings</SheetTitle>
          <SheetDescription>
            Customize your dashboard experience with these settings.
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6 py-6">
          {/* Auto Refresh Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Auto Refresh
              </CardTitle>
              <CardDescription>
                Automatically refresh dashboard data at regular intervals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-refresh">Enable Auto Refresh</Label>
                <Switch
                  id="auto-refresh"
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
              </div>
              
              {autoRefresh && (
                <div className="space-y-2">
                  <Label>Refresh Interval</Label>
                  <Select
                    value={refreshInterval.toString()}
                    onValueChange={(value) => setRefreshInterval(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {refreshIntervalOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-4 w-4" />
                Display Options
              </CardTitle>
              <CardDescription>
                Customize how your dashboard data is displayed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="compact-view">Compact View</Label>
                  <p className="text-sm text-muted-foreground">
                    Show more data in less space
                  </p>
                </div>
                <Switch
                  id="compact-view"
                  checked={compactView}
                  onCheckedChange={setCompactView}
                />
              </div>
            </CardContent>
          </Card>

          {/* Performance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Performance
              </CardTitle>
              <CardDescription>
                Settings that affect dashboard performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Real-time Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Currently: {autoRefresh ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {autoRefresh 
                      ? `Updating every ${refreshInterval / 1000}s`
                      : 'Manual refresh only'
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSaveSettings}
            disabled={updateSettings.isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            {updateSettings.isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
} 