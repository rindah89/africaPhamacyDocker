"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface ComboboxProps {
  items: { value: string; label: string }[]
  value: { value: string; label: string } | null
  onChange: (value: { value: string; label: string } | null) => void
  placeholder?: string
}

export function Combobox({ items, value, onChange, placeholder = "Select an option..." }: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredItems = React.useMemo(() => {
    if (!searchQuery) return items
    const lowerQuery = searchQuery.toLowerCase()
    return items.filter(item => 
      item.label.toLowerCase().includes(lowerQuery) || 
      item.value.toLowerCase().includes(lowerQuery)
    )
  }, [items, searchQuery])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? value.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="flex flex-col">
          <div className="flex items-center border-b px-3">
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          
          <div className="max-h-[200px] overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="py-6 text-center text-sm">No items found.</div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.value}
                  onClick={() => {
                    console.log("Item clicked:", item);
                    onChange(item);
                    setOpen(false);
                    setSearchQuery("");
                  }}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                    value?.value === item.value && "bg-slate-100"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="min-w-[16px]">
                      {value?.value === item.value && (
                        <Check className="h-4 w-4" />
                      )}
                    </div>
                    <span>{item.label}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
} 