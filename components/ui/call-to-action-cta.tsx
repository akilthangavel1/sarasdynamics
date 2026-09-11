"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";

// Define the props for the CtaCard component
export interface CtaCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imageSrc?: string;
  title: string;
  description: string;
  inputPlaceholder?: string;
  buttonText: string;
  onButtonClick?: (email: string) => void;
  theme?: "light" | "dark";
}

const CtaCard = React.forwardRef<HTMLDivElement, CtaCardProps>(
  (
    {
      className,
      imageSrc = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
      title,
      description,
      inputPlaceholder = "Email address",
      buttonText,
      onButtonClick,
      theme = "light",
      ...props
    },
    ref
  ) => {
    const [email, setEmail] = React.useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (onButtonClick) {
        onButtonClick(email);
      }
      console.log("Email submitted:", email);
    };

    // Animation variants for Framer Motion
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.2,
          delayChildren: 0.1,
        },
      },
    };

    const itemVariants = {
      hidden: { y: 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 12,
        },
      },
    };

    const isLight = theme === "light";

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full overflow-hidden rounded-2xl border transition-colors shadow-lg",
          isLight
            ? "border-zinc-200/90 bg-white text-zinc-900 shadow-zinc-950/5"
            : "border-zinc-800 bg-zinc-950 text-white shadow-xl shadow-black/20",
          className
        )}
        {...props}
      >
        {/* Background Image */}
        {imageSrc && (
          <img
            src={imageSrc}
            alt="Background"
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden="true"
            onError={(e) => {
              e.currentTarget.src = isLight
                ? "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80"
                : "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80";
            }}
          />
        )}

        {/* Overlay adapted to theme for maximum legibility */}
        {isLight ? (
          <div className="absolute inset-0 bg-white/88 backdrop-blur-[2px] transition-colors" />
        ) : (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] transition-colors" />
        )}

        {/* Content */}
        <motion.div
          className="relative z-10 grid h-full grid-cols-1 items-center gap-8 p-8 md:grid-cols-2 md:p-12 lg:p-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div
            className={cn(
              "flex flex-col items-start text-left",
              isLight ? "text-zinc-900" : "text-white"
            )}
          >
            <motion.h2
              className={cn(
                "text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl leading-tight",
                isLight ? "text-zinc-900" : "text-white"
              )}
              variants={itemVariants}
            >
              {title}
            </motion.h2>
            <motion.p
              className={cn(
                "mt-4 max-w-xl text-base md:text-lg leading-relaxed",
                isLight ? "text-zinc-600" : "text-neutral-200"
              )}
              variants={itemVariants}
            >
              {description}
            </motion.p>
          </div>

          <motion.div
            className="flex w-full max-w-md flex-col items-center justify-center md:justify-self-end"
            variants={itemVariants}
          >
            <form
              onSubmit={handleSubmit}
              className="flex w-full flex-col gap-3 sm:flex-row"
            >
              <Input
                type="email"
                placeholder={inputPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  "h-12 flex-grow rounded-xl text-sm font-medium transition-colors shadow-2xs",
                  isLight
                    ? "border-zinc-300 bg-white/95 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-zinc-900 focus-visible:border-zinc-400"
                    : "border-neutral-700 bg-neutral-800/60 text-white placeholder:text-neutral-400 focus:ring-offset-background"
                )}
                aria-label={inputPlaceholder}
                required
              />
              <Button
                type="submit"
                size="lg"
                className={cn(
                  "h-12 font-semibold px-6 rounded-xl transition-all cursor-pointer shadow-sm active:scale-98 shrink-0",
                  isLight
                    ? "bg-zinc-900 text-white hover:bg-zinc-800"
                    : "bg-white text-black hover:bg-neutral-200"
                )}
              >
                <span>{buttonText}</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    );
  }
);

CtaCard.displayName = "CtaCard";

export { CtaCard };
export default CtaCard;
