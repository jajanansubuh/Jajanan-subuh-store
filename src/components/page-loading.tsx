"use client";

import React from "react";
import { Loader } from "@/components/ui/loader";
import { useLoading } from "@/providers/loading-provider";

export default function PageLoading() {
  const { loading } = useLoading();

  if (!loading) return null;

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
      role="status"
      aria-live="polite"
    >
      {/* subtle background panel so spinner is visible but doesn't block clicks */}
      <div className="pointer-events-none flex items-center justify-center">
        <div
          className="bg-white/80 dark:bg-neutral-900/70 backdrop-blur-sm px-4 py-3 rounded-lg shadow-md flex flex-col justify-center items-center min-h-[120px] min-w-[120px] gap-2 transition-all duration-500 ease-out animate-fade-in-scale"
          style={{
            animation: "fade-in-scale 0.5s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <Loader className="h-12 w-12 text-gray-800 dark:text-gray-100" />
          <span className="text-sm text-gray-700 dark:text-gray-200">
            Loading...
          </span>
        </div>
      </div>
    </div>
  );
}
