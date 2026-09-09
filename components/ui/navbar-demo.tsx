import { Book, Building2, Globe, Mail, Smartphone, Sparkles, Sunset, Trees, Users, Zap } from "lucide-react";
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
      title: "Services",
      url: "#services",
      items: [
        {
          title: "Web",
          description: "Custom web applications, responsive websites, and digital platforms",
          icon: <Globe className="size-5 shrink-0 text-zinc-700" />,
          url: "#interactive-links-section",
        },
        {
          title: "Mobile",
          description: "Native iOS & Android mobile applications built for speed and scale",
          icon: <Smartphone className="size-5 shrink-0 text-zinc-700" />,
          url: "#interactive-links-section",
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
      title: "Admin",
      url: "#recent-hires",
      items: [
        {
          title: "Recent Hire",
          description: "View and manage recent employee hires and staff records",
          icon: <Users className="size-5 shrink-0" />,
          url: "#recent-hires",
        },
      ],
    },
    {
      title: "Contact Us",
      url: "#contact",
    },
  ],
  mobileExtraLinks: [
    { name: "About Us", url: "#about" },
    { name: "Recent Hire", url: "#recent-hires" },
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
