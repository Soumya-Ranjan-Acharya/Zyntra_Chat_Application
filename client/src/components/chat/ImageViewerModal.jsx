import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { getFileUrl } from '../../services/api';

const ImageViewerModal = ({ isOpen, onClose, src, alt, filename }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsZoomed(false);
      return;
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !src) return null;

  const fullUrl = getFileUrl(src);
  const displayName = filename || alt || 'Image Preview';

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = displayName.includes('.') ? displayName : `${displayName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(fullUrl, '_blank');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-sm cursor-zoom-out"
        />

        {/* Top Floating Control Bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
          <span className="text-white/90 text-sm font-medium truncate max-w-[60%] bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 pointer-events-auto">
            {displayName}
          </span>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed(!isZoomed);
              }}
              className="p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white/90 hover:text-white border border-white/10 backdrop-blur-md transition-all cursor-pointer"
              title={isZoomed ? 'Zoom out' : 'Zoom in'}
            >
              {isZoomed ? <ZoomOut size={17} /> : <ZoomIn size={17} />}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white/90 hover:text-white border border-white/10 backdrop-blur-md transition-all cursor-pointer"
              title="Download image"
            >
              <Download size={17} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-black/40 hover:bg-red-500/80 text-white/90 hover:text-white border border-white/10 backdrop-blur-md transition-all cursor-pointer"
              title="Close (Esc)"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Image Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="relative max-w-full max-h-full flex items-center justify-center p-2 z-1"
        >
          <img
            src={fullUrl}
            alt={displayName}
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(!isZoomed);
            }}
            style={{
              maxHeight: isZoomed ? 'none' : '82vh',
              maxWidth: isZoomed ? 'none' : '90vw',
              transform: isZoomed ? 'scale(1.4)' : 'scale(1)',
              transition: 'transform 0.2s ease',
              cursor: isZoomed ? 'zoom-out' : 'zoom-in',
            }}
            className="rounded-lg shadow-2xl object-contain select-none"
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ImageViewerModal;