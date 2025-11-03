"use client";
import React from "react";
import Image from "next/image";

export interface MainCarouselProps {
  images: { imageUrl: string; label?: string }[];
}

export default function MainCarousel({ images }: MainCarouselProps) {
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!images || images.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full h-[180px] md:h-[300px] overflow-hidden rounded-2xl pt-6 bg-transparent mt-6 px-4 md:px-8">
      {images.map((img, idx) => (
        <Image
          key={img.imageUrl}
          src={img.imageUrl}
          alt={img.label || "carousel"}
          fill
          className={`object-cover transition-opacity duration-700 ${
            idx === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}
