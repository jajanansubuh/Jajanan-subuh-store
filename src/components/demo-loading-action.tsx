"use client";
import React from "react";
import { useLoading } from "@/providers/loading-provider";

export default function DemoLoadingAction() {
  const { setLoading } = useLoading();

  const handleAction = async () => {
    setLoading(true); // animasi loading langsung muncul
    // Simulasi aksi async (misal fetch, submit, dsb)
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false); // animasi loading hilang setelah aksi selesai
  };

  return (
    <button
      className="px-4 py-2 bg-green-600 text-white rounded shadow"
      onClick={handleAction}
    >
      Tes Loading Aksi
    </button>
  );
}
