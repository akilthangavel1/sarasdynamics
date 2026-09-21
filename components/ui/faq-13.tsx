"use client";

import { FancyButton } from "@/components/ui/faq-13-utils/fancy-button";

const faqs = [
  {
    id: 1,
    trigger: "Can I cancel anytime?",
    content:
      "Yes, you can cancel your subscription at any time. Your access will remain active until the billing cycle ends, and no additional charges will be applied.",
  },
  {
    id: 2,
    trigger: "Do you offer student discounts?",
    content:
      "Yes, students receive a 50% discount on all plans. Verification is required with a valid enrollment document, and the discount is applied immediately.",
  },
  {
    id: 3,
    trigger: "Is my data kept secure?",
    content:
      "Yes, all customer data is encrypted and stored safely. We follow strict compliance standards, with regular audits to keep your information protected.",
  },
  {
    id: 4,
    trigger: "Can I upgrade or downgrade my plan?",
    content:
      "Yes. Switch plans anytime. Changes take effect immediately, and billing is prorated automatically.",
  },
  {
    id: 5,
    trigger: "Do you provide onboarding support?",
    content:
      "Yes. Every customer gets guided setup, interactive demos, and a shared checklist so the first publish is straightforward.",
  },
  {
    id: 6,
    trigger: "How do I reach support?",
    content:
      "Yes. Support is available around the clock by live chat and email, with typical replies in under two hours.",
  },
];

export function Faq() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <header className="flex flex-col gap-3 md:items-center md:text-center">
        <p className="w-fit rounded-md bg-muted p-2 text-sm text-foreground">
          Snapshot
        </p>
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Six answers at a glance
          </h1>
          <p className="text-muted-foreground">
            Cancel, discounts, security, plans, onboarding, and how to reach us.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-x-12 md:gap-y-10">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="flex items-start gap-4"
          >
            <span className="min-w-fit font-mono text-sm font-semibold text-muted-foreground pt-0.5">
              {String(faq.id).padStart(2, "0")}
            </span>
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-semibold text-foreground tracking-tight">
                {faq.trigger}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{faq.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-start md:justify-center">
        <FancyButton size="lg">Browse the guides</FancyButton>
      </div>
    </div>
  );
}
export default Faq;
