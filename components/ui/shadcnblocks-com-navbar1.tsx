import React from "react";
import { Book, Menu, Sunset, Trees, Zap } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

export interface Navbar1Props {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  menu?: MenuItem[];
  mobileExtraLinks?: {
    name: string;
    url: string;
  }[];
  auth?: {
    login: {
      text: string;
      url: string;
    };
    signup: {
      text: string;
      url: string;
    };
  };
}

const Navbar1 = ({
  logo = {
    url: "#",
    src: "https://cdn.21st.dev/assets/mirror/06/067c72836298829da27d230af61c2b4be0e09da5103dc2789639d18beea789f4.svg",
    alt: "logo",
    title: "Shadcnblocks.com",
  },
  menu = [
    { title: "Home", url: "#" },
    {
      title: "Products",
      url: "#",
      items: [
        {
          title: "Blog",
          description: "The latest industry news, updates, and info",
          icon: <Book className="size-5 shrink-0 text-zinc-700" />,
          url: "#",
        },
        {
          title: "Company",
          description: "Our mission is to innovate and empower the world",
          icon: <Trees className="size-5 shrink-0 text-zinc-700" />,
          url: "#",
        },
        {
          title: "Careers",
          description: "Browse job listing and discover our workspace",
          icon: <Sunset className="size-5 shrink-0 text-zinc-700" />,
          url: "#",
        },
        {
          title: "Support",
          description:
            "Get in touch with our support team or visit our community forums",
          icon: <Zap className="size-5 shrink-0 text-zinc-700" />,
          url: "#",
        },
      ],
    },
    {
      title: "Resources",
      url: "#",
      items: [
        {
          title: "Help Center",
          description: "Get all the answers you need right here",
          icon: <Zap className="size-5 shrink-0 text-zinc-700" />,
          url: "#",
        },
        {
          title: "Contact Us",
          description: "We are here to help you with any questions you have",
          icon: <Sunset className="size-5 shrink-0 text-zinc-700" />,
          url: "#",
        },
        {
          title: "Status",
          description: "Check the current status of our services and APIs",
          icon: <Trees className="size-5 shrink-0 text-zinc-700" />,
          url: "#",
        },
        {
          title: "Terms of Service",
          description: "Our terms and conditions for using our services",
          icon: <Book className="size-5 shrink-0 text-zinc-700" />,
          url: "#",
        },
      ],
    },
    {
      title: "Pricing",
      url: "#",
    },
    {
      title: "Blog",
      url: "#",
    },
  ],
  mobileExtraLinks = [
    { name: "Press", url: "#" },
    { name: "Contact", url: "#" },
    { name: "Imprint", url: "#" },
    { name: "Sitemap", url: "#" },
  ],
  auth = {
    login: { text: "Log in", url: "#" },
    signup: { text: "Sign up", url: "#" },
  },
}: Navbar1Props) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <nav className="hidden justify-between items-center lg:flex">
          <div className="flex items-center gap-8">
            <a href={logo.url} className="flex items-center gap-2.5">
              <img src={logo.src} className="w-7 h-7 object-contain" alt={logo.alt} />
              <span className="text-base font-bold tracking-tight text-zinc-900">{logo.title}</span>
            </a>
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList>
                  {menu.map((item) => renderMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Button asChild variant="outline" size="sm" className="rounded-full px-4 border-zinc-200 text-zinc-800 hover:bg-zinc-100">
              <a href={auth.login.url}>{auth.login.text}</a>
            </Button>
            <Button asChild size="sm" className="rounded-full px-5 bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm">
              <a href={auth.signup.url}>{auth.signup.text}</a>
            </Button>
          </div>
        </nav>
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            <a href={logo.url} className="flex items-center gap-2.5">
              <img src={logo.src} className="w-7 h-7 object-contain" alt={logo.alt} />
              <span className="text-base font-bold tracking-tight text-zinc-900">
                {logo.title}
              </span>
            </a>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-lg border-zinc-200">
                  <Menu className="size-4 text-zinc-800" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto bg-white">
                <SheetHeader>
                  <SheetTitle>
                    <a href={logo.url} className="flex items-center gap-2.5">
                      <img src={logo.src} className="w-7 h-7" alt={logo.alt} />
                      <span className="text-base font-bold tracking-tight text-zinc-900">
                        {logo.title}
                      </span>
                    </a>
                  </SheetTitle>
                </SheetHeader>
                <div className="my-6 flex flex-col gap-6">
                  <Accordion
                    type="single"
                    collapsible
                    className="flex w-full flex-col gap-4"
                  >
                    {menu.map((item) => renderMobileMenuItem(item))}
                  </Accordion>
                  <div className="border-t border-zinc-200 py-4">
                    <div className="grid grid-cols-2 justify-start gap-1">
                      {mobileExtraLinks.map((link, idx) => (
                        <a
                          key={idx}
                          className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                          href={link.url}
                        >
                          {link.name}
                        </a>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button asChild variant="outline" className="w-full rounded-full border-zinc-200">
                      <a href={auth.login.url}>{auth.login.text}</a>
                    </Button>
                    <Button asChild className="w-full rounded-full bg-zinc-900 text-white hover:bg-zinc-800">
                      <a href={auth.signup.url}>{auth.signup.text}</a>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title} className="text-zinc-700">
        <NavigationMenuTrigger className="text-zinc-700 hover:text-zinc-900 font-medium text-sm">
          {item.title}
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="w-80 p-3 bg-white rounded-lg shadow-xl border border-zinc-200">
            {item.items.map((subItem) => (
              <li key={subItem.title}>
                <NavigationMenuLink asChild>
                  <a
                    className="flex select-none gap-3.5 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-zinc-100 text-zinc-900"
                    href={subItem.url}
                  >
                    {subItem.icon}
                    <div>
                      <div className="text-sm font-semibold text-zinc-900">
                        {subItem.title}
                      </div>
                      {subItem.description && (
                        <p className="text-xs leading-snug text-zinc-500 mt-1">
                          {subItem.description}
                        </p>
                      )}
                    </div>
                  </a>
                </NavigationMenuLink>
              </li>
            ))}
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink asChild>
        <a
          className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          href={item.url}
        >
          {item.title}
        </a>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="py-1 font-semibold text-zinc-900 hover:no-underline">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2 pl-2">
          {item.items.map((subItem) => (
            <a
              key={subItem.title}
              className="flex select-none gap-3 rounded-md p-2.5 leading-none outline-none transition-colors hover:bg-zinc-100 text-zinc-900"
              href={subItem.url}
            >
              {subItem.icon}
              <div>
                <div className="text-sm font-semibold text-zinc-900">{subItem.title}</div>
                {subItem.description && (
                  <p className="text-xs leading-snug text-zinc-500 mt-0.5">
                    {subItem.description}
                  </p>
                )}
              </div>
            </a>
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <a key={item.title} href={item.url} className="font-semibold text-zinc-900 py-1">
      {item.title}
    </a>
  );
};

export { Navbar1 };
export default Navbar1;
