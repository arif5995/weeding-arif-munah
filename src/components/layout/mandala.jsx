import { motion } from "motion/react";
import { useReducedMotionFlag } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Mandala decorative component
 * Positioned at top center with negative offset, rotating slowly
 * Uses two-layer structure for proper center rotation
 */
export default function Mandala() {
  const reduceMotion = useReducedMotionFlag();

  return (
    <motion.div
      className={cn(
        "absolute left-1/2 top-0 z-10 w-full max-w-[400px] pointer-events-none",
        "-translate-x-1/2",
      )}
      style={{
        transformOrigin: "center top",
      }}
    >
      {/* Wrapper for horizontal centering - handles translateX(-50%) */}
      <div
        className={cn("relative")}
        style={{
          transform: "translateX(-50%)",
          transformOrigin: "center top",
        }}
      >
        {/* Mandala image with rotation animation */}
        <motion.img
          src="/images/mandala_satu.png"
          alt=""
          aria-hidden="true"
          className={cn(
            "block w-full h-auto",
            "md:w-[280px] md:h-auto",
            "lg:w-[340px] lg:h-auto",
            "xl:w-[400px] xl:h-auto",
          )}
          style={{
            transformOrigin: "center center",
            marginTop: "-120px", // Negative offset to show only bottom portion
          }}
          animate={reduceMotion ? {} : { rotate: 360 }}
          transition={{
            duration: 45,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    </motion.div>
  );
}