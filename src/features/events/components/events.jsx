import EventCards from "@/features/events/components/events-card";
import { useAgendaData } from "@/features/invitation/hooks/use-invitation-data";
import { motion } from "motion/react";
import { Heart } from "lucide-react";
import { useMotionPreset, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function Events() {
  const { agenda, isLoading, error } = useAgendaData();
  const fade = useMotionPreset("fade");
  const { t } = useTranslation();
  const fadeUp = useMotionPreset("fadeUp");
  const scaleIn = useMotionPreset("scaleIn");

  if (isLoading) {
    return (
      <section
        id="event"
        className={cn("min-h-screen relative overflow-hidden")}
      >
        <div className={cn("container mx-auto px-4 py-20 relative z-10")}>
          <motion.div
            variants={fade}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={cn("text-center space-y-4 mb-16")}
          >
            <motion.span
              variants={fadeUp}
              className={cn("inline-block text-brand-primary font-medium mb-2")}
            >
              {t("events.saveTheDate")}
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className={cn(
                "text-4xl md:text-5xl font-script text-gray-800 leading-tight",
              )}
            >
              {t("events.title")}
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className={cn("text-gray-500 max-w-md mx-auto")}
            >
              {t("events.subtitle")}
            </motion.p>
            <motion.div
              variants={scaleIn}
              className={cn("flex items-center justify-center gap-4 mt-6")}
            >
              <div className={cn("h-[1px] w-12 bg-brand-accent")} />
              <div className={cn("text-brand-primary/60")}>
                <Heart className={cn("w-4 h-4")} fill="currentColor" />
              </div>
              <div className={cn("h-[1px] w-12 bg-brand-accent")} />
            </motion.div>
          </motion.div>
          <div className={cn("flex items-center justify-center py-12")}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 44 }}
              transition={{
                duration: 1.2,
                ease: "easeOut",
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className={cn("h-px bg-brand-primary")}
            />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        id="event"
        className={cn("min-h-screen relative overflow-hidden")}
      >
        <div
          className={cn(
            "container mx-auto px-4 py-20 relative z-10 text-center",
          )}
        >
          <div
            className={cn(
              "w-16 h-16 mx-auto rounded-full bg-rose-100 flex items-center justify-center mb-4",
            )}
          >
            <svg
              className={cn("w-8 h-8 text-rose-500")}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className={cn("text-2xl font-semibold text-gray-800 mb-2")}>
            {t("events.errorTitle")}
          </h2>
          <p className={cn("text-gray-600")}>{error}</p>
        </div>
      </section>
    );
  }

  if (!agenda || agenda.length === 0) {
    return (
      <section
        id="event"
        className={cn("min-h-screen relative overflow-hidden")}
      >
        <div
          className={cn(
            "container mx-auto px-4 py-20 relative z-10 text-center",
          )}
        >
          <motion.div
            variants={fade}
            initial="hidden"
            animate="visible"
            className={cn("space-y-4 mb-16")}
          >
            <motion.span
              variants={fadeUp}
              className={cn("inline-block text-brand-primary font-medium mb-2")}
            >
              {t("events.saveTheDate")}
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className={cn(
                "text-4xl md:text-5xl font-script text-gray-800 leading-tight",
              )}
            >
              {t("events.title")}
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className={cn("text-gray-500 max-w-md mx-auto")}
            >
              {t("events.subtitle")}
            </motion.p>
            <motion.div
              variants={scaleIn}
              className={cn("flex items-center justify-center gap-4 mt-6")}
            >
              <div className={cn("h-[1px] w-12 bg-brand-accent")} />
              <div className={cn("text-brand-primary/60")}>
                <Heart className={cn("w-4 h-4")} fill="currentColor" />
              </div>
              <div className={cn("h-[1px] w-12 bg-brand-accent")} />
            </motion.div>
          </motion.div>
          <div className={cn("text-gray-500 py-12")}>
            {t("events.emptyState")}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Event Section */}
      <section
        id="event"
        className={cn("min-h-screen relative overflow-hidden")}
      >
        <motion.div
          variants={fade}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className={cn("relative z-10 container mx-auto px-4 py-20")}
        >
          {/* Section Header */}
          <motion.div
            variants={staggerContainer()}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={cn("text-center space-y-4 mb-16")}
          >
            <motion.span
              variants={fadeUp}
              className={cn("inline-block text-brand-primary font-medium mb-2")}
            >
              {t("events.saveTheDate")}
            </motion.span>

            <motion.h2
              variants={fadeUp}
              className={cn(
                "text-4xl md:text-5xl font-script text-gray-800 leading-tight",
              )}
            >
              {t("events.title")}
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className={cn("text-gray-500 max-w-md mx-auto")}
            >
              {t("events.subtitle")}
            </motion.p>

            {/* Decorative Line */}
            <motion.div
              variants={scaleIn}
              className={cn("flex items-center justify-center gap-4 mt-6")}
            >
              <div className={cn("h-[1px] w-12 bg-brand-accent")} />
              <div className={cn("text-brand-primary/60")}>
                <Heart className={cn("w-4 h-4")} fill="currentColor" />
              </div>
              <div className={cn("h-[1px] w-12 bg-brand-accent")} />
            </motion.div>
          </motion.div>

          {/* Events Grid */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={cn("max-w-2xl mx-auto")}
          >
            <EventCards events={agenda} />
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}
