"use client";
import { useState } from "react";

import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface MediaItem {
  url: string;
  type: "image" | "video";
}

interface GalleryProps {
  productMedia: MediaItem[];
  colorImages?: MediaItem[];
}

export default function Gallery({
  productMedia,
  colorImages = [],
}: GalleryProps) {
  // Combine product media and color images
  const allMedia = [...productMedia, ...colorImages];
  const [mainMedia, setMainMedia] = useState<MediaItem>(allMedia[0]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % allMedia.length;
    setCurrentIndex(newIndex);
    setMainMedia(allMedia[newIndex]);
  };

  const handlePrev = () => {
    const newIndex = (currentIndex - 1 + allMedia.length) % allMedia.length;
    setCurrentIndex(newIndex);
    setMainMedia(allMedia[newIndex]);
  };

  return (
    <div className="flex size-full flex-1 flex-col gap-6">
      {/* Main Media Container */}
      <div
        className="relative aspect-square w-full overflow-hidden rounded-2xl bg-neutral-50 shadow-sm transition-all duration-300 hover:shadow-md lg:size-[500px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={mainMedia.url}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="relative size-full"
          >
            {mainMedia.type === "image" ? (
              <Image
                src={mainMedia.url}
                fill
                alt="product"
                className="object-cover transition-transform duration-500 hover:scale-105"
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
        {allMedia.length > 1 && (
          <>
            <motion.button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
              initial={{ opacity: 0, x: -10 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                x: isHovered ? 0 : -10,
              }}
              transition={{ duration: 0.2 }}
            >
              <ChevronLeft className="size-6 text-gray-700" />
            </motion.button>
            <motion.button
              onClick={handleNext}
              className="absolute right-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
              initial={{ opacity: 0, x: 10 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                x: isHovered ? 0 : 10,
              }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="size-6 text-gray-700" />
            </motion.button>
          </>
        )}

        {/* Image Counter */}
        {allMedia.length > 1 && (
          <motion.div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white backdrop-blur-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {currentIndex + 1} / {allMedia.length}
          </motion.div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {allMedia.map((media, index) => {
          const isActive = mainMedia.url === media.url;
          return (
            <div
              key={index}
              className={`min-w-[100px] p-[2px] rounded-lg ${isActive ? "border-2 border-bondi-blue shadow-md" : "border-2 border-transparent"} bg-white transition-shadow duration-200`}
              style={{ boxSizing: "border-box" }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setMainMedia(media);
                  setCurrentIndex(index);
                }}
                className="w-full h-full rounded-lg overflow-hidden"
                style={{ display: "block" }}
              >
                <div className="relative aspect-square w-24 rounded-lg lg:w-28">
                  {media.type === "image" ? (
                    <Image
                      src={media.url}
                      fill
                      alt={`Product thumbnail ${index + 1}`}
                      className="object-cover w-full h-full"
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
              </motion.button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
