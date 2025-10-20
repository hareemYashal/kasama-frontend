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
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const viewport = window.visualViewport;
    if (!viewport) return;

    const handleResize = () => {
      const offset = window.innerHeight - viewport.height;
      setKeyboardOffset(offset > 0 ? offset : 0);
    };

    viewport.addEventListener("resize", handleResize);
    viewport.addEventListener("scroll", handleResize);

    return () => {
      viewport.removeEventListener("resize", handleResize);
      viewport.removeEventListener("scroll", handleResize);
    };
  }, []);

  // ✅ Lock body scroll when modal open
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
          {/* ✅ Backdrop stays static (no scroll) */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" />

          {/* ✅ Dialog container — scroll only inside here */}
          <motion.div
            className="relative z-[9999] w-full max-w-md bg-white rounded-2xl shadow-xl flex flex-col max-h-[90dvh]"
            initial={{ y: 40, opacity: 0 }}
            animate={{
              y:
                keyboardOffset > 0
                  ? -Math.min(keyboardOffset * 0.3, 120)
                  : 0,
              opacity: 1,
            }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ✅ Only this part scrolls */}
            <div
              className="p-6 overflow-y-auto"
              style={{
                maxHeight: `calc(100dvh - ${keyboardOffset + 150}px)`,
              }}
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
