"use client";

import { NeuroNoise } from "@paper-design/shaders-react";
import { ArrowUpRight } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export interface CTAProps {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  onPrimaryClick?: () => void;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  onSecondaryClick?: () => void;
  className?: string;
  cardClassName?: string;
  contentClassName?: string;
  fullWidth?: boolean;
}

const CTA = ({
  title = "Experience the difference",
  description = "Join thousands of developers using our premium component library to ship beautiful UIs in minutes, not hours.",
  primaryButtonText = "Get Started",
  primaryButtonHref,
  onPrimaryClick,
  secondaryButtonText = "View Components",
  secondaryButtonHref,
  onSecondaryClick,
  className = "",
  cardClassName = "",
  contentClassName = "",
  fullWidth = false,
}: CTAProps = {}) => {
  let resolvedTheme = "light";
  try {
    const themeContext = useTheme();
    resolvedTheme = themeContext?.resolvedTheme || themeContext?.theme || "light";
  } catch {
    resolvedTheme = "light";
  }

  const isLight = resolvedTheme === "light";

  return (
    <div
      className={
        fullWidth
          ? `w-full px-0 py-0 ${className}`
          : `px-0 py-16 sm:px-6 ${className}`
      }
    >
      <div
        className={
          fullWidth
            ? `relative w-full overflow-hidden border-y border-zinc-200/80 p-10 sm:p-14 md:p-16 lg:p-20 shadow-muted bg-background/50 ${cardClassName}`
            : `relative mx-auto max-w-5xl overflow-hidden border-y p-14 shadow-muted sm:rounded-xl sm:border-x sm:shadow-lg/5 bg-background/50 ${cardClassName}`
        }
      >
        <NeuroNoise
          brightness={0}
          className="mask-l-from-30% sm:mask-l-from-10% absolute inset-0 pointer-events-none w-full h-full"
          colorBack={
            isLight ? "rgba(0, 0, 0, 0.08)" : undefined
          }
          colorFront={
            isLight ? "rgba(0, 0, 0, 0.08)" : undefined
          }
          colorMid={
            isLight
              ? "rgba(0, 0, 0, 0.5)"
              : "rgba(255, 255, 255, 0.85)"
          }
          contrast={1}
          height={720}
          scale={0.55}
          speed={1}
          width={1920}
        />

        <div
          className={
            fullWidth
              ? `relative isolate max-w-5xl mx-auto w-full ${contentClassName}`
              : `relative isolate ${contentClassName}`
          }
        >

          <h2 className="text-balance font-medium text-4xl text-foreground tracking-tighter md:leading-tight lg:text-[2.75rem]">
            {title}
          </h2>
          <p className="mt-4 text-balance text-zinc-700 dark:text-zinc-300 text-xl/normal md:mt-2.5 lg:text-[1.4rem]/normal">
            {description}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={onPrimaryClick}
              asChild={Boolean(primaryButtonHref)}
            >
              {primaryButtonHref ? (
                <a href={primaryButtonHref}>
                  {primaryButtonText} <ArrowUpRight className="ml-1 size-4" />
                </a>
              ) : (
                <>
                  {primaryButtonText} <ArrowUpRight className="ml-1 size-4" />
                </>
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onSecondaryClick}
              asChild={Boolean(secondaryButtonHref)}
            >
              {secondaryButtonHref ? (
                <a href={secondaryButtonHref}>{secondaryButtonText}</a>
              ) : (
                <>{secondaryButtonText}</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTA;
export { CTA };
