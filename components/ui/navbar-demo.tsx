import { Book, Building2, Mail, Sparkles, Sunset, Trees, Users, Zap } from "lucide-react";
import { Navbar1 } from "@/components/ui/shadcnblocks-com-navbar1";

const demoData = {
  logo: {
    url: "#",
    src: "https://cdn.21st.dev/assets/mirror/06/067c72836298829da27d230af61c2b4be0e09da5103dc2789639d18beea789f4.svg",
    alt: "blocks for shadcn/ui",
    title: "Shadcnblocks.com",
  },
  menu: [
    {
      title: "Home",
      url: "#",
    },
    {
      title: "Products",
      url: "#",
      items: [
        {
          title: "Design Portfolio",
          description: "Explore our featured digital work and showcases",
          icon: <Sparkles className="size-5 shrink-0" />,
          url: "#interactive-links-section",
        },
        {
          title: "Work Gallery",
          description: "Browse interactive case studies and creative builds",
          icon: <Trees className="size-5 shrink-0" />,
          url: "#gallery-section",
        },
        {
          title: "Client Testimonials",
          description: "Discover what founders and partners say about our work",
          icon: <Sunset className="size-5 shrink-0" />,
          url: "#testimonials-v2-section",
        },
        {
          title: "Get in Touch",
          description: "Contact our product team for inquiries and project quotes",
          icon: <Mail className="size-5 shrink-0" />,
          url: "#contact",
        },
      ],
    },
    {
      title: "Company",
      url: "#about",
      items: [
        {
          title: "About Us",
          description: "Learn about our philosophy, story, and digital design craft",
          icon: <Users className="size-5 shrink-0" />,
          url: "#about",
        },
        {
          title: "Careers",
          description: "Discover opportunities to join our team of designers and engineers",
          icon: <Sunset className="size-5 shrink-0" />,
          url: "#interactive-links-section",
        },
        {
          title: "Help Center & FAQs",
          description: "Get quick answers to common questions about our services",
          icon: <Zap className="size-5 shrink-0" />,
          url: "#contact",
        },
        {
          title: "Contact Us",
          description: "Speak directly with our team or request assistance",
          icon: <Mail className="size-5 shrink-0" />,
          url: "#contact",
        },
      ],
    },
    {
      title: "Pricing",
      url: "#",
    },
    {
      title: "Contact Us",
      url: "#contact",
    },
  ],
  mobileExtraLinks: [
    { name: "About Us", url: "#about" },
    { name: "Contact Us", url: "#contact" },
    { name: "Careers", url: "#interactive-links-section" },
    { name: "Sitemap", url: "#" },
  ],
  auth: {
    login: { text: "Log in", url: "#" },
    signup: { text: "Sign up", url: "#" },
  },
};

export function Navbar1Demo() {
  return <Navbar1 {...demoData} />;
}

export default Navbar1Demo;
