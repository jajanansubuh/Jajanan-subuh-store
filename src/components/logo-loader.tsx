"use client";

import Image from "next/image";
import { useLoading } from "@/providers/loading-provider";
import React from "react";

export default function LogoLoader() {
  const { setLoading } = useLoading();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // tampilkan loading overlay yang sudah ada
    setLoading(true);
    // beri sedikit delay agar overlay terlihat sebelum reload
    setTimeout(() => {
      // lakukan reload penuh agar state dan data dimuat ulang
      window.location.href = "/";
    }, 100);
  };

  return (
    <button
      onClick={handleClick}
      className="absolute left-4 lg:left-8 flex items-center gap-x-2 cursor-pointer"
      aria-label="Kembali ke beranda"
    >
      <div className="relative h-8 w-8">
        <Image src="/logo-jjs.png" alt="Logo Jajanan Subuh" fill />
      </div>
      <p className="font-bold text-xl logo-gloock">Jajanan Subuh</p>
    </button>
  );
}
