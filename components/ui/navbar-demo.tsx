import { Book, Mail, Sunset, Trees, Zap } from "lucide-react";
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
          title: "Contact Us",
          description: "Reach out to our team or explore our help center",
          icon: <Mail className="size-5 shrink-0" />,
          url: "#contact",
        },
        {
          title: "Company",
          description: "Our mission is to innovate and empower the world",
          icon: <Trees className="size-5 shrink-0" />,
          url: "#about-section",
        },
        {
          title: "Careers",
          description: "Browse job listing and discover our workspace",
          icon: <Sunset className="size-5 shrink-0" />,
          url: "#interactive-links-section",
        },
        {
          title: "Support",
          description:
            "Get in touch with our support team or visit our community forums",
          icon: <Zap className="size-5 shrink-0" />,
          url: "#testimonials-v2-section",
        },
      ],
    },
    {
      title: "Resources",
      url: "#",
      items: [
        {
          title: "Help Center & FAQs",
          description: "Get all the answers you need right here",
          icon: <Zap className="size-5 shrink-0" />,
          url: "#contact",
        },
        {
          title: "Contact Us",
          description: "We are here to help you with any questions you have",
          icon: <Mail className="size-5 shrink-0" />,
          url: "#contact",
        },
        {
          title: "Status",
          description: "Check the current status of our services and APIs",
          icon: <Trees className="size-5 shrink-0" />,
          url: "#",
        },
        {
          title: "Terms of Service",
          description: "Our terms and conditions for using our services",
          icon: <Book className="size-5 shrink-0" />,
          url: "#",
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
    { name: "Press", url: "#" },
    { name: "Contact Us", url: "#contact" },
    { name: "Imprint", url: "#" },
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
