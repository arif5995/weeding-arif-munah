import { useBankData } from "@/features/invitation/hooks/use-invitation-data";
import { useTranslation } from "@/lib/i18n";
import { motion } from "motion/react";
import { Copy, Gift, CheckCircle, Wallet, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useMotionPreset, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";

export default function Gifts() {
  const { banks, isLoading, error } = useBankData();
  const { t } = useTranslation();
  const [copiedAccount, setCopiedAccount] = useState(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const fade = useMotionPreset("fade");
  const fadeUp = useMotionPreset("fadeUp");
  const scaleIn = useMotionPreset("scaleIn");

  // Set animation to run once on component mount
  useEffect(() => {
    setHasAnimated(true);
  }, []);

  const copyToClipboard = (text, bank) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(bank);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  if (isLoading) {
    return (
      <section id="gifts" className={cn("min-h-screen relative overflow-hidden")}>
        <div className={cn("container mx-auto px-4 py-20 relative z-10")}>
          <motion.div
            variants={staggerContainer()}
            initial="hidden"
            animate="visible"
            className={cn("text-center space-y-4 mb-16")}
          >
            <motion.span variants={fadeUp} className={cn("inline-block text-brand-primary font-medium")}>
              {t("gifts.subTitle")}
            </motion.span>
            <motion.h2 variants={fadeUp} className={cn("text-4xl md:text-5xl font-script text-gray-800")}>
              {t("gifts.title")}
            </motion.h2>
            <motion.div variants={scaleIn} className={cn("flex items-center justify-center gap-4 pt-4")}>
              <div className={cn("h-[1px] w-12 bg-brand-accent")} />
              <Gift className={cn("w-5 h-5 text-brand-primary/60")} />
              <div className={cn("h-[1px] w-12 bg-brand-accent")} />
            </motion.div>
          </motion.div>
          <div className={cn("flex items-center justify-center py-12")}>
            <motion.div initial={{ width: 0 }} animate={{ width: 44 }} transition={{ duration: 1.2, ease: "easeOut", repeat: Infinity, repeatType: "reverse" }} className={cn("h-px bg-brand-primary")} />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="gifts" className={cn("min-h-screen relative overflow-hidden")}>
        <div className={cn("container mx-auto px-4 py-20 relative z-10 text-center")}>
          <div className={cn("w-16 h-16 mx-auto rounded-full bg-rose-100 flex items-center justify-center mb-4")}>
            <svg className={cn("w-8 h-8 text-rose-500")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className={cn("text-2xl font-semibold text-gray-800 mb-2")}>{t("gifts.errorTitle")}</h2>
          <p className={cn("text-gray-600")}>{error}</p>
        </div>
      </section>
    );
  }

  // Hide section if banks data is not set
  if (!banks || banks.length === 0) {
    return null;
  }

  return (
    <>
      <section id="gifts" className={cn("min-h-screen relative overflow-hidden")}>
        <div className={cn("container mx-auto px-4 py-20 relative z-10")}>
          {/* Section Header */}
          <motion.div
            variants={staggerContainer()}
            initial="hidden"
            animate={hasAnimated ? "visible" : "hidden"}
            className={cn("text-center space-y-4 mb-16")}
          >
            <motion.span
              variants={fadeUp}
              className={cn("inline-block text-brand-primary font-medium")}
            >
              {t("gifts.subTitle")}
            </motion.span>

            <motion.h2
              variants={fadeUp}
              className={cn("text-4xl md:text-5xl font-script text-gray-800")}
            >
              {t("gifts.title")}
            </motion.h2>

            {/* Decorative Divider */}
            <motion.div
              variants={scaleIn}
              className={cn("flex items-center justify-center gap-4 pt-4")}
            >
              <div className={cn("h-[1px] w-12 bg-brand-accent")} />
              <Gift className={cn("w-5 h-5 text-brand-primary/60")} />
              <div className={cn("h-[1px] w-12 bg-brand-accent")} />
            </motion.div>

            {/* Message Container */}
            <motion.div
              variants={fade}
              className={cn("space-y-4 max-w-md mx-auto")}
            >
              {/* Arabic InsyaAllah */}
              <p className={cn("font-arabic text-xl text-gray-800")}>
                إن شاء الله
              </p>

              <p className={cn("text-gray-600 leading-relaxed")}>
                {t("gifts.message")}
              </p>
              <div className={cn("space-y-2")}>
                <p className={cn("font-arabic text-lg text-gray-800")}>
                  جزاكم الله خيرا وبارك الله فيكم
                </p>
                <p className={cn("text-gray-600 italic text-sm")}>
                  Jazakumullahu khairan, Barakallah fiikum
                </p>
              </div>
            </motion.div>

            {/* Optional: Additional Decorative Element */}
            <motion.div
              variants={scaleIn}
              className={cn("flex items-center justify-center gap-3 pt-4")}
            >
              <div className={cn("h-px w-8 bg-brand-accent/50")} />
              <div className={cn("w-1.5 h-1.5 rounded-full bg-brand-accent")} />
              <div className={cn("h-px w-8 bg-brand-accent/50")} />
            </motion.div>
          </motion.div>

          {/* Bank Accounts Grid */}
          <motion.div
            variants={staggerContainer()}
            initial="hidden"
            animate={hasAnimated ? "visible" : "hidden"}
            className={cn("max-w-2xl mx-auto grid gap-6")}
          >
            {banks.map((account) => (
              <motion.div
                key={account.id}
                variants={fadeUp}
                className={cn("relative group")}
              >
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-r from-brand-accent-soft/50 to-brand-accent-soft/50 rounded-2xl transform transition-transform group-hover:scale-105 duration-300",
                  )}
                />
                <div
                  className={cn(
                    "relative backdrop-blur-sm bg-white/80 p-6 rounded-2xl border border-brand-accent-soft/50 shadow-lg",
                  )}
                >
                  <div className={cn("flex items-center justify-between")}>
                    <div className={cn("flex items-center space-x-4")}>
                      <div
                        className={cn(
                          "w-12 h-12 rounded-lg bg-white p-2 shadow-sm",
                        )}
                      >
                        <Building2
                          className={cn("w-full h-full text-brand-primary")}
                        />
                      </div>
                      <div>
                        <h3 className={cn("font-medium text-gray-800")}>
                          {account.bankName}
                        </h3>
                        <p className={cn("text-sm text-gray-500")}>
                          {account.accountName}
                        </p>
                      </div>
                    </div>
                    <Wallet className={cn("w-5 h-5 text-brand-primary/60")} />
                  </div>

                  <div className={cn("mt-4")}>
                    <div
                      className={cn(
                        "flex items-center justify-between bg-gray-50/80 px-4 py-3 rounded-lg",
                      )}
                    >
                      <p className={cn("font-mono text-gray-700")}>
                        {account.accountNumber}
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          copyToClipboard(account.accountNumber, account.bankName)
                        }
                        className={cn(
                          "flex items-center space-x-1 text-brand-primary hover:text-brand-primary-hover",
                        )}
                      >
                        {copiedAccount === account.bankName ? (
                          <CheckCircle className={cn("w-4 h-4")} />
                        ) : (
                          <Copy className={cn("w-4 h-4")} />
                        )}
                        <span className={cn("text-sm")}>
                          {copiedAccount === account.bankName
                            ? t("gifts.copied")
                            : t("gifts.copy")}
                        </span>
                      </motion.button>
                    </div>

                    {account.type && (
                      <span className={cn("inline-block px-2 py-1 text-xs font-medium text-brand-accent bg-brand-accent-soft rounded-full mt-2")}>
                        {account.type}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}