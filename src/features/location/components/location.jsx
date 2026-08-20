import { useInvitationData } from "@/features/invitation/hooks/use-invitation-data";
import { useTranslation } from "@/lib/i18n";
import { Clock, MapPin, CalendarCheck, ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import { formatEventDate } from "@/lib/format-event-date";
import { useMotionPreset, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";

export default function Location() {
  const { invitation, isLoading, error } = useInvitationData();
  const { t } = useTranslation();
  const fadeUp = useMotionPreset("fadeUp");
  const scaleIn = useMotionPreset("scaleIn");

  if (isLoading) {
    return (
      <section
        id="location"
        className={cn("min-h-screen relative overflow-hidden")}
      >
        <div className={cn("container mx-auto px-4 py-20 relative z-10")}>
          <motion.div
            variants={staggerContainer()}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={cn("text-center space-y-4 mb-16")}
          >
            <motion.span
              variants={fadeUp}
              className={cn("inline-block text-brand-primary font-medium")}
            >
              {t("location.eventVenue")}
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className={cn("text-4xl md:text-5xl font-script text-gray-800")}
            >
              {t("location.title")}
            </motion.h2>
            <motion.div
              variants={scaleIn}
              className={cn("flex items-center justify-center gap-4 pt-4")}
            >
              <div className={cn("h-[1px] w-12 bg-brand-accent")} />
              <MapPin className={cn("w-5 h-5 text-brand-primary/60")} />
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
        id="location"
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
            {t("location.errorTitle")}
          </h2>
          <p className={cn("text-gray-600")}>{error}</p>
        </div>
      </section>
    );
  }

  if (!invitation) {
    return null;
  }

  const config = invitation;

  return (
    <>
      {/* Location section */}
      <section
        id="location"
        className={cn("min-h-screen relative overflow-hidden")}
      >
        <div className={cn("container mx-auto px-4 py-20 relative z-10")}>
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
              className={cn("inline-block text-brand-primary font-medium")}
            >
              {t("location.eventVenue")}
            </motion.span>

            <motion.h2
              variants={fadeUp}
              className={cn("text-4xl md:text-5xl font-script text-gray-800")}
            >
              {t("location.title")}
            </motion.h2>

            {/* Decorative Divider */}
            <motion.div
              variants={scaleIn}
              className={cn("flex items-center justify-center gap-4 pt-4")}
            >
              <div className={cn("h-[1px] w-12 bg-brand-accent")} />
              <MapPin className={cn("w-5 h-5 text-brand-primary/60")} />
              <div className={cn("h-[1px] w-12 bg-brand-accent")} />
            </motion.div>
          </motion.div>

          {/* Location Content */}
          <div
            className={cn(
              "max-w-6xl mx-auto grid md:grid-row-2 gap-8 items-center",
            )}
          >
            {/* Map Container */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className={cn(
                "w-full h-[400px] rounded-2xl overflow-hidden shadow-lg border-8 border-white",
              )}
            >
              <iframe
                src={config.maps_embed}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className={cn("w-full h-full")}
              ></iframe>
            </motion.div>

            {/* Venue Details */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className={cn("space-y-6")}
            >
              <div
                className={cn(
                  "bg-white rounded-2xl p-8 shadow-lg border border-gray-100",
                )}
              >
                <h3 className={cn("text-2xl font-serif text-gray-800 mb-6")}>
                  {config.location}
                </h3>

                <div className={cn("space-y-4")}>
                  <div className={cn("flex items-start space-x-4")}>
                    <MapPin className={cn("w-5 h-5 text-brand-primary mt-1")} />
                    <p className={cn("text-gray-600 flex-1")}>
                      {config.address}
                    </p>
                  </div>

                  <div className={cn("flex items-center space-x-4")}>
                    <CalendarCheck
                      className={cn("w-5 h-5 text-brand-primary")}
                    />
                    <p className={cn("text-gray-600")}>
                      {formatEventDate(config.date)}
                    </p>
                  </div>

                  <div className={cn("flex items-center space-x-4")}>
                    <Clock className={cn("w-5 h-5 text-brand-primary")} />
                    <p className={cn("text-gray-600")}>{config.time}</p>
                  </div>

                  {/* Action Button - Full Width */}
                  <div className={cn("pt-4")}>
                    <motion.a
                      href={config.maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      viewport={{ once: true }}
                      className={cn(
                        "w-full flex items-center justify-center gap-1.5 bg-white text-gray-600 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm",
                      )}
                    >
                      <ExternalLink className={cn("w-3.5 h-3.5")} />
                      <span className={cn("font-semibold")}>
                        {t("location.viewMap")}
                      </span>
                    </motion.a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
