"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

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
        <Command shouldFilter={false} className="w-full">
          <CommandInput 
            placeholder="Search..." 
            onValueChange={(search) => {
              setSearchQuery(search)
              if (!open) setOpen(true)
            }}
          />
          <CommandEmpty>No items found.</CommandEmpty>
          <CommandGroup className="max-h-[200px] overflow-y-auto">
            {filteredItems.map((item) => (
              <CommandItem
                key={item.value}
                value={item.label}
                onSelect={() => {
                  onChange(item)
                  setOpen(false)
                  setSearchQuery("")
                }}
                className="flex items-center gap-2 px-4 py-2 cursor-pointer aria-selected:bg-slate-100 hover:bg-slate-100 transition-colors"
              >
                <div className="min-w-[16px]">
                  {value?.value === item.value && (
                    <Check className="h-4 w-4" />
                  )}
                </div>
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 