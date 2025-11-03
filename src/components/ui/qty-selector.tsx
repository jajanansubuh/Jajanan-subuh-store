"use client";

import React from "react";

interface QtySelectorProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

const QtySelector: React.FC<QtySelectorProps> = ({
  value,
  onChange,
  min = 1,
  max,
  className,
}) => {
  const dec = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange(Math.max(min, value - 1));
  };

  const inc = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (typeof max === "number") onChange(Math.min(max, value + 1));
    else onChange(value + 1);
  };

  return (
    <div className={`flex items-center gap-x-2 ${className ?? ""}`}>
      <button
        type="button"
        onClick={dec}
        aria-label="Kurangi jumlah"
        className="px-2 py-1 border rounded"
        disabled={value <= min}
      >
        -
      </button>
      <input
        aria-label="Jumlah"
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value) || min;
          let next = Math.max(min, Math.floor(v));
          if (typeof max === "number") next = Math.min(max, next);
          onChange(next);
        }}
        className="w-16 text-center border rounded px-2 py-1"
        {...(typeof max === "number" ? { max } : {})}
      />
      <button
        type="button"
        onClick={inc}
        aria-label="Tambah jumlah"
        className="px-2 py-1 border rounded"
        disabled={typeof max === "number" ? value >= max : false}
      >
        +
      </button>
    </div>
  );
};

export default QtySelector;
