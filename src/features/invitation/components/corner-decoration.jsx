import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useMotionPreset, useReducedMotionFlag } from "@/lib/motion";

const CornerDecoration = ({
  position,
  variant = "flower-leaf",
  customOffset = {},
}) => {
  const reduceMotion = useReducedMotionFlag();
  const swayIn = useMotionPreset("swayIn");

  // 1. Konfigurasi posisi dasar dan transformasi (flip/rotasi)
  const positionClasses = {
    "top-left": "top-0 left-0 flex-row",
    "top-right": "top-0 right-0 flex-row-reverse scale-x-[-1]",
    "bottom-left": "bottom-0 left-0 flex-row scale-y-[-1]",
    "bottom-right":
      "bottom-0 right-0 flex-row-reverse scale-x-[-1] scale-y-[-1]",
  };

  // 2. Default offset (bisa ditarik keluar / offside minus agar menjorok ke luar bingkai)
  // Anda bisa mengubah angka minus ini untuk mengatur seberapa jauh offside-nya
  const defaultOffsets = {
    "top-left": { top: "-50px", left: "-30px" },
    "top-right": { top: "-100px", right: "-90px" },
    "bottom-left": { bottom: "-100px", left: "-90px" },
    "bottom-right": { bottom: "-50px", right: "-30px" },
  };

  const currentPositionClass = positionClasses[position] || "top-left";

  // Gabungkan default offset dengan custom offset jika ada
  const activeOffset = {
    ...defaultOffsets[position],
    ...customOffset,
  };

  return (
    <motion.div
      variants={swayIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        "absolute pointer-events-none select-none z-0 flex items-start",
        "gap-1 sm:gap-2",
        // Ukuran container diperbesar (lebih besar dari sebelumnya)
        variant === "flower" ? "w-75 sm:w-85" : "w-52 sm:w-72",
        currentPositionClass,
      )}
      // Menerapkan posisi offside secara otomatis berdasarkan posisi sudut
      style={{
        top: activeOffset.top,
        bottom: activeOffset.bottom,
        left: activeOffset.left,
        right: activeOffset.right,
      }}
    >
      {/* Tampilkan gambar daun jika variant adalah "leaf" atau "flower-leaf" */}
      {(variant === "leaf" || variant === "flower-leaf") && (
        <motion.img
          src="/images/leaf-white.png"
          alt=""
          className={cn(
            variant === "flower-leaf" ? "w-[60%]" : "w-full",
            "h-auto",
          )}
          loading="lazy"
          animate={reduceMotion ? undefined : { rotate: [-2, 2, -2] }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }
          style={{ transformOrigin: "top center" }}
        />
      )}

      {/* Tampilkan gambar bunga jika variant adalah "flower" atau "flower-leaf" */}
      {(variant === "flower" || variant === "flower-leaf") && (
        <motion.img
          src="/images/flower-white.png"
          alt=""
          className={cn(
            variant === "flower-leaf" ? "w-[50%] mt-2 sm:mt-4" : "w-full",
            "h-auto",
          )}
          loading="lazy"
          animate={reduceMotion ? undefined : { rotate: [-2, 2, -2] }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
          }
          style={{ transformOrigin: "top center" }}
        />
      )}
    </motion.div>
  );
};

export default CornerDecoration;
