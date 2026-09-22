import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

const steps = [
  {
    n: "01",
    title: "Pick a block",
    body: "Browse 135 production sections. Search by category, preview live, copy the install command.",
  },
  {
    n: "02",
    title: "Install in seconds",
    body: "Run one CLI command. Dependencies, primitives and styles wire themselves into your project.",
  },
  {
    n: "03",
    title: "Ship to production",
    body: "Swap the copy and your brand mark. Light and dark mode are pre-wired. Push and move on.",
  },
];

export default function HowItWorks09() {
  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-6 sm:px-10">
        <div className="mb-14 flex flex-col items-center gap-3 text-center">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            How it works
          </span>
          <h2
            className="text-balance font-semibold tracking-tight text-foreground"
            style={{
              fontSize: "clamp(1.85rem, 4vw, 2.75rem)",
              letterSpacing: "-0.03em",
            }}
          >
            Three steps from browse to live
          </h2>
        </div>

        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* connector lines */}
          <div className="absolute inset-x-0 top-6 hidden h-px bg-border md:block" />

          {steps.map((step, i) => (
            <div
              key={step.n}
              className="relative flex flex-col items-center gap-4 text-center"
            >
              <div className="relative z-10 flex size-12 items-center justify-center rounded-full border border-border bg-background">
                <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                  {step.n}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-semibold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="mt-2 size-4 text-muted-foreground/40 md:hidden" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <Button size="lg" className="rounded-full px-8">
            Browse blocks
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

export { HowItWorks09 };
