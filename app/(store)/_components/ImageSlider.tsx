'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

interface ImageSliderProps {
  images?: string[];
  autoPlayInterval?: number;
  initialPlayState?: boolean;
  hideControls?: boolean;
}

const defaultImages = [
  '/banner.webp',
  '/banner-1.webp',
  '/banner-2.webp',
  '/banner-3.webp',
  '/banner-4.webp',
  '/banner-5.webp',
];

const ImageSlider: React.FC<ImageSliderProps> = ({
  images = defaultImages,
  autoPlayInterval = 5000,
  initialPlayState = true,
  hideControls = false,
}) => {
  const [[currentIndex, direction], setPage] = useState<[number, number]>([
    0, 0,
  ]);
  const [isPlaying, setIsPlaying] = useState<boolean>(initialPlayState);

  const paginate = useCallback(
    (newDirection: number): void => {
      const newIndex =
        (currentIndex + newDirection + images.length) % images.length;
      setPage([newIndex, newDirection]);
    },
    [currentIndex, images.length]
  );

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isPlaying) {
      interval = setInterval(() => paginate(1), autoPlayInterval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, autoPlayInterval, paginate]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number): number =>
    Math.abs(offset) * velocity;

  const handleDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void => {
      const swipe = swipePower(info.offset.x, info.velocity.x);
      if (swipe < -swipeConfidenceThreshold) paginate(1);
      else if (swipe > swipeConfidenceThreshold) paginate(-1);
    },
    [paginate]
  );

  return (
    <div className='relative mx-auto w-full h-full overflow-hidden rounded-lg shadow-md bg-gray-100'>
      <AnimatePresence
        initial={false}
        custom={direction}
      >
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          custom={direction}
          variants={slideVariants}
          initial='enter'
          animate='center'
          exit='exit'
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30, mass: 1.8 },
            opacity: { duration: 0.5 },
          }}
          drag='x'
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={handleDragEnd}
          className='absolute inset-0 size-full cursor-grab object-cover select-none'
          draggable='false'
        />
      </AnimatePresence>

      {/* Gradient overlay for better text contrast */}
      <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60'></div>

      {!hideControls && (
        <div className='absolute inset-x-0 bottom-4 z-10 flex items-center justify-center gap-3 sm:gap-4'>
          <button
            className='rounded-full bg-bondi-blue/80 p-1.5 sm:p-2 shadow-lg transition-all duration-300 hover:bg-bondi-blue focus:outline-none focus:ring-2 focus:ring-white'
            onClick={() => paginate(-1)}
            aria-label='Previous slide'
          >
            <ChevronLeft className='size-3.5 sm:size-4 text-white lg:size-6' />
          </button>
          <button
            className='rounded-full bg-bondi-blue/80 p-1.5 sm:p-2 shadow-lg hover:bg-bondi-blue focus:outline-none focus:ring-2 focus:ring-white'
            onClick={() => setIsPlaying((prev) => !prev)}
            aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
          >
            {isPlaying ? (
              <Pause className='size-3.5 sm:size-4 text-white lg:size-6' />
            ) : (
              <Play className='size-3.5 sm:size-4 text-white lg:size-6' />
            )}
          </button>
          <button
            className='rounded-full bg-bondi-blue/80 p-1.5 sm:p-2 shadow-lg hover:bg-bondi-blue focus:outline-none focus:ring-2 focus:ring-white'
            onClick={() => paginate(1)}
            aria-label='Next slide'
          >
            <ChevronRight className='size-3.5 sm:size-4 text-white lg:size-6' />
          </button>
        </div>
      )}

      <div
        className={`absolute left-1/2 z-10 flex -translate-x-1/2 space-x-1.5 sm:space-x-2 ${
          hideControls ? 'bottom-3 sm:bottom-4' : 'bottom-14 sm:bottom-16'
        }`}
      >
        {images.map((_, index) => (
          <button
            key={index}
            className={`h-1.5 w-1.5 sm:size-2 rounded-full transition-all duration-300 ${
              currentIndex === index ? 'bg-white w-3 sm:w-4' : 'bg-white/50'
            }`}
            onClick={() => setPage([index, index > currentIndex ? 1 : -1])}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
