import { useTranslation } from "@/lib/i18n";
import { useConfig } from "@/features/invitation/hooks/use-config";
import { formatEventDateParts } from "@/lib/format-event-date";
import { motion } from "motion/react";
import {
  useMotionPreset,
  staggerContainer,
  LOOP,
  useReducedMotionFlag,
} from "@/lib/motion";
import { cn } from "@/lib/utils";
import CornerDecoration from "./corner-decoration";

const LandingPage = ({ onOpenInvitation }) => {
  const config = useConfig(); // Use hook to get config from API or fallback to static
  const reduceMotion = useReducedMotionFlag();
  const fade = useMotionPreset("fade");
  const fadeUp = useMotionPreset("fadeUp");
  const { t } = useTranslation();

  const dateParts = formatEventDateParts(config.date);

  return (
    <motion.div
      variants={fade}
      initial="hidden"
      animate="visible"
      className={cn("min-h-screen relative overflow-hidden bg-[#faf7f2]")}
    >
      {/* Corner Decorations */}
      <CornerDecoration position="top-left" variant="leaf" />
      <CornerDecoration position="top-right" variant="flower" />
      <CornerDecoration position="bottom-left" variant="flower" />
      <CornerDecoration position="bottom-right" variant="leaf" />

      {/* Main Content */}
      <div
        className={cn(
          "relative z-10 min-h-screen flex flex-col items-center justify-center px-4",
        )}
      >
        <motion.div
          variants={staggerContainer()}
          initial="hidden"
          animate="visible"
          className={cn("w-full max-w-md space-y-6 sm:space-y-8")}
        >
          {/* Bismillah Image */}
          <motion.div variants={fade} className={cn("flex justify-center")}>
            <img
              src="/images/bismillah.png"
              alt="Bismillah"
              className={cn("h-18 sm:h-24 w-auto")}
            />
          </motion.div>

          {/* Invited Text */}
          <motion.div variants={fadeUp} className={cn("text-center")}>
            <p
              className={cn(
                "font-fahkwang text-center text-gray-700 text-sm sm:text-base",
              )}
            >
              {t("landing.invitedTo")}
            </p>
          </motion.div>

          {/* Couple Names */}
          <motion.div variants={fadeUp} className={cn("text-center space-y-2")}>
            <div
              className={cn(
                "font-script text-4xl sm:text-5xl md:text-6xl text-gray-800 leading-tight space-y-1",
              )}
            >
              <div>{config.groomName}</div>
              <div
                className={cn("font-fahkwang text-lg sm:text-xl text-gray-500")}
              >
                &
              </div>
              <div>{config.brideName}</div>
            </div>
          </motion.div>

          {/* Date Block */}
          <motion.div variants={fadeUp} className={cn("text-center space-y-3")}>
            {/* Bulan */}
            <p
              className={cn(
                "font-fahkwang text-xs tracking-[4px] uppercase text-gray-600",
              )}
            >
              {dateParts.month}
            </p>

            {/* Bagian Hari, Garis, Tanggal, dan Waktu */}
            <div
              className={cn("flex items-center justify-center gap-4 sm:gap-6")}
            >
              {/* Hari (Rata kanan agar rapi mendekati garis) */}
              <span
                className={cn(
                  "font-fahkwang text-sm sm:text-base uppercase text-gray-600 text-right w-24 sm:w-28",
                )}
              >
                {dateParts.day}
              </span>

              {/* Garis Vertikal Kiri (Tinggi disesuaikan dengan ukuran teks tanggal) */}
              <span className={cn("border-l border-amber-400 h-10 sm:h-12")} />

              {/* Tanggal Utama (Dibuat jauh lebih besar dan di-center) */}
              <span
                className={cn(
                  "font-fahkwang text-5xl sm:text-6xl font-semibold text-emerald-800 text-center w-20 sm:w-24",
                )}
              >
                {dateParts.date}
              </span>

              {/* Garis Vertikal Kanan */}
              <span className={cn("border-r border-amber-400 h-10 sm:h-12")} />

              {/* Waktu (Rata kiri agar seimbang) */}
              <span
                className={cn(
                  "font-fahkwang text-xs sm:text-sm uppercase text-gray-600 text-left w-28 sm:w-36",
                )}
              >
                {config.time}
              </span>
            </div>

            {/* Tahun */}
            <p className={cn("font-fahkwang text-sm text-gray-600")}>
              {dateParts.year}
            </p>
          </motion.div>

          {/* Address & City */}
          <motion.div
            variants={fadeUp}
            className={cn("text-center space-y-0.5")}
          >
            <p className={cn("font-fahkwang text-sm text-gray-600")}>
              {config.address}
            </p>
            <p className={cn("font-fahkwang text-xs text-gray-500")}>
              {config.city}
            </p>
          </motion.div>

          {/* Reception to Follow */}
          <motion.div variants={fadeUp} className={cn("text-center")}>
            <p
              className={cn(
                "font-script italic text-center text-lg text-gray-500",
              )}
            >
              {t("landing.receptionToFollow")}
            </p>
          </motion.div>

          {/* Open Invitation Button */}
          <motion.div variants={fadeUp} className={cn("mt-4 sm:mt-6")}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenInvitation}
              className={cn(
                "group relative w-full bg-emerald-800 text-white px-6 py-3 sm:px-8 sm:py-3 rounded-xl font-medium shadow-lg hover:bg-emerald-900 transition-all duration-200",
              )}
            >
              <span
                className={cn(
                  "relative z-10 flex items-center justify-center gap-2",
                )}
              >
                <span>{t("landing.openInvitation")}</span>
                <motion.span
                  animate={reduceMotion ? undefined : { x: [0, 4, 0] }}
                  transition={
                    reduceMotion
                      ? undefined
                      : { repeat: Infinity, duration: LOOP.nudge }
                  }
                >
                  →
                </motion.span>
              </span>
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-r from-emerald-900 to-emerald-800 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                )}
              />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LandingPage;
