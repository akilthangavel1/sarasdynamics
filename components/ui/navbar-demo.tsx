import { BookOpen, Globe, GraduationCap, Mic, Smartphone, Sunset, Users } from "lucide-react";
import { Navbar1 } from "@/components/ui/shadcnblocks-com-navbar1";

const demoData = {
  logo: {
    url: "#",
    src: "/saras-dynamics-logo.svg",
    alt: "Saras Dynamics logo",
    title: "Saras Dynamics",
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
          url: "#web",
        },
        {
          title: "Mobile",
          description: "Native iOS & Android mobile applications built for speed and scale",
          icon: <Smartphone className="size-5 shrink-0 text-zinc-700" />,
          url: "#mobile",
        },
        {
          title: "Voice Agent",
          description: "Ultra-low latency conversational AI and voice automation agents",
          icon: <Mic className="size-5 shrink-0 text-zinc-700" />,
          url: "#voice-agent",
        },
        {
          title: "LMS & E-Learning",
          description: "Enterprise learning management systems and custom EdTech platforms",
          icon: <GraduationCap className="size-5 shrink-0 text-zinc-700" />,
          url: "#lms",
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
          url: "#careers",
        },
        {
          title: "Blog",
          description: "Read our latest articles on design systems, UI architecture, and tech",
          icon: <BookOpen className="size-5 shrink-0" />,
          url: "#blog",
        },
      ],
    },
    {
      title: "Contact Us",
      url: "#contact",
    },
  ],
  mobileExtraLinks: [
    { name: "Web Development", url: "#web" },
    { name: "Mobile Development", url: "#mobile" },
    { name: "Voice Agent", url: "#voice-agent" },
    { name: "LMS & E-Learning", url: "#lms" },
    { name: "About Us", url: "#about" },
    { name: "Careers", url: "#careers" },
    { name: "Blog", url: "#blog" },
    { name: "Contact Us", url: "#contact" },
  ],
  auth: {
    login: { text: "Log in", url: "#login" },
    signup: { text: "Sign up", url: "#register" },
  },
};

export function Navbar1Demo() {
  return <Navbar1 {...demoData} />;
}

export default Navbar1Demo;
