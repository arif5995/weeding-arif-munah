import { cn } from "@/lib/utils";

/**
 * Wrapper yang membuat konten selalu tampil sebagai "bingkai HP"
 * di tengah layar, konsisten di semua breakpoint (mobile & desktop).
 */
const PhoneFrame = ({ children, className }) => {
  return (
    <div
      className={cn(
        "relative min-h-screen w-full bg-brand-bg flex items-center justify-center",
      )}
    >
      <div
        className={cn(
          "mx-auto w-full max-w-[430px] min-h-screen bg-brand-bg relative overflow-hidden",
          "sm:border sm:border-gray-200 sm:shadow-lg",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default PhoneFrame;