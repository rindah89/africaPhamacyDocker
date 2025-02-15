"use client";

import * as React from "react";
import { CalendarIcon, Clock, Settings2 } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from "@/components/ui/popover";
import { format, setHours, setMinutes } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TimeRange {
  from: { hours: string; minutes: string };
  to: { hours: string; minutes: string };
}

interface ShiftConfig {
  morning: TimeRange;
  afternoon: TimeRange;
  night: TimeRange;
}

const defaultShiftConfig: ShiftConfig = {
  morning: {
    from: { hours: "06", minutes: "00" },
    to: { hours: "14", minutes: "00" },
  },
  afternoon: {
    from: { hours: "14", minutes: "00" },
    to: { hours: "22", minutes: "00" },
  },
  night: {
    from: { hours: "22", minutes: "00" },
    to: { hours: "06", minutes: "00" },
  },
};

interface DatePickerWithRangeProps {
  date: DateRange | undefined;
  time: TimeRange;
  onDateChange: (date: DateRange | undefined) => void;
  onTimeChange: (time: TimeRange) => void;
  className?: string;
}

export function DatePickerWithRange({
  date,
  time,
  onDateChange,
  onTimeChange,
  className,
}: DatePickerWithRangeProps) {
  const [shiftConfig, setShiftConfig] = React.useState<ShiftConfig>(defaultShiftConfig);
  const [tempDate, setTempDate] = React.useState<DateRange | undefined>(date);
  const [tempTime, setTempTime] = React.useState<TimeRange>(time);
  const [open, setOpen] = React.useState(false);

  // Reset temp values when popover opens
  React.useEffect(() => {
    if (open) {
      setTempDate(date);
      setTempTime(time);
    }
  }, [open, date, time]);

  const handleTimeChange = (
    type: "from" | "to",
    field: "hours" | "minutes",
    value: string
  ) => {
    let normalizedValue = value.replace(/\D/g, "");
    if (field === "hours") {
      normalizedValue = Math.min(23, Math.max(0, parseInt(normalizedValue) || 0)).toString().padStart(2, "0");
    } else {
      normalizedValue = Math.min(59, Math.max(0, parseInt(normalizedValue) || 0)).toString().padStart(2, "0");
    }

    setTempTime({
      ...tempTime,
      [type]: {
        ...tempTime[type],
        [field]: normalizedValue,
      },
    });
  };

  const handleShiftConfigChange = (
    shift: keyof ShiftConfig,
    type: "from" | "to",
    field: "hours" | "minutes",
    value: string
  ) => {
    let normalizedValue = value.replace(/\D/g, "");
    if (field === "hours") {
      normalizedValue = Math.min(23, Math.max(0, parseInt(normalizedValue) || 0)).toString().padStart(2, "0");
    } else {
      normalizedValue = Math.min(59, Math.max(0, parseInt(normalizedValue) || 0)).toString().padStart(2, "0");
    }

    setShiftConfig({
      ...shiftConfig,
      [shift]: {
        ...shiftConfig[shift],
        [type]: {
          ...shiftConfig[shift][type],
          [field]: normalizedValue,
        },
      },
    });
  };

  const applyShift = (shift: keyof ShiftConfig) => {
    setTempTime(shiftConfig[shift]);
  };

  const handleSubmit = () => {
    if (tempDate) {
      onDateChange(tempDate);
      onTimeChange(tempTime);
    }
    setOpen(false);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} {time.from.hours}:{time.from.minutes} -{" "}
                  {format(date.to, "LLL dd, y")} {time.to.hours}:{time.to.minutes}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="end">
          <div className="space-y-4">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={tempDate?.from}
              selected={tempDate}
              onSelect={setTempDate}
              numberOfMonths={2}
            />
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Label>Shift Presets</Label>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Configure Shift Times</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="morning">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="morning">Morning</TabsTrigger>
                        <TabsTrigger value="afternoon">Afternoon</TabsTrigger>
                        <TabsTrigger value="night">Night</TabsTrigger>
                      </TabsList>
                      {(["morning", "afternoon", "night"] as const).map((shift) => (
                        <TabsContent key={shift} value={shift} className="space-y-4">
                          <div className="flex gap-4">
                            <div className="space-y-2">
                              <Label>Start Time</Label>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <Input
                                  className="w-[4rem]"
                                  value={shiftConfig[shift].from.hours}
                                  onChange={(e) => handleShiftConfigChange(shift, "from", "hours", e.target.value)}
                                  placeholder="HH"
                                  maxLength={2}
                                />
                                :
                                <Input
                                  className="w-[4rem]"
                                  value={shiftConfig[shift].from.minutes}
                                  onChange={(e) => handleShiftConfigChange(shift, "from", "minutes", e.target.value)}
                                  placeholder="MM"
                                  maxLength={2}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>End Time</Label>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <Input
                                  className="w-[4rem]"
                                  value={shiftConfig[shift].to.hours}
                                  onChange={(e) => handleShiftConfigChange(shift, "to", "hours", e.target.value)}
                                  placeholder="HH"
                                  maxLength={2}
                                />
                                :
                                <Input
                                  className="w-[4rem]"
                                  value={shiftConfig[shift].to.minutes}
                                  onChange={(e) => handleShiftConfigChange(shift, "to", "minutes", e.target.value)}
                                  placeholder="MM"
                                  maxLength={2}
                                />
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => applyShift("morning")}>
                  Morning
                </Button>
                <Button size="sm" variant="outline" onClick={() => applyShift("afternoon")}>
                  Afternoon
                </Button>
                <Button size="sm" variant="outline" onClick={() => applyShift("night")}>
                  Night
                </Button>
              </div>
              <div className="flex gap-4">
                <div className="space-y-2">
                  <Label>Custom Start Time</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <Input
                      className="w-[4rem]"
                      value={tempTime.from.hours}
                      onChange={(e) => handleTimeChange("from", "hours", e.target.value)}
                      placeholder="HH"
                      maxLength={2}
                    />
                    :
                    <Input
                      className="w-[4rem]"
                      value={tempTime.from.minutes}
                      onChange={(e) => handleTimeChange("from", "minutes", e.target.value)}
                      placeholder="MM"
                      maxLength={2}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Custom End Time</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <Input
                      className="w-[4rem]"
                      value={tempTime.to.hours}
                      onChange={(e) => handleTimeChange("to", "hours", e.target.value)}
                      placeholder="HH"
                      maxLength={2}
                    />
                    :
                    <Input
                      className="w-[4rem]"
                      value={tempTime.to.minutes}
                      onChange={(e) => handleTimeChange("to", "minutes", e.target.value)}
                      placeholder="MM"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSubmit} className="w-full">
                  Apply Filter
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 