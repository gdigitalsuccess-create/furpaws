'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  brands: string[];
}

export default function BrandCombobox({ value, onChange, brands }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = brands.filter((b) =>
    b.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function select(brand: string) {
    onChange(brand);
    setOpen(false);
    setQuery('');
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
  }

  function handleOpen() {
    setOpen(true);
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function clear() {
    onChange('');
    setQuery('');
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button — shows selected value */}
      {!open ? (
        <button
          type="button"
          onClick={handleOpen}
          className="flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 hover:border-pink-primary focus:border-pink-primary focus:outline-none focus:ring-2 focus:ring-pink-primary/20 transition-colors"
        >
          <span className={value ? 'text-gray-900' : 'text-gray-400'}>
            {value || 'Select or type a brand…'}
          </span>
          <div className="flex items-center gap-1">
            {value && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); clear(); }}
                onKeyDown={(e) => e.key === 'Enter' && clear()}
                className="rounded p-0.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </button>
      ) : (
        /* Search input — shown when open */
        <input
          ref={inputRef}
          type="text"
          value={query || value}
          onChange={handleInputChange}
          placeholder="Search or type new brand…"
          className="h-10 w-full rounded-lg border border-pink-primary bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-primary/20"
        />
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
          {filtered.length === 0 && (
            <div className="px-3 py-2 text-xs text-gray-400">
              {query ? `Use "${query}" as new brand` : 'No brands yet'}
            </div>
          )}
          <ul className="max-h-52 overflow-y-auto divide-y divide-gray-50">
            {filtered.map((brand) => (
              <li key={brand}>
                <button
                  type="button"
                  onClick={() => select(brand)}
                  className="w-full px-3 py-2.5 text-left text-sm text-gray-800 hover:bg-pink-50 hover:text-pink-primary transition-colors"
                >
                  {brand}
                </button>
              </li>
            ))}
          </ul>
          {query && !filtered.includes(query) && (
            <div className="border-t border-gray-100">
              <button
                type="button"
                onClick={() => select(query)}
                className="w-full px-3 py-2.5 text-left text-sm font-medium text-pink-primary hover:bg-pink-50 transition-colors"
              >
                + Add &quot;{query}&quot; as new brand
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
