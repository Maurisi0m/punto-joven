import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageLightboxProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageLightbox({
  src,
  alt,
  isOpen,
  onClose,
}: ImageLightboxProps) {
  const [imageError, setImageError] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            onKeyDown={handleKeyDown}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Image Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
            onKeyDown={handleKeyDown}
          >
            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="absolute top-4 right-4 z-50 rounded-full bg-white/20 hover:bg-white/30 p-2 transition-colors text-white"
              aria-label="Cerrar"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Image */}
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center"
            >
              {imageError ? (
                <div className="bg-white/10 rounded-lg p-8 text-center text-white">
                  <p className="text-lg font-semibold mb-2">No se pudo cargar la imagen</p>
                  <p className="text-sm text-white/60">Intenta de nuevo más tarde</p>
                </div>
              ) : (
                <img
                  src={src}
                  alt={alt}
                  onError={() => setImageError(true)}
                  className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-2xl"
                />
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
