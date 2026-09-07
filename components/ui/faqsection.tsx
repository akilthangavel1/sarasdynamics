import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type FAQItem = {
  question: string;
  answer: string;
};

export interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
  faqsLeft: FAQItem[];
  faqsRight: FAQItem[];
  className?: string;
}

export function FAQSection({
  title = "Product & Account Help",
  subtitle = "Frequently Asked Questions",
  description = "Get instant answers to the most common questions about your account, product setup, and updates.",
  buttonLabel = "Browse All FAQs →",
  onButtonClick,
  faqsLeft,
  faqsRight,
  className,
}: FAQSectionProps) {
  return (
    <section className={cn("w-full max-w-5xl mx-auto py-16 px-4", className)}>
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-xs sm:text-sm text-zinc-500 font-semibold tracking-wider uppercase mb-2">
          {subtitle}
        </p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 tracking-tight mb-3">
          {title}
        </h2>
        <p className="text-zinc-500 max-w-xl mx-auto mb-6 text-sm sm:text-base leading-relaxed">
          {description}
        </p>
        <Button variant="default" className="rounded-full px-6 py-2.5 font-medium cursor-pointer" onClick={onButtonClick}>
          {buttonLabel}
        </Button>
      </div>

      {/* FAQs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
        {[faqsLeft, faqsRight].map((faqColumn, columnIndex) => (
          <Accordion
            key={columnIndex}
            type="single"
            collapsible
            className="space-y-4"
          >
            {faqColumn.map((faq, i) => (
              <AccordionItem key={i} value={`item-${columnIndex}-${i}`}>
                <AccordionTrigger className="text-base font-semibold text-zinc-900 hover:text-red-600 transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-zinc-500 leading-relaxed">
                  <div className="min-h-[40px] transition-all duration-200 ease-in-out">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ))}
      </div>
    </section>
  );
}

export default FAQSection;
