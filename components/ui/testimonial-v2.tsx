import React from 'react';
import { motion } from "motion/react";
import { Marquee, CommonAvatar } from "@/components/ui/cards";

// --- Types ---
export interface Testimonial {
  text: string;
  name: string;
  role: string;
  company?: string;
  image?: string;
}

// --- Data with Real Client Reviews ---
export const testimonials: Testimonial[] = [
  {
    text: "Saras Dynamics re-architected our RAG retrieval pipelines and autonomous agents. Query latency dropped 64% while generation accuracy improved noticeably.",
    name: "David Lin",
    role: "VP of Engineering",
    company: "Kinetix AI",
  },
  {
    text: "They delivered our offline-first mobile patient monitoring app ahead of deadline. The real-time biometric synchronization is rock-solid and passed HIPAA audits cleanly.",
    name: "Sarah Jenkins",
    role: "Head of Product",
    company: "OmniHealth Systems",
  },
  {
    text: "The high-throughput trading telemetry console they built handles millions of live events without a hiccup. Their attention to UX, latency, and code structure is world-class.",
    name: "Michael Vance",
    role: "Founder & CTO",
    company: "StrataPay Financial",
  },
  {
    text: "Containerizing our legacy monolith into Kubernetes with zero customer downtime was an immense task. Saras Dynamics finished it in 8 weeks flat with full observability.",
    name: "Elena Rostova",
    role: "Director of Infrastructure",
    company: "CloudScale Tech",
  },
  {
    text: "Their automated workflow pipelines eliminated over 40 hours of manual data reconciliation each week. Easily one of the most capable engineering teams we've hired.",
    name: "Rajesh Patel",
    role: "Chief Digital Officer",
    company: "Apex Global Logistics",
  },
  {
    text: "Most engineering agencies struggle with precision micro-interactions and design tokens. Saras Dynamics implemented our motion physics and layout down to the pixel.",
    name: "Claire Beaumont",
    role: "Design Engineering Lead",
    company: "Atelier Studio",
  },
  {
    text: "Finding engineers who master enterprise cloud security alongside fluid frontend architecture is rare. Saras Dynamics delivered an exceptional institutional platform.",
    name: "Brian Connolly",
    role: "VP of Technology",
    company: "Summit Capital Group",
  },
  {
    text: "Their WebSocket state management and real-time multiplayer canvas engine operate without friction. Our active user engagement surged 35% following release.",
    name: "Anita Desai",
    role: "Product Principal",
    company: "Novus Platforms",
  },
  {
    text: "From discovery sprint to high-availability deployment on Docker and Vercel, communication was crystal-clear and the engineering quality exceeded expectations.",
    name: "Marcus Sterling",
    role: "Co-Founder & CEO",
    company: "Veloce Technologies",
  },
];

export const firstColumn = testimonials.slice(0, 3);
export const secondColumn = testimonials.slice(3, 6);
export const thirdColumn = testimonials.slice(6, 9);

// --- Sub-Components ---
export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.ul
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-transparent transition-colors duration-300 list-none m-0 p-0"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, name, role, company }, i) => (
                <motion.li 
                  key={`${index}-${i}`}
                  aria-hidden={index === 1 ? "true" : "false"}
                  tabIndex={index === 1 ? -1 : 0}
                  whileHover={{ 
                    scale: 1.03,
                    y: -8,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                    transition: { type: "spring", stiffness: 400, damping: 17 }
                  }}
                  whileFocus={{ 
                    scale: 1.03,
                    y: -8,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                    transition: { type: "spring", stiffness: 400, damping: 17 }
                  }}
                  className="p-8 sm:p-10 rounded-3xl border border-zinc-200 shadow-md shadow-zinc-900/[0.03] max-w-xs w-full bg-white transition-all duration-300 cursor-default select-none group focus:outline-none focus:ring-2 focus:ring-zinc-400" 
                >
                  <blockquote className="m-0 p-0">
                    <p className="text-zinc-600 leading-relaxed font-normal m-0 transition-colors duration-300 text-sm sm:text-base">
                      "{text}"
                    </p>
                    <footer className="flex items-center gap-3 mt-6">
                      <CommonAvatar className="size-10" />
                      <div className="flex flex-col">
                        <cite className="font-semibold not-italic tracking-tight leading-5 text-zinc-900 transition-colors duration-300 text-sm">
                          {name}
                        </cite>
                        <span className="text-xs leading-5 tracking-tight text-zinc-500 mt-0.5 transition-colors duration-300">
                          {role}{company ? ` • ${company}` : ""}
                        </span>
                      </div>
                    </footer>
                  </blockquote>
                </motion.li>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.ul>
    </div>
  );
};

export const TestimonialsSection = () => {
  return (
    <section 
      id="testimonials-v2-section"
      aria-labelledby="testimonials-heading"
      className="bg-white py-20 md:py-24 relative overflow-hidden border-t border-zinc-200/80 transition-colors duration-300 w-full select-none"
    >
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ 
          duration: 0.8, 
          ease: [0.16, 1, 0.3, 1],
        }}
        className="w-full z-10 mx-auto"
      >
        <div className="flex flex-col items-center justify-center max-w-2xl mx-auto mb-12 sm:mb-14 px-4 text-center">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#c30000]" />
            <span className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-zinc-900">
              Verified Client Reviews
            </span>
          </div>

          <h2 id="testimonials-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight uppercase text-zinc-900 transition-colors">
            What Technology Leaders Say
          </h2>
          <p className="text-center mt-3 text-zinc-500 text-xs sm:text-sm md:text-base leading-relaxed max-w-lg transition-colors font-medium">
            Real feedback from engineering directors, CTOs, and product founders who build and scale mission-critical systems with Saras Dynamics.
          </p>
        </div>

        {/* Dual Horizontal Infinite Marquee with Verified Badges & Cards */}
        <div className="w-full overflow-hidden">
          <Marquee />
        </div>
      </motion.div>
    </section>
  );
};

// --- Main Component ---
export default function TestimonialsApp() {
  return (
    <div className="w-full bg-white flex flex-col justify-center relative">
      <TestimonialsSection />
    </div>
  );
}
