'use client';

import { useState, useCallback, useEffect } from 'react';

const PRICE_MIN = 0;
const PRICE_MAX = 1000;

interface Props {
  currentMin?: number;
  currentMax?: number;
  locale: string;
  onChange: (min: number | undefined, max: number | undefined) => void;
}

export default function PriceRangeFilter({ currentMin, currentMax, locale, onChange }: Props) {
  const isAr = locale === 'ar';
  const [min, setMin] = useState(currentMin ?? PRICE_MIN);
  const [max, setMax] = useState(currentMax ?? PRICE_MAX);

  useEffect(() => {
    setMin(currentMin ?? PRICE_MIN);
    setMax(currentMax ?? PRICE_MAX);
  }, [currentMin, currentMax]);

  const trackLeft = ((min - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const trackRight = 100 - ((max - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  const commit = useCallback((newMin: number, newMax: number) => {
    onChange(
      newMin === PRICE_MIN ? undefined : newMin,
      newMax === PRICE_MAX ? undefined : newMax,
    );
  }, [onChange]);

  function handleMinChange(v: number) {
    const clamped = Math.min(v, max - 10);
    setMin(clamped);
  }

  function handleMaxChange(v: number) {
    const clamped = Math.max(v, min + 10);
    setMax(clamped);
  }

  const isActive = min !== PRICE_MIN || max !== PRICE_MAX;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          {isAr ? 'نطاق السعر' : 'Price Range'}
        </p>
        {isActive && (
          <button
            onClick={() => { setMin(PRICE_MIN); setMax(PRICE_MAX); onChange(undefined, undefined); }}
            className="text-[11px] font-medium text-pink-primary hover:underline"
          >
            {isAr ? 'مسح' : 'Reset'}
          </button>
        )}
      </div>

      {/* Values display */}
      <div className="mb-3 flex items-center justify-between text-sm font-semibold text-text-dark">
        <span>{min} AED</span>
        <span>{max === PRICE_MAX ? `${PRICE_MAX}+ AED` : `${max} AED`}</span>
      </div>

      {/* Dual range slider */}
      <div className="relative h-5">
        {/* Track */}
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-gray-200">
          <div
            className="absolute h-full rounded-full bg-pink-primary"
            style={{ left: `${trackLeft}%`, right: `${trackRight}%` }}
          />
        </div>

        {/* Min thumb */}
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={10}
          value={min}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          onMouseUp={() => commit(min, max)}
          onTouchEnd={() => commit(min, max)}
          className="price-range-input absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent"
        />

        {/* Max thumb */}
        <input
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={10}
          value={max}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          onMouseUp={() => commit(min, max)}
          onTouchEnd={() => commit(min, max)}
          className="price-range-input absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent"
        />
      </div>
    </div>
  );
}
