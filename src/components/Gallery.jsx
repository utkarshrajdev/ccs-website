import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import LazyImage from './common/LazyImage';
import Reveal from './common/Reveal';

/** Responsive image gallery with lightbox. items: [{ image, caption }] */
export default function Gallery({ items = [] }) {
  const [active, setActive] = useState(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {items.map((item, i) => (
          <Reveal key={i} delay={i * 0.05}>
            <button
              type="button"
              onClick={() => setActive(item)}
              className="group block w-full overflow-hidden rounded-2xl"
              aria-label={`View image: ${item.caption || `Gallery image ${i + 1}`}`}
            >
              <LazyImage
                src={item.image}
                alt={item.caption || `Gallery image ${i + 1}`}
                className="h-40 w-full transition-transform duration-500 group-hover:scale-105 md:h-52"
              />
            </button>
          </Reveal>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={active.caption || 'Image preview'}
          >
            <button
              type="button"
              onClick={() => setActive(null)}
              aria-label="Close preview"
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <FiX size={20} aria-hidden="true" />
            </button>
            <motion.figure
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] max-w-4xl"
            >
              <img src={active.image} alt={active.caption || ''} className="max-h-[78vh] rounded-2xl object-contain" />
              {active.caption && (
                <figcaption className="mt-3 text-center text-sm text-slate-300">{active.caption}</figcaption>
              )}
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
