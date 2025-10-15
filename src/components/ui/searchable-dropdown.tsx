import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchableDropdownOption {
  value: string;
  label: string;
  icon?: string | React.ReactNode;
  subtitle?: string;
  searchTerms?: string[]; // Additional terms to search by
}

interface SearchableDropdownProps {
  options: SearchableDropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  dropdownClassName?: string;
  disabled?: boolean;
  searchPlaceholder?: string;
  noResultsText?: string;
  allowCustomValue?: boolean; // Allow typing custom values
}

export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className = "",
  dropdownClassName = "",
  disabled = false,
  searchPlaceholder = "Search...",
  noResultsText = "No results found.",
  allowCustomValue = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Find selected option
  const selectedOption = options.find((opt) => opt.value === value);

  // Filter options based on search query
  const filteredOptions = options.filter((option) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      option.label.toLowerCase().includes(query) ||
      option.value.toLowerCase().includes(query) ||
      option.subtitle?.toLowerCase().includes(query) ||
      option.searchTerms?.some((term) => term.toLowerCase().includes(query))
    );
  });

  // Handle input change
  const handleInputChange = (inputValue: string) => {
    setSearchQuery(inputValue);
    setIsTyping(true);

    // Auto-open dropdown when typing
    if (!isOpen && inputValue) {
      setIsOpen(true);
    }

    // If custom values are allowed, update the value directly
    if (allowCustomValue && inputValue) {
      onChange(inputValue);
    }
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filteredOptions.length === 1) {
      // Auto-select if only one result
      onChange(filteredOptions[0].value);
      setIsOpen(false);
      setSearchQuery("");
      setIsTyping(false);
      e.preventDefault();
    } else if (e.key === "Escape") {
      // Close dropdown on escape
      setIsOpen(false);
      setSearchQuery("");
      setIsTyping(false);
    }
  };

  // Handle option selection
  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery("");
    setIsTyping(false);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative h-7 sm:h-8">
        {selectedOption?.icon && !isTyping && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-base sm:text-lg pointer-events-none z-10">
            {typeof selectedOption.icon === "string" ? (
              <span>{selectedOption.icon}</span>
            ) : (
              selectedOption.icon
            )}
          </div>
        )}
        <Input
          type="text"
          placeholder={placeholder}
          value={isTyping ? searchQuery : selectedOption?.label || value || ""}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (!isOpen) {
              setIsOpen(true);
              setIsTyping(true);
              setSearchQuery("");
            }
          }}
          onBlur={(e) => {
            // Delay to allow clicking on dropdown items
            setTimeout(() => {
              const relatedTarget = e.relatedTarget as HTMLElement;
              if (
                !relatedTarget ||
                !relatedTarget.closest("[data-searchable-dropdown]")
              ) {
                setIsOpen(false);
                setSearchQuery("");
                setIsTyping(false);
              }
            }, 150);
          }}
          disabled={disabled}
          className={cn(
            "h-full w-full pr-6 text-[11px] sm:text-xs focus-visible:ring-0 focus-visible:ring-offset-0",
            selectedOption?.icon && !isTyping ? "pl-8 sm:pl-9" : "pl-2 sm:pl-2.5"
          )}
        />
        <ChevronsUpDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 opacity-50 pointer-events-none" />
      </div>

      {isOpen && (
        <div
          data-searchable-dropdown
          className={cn(
            "absolute z-50 mt-1 w-full rounded-md border bg-white shadow-md",
            dropdownClassName
          )}
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="max-h-[250px] sm:max-h-[320px] overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="py-8 text-center text-sm sm:text-base text-gray-500">
                {noResultsText}
              </div>
            ) : (
              <div className="p-1 sm:p-1.5">
                {filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "w-full flex items-center px-2 sm:px-3 py-2.5 sm:py-3 text-sm sm:text-base rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation",
                      value === option.value && "bg-cyan-50 hover:bg-cyan-100"
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-cyan-600 shrink-0",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.icon && (
                      <span className="mr-2 sm:mr-3 text-xl sm:text-2xl shrink-0">
                        {typeof option.icon === "string" ? (
                          <span>{option.icon}</span>
                        ) : (
                          option.icon
                        )}
                      </span>
                    )}
                    <span className="flex-1 text-left">
                      <div className="font-medium truncate pr-2">
                        {option.label}
                      </div>
                      {option.subtitle && (
                        <div className="text-gray-600 font-mono text-xs sm:text-sm truncate">
                          {option.subtitle}
                        </div>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
