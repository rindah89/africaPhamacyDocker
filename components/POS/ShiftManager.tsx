"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { startShift, endShift, getShiftSales } from "@/actions/shifts";
import toast from "react-hot-toast";
import { ClipboardList } from "lucide-react";
import ShiftReport from "./ShiftReport";
import type { Shift } from "@/types";

interface ShiftManagerProps {
  currentShift: Shift | null;
  className?: string;
}

interface Sale {
  id: string;
  total: number;
  createdAt: Date;
  // Add other sale properties as needed
}

export default function ShiftManager({ currentShift, className }: ShiftManagerProps) {
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);

  const handleStartShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setLoading(true);
    try {
      const result = await startShift(name);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Shift started successfully");
        setStartOpen(false);
      }
    } catch (error) {
      toast.error("Failed to start shift");
    } finally {
      setLoading(false);
    }
  };

  const handleEndShift = async () => {
    if (!currentShift) return;

    setLoading(true);
    try {
      const result = await endShift(currentShift.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Shift ended successfully");
        setEndOpen(false);
      }
    } catch (error) {
      toast.error("Failed to end shift");
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async () => {
    if (!currentShift) return;

    try {
      const shiftSales = await getShiftSales(currentShift.id);
      if (shiftSales) {
        setSales(shiftSales);
        setReportOpen(true);
      }
    } catch (error) {
      toast.error("Failed to load shift report");
    }
  };

  return (
    <div className={`flex justify-end gap-2 p-4 ${className || ''}`}>
      {!currentShift ? (
        <Button
          className="w-full"
          onClick={() => setStartOpen(true)}
        >
          Start Your Shift
        </Button>
      ) : (
        <>
          <Button
            variant="outline"
            onClick={() => setEndOpen(true)}
            className="bg-red-100 hover:bg-red-200 text-red-600 border-red-200"
          >
            End Current Shift
          </Button>
          <Button
            variant="outline"
            onClick={() => setReportOpen(true)}
            className="bg-blue-100 hover:bg-blue-200 text-blue-600 border-blue-200"
          >
            View Current Shift
          </Button>
        </>
      )}

      {/* Start Shift Dialog */}
      <Dialog open={startOpen} onOpenChange={setStartOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Shift</DialogTitle>
            <DialogDescription>
              Enter your name to start a new shift
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStartShift}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Starting..." : "Start Shift"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* End Shift Dialog */}
      <Dialog open={endOpen} onOpenChange={setEndOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Current Shift</DialogTitle>
            <DialogDescription>
              Are you sure you want to end the current shift?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleEndShift} disabled={loading} variant="destructive">
              {loading ? "Ending..." : "End Shift"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shift Report Dialog */}
      {currentShift && (
        <ShiftReport
          open={reportOpen}
          onOpenChange={setReportOpen}
          shift={currentShift}
          sales={sales}
        />
      )}
    </div>
  );
} 