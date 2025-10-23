"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function KeyboardAwareDialog({
  open,
  onClose,
  title,
  children,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Disable background scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9998] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* ✅ Fullscreen backdrop (no scroll) */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* ✅ Centered Modal — stays fixed even with keyboard open */}
          <motion.div
            className="relative z-[9999] w-[90%] max-w-md md:max-w-lg bg-white rounded-2xl shadow-xl flex flex-col max-h-dvh  mx-auto my-6 sm:my-10"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
          >
            {/* Header */}
            {title ? (
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                <h2 className="text-lg font-semibold">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="text-2xl font-bold text-slate-800">
                <div className="w-full flex justify-end">
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-100 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-col space-y-1.5 text-center sm:text-left pb-6 border-b">
                  <div className="flex justify-center items-center">
                    <img
                      src="/assets/kasama-logo1.png"
                      alt="Kasama Logo"
                      className="h-16 object-contain"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ✅ Only inner form scrolls */}
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
