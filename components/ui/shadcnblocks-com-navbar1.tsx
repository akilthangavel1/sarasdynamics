import React, { useState, useRef, useEffect } from "react";
import {
  Book,
  Globe,
  Menu,
  Smartphone,
  Sunset,
  Trees,
  Zap,
  LogOut,
  User as UserIcon,
  Shield,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";

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
import { useAuth } from "../../src/context/AuthContext.js";

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
    src: "/saras-dynamics-logo.svg",
    alt: "Saras Dynamics logo",
    title: "Saras Dynamics",
  },
  menu = [
    { title: "Home", url: "#" },
    {
      title: "Services",
      url: "#services",
      items: [
        {
          title: "Web",
          description: "Modern responsive websites and web applications",
          icon: <Globe className="size-5 shrink-0 text-zinc-700" />,
          url: "#web",
        },
        {
          title: "Mobile",
          description: "Native iOS and Android mobile app development",
          icon: <Smartphone className="size-5 shrink-0 text-zinc-700" />,
          url: "#mobile",
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
          icon: <Zap className="size-5 shrink-0 text-zinc-700" />,
          url: "#about",
        },
        {
          title: "Careers",
          description: "Discover opportunities to join our team of designers and engineers",
          icon: <Sunset className="size-5 shrink-0 text-zinc-700" />,
          url: "#careers",
        },
        {
          title: "Blog",
          description: "Read our latest articles on design systems, UI architecture, and tech",
          icon: <Book className="size-5 shrink-0 text-zinc-700" />,
          url: "#blog",
        },
      ],
    },
    {
      title: "Contact Us",
      url: "#contact",
    },
  ],
  mobileExtraLinks = [
    { name: "Web Development", url: "#web" },
    { name: "Mobile Development", url: "#mobile" },
    { name: "About Us", url: "#about" },
    { name: "Careers", url: "#careers" },
    { name: "Blog", url: "#blog" },
    { name: "Contact Us", url: "#contact" },
  ],
  auth: authConfig = {
    login: { text: "Log in", url: "#login" },
    signup: { text: "Sign up", url: "#register" },
  },
}: Navbar1Props) => {
  const {
    firebaseUser,
    dbUser,
    roles,
    signOut,
    openAuthModal,
    hasPermission,
    hasRole,
  } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await signOut();
    window.location.hash = "#";
  };

  const isStaffOrAdmin =
    hasRole("SUPER_ADMIN") ||
    hasRole("ADMIN") ||
    hasRole("RECRUITER") ||
    hasRole("CONTENT_WRITER") ||
    hasPermission("jobs.read") ||
    hasPermission("blog.read");

  const renderBrandTitle = (title: string) => {
    if (title.includes("Dynamics")) {
      const parts = title.split("Dynamics");
      return (
        <span className="text-base font-bold tracking-tight text-zinc-900 group-hover:text-zinc-700 transition-colors">
          {parts[0]}
          <span className="text-red-600 font-extrabold">Dynamics</span>
          {parts.slice(1).join("Dynamics")}
        </span>
      );
    }
    return (
      <span className="text-base font-bold tracking-tight text-zinc-900 group-hover:text-zinc-700 transition-colors">
        {title}
      </span>
    );
  };

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name && name.trim()) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "SD";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <nav className="hidden justify-between items-center lg:flex">
          <div className="flex items-center gap-8">
            <a href={logo.url} className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 shadow-2xs flex items-center justify-center p-0.5 shrink-0 group-hover:border-zinc-300 transition-colors">
                <img
                  src={logo.src}
                  className="w-full h-full object-contain rounded-md"
                  alt={logo.alt}
                />
              </div>
              {renderBrandTitle(logo.title)}
            </a>
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList>
                  {menu.map((item) => renderMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          {/* Desktop Auth Controls */}
          <div className="flex items-center gap-3">
            {firebaseUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  id="navbar-user-dropdown-button"
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-expanded={userDropdownOpen}
                  className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white py-1.5 pl-2 pr-3 text-sm font-medium text-zinc-700 shadow-xs hover:bg-zinc-50 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                >
                  <div className="flex size-7 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
                    {getInitials(dbUser?.full_name, firebaseUser.email)}
                  </div>
                  <span className="max-w-[120px] truncate text-xs font-semibold">
                    {dbUser?.full_name || firebaseUser.email?.split("@")[0] || "Account"}
                  </span>
                  <ChevronDown className="size-3.5 text-zinc-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    id="navbar-user-dropdown-menu"
                    className="absolute right-0 mt-2 w-64 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg ring-1 ring-black/5 z-50 divide-y divide-zinc-100"
                  >
                    <div className="px-3 py-2.5">
                      <p className="text-xs font-semibold text-zinc-900 truncate">
                        {dbUser?.full_name || "Saras User"}
                      </p>
                      <p className="text-xs text-zinc-500 truncate mt-0.5">
                        {firebaseUser.email}
                      </p>
                      {roles.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {roles.map((r) => (
                            <span
                              key={r}
                              className="inline-flex items-center gap-1 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-700"
                            >
                              <Shield className="size-2.5 text-zinc-500" />
                              {r}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="py-1">
                      {isStaffOrAdmin && (
                        <a
                          id="navbar-dropdown-admin-link"
                          href="#careers"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
                        >
                          <LayoutDashboard className="size-4 text-zinc-500" />
                          Management Console
                        </a>
                      )}
                      <a
                        href="#about"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
                      >
                        <UserIcon className="size-4 text-zinc-500" />
                        Company Overview
                      </a>
                    </div>

                    <div className="pt-1">
                      <button
                        id="navbar-dropdown-logout-button"
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <LogOut className="size-4" />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button
                  id="navbar-login-btn"
                  variant="outline"
                  size="sm"
                  onClick={() => openAuthModal("login")}
                  className="rounded-full px-4 border-zinc-200 text-zinc-800 hover:bg-zinc-100"
                >
                  {authConfig.login.text}
                </Button>
                <Button
                  id="navbar-signup-btn"
                  size="sm"
                  onClick={() => openAuthModal("register")}
                  className="rounded-full px-5 bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm"
                >
                  {authConfig.signup.text}
                </Button>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            <a href={logo.url} className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 shadow-2xs flex items-center justify-center p-0.5 shrink-0">
                <img
                  src={logo.src}
                  className="w-full h-full object-contain rounded-md"
                  alt={logo.alt}
                />
              </div>
              {renderBrandTitle(logo.title)}
            </a>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  id="navbar-mobile-menu-trigger"
                  variant="outline"
                  size="icon"
                  className="rounded-lg border-zinc-200"
                >
                  <Menu className="size-4 text-zinc-800" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto bg-white">
                <SheetHeader>
                  <SheetTitle>
                    <a href={logo.url} className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 shadow-2xs flex items-center justify-center p-0.5 shrink-0">
                        <img
                          src={logo.src}
                          className="w-full h-full object-contain rounded-md"
                          alt={logo.alt}
                        />
                      </div>
                      {renderBrandTitle(logo.title)}
                    </a>
                  </SheetTitle>
                </SheetHeader>
                <div className="my-6 flex flex-col gap-6">
                  {/* If user logged in on mobile, show profile card */}
                  {firebaseUser && (
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
                          {getInitials(dbUser?.full_name, firebaseUser.email)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-zinc-900 truncate">
                            {dbUser?.full_name || "Saras User"}
                          </p>
                          <p className="text-xs text-zinc-500 truncate">
                            {firebaseUser.email}
                          </p>
                        </div>
                      </div>
                      {roles.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {roles.map((r) => (
                            <span
                              key={r}
                              className="rounded bg-white px-2 py-0.5 text-[10px] font-semibold text-zinc-700 border border-zinc-200"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

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
                    {firebaseUser ? (
                      <>
                        {isStaffOrAdmin && (
                          <Button
                            asChild
                            variant="outline"
                            className="w-full rounded-full border-zinc-200"
                          >
                            <a href="#careers">Management Console</a>
                          </Button>
                        )}
                        <Button
                          id="mobile-logout-button"
                          variant="outline"
                          onClick={handleLogout}
                          className="w-full rounded-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center justify-center gap-2"
                        >
                          <LogOut className="size-4" />
                          Log out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          id="mobile-login-btn"
                          variant="outline"
                          onClick={() => openAuthModal("login")}
                          className="w-full rounded-full border-zinc-200"
                        >
                          {authConfig.login.text}
                        </Button>
                        <Button
                          id="mobile-signup-btn"
                          onClick={() => openAuthModal("register")}
                          className="w-full rounded-full bg-zinc-900 text-white hover:bg-zinc-800"
                        >
                          {authConfig.signup.text}
                        </Button>
                      </>
                    )}
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
      <NavigationMenuItem key={item.title} className="relative text-zinc-700">
        <NavigationMenuTrigger className="text-zinc-700 hover:text-zinc-900 font-medium text-sm">
          {item.title}
        </NavigationMenuTrigger>
        <NavigationMenuContent className="before:absolute before:-top-3 before:left-0 before:right-0 before:h-3">
          <ul className="w-80 p-2.5 bg-white rounded-xl shadow-xl border border-zinc-200/90 divide-y divide-zinc-100">
            {item.items.map((subItem) => (
              <li key={subItem.title}>
                <NavigationMenuLink asChild>
                  <a
                    className="flex select-none gap-3.5 rounded-lg p-2.5 leading-none no-underline outline-none transition-colors hover:bg-zinc-100/80 text-zinc-900 group"
                    href={subItem.url}
                  >
                    <div className="text-zinc-500 group-hover:text-zinc-900 transition-colors mt-0.5">
                      {subItem.icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-zinc-900 group-hover:text-zinc-950">
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
                <div className="text-sm font-semibold text-zinc-900">
                  {subItem.title}
                </div>
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
