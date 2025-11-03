"use client";

import React from "react";
import { Loader } from "@/components/ui/loader";

export default function Loading() {
  // Render only the spinner centered in the page content area.
  // No full-screen overlay so header/nav remain visible.
  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-none flex items-center justify-center">
        <div className="bg-white/80 dark:bg-neutral-900/70 backdrop-blur-sm px-4 py-3 rounded-lg shadow-md flex flex-col items-center">
          <Loader className="h-12 w-12 text-gray-800 dark:text-gray-100" />
          <span className="mt-3 text-sm text-gray-700 dark:text-gray-200">
            Loading...
          </span>
        </div>
      </div>
    </div>
  );
}
