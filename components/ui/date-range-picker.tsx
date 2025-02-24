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
} from "@/components/ui/popover";
import { format } from "date-fns";
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

const defaultTimeRange: TimeRange = {
  from: { hours: "00", minutes: "00" },
  to: { hours: "23", minutes: "59" },
};

interface DatePickerWithRangeProps {
  date: DateRange | undefined;
  time?: TimeRange;
  onDateChange: (date: DateRange | undefined) => void;
  onTimeChange: (time: TimeRange) => void;
  className?: string;
}

export function DatePickerWithRange({
  date,
  time = defaultTimeRange,
  onDateChange,
  onTimeChange,
  className,
}: DatePickerWithRangeProps) {
  const logState = (location: string, data: any) => {
    console.group(`DatePickerWithRange - ${location}`);
    console.log('Data:', data);
    console.trace('Stack trace');
    console.groupEnd();
  };

  // Initialize with today's date if no date is provided
  const today = React.useMemo(() => {
    const t = new Date();
    logState('today init', { today: t });
    return t;
  }, []);

  const defaultDateRange = React.useMemo<DateRange>(() => {
    const range = { from: today, to: today };
    logState('defaultDateRange init', { range });
    return range;
  }, [today]);

  // Ensure time prop has the complete structure with deep validation
  const validatedTime: TimeRange = React.useMemo(() => {
    logState('validatedTime calculation', { 
      inputTime: time,
      defaultTimeRange
    });

    // Deep clone the default time range to avoid reference issues
    const defaultTime = JSON.parse(JSON.stringify(defaultTimeRange)) as TimeRange;
    
    if (!time) {
      logState('validatedTime - using default', { defaultTime });
      return defaultTime;
    }

    const result = {
      from: {
        hours: time.from?.hours?.toString() || defaultTime.from.hours,
        minutes: time.from?.minutes?.toString() || defaultTime.from.minutes
      },
      to: {
        hours: time.to?.hours?.toString() || defaultTime.to.hours,
        minutes: time.to?.minutes?.toString() || defaultTime.to.minutes
      }
    };

    logState('validatedTime result', { result });
    return result;
  }, [time]);

  // Initialize states with safe defaults and ensure they're never undefined
  const [tempDate, setTempDate] = React.useState<DateRange>(() => {
    if (!date?.from || !date?.to) {
      return defaultDateRange;
    }
    return { from: date.from, to: date.to };
  });

  const [tempTime, setTempTime] = React.useState<TimeRange>(() => {
    return time || defaultTimeRange;
  });

  const [shiftConfig, setShiftConfig] = React.useState<ShiftConfig>(() => {
    const config = JSON.parse(JSON.stringify(defaultShiftConfig)) as ShiftConfig;
    logState('shiftConfig init', { config });
    return config;
  });

  // Update tempTime when time prop changes with validation
  React.useEffect(() => {
    logState('tempTime effect', { validatedTime, currentTempTime: tempTime });
    
    setTempTime(prev => {
      if (!validatedTime?.from || !validatedTime?.to) {
        logState('tempTime effect - invalid time', { prev, validatedTime });
        return prev;
      }
      logState('tempTime effect - updating', { validatedTime });
      return validatedTime;
    });
  }, [validatedTime]);

  // Update tempDate when date prop changes with validation
  React.useEffect(() => {
    logState('date effect', { date, currentTempDate: tempDate });

    if (!date?.from || !date?.to) {
      logState('date effect - invalid date', { date });
      return;
    }
    
    const from = new Date(date.from);
    const to = new Date(date.to);
    
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      logState('date effect - invalid date values', { from, to });
      return;
    }
    
    logState('date effect - updating', { from, to });
    setTempDate({ from, to });
  }, [date]);

  const handleTimeChange = (
    type: "from" | "to",
    field: "hours" | "minutes",
    value: string
  ) => {
    try {
      logState('handleTimeChange', { type, field, value, currentTempTime: tempTime });

      let numValue = parseInt(value);
      
      // Validate hours (0-23)
      if (field === "hours") {
        if (isNaN(numValue) || numValue < 0) numValue = 0;
        if (numValue > 23) numValue = 23;
      }
      // Validate minutes (0-59)
      if (field === "minutes") {
        if (isNaN(numValue) || numValue < 0) numValue = 0;
        if (numValue > 59) numValue = 59;
      }

      setTempTime(prev => {
        logState('handleTimeChange - updating', { prev, type, field, numValue });

        if (!prev?.from || !prev?.to) {
          logState('handleTimeChange - invalid prev state', { prev });
          return validatedTime;
        }

        const updatedTime = {
          from: { ...prev.from },
          to: { ...prev.to },
          [type]: {
            ...(type === 'from' ? prev.from : prev.to),
            [field]: numValue.toString().padStart(2, "0")
          }
        };
        
        logState('handleTimeChange - result', { updatedTime });
        return updatedTime;
      });
    } catch (error) {
      console.error('Error in handleTimeChange:', error);
      logState('handleTimeChange - error', { error, validatedTime });
      setTempTime(validatedTime);
    }
  };

  const handleShiftConfigChange = (
    shift: keyof ShiftConfig,
    type: "from" | "to",
    field: "hours" | "minutes",
    value: string
  ) => {
    try {
      let normalizedValue = value.replace(/\D/g, "");
      if (field === "hours") {
        normalizedValue = Math.min(23, Math.max(0, parseInt(normalizedValue) || 0)).toString().padStart(2, "0");
      } else {
        normalizedValue = Math.min(59, Math.max(0, parseInt(normalizedValue) || 0)).toString().padStart(2, "0");
      }

      setShiftConfig(prev => {
        if (!prev?.[shift]?.[type]) return prev;

        const updatedConfig = JSON.parse(JSON.stringify(prev)) as ShiftConfig;
        updatedConfig[shift][type][field] = normalizedValue;
        return updatedConfig;
      });
    } catch (error) {
      console.error('Error in handleShiftConfigChange:', error);
    }
  };

  const applyShift = (shift: keyof ShiftConfig) => {
    try {
      const currentShift = shiftConfig[shift];
      if (!currentShift?.from?.hours || !currentShift?.from?.minutes || 
          !currentShift?.to?.hours || !currentShift?.to?.minutes) {
        return;
      }

      setTempTime({
        from: {
          hours: currentShift.from.hours,
          minutes: currentShift.from.minutes
        },
        to: {
          hours: currentShift.to.hours,
          minutes: currentShift.to.minutes
        }
      });
    } catch (error) {
      console.error('Error in applyShift:', error);
    }
  };

  const handleSubmit = () => {
    try {
      if (!tempDate?.from || !tempDate?.to || !tempTime?.from || !tempTime?.to) {
        return;
      }

      // Validate all required fields are present
      const isValid = 
        tempTime.from.hours && tempTime.from.minutes &&
        tempTime.to.hours && tempTime.to.minutes &&
        !isNaN(tempDate.from.getTime()) && !isNaN(tempDate.to.getTime());

      if (!isValid) {
        console.error('Invalid date or time values');
        return;
      }

      onDateChange(tempDate);
      onTimeChange({
        from: {
          hours: tempTime.from.hours,
          minutes: tempTime.from.minutes
        },
        to: {
          hours: tempTime.to.hours,
          minutes: tempTime.to.minutes
        }
      });
      setOpen(false);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }
  };

  const handleSelect = (newDate: DateRange | undefined) => {
    try {
      if (!newDate?.from) return;
      
      const to = newDate.to || newDate.from;
      
      // Validate dates
      if (isNaN(newDate.from.getTime()) || isNaN(to.getTime())) {
        console.error('Invalid date selected');
        return;
      }

      setTempDate({
        from: newDate.from,
        to: to
      });
    } catch (error) {
      console.error('Error in handleSelect:', error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    try {
      if (!newOpen && open) {
        if (tempDate?.from && tempDate?.to && 
            !isNaN(tempDate.from.getTime()) && !isNaN(tempDate.to.getTime())) {
          handleSubmit();
        }
        return;
      }
      setOpen(newOpen);
    } catch (error) {
      console.error('Error in handleOpenChange:', error);
      setOpen(false);
    }
  };

  const displayText = React.useMemo(() => {
    try {
      if (!tempDate?.from) {
        return <span>Pick a date</span>;
      }

      const fromDate = format(tempDate.from, "LLL dd, y");
      const toDate = tempDate.to ? format(tempDate.to, "LLL dd, y") : fromDate;
      
      // Ensure tempTime has default values if undefined
      const fromTime = `${tempTime?.from?.hours || "00"}:${tempTime?.from?.minutes || "00"}`;
      const toTime = `${tempTime?.to?.hours || "23"}:${tempTime?.to?.minutes || "59"}`;

      return (
        <>
          {fromDate} {fromTime} - {toDate} {toTime}
        </>
      );
    } catch (error) {
      console.error('Error in displayText:', error);
      return <span>Pick a date</span>;
    }
  }, [tempDate, tempTime]);

  const [open, setOpen] = React.useState(false);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={handleOpenChange} modal>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !tempDate?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayText}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-4" 
          align="start"
          side="right"
          sideOffset={4}
          alignOffset={0}
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
          style={{ zIndex: 50 }}
        >
          <div className="space-y-4">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={tempDate?.from || today}
              selected={tempDate}
              onSelect={handleSelect}
              numberOfMonths={2}
              className="rounded-md"
            />
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Shift Presets</div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-[51] max-w-[90vw] w-[400px]">
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
                              <div className="text-sm font-medium">Start Time</div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <Input
                                  className="w-[4rem]"
                                  value={shiftConfig?.[shift]?.from?.hours || "00"}
                                  onChange={(e) => handleShiftConfigChange(shift, "from", "hours", e.target.value)}
                                  placeholder="HH"
                                  maxLength={2}
                                />
                                :
                                <Input
                                  className="w-[4rem]"
                                  value={shiftConfig?.[shift]?.from?.minutes || "00"}
                                  onChange={(e) => handleShiftConfigChange(shift, "from", "minutes", e.target.value)}
                                  placeholder="MM"
                                  maxLength={2}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm font-medium">End Time</div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <Input
                                  className="w-[4rem]"
                                  value={shiftConfig?.[shift]?.to?.hours || "00"}
                                  onChange={(e) => handleShiftConfigChange(shift, "to", "hours", e.target.value)}
                                  placeholder="HH"
                                  maxLength={2}
                                />
                                :
                                <Input
                                  className="w-[4rem]"
                                  value={shiftConfig?.[shift]?.to?.minutes || "00"}
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
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => applyShift("morning")}
                >
                  Morning
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => applyShift("afternoon")}
                >
                  Afternoon
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => applyShift("night")}
                >
                  Night
                </Button>
              </div>
              <div className="flex gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Custom Start Time</div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <Input
                      className="w-[4rem]"
                      value={tempTime?.from?.hours || "00"}
                      onChange={(e) => handleTimeChange("from", "hours", e.target.value)}
                      placeholder="HH"
                      maxLength={2}
                    />
                    :
                    <Input
                      className="w-[4rem]"
                      value={tempTime?.from?.minutes || "00"}
                      onChange={(e) => handleTimeChange("from", "minutes", e.target.value)}
                      placeholder="MM"
                      maxLength={2}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Custom End Time</div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <Input
                      className="w-[4rem]"
                      value={tempTime?.to?.hours || "23"}
                      onChange={(e) => handleTimeChange("to", "hours", e.target.value)}
                      placeholder="HH"
                      maxLength={2}
                    />
                    :
                    <Input
                      className="w-[4rem]"
                      value={tempTime?.to?.minutes || "59"}
                      onChange={(e) => handleTimeChange("to", "minutes", e.target.value)}
                      placeholder="MM"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmit} 
                  className="w-full"
                  variant="default"
                  disabled={!tempDate?.from || !tempDate?.to}
                >
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