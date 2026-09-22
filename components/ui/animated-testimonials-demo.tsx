"use client";

import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

export function AnimatedTestimonialsBasic() {
  return (
    <AnimatedTestimonials
      testimonials={[
        {
          id: 1,
          name: "Alex Johnson",
          role: "Full Stack Developer",
          company: "TechFlow",
          content:
            "This starter template saved me weeks of setup time. The Supabase integration is flawless, and the UI components are beautiful and easy to customize. Worth every penny!",
          rating: 5,
          avatar: "https://cdn.21st.dev/assets/mirror/a6/a634d4f02fe5b77804943c1d74b8d70e35ffe26454e0e9af9717432a2c72bfde.jpg",
        },
        {
          id: 2,
          name: "Sarah Miller",
          role: "Frontend Engineer",
          company: "DesignHub",
          content:
            "I've used many starter templates, but this one stands out for its clean architecture and attention to detail. The TypeScript support is excellent, and the documentation is comprehensive.",
          rating: 5,
          avatar: "https://cdn.21st.dev/assets/mirror/d8/d8dab29a5736d5c2b0084d720d3db02c785560071609be501541922928fdf831.jpg",
        },
        {
          id: 3,
          name: "Michael Chen",
          role: "Product Manager",
          company: "InnovateLabs",
          content:
            "Our team was able to launch our MVP in record time thanks to this template. The authentication flow and user management features worked right out of the box. Highly recommended!",
          rating: 5,
          avatar: "https://cdn.21st.dev/assets/mirror/07/07b2fa37a61afa65b8e621b24da7408d287751fd5e7dcc887855ce077faaa425.jpg",
        },
      ]}
    />
  );
}

export default AnimatedTestimonialsBasic;
