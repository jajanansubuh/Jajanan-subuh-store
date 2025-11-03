"use client";
import React from "react";
import { useLoading } from "@/providers/loading-provider";

export default function DemoLoadingButton() {
  const { setLoading } = useLoading();

  const handleClick = async () => {
    setLoading(true);
    // Simulasi aksi async (misal fetch)
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setLoading(false);
  };

  return (
    <button
      className="px-4 py-2 bg-blue-600 text-white rounded"
      onClick={handleClick}
    >
      Tes Loading
    </button>
  );
}
