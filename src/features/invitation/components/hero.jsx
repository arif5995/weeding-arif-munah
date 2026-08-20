import { Calendar, Clock, Heart } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useInvitationData } from "@/features/invitation/hooks/use-invitation-data";
import { formatEventDate } from "@/lib/format-event-date";
import { getGuestName } from "@/lib/invitation-storage";
import { useTranslation } from "@/lib/i18n";
import {
  useMotionPreset,
  staggerContainer,
  LOOP,
  EASE,
  useReducedMotionFlag,
} from "@/lib/motion";

export default function Hero() {
  const { t } = useTranslation();
  const { invitation, isLoading, error } = useInvitationData();
  const [guestName, setGuestName] = useState("");
  const reduceMotion = useReducedMotionFlag();
  const fade = useMotionPreset("fade");
  const fadeUp = useMotionPreset("fadeUp");
  const scaleIn = useMotionPreset("scaleIn");

  useEffect(() => {
    // Get guest name from localStorage
    const storedGuestName = getGuestName();
    if (storedGuestName) {
      setGuestName(storedGuestName);
    }
  }, []);

  const CountdownTimer = ({ targetDate }) => {
    const calculateTimeLeft = useCallback(() => {
      const difference = +new Date(targetDate) - +new Date();
      let timeLeft = {};

      if (difference > 0) {
        timeLeft = {
          [t("hero.days")]: Math.floor(difference / (1000 * 60 * 60 * 24)),
          [t("hero.hours")]: Math.floor((difference / (1000 * 60 * 60)) % 24),
          [t("hero.minutes")]: Math.floor((difference / 1000 / 60) % 60),
          [t("hero.seconds")]: Math.floor((difference / 1000) % 60),
        };
      }
      return timeLeft;
    }, [targetDate]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 1000);
      return () => clearInterval(timer);
    }, [calculateTimeLeft]);

    if (!targetDate) return null;

    return (
      <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8")}>
        {Object.keys(timeLeft).map((interval) => (
          <motion.div
            key={interval}
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className={cn(
              "flex flex-col items-center p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-brand-accent-soft",
            )}
          >
            <span
              className={cn("text-xl sm:text-2xl font-bold text-brand-primary")}
            >
              {timeLeft[interval]}
            </span>
            <span className={cn("text-xs text-gray-500 capitalize")}>
              {interval}
            </span>
          </motion.div>
        ))}
      </div>
    );
  };

  const FloatingHearts = () => {
    const [hearts] = useState(() =>
      [...Array(8)].map((_, i) => ({
        size: Math.floor(Math.random() * 2) + 8,
        color:
          i % 3 === 0
            ? "text-brand-primary/70"
            : i % 3 === 1
              ? "text-brand-accent"
              : "text-brand-primary",
        initialX:
          typeof window !== "undefined" ? Math.random() * window.innerWidth : 0,
        animateX:
          typeof window !== "undefined" ? Math.random() * window.innerWidth : 0,
      })),
    );

    return (
      <div
        className={cn("absolute inset-0 overflow-hidden pointer-events-none")}
      >
        {hearts.map((heart, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 0,
              scale: 0,
              x: heart.initialX,
              y: typeof window !== "undefined" ? window.innerHeight : 0,
            }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 1, 0.5],
              x: heart.animateX,
              y: -100,
            }}
            transition={{
              duration: LOOP.float,
              repeat: Infinity,
              delay: i * 0.8,
              ease: EASE.out,
            }}
            className={cn("absolute")}
          >
            <Heart
              className={heart.color}
              style={{
                width: `${heart.size * 4}px`,
                height: `${heart.size * 4}px`,
              }}
              fill="currentColor"
            />
          </motion.div>
        ))}
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <section
        id="home"
        className={cn(
          "min-h-screen flex flex-col items-center justify-center px-4 py-16 sm:py-20 text-center relative overflow-hidden",
        )}
      >
        <div className={cn("flex flex-col items-center justify-center space-y-4")}>
          <div className={cn("w-12 h-12 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin")} />
          <p className={cn("text-gray-500 font-light italic")}>{t("hero.loading")}</p>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section
        id="home"
        className={cn(
          "min-h-screen flex flex-col items-center justify-center px-4 py-16 sm:py-20 text-center relative overflow-hidden",
        )}
      >
        <div className={cn("text-center space-y-4")}>
          <div className={cn("w-16 h-16 mx-auto rounded-full bg-rose-100 flex items-center justify-center")}>
            <svg className={cn("w-8 h-8 text-rose-500")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className={cn("text-2xl font-semibold text-gray-800")}>{t("hero.errorTitle")}</h2>
          <p className={cn("text-gray-600")}>{error}</p>
        </div>
      </section>
    );
  }

  // No invitation data
  if (!invitation) {
    return (
      <section
        id="home"
        className={cn(
          "min-h-screen flex flex-col items-center justify-center px-4 py-16 sm:py-20 text-center relative overflow-hidden",
        )}
      >
        <div className={cn("text-center space-y-4")}>
          <h2 className={cn("text-2xl font-semibold text-gray-800")}>{t("hero.notFound")}</h2>
          <p className={cn("text-gray-600")}>{t("hero.notFoundDesc")}</p>
        </div>
      </section>
    );
  }

  const config = invitation;

  return (
    <>
      <section
        id="home"
        className={cn(
          "min-h-screen flex flex-col items-center justify-center px-4 py-16 sm:py-20 text-center relative overflow-hidden",
        )}
      >
        <motion.div
          variants={staggerContainer()}
          initial="hidden"
          animate="visible"
          className={cn("space-y-6 relative z-10")}
        >
          <motion.div variants={scaleIn} className={cn("inline-block mx-auto")}>
            <span
              className={cn(
                "px-4 py-1 text-sm bg-brand-accent-soft text-brand-primary rounded-full border border-brand-accent",
              )}
            >
              {t("landing.saveTheDate")}
            </span>
          </motion.div>

          <div className={cn("space-y-4")}>
            <motion.p
              variants={fade}
              className={cn(
                "text-gray-500 font-light italic text-base sm:text-lg",
              )}
            >
              {t("hero.marriageTitle")}
            </motion.p>
            <motion.h2
              variants={scaleIn}
              className={cn(
                "text-3xl sm:text-5xl font-script text-brand-primary",
              )}
            >
              {config.groomName} & {config.brideName}
            </motion.h2>
          </div>

          <motion.div
            variants={fadeUp}
            className={cn("relative max-w-md mx-auto")}
          >
            <div
              className={cn(
                "w-20 sm:w-32 h-[2px] bg-gradient-to-r from-transparent via-brand-accent to-transparent",
              )}
            />
            <div
              className={cn(
                "relative px-4 sm:px-8 py-8 sm:py-10 rounded-2xl border border-brand-accent-soft/50",
              )}
            >
              <div
                className={cn(
                  "absolute top-0 left-1/2 -translate-x-1/2 -translate-y-px",
                )}
              >
                <div
                  className={cn(
                    "w-20 sm:w-32 h-[2px] bg-gradient-to-r from-transparent via-brand-accent to-transparent",
                  )}
                />
              </div>

              <div className={cn("space-y-6 text-center")}>
                <div className={cn("space-y-3")}>
                  <motion.div
                    variants={fade}
                    className={cn("flex items-center justify-center space-x-2")}
                  >
                    <Calendar className={cn("w-4 h-4 text-brand-primary/60")} />
                    <span
                      className={cn(
                        "text-gray-700 font-medium text-sm sm:text-base",
                      )}
                    >
                      {formatEventDate(config.date, "full")}
                    </span>
                  </motion.div>

                  <motion.div
                    variants={fade}
                    className={cn("flex items-center justify-center space-x-2")}
                  >
                    <Clock className={cn("w-4 h-4 text-brand-primary/60")} />
                    <span
                      className={cn(
                        "text-gray-700 font-medium text-sm sm:text-base",
                      )}
                    >
                      {config.time}
                    </span>
                  </motion.div>
                </div>

                <div className={cn("flex items-center justify-center gap-3")}>
                  <div className={cn("h-px w-8 sm:w-12 bg-brand-accent/50")} />
                  <div className={cn("w-2 h-2 rounded-full bg-brand-accent")} />
                  <div className={cn("h-px w-8 sm:w-12 bg-brand-accent/50")} />
                </div>

                <motion.div variants={fade} className={cn("space-y-2")}>
                  <p className={cn("text-gray-500 font-serif italic text-sm")}>
                    {t("hero.guestGreeting")}
                  </p>
                  <p className={cn("text-gray-600 font-medium text-sm")}>
                    {t("hero.guestSalutation")}
                  </p>
                  <p className={cn("text-brand-primary font-semibold text-lg")}>
                    {guestName || t("hero.guestFallback")}
                  </p>
                </motion.div>
              </div>

              <div
                className={cn(
                  "absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-px",
                )}
              >
                <div
                  className={cn(
                    "w-20 sm:w-32 h-[2px] bg-gradient-to-r from-transparent via-brand-accent to-transparent",
                  )}
                />
              </div>
            </div>

            <div
              className={cn(
                "absolute -top-2 -right-2 w-16 sm:w-24 h-16 sm:h-24 bg-brand-accent-soft/20 rounded-full blur-xl",
              )}
            />
            <div
              className={cn(
                "absolute -bottom-2 -left-2 w-16 sm:w-24 h-16 sm:h-24 bg-brand-accent-soft/20 rounded-full blur-xl",
              )}
            />
          </motion.div>

          <CountdownTimer targetDate={config.date} />

          <div className={cn("pt-6 relative")}>
            {!reduceMotion && <FloatingHearts />}
            <motion.div
              animate={
                reduceMotion
                  ? undefined
                  : {
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }
              }
              transition={
                reduceMotion
                  ? undefined
                  : {
                      duration: LOOP.pulse,
                      repeat: Infinity,
                      ease: EASE.inOut,
                    }
              }
            >
              <Heart
                className={cn(
                  "w-10 sm:w-12 h-10 sm:h-12 text-brand-primary mx-auto",
                )}
                fill="currentColor"
              />
            </motion.div>
          </div>
        </motion.div>
      </section>
    </>
  );
}