"use client";

import * as React from "react";
import { MapPin, X, Loader2 } from "lucide-react";
import { searchPlaces, type SearchResult } from "@/lib/tomtom/search";
import { cn } from "@/lib/utils";
import { debounce } from "@/lib/utils";

interface LocationInputProps {
  id?: string;
  placeholder: string;
  value: SearchResult | null;
  onChange: (location: SearchResult | null) => void;
  disabled?: boolean;
  iconPosition?: "start" | "end";
  className?: string;
}

export function LocationInput({
  id,
  placeholder,
  value,
  onChange,
  disabled,
  className,
}: LocationInputProps) {
  const [inputText, setInputText] = React.useState(value?.address?.freeformAddress || "");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState<number>(-1);
  const [error, setError] = React.useState<string | null>(null);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // Sync internal text when external `value` prop changes (e.g. initial URL params or reset)
  React.useEffect(() => {
    if (value && value.address?.freeformAddress) {
      setInputText(value.address.freeformAddress);
    } else if (!value && !isOpen) {
      setInputText("");
    }
  }, [value, isOpen]);

  const debouncedSearch = React.useMemo(
    () =>
      debounce(async (query: string) => {
        if (!query || query.trim().length < 2) {
          setResults([]);
          setIsLoading(false);
          setIsOpen(false);
          return;
        }

        setIsLoading(true);
        setError(null);

        try {
          const searchResults = await searchPlaces(query.trim());
          setResults(searchResults);
          setSelectedIndex(-1);
          if (searchResults.length > 0) {
            setIsOpen(true);
          } else {
            setIsOpen(false);
          }
        } catch {
          setError("Failed to search locations");
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      }, 250),
    []
  );

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputText(newValue);

    // If text was cleared or drastically modified from previously selected value
    if (value && newValue !== value.address.freeformAddress) {
      onChange(null);
    }

    debouncedSearch(newValue);
  };

  const handleSelect = (result: SearchResult) => {
    setInputText(result.address.freeformAddress);
    onChange(result);
    setIsOpen(false);
    setResults([]);
    setSelectedIndex(-1);
  };

  const handleClear = () => {
    setInputText("");
    onChange(null);
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) {
      if (e.key === "Enter" && inputText.trim()) {
        e.preventDefault();
        // Fallback: create SearchResult from typed address if no dropdown item was chosen
        const fallbackResult: SearchResult = {
          id: `custom-${Date.now()}`,
          address: { freeformAddress: inputText.trim(), municipality: "Seattle", country: "United States" },
          position: { lat: 47.6062, lon: -122.3321 },
          type: "POI"
        };
        handleSelect(fallbackResult);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex]);
      } else if (results.length > 0) {
        handleSelect(results[0]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gold pointer-events-none z-10" />
        <input
          id={id}
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length > 0 && inputText.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={cn(
            "flex h-12 min-h-[44px] w-full rounded-none border border-border bg-input pl-10 pr-10 py-2.5 text-xs sm:text-sm font-bold text-foreground placeholder:text-muted-foreground font-sans",
            "focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/60",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-colors duration-200",
            className
          )}
        />
        
        {isLoading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10">
            <Loader2 className="h-4 w-4 text-gold animate-spin" />
          </div>
        )}

        {inputText && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors z-10"
            aria-label="Clear location input"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-[100] bg-card border border-border shadow-2xl overflow-hidden rounded-none max-h-64 overflow-y-auto">
          {results.map((result, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={result.id || idx}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevents input blur before click fires
                  handleSelect(result);
                }}
                onClick={() => handleSelect(result)}
                className={cn(
                  "flex items-start gap-3 w-full p-3 text-left transition-colors border-b border-border/50 last:border-b-0 cursor-pointer",
                  isSelected
                    ? "bg-gold/15 text-foreground font-bold"
                    : "hover:bg-secondary text-foreground"
                )}
              >
                <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                    {result.address.freeformAddress}
                  </p>
                  {result.address.municipality && (
                    <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-0.5 truncate">
                      {result.address.municipality}
                      {result.address.country && `, ${result.address.country}`}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <p className="mt-1 text-[11px] text-destructive font-medium">{error}</p>
      )}
    </div>
  );
}