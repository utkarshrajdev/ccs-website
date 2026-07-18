import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

/** Generic autoplay carousel. Renders one slide at a time via renderItem. */
export default function Carousel({ items = [], renderItem, interval = 6000, label = 'Carousel' }) {
  const [index, setIndex] = useState(0);
  const count = items.length;

  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = () => setIndex((i) => (i - 1 + count) % count);

  useEffect(() => {
    if (count <= 1) return undefined;
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [count, interval, next]);

  if (!count) return null;

  return (
    <div className="relative" role="region" aria-roledescription="carousel" aria-label={label}>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.35 }}
        >
          {renderItem(items[index], index)}
        </motion.div>
      </AnimatePresence>

      {count > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 hover:border-primary-400 transition"
          >
            <FiChevronLeft aria-hidden="true" />
          </button>
          <div className="flex gap-2" role="tablist" aria-label="Slides">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2.5 rounded-full transition-all ${i === index ? 'w-6 bg-primary-600' : 'w-2.5 bg-slate-300 dark:bg-slate-600'}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 hover:border-primary-400 transition"
          >
            <FiChevronRight aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
