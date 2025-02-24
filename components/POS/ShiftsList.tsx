"use client";

import React, { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate, formatTime } from '@/lib/utils';
import { Button } from '../ui/button';
import { CalendarDays, Clock } from 'lucide-react';
import ShiftReport from './ShiftReport';
import { getShiftSales } from '@/actions/shifts';

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime?: string;
}

interface ShiftsListProps {
  shifts: Shift[];
  onShiftSelect: (shift: Shift) => void;
  currentShiftId?: string;
}

export default function ShiftsList({ shifts, onShiftSelect, currentShiftId }: ShiftsListProps) {
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [shiftSales, setShiftSales] = useState<any[]>([]);

  // Sort shifts by start time, most recent first
  const sortedShifts = [...shifts].sort((a, b) => 
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  const handleShiftClick = async (shift: Shift) => {
    setSelectedShift(shift);
    try {
      const sales = await getShiftSales(shift.id);
      if (sales) {
        setShiftSales(sales);
        setShowReport(true);
      }
    } catch (error) {
      console.error('Error fetching shift sales:', error);
    }
  };

  return (
    <>
      <div className="w-full p-4 border-r h-screen bg-background">
        <h2 className="text-lg font-semibold mb-4">Shift History</h2>
        <ScrollArea className="h-[calc(100vh-100px)]">
          <div className="space-y-2">
            {sortedShifts.map((shift) => (
              <Button
                key={shift.id}
                variant={currentShiftId === shift.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleShiftClick(shift)}
              >
                <div className="w-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{shift.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {shift.endTime ? 'Completed' : 'Active'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="h-3 w-3" />
                    <span>{formatDate(shift.startTime)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(shift.startTime)}</span>
                    </div>
                    {shift.endTime && (
                      <span>→ {formatTime(shift.endTime)}</span>
                    )}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {selectedShift && (
        <ShiftReport
          open={showReport}
          onOpenChange={setShowReport}
          shift={selectedShift}
          sales={shiftSales}
        />
      )}
    </>
  );
} 