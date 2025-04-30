"use client";
import { useState } from "react";

import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface MediaItem {
  url: string;
  type: "image" | "video";
}

export default function Gallery({
  productMedia,
}: {
  productMedia: MediaItem[];
}) {
  const [mainMedia, setMainMedia] = useState<MediaItem>(productMedia[0]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % productMedia.length;
    setCurrentIndex(newIndex);
    setMainMedia(productMedia[newIndex]);
  };

  const handlePrev = () => {
    const newIndex =
      (currentIndex - 1 + productMedia.length) % productMedia.length;
    setCurrentIndex(newIndex);
    setMainMedia(productMedia[newIndex]);
  };

  return (
    <div className="flex size-full flex-1 flex-col gap-4">
      {/* Main Media Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-neutral-100 lg:size-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={mainMedia.url}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative size-full"
          >
            {mainMedia.type === "image" ? (
              <Image
                src={mainMedia.url}
                fill
                alt="product"
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 500px"
              />
            ) : (
              <video
                src={mainMedia.url}
                className="size-full object-cover"
                controls
                autoPlay
                loop
                muted
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {productMedia.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-lg backdrop-blur-sm transition hover:bg-white"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-lg backdrop-blur-sm transition hover:bg-white"
            >
              <ChevronRight className="size-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Gallery */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {productMedia.map((media, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setMainMedia(media);
              setCurrentIndex(index);
            }}
            className="relative min-w-[100px]"
          >
            <div className="relative aspect-square w-24 overflow-hidden rounded-lg lg:w-28">
              {media.type === "image" ? (
                <Image
                  src={media.url}
                  fill
                  alt={`Product thumbnail ${index + 1}`}
                  className="object-cover"
                  sizes="(max-width: 768px) 96px, 112px"
                />
              ) : (
                <video
                  src={media.url}
                  className="size-full object-cover"
                  muted
                />
              )}
            </div>
            {mainMedia.url === media.url && (
              <motion.div
                layoutId="selectedBorder"
                className="absolute inset-0 rounded-lg border-2 border-black"
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
