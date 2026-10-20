"use client";

import Timeline from "@/components/ui/timeline-01-utils/timeline";

const timelineData = [
  {
    title: "Who We Are",
    description:
      "SarasDynamics helps growing businesses put AI to work. We listen first, understand how your team operates, and then build automation and software that fits naturally into your day-to-day.",
    date: "2022",
    image:
      "https://cdn.21st.dev/assets/localized/0ea25e6c9f3a254d713265295d48f2f515a3ce40d9cf2adcfd9454a3a96df996.webp",
  },
  {
    title: "Our Mission",
    description:
      "To make AI and automation practical and affordable for growing businesses, so teams spend time on work that matters, not repetitive tasks.",
    date: "2024",
    image:
      "https://cdn.21st.dev/assets/localized/8fcabd896d283359f9f601b92bce74fc06aa48f368e56afbd21dca69a9742809.webp",
  },
  {
    title: "Our Vision",
    description:
      "To make advanced AI simple, accessible and valuable for businesses everywhere.",
    date: "2026",
    image:
      "https://cdn.21st.dev/assets/localized/f8596260a4e342a4a2d85e821ff477a8e71182f373aea763dfd4f13fe657f5fa.webp",
  },
];

const TimelineBlock01 = () => {
  return (
    <section className="overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 pt-6 md:pt-12">
        <div className="border-border">
          <Timeline items={timelineData} />
        </div>
        <div className="border-t border-border h-18 md:h-28" />
      </div>
    </section>
  );
};

export default TimelineBlock01;
