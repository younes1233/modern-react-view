import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface MultiSelectOption {
  id: number | string
  label: string
  value: string
  color?: string
  disabled?: boolean
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  selected: number | string | null
  onSelectionChange: (selected: number | string | null) => void
  placeholder?: string
  searchPlaceholder?: string
  className?: string
  disabled?: boolean
}

export function MultiSelect({
  options,
  selected,
  onSelectionChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search options...",
  className,
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const selectedOption = selected ? options.find(option => option.id === selected) : null

  // Filter options based on search
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
    option.value.toLowerCase().includes(searchValue.toLowerCase())
  )

  const handleSelect = (optionId: number | string) => {
    if (selected === optionId) {
      // If clicking the same option, deselect it
      onSelectionChange(null)
    } else {
      // Select the new option
      onSelectionChange(optionId)
    }
    // Close dropdown after selection
    setOpen(false)
    setSearchValue("")
  }

  // Clear search when dropdown closes
  React.useEffect(() => {
    if (!open) {
      setSearchValue("")
    }
  }, [open])

  return (
    <div className={cn("w-full relative", className)}>
      <Select
        open={open}
        onOpenChange={setOpen}
        value={selected?.toString() || ""}
        onValueChange={(value) => {
          if (value) {
            onSelectionChange(parseInt(value))
          } else {
            onSelectionChange(null)
          }
        }}
        disabled={disabled}
      >
        <SelectTrigger className={cn("w-full", selectedOption && !open ? "pr-16" : "pr-8")}>
          {open ? (
            <input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="flex h-full w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 caret-foreground"
              style={{ color: 'inherit' }}
              autoFocus
            />
          ) : (
            <SelectValue>
              {selectedOption ? (
                <div className="flex items-center space-x-2">
                  {selectedOption.color && (
                    <div
                      className="w-4 h-4 rounded border border-border"
                      style={{ backgroundColor: selectedOption.color }}
                    />
                  )}
                  <span>{selectedOption.label}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </SelectValue>
          )}
        </SelectTrigger>

        {/* Clear button - positioned next to the arrow */}
        {selectedOption && !open && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-6 top-1/2 transform -translate-y-1/2 h-4 w-4 p-0 hover:bg-transparent z-10"
            onClick={(e) => {
              e.stopPropagation()
              onSelectionChange(null)
            }}
          >
            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
          </Button>
        )}

        <SelectContent>
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {searchValue ? "No options found." : "No options available."}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <SelectItem
                  key={option.id}
                  value={option.id.toString()}
                  disabled={option.disabled}
                >
                  <div className="flex items-center space-x-2">
                    {option.color && (
                      <div
                        className="w-4 h-4 rounded border border-border"
                        style={{ backgroundColor: option.color }}
                      />
                    )}
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))
            )}
          </div>
        </SelectContent>
      </Select>
    </div>
  )
}