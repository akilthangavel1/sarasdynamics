"use client";

import { RulerCarousel, type CarouselItem } from "@/components/ui/ruler-carousel";

export function RulerCarouselDemo() {
  const originalItems: CarouselItem[] = [
    { id: 1, title: "WEBSITES" },
    { id: 2, title: "WEB APPS" },
    { id: 3, title: "E-COMMERCE" },
    { id: 4, title: "SAAS" },
    { id: 5, title: "PORTALS" },
    { id: 6, title: "CMS" },
    { id: 7, title: "APIs" },
    { id: 8, title: "DASHBOARDS" },
    { id: 9, title: "ENTERPRISE" },
  ];
  return (
    <div className="w-full overflow-hidden flex items-center justify-center">
      <RulerCarousel originalItems={originalItems} />
    </div>
  );
}

export default RulerCarouselDemo;
