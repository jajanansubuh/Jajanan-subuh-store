"use client";

import { Image as ImageType } from "@/types";

import { TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import GalleryTab from "./gallery-tab";
import Image from "next/image";

interface GalleryProps {
  images: ImageType[];
}

const Gallery: React.FC<GalleryProps> = ({ images }) => {
  return (
    <TabGroup as="div" className="flex flex-col-reverse">
      <div className="mx-auto mt-6 hidden w-full max-w-3xl sm:block lg:max-w-none">
        <TabList className="grid grid-cols-4 gap-6">
          {images.map((image) => (
            <GalleryTab key={image.id} image={image} />
          ))}
        </TabList>
      </div>
      {/* Use a taller, responsive area instead of forcing a square */}
      <TabPanels className="w-full">
        {images.map((image) => (
          <TabPanel key={image.id}>
            <div className="relative h-[420px] w-full sm:rounded-lg overflow-hidden">
              <Image
                src={image.url}
                fill
                alt="Image"
                className="object-contain object-center bg-white"
              />
            </div>
          </TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
};

export default Gallery;
