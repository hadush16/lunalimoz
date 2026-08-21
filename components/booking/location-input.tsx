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
  const [inputValue, setInputValue] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  const debouncedSearch = React.useMemo(
    () =>
      debounce(async (query: string) => {
        if (query.length < 2) {
          setResults([]);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        setError(null);

        try {
          const searchResults = await searchPlaces(query);
          setResults(searchResults);
          if (searchResults.length > 0) {
            setIsOpen(true);
          }
        } catch {
          setError("Failed to search locations");
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      }, 300),
    []
  );

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    debouncedSearch(newValue);
  };

  const handleSelect = (result: SearchResult) => {
    setInputValue(result.address.freeformAddress);
    onChange(result);
    setIsOpen(false);
    setResults([]);
  };

  const handleClear = () => {
    setInputValue("");
    onChange(null);
    setResults([]);
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-600 dark:text-gold" />
        <input
          id={id}
          ref={inputRef}
          type="text"
          value={value ? value.address.freeformAddress : inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "flex h-12 min-h-[44px] w-full rounded-none border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-12 py-2 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-600 font-sans",
            "focus:border-amber-500 dark:focus:border-gold focus:outline-none focus:ring-1 focus:ring-amber-500 dark:focus:ring-gold",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-colors duration-200",
            className
          )}
        />
        {isLoading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 animate-spin" />
        )}
        {value && !isLoading && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-slate-900 dark:hover:text-white"
            aria-label="Clear location"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 shadow-2xl overflow-hidden rounded-none">
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => handleSelect(result)}
              className="flex items-start gap-4 w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-neutral-900 transition-all border-b border-slate-100 dark:border-neutral-900 last:border-b-0 group"
            >
              <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-neutral-900 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-amber-500/10 dark:group-hover:bg-gold/10 transition-colors">
                <MapPin className="h-4 w-4 text-slate-500 dark:text-neutral-500 group-hover:text-amber-600 dark:group-hover:text-gold transition-colors" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800 dark:text-neutral-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{result.address.freeformAddress}</p>
                {result.address.municipality && (
                  <p className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-400 dark:text-neutral-600 group-hover:text-amber-600 dark:group-hover:text-gold/60 transition-colors mt-1">
                    {result.address.municipality}
                    {result.address.country && `, ${result.address.country}`}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}