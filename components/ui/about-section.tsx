"use client";
import React, { useRef } from "react";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import {
  ArrowRight,
  MapPin,
  Building,
  Clock,
  Mail,
  Phone,
  ExternalLink,
  Globe,
  Navigation,
} from "lucide-react";

export default function AboutSection3() {
  const heroRef = useRef<HTMLDivElement>(null);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.15,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  const scaleVariants = {
    visible: (i: number) => ({
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.15,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      opacity: 0,
    },
  };

  const handleOpenMap = (address: string) => {
    const encoded = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, "_blank");
  };

  return (
    <section id="address-section" className="py-10 px-4 sm:px-6 bg-[#f9f9f9]" ref={heroRef}>
      <div className="max-w-6xl mx-auto">
        <div className="relative">
          {/* Header with location badge and external links */}
          <div className="flex justify-between items-center mb-8 w-[85%] absolute lg:top-4 md:top-0 sm:-top-2 -top-3 z-10">
            <div className="flex items-center gap-2 text-xl">
              <span className="text-red-500 animate-spin">✱</span>
              <TimelineContent
                as="span"
                animationNum={0}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="text-xs sm:text-sm font-semibold tracking-wider text-gray-700 uppercase"
              >
                OUR PHYSICAL LOCATIONS &amp; OFFICES
              </TimelineContent>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <TimelineContent
                as="a"
                animationNum={0}
                timelineRef={heroRef}
                customVariants={revealVariants}
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
                className="md:w-8 md:h-8 sm:w-7 w-6 sm:h-7 h-6 border border-gray-200 bg-white/90 backdrop-blur rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 hover:shadow-sm transition-all"
              >
                <img
                  src="https://cdn.21st.dev/assets/mirror/23/2371179e72304e6296cb7324ea9ea67a1ad6cb1fe3a35c40a689ed7bf6dd5064.svg"
                  alt="LinkedIn"
                  width={18}
                  height={18}
                />
              </TimelineContent>
              <TimelineContent
                as="a"
                animationNum={1}
                timelineRef={heroRef}
                customVariants={revealVariants}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                className="md:w-8 md:h-8 sm:w-7 w-6 sm:h-7 h-6 border border-gray-200 bg-white/90 backdrop-blur rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 hover:shadow-sm transition-all"
              >
                <img
                  src="https://cdn.21st.dev/assets/mirror/80/8060ef38a7f4c25ea5e8bf5df005a4472de35f56836c64442341a9e590591e56.svg"
                  alt="Instagram"
                  width={18}
                  height={18}
                />
              </TimelineContent>
              <TimelineContent
                as="a"
                animationNum={2}
                timelineRef={heroRef}
                customVariants={revealVariants}
                href="mailto:contact@sarasdynamics.com"
                title="Email Support"
                className="md:w-8 md:h-8 sm:w-7 w-6 sm:h-7 h-6 border border-gray-200 bg-white/90 backdrop-blur rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 hover:shadow-sm transition-all text-zinc-700"
              >
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-700" />
              </TimelineContent>
            </div>
          </div>

          {/* Cut-out Hero Figure */}
          <TimelineContent
            as="figure"
            animationNum={4}
            timelineRef={heroRef}
            customVariants={scaleVariants}
            className="relative group overflow-hidden"
          >
            <svg
              className="w-full drop-shadow-sm"
              width={"100%"}
              height={"100%"}
              viewBox="0 0 100 40"
            >
              <defs>
                <clipPath id="clip-inverted" clipPathUnits={"objectBoundingBox"}>
                  <path
                    d="M0.0998072 1H0.422076H0.749756C0.767072 1 0.774207 0.961783 0.77561 0.942675V0.807325C0.777053 0.743631 0.791844 0.731953 0.799059 0.734076H0.969813C0.996268 0.730255 1.00088 0.693206 0.999875 0.675159V0.0700637C0.999875 0.0254777 0.985045 0.00477707 0.977629 0H0.902473C0.854975 0 0.890448 0.138535 0.850165 0.138535H0.0204424C0.00408849 0.142357 0 0.180467 0 0.199045V0.410828C0 0.449045 0.0136283 0.46603 0.0204424 0.469745H0.0523086C0.0696245 0.471019 0.0735527 0.497877 0.0733523 0.511146V0.915605C0.0723903 0.983121 0.090588 1 0.0998072 1Z"
                    fill="#D9D9D9"
                  />
                </clipPath>
              </defs>
              <image
                clipPath="url(#clip-inverted)"
                preserveAspectRatio="xMidYMid slice"
                width={"100%"}
                height={"100%"}
                xlinkHref="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80"
              />
            </svg>
          </TimelineContent>

          {/* Stats Bar */}
          <div className="flex flex-wrap lg:justify-start justify-between items-center py-3 text-sm">
            <TimelineContent
              as="div"
              animationNum={5}
              timelineRef={heroRef}
              customVariants={revealVariants}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2 mb-2 sm:text-base text-xs">
                <span className="text-red-500 font-bold">2+</span>
                <span className="text-gray-600 font-medium">Global Hubs</span>
                <span className="text-gray-300">|</span>
              </div>
              <div className="flex items-center gap-2 mb-2 sm:text-base text-xs">
                <span className="text-red-500 font-bold">24 / 7</span>
                <span className="text-gray-600 font-medium">Operations &amp; Security</span>
              </div>
            </TimelineContent>

            <div className="lg:absolute right-0 bottom-16 flex lg:flex-col flex-row-reverse lg:gap-0 gap-4">
              <TimelineContent
                as="div"
                animationNum={6}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="flex lg:text-4xl sm:text-3xl text-2xl items-center gap-2 mb-2"
              >
                <span className="text-red-500 font-semibold">100%</span>
                <span className="text-gray-600 uppercase text-lg sm:text-xl font-bold tracking-tight">On-Site Ready</span>
              </TimelineContent>
              <TimelineContent
                as="div"
                animationNum={7}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="flex items-center gap-2 mb-2 sm:text-base text-xs"
              >
                <span className="text-red-500 font-bold">&lt; 2 hrs</span>
                <span className="text-gray-600">Visitor Assistance</span>
                <span className="text-gray-300 lg:hidden block">|</span>
              </TimelineContent>
            </div>
          </div>
        </div>

        {/* Main Content Area: Address Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-4">
          <div className="md:col-span-2">
            <h1 className="sm:text-4xl md:text-5xl text-2xl !leading-[110%] font-semibold text-gray-900 mb-8">
              <VerticalCutReveal
                splitBy="words"
                staggerDuration={0.08}
                staggerFrom="first"
                reverse={true}
                transition={{
                  type: "spring",
                  stiffness: 250,
                  damping: 30,
                  delay: 0.2,
                }}
              >
                Our Global Offices & Physical Headquarters.
              </VerticalCutReveal>
            </h1>

            {/* Address Cards Grid */}
            <TimelineContent
              as="div"
              animationNum={9}
              timelineRef={heroRef}
              customVariants={revealVariants}
              className="grid sm:grid-cols-2 gap-6 text-gray-700"
            >
              {/* Card 1: San Francisco Global Headquarters */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      Americas HQ
                    </span>
                    <Building className="w-4 h-4 text-gray-400" />
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                    San Francisco Headquarters
                  </h3>

                  <div className="space-y-2 text-xs sm:text-sm text-gray-600 mb-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800">Saras Dynamics Inc.</p>
                        <p>548 Market Street, Suite 74210</p>
                        <p>San Francisco, CA 94104, USA</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                      <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>Mon – Fri: 9:00 AM – 6:00 PM PST</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <a href="mailto:contact@sarasdynamics.com" className="hover:text-red-600 transition-colors">
                        contact@sarasdynamics.com
                      </a>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenMap("548 Market Street, Suite 74210, San Francisco, CA 94104")}
                  className="mt-2 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-900 bg-gray-100 hover:bg-gray-200 py-2 px-3 rounded-lg transition-colors cursor-pointer w-full"
                >
                  <Navigation className="w-3.5 h-3.5 text-red-600" />
                  Get Directions in Google Maps
                </button>
              </div>

              {/* Card 2: Bengaluru Innovation & AI Lab */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      APAC Engineering Hub
                    </span>
                    <Globe className="w-4 h-4 text-gray-400" />
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                    Bengaluru Innovation Lab
                  </h3>

                  <div className="space-y-2 text-xs sm:text-sm text-gray-600 mb-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800">Saras Dynamics Labs</p>
                        <p>Level 4, Prestige Tech Cloud Campus</p>
                        <p>Outer Ring Road, Bengaluru, KA 560103</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                      <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>Mon – Fri: 9:30 AM – 6:30 PM IST</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <a href="mailto:apac@sarasdynamics.com" className="hover:text-red-600 transition-colors">
                        apac@sarasdynamics.com
                      </a>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenMap("Prestige Tech Cloud, Bengaluru, Karnataka, India")}
                  className="mt-2 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-900 bg-gray-100 hover:bg-gray-200 py-2 px-3 rounded-lg transition-colors cursor-pointer w-full"
                >
                  <Navigation className="w-3.5 h-3.5 text-red-600" />
                  Get Directions in Google Maps
                </button>
              </div>
            </TimelineContent>
          </div>

          {/* Right Column: Saras Dynamics Brand & Visit CTA */}
          <div className="md:col-span-1">
            <div className="text-left md:text-right flex flex-col items-start md:items-end justify-between h-full">
              <div>
                <TimelineContent
                  as="div"
                  animationNum={12}
                  timelineRef={heroRef}
                  customVariants={revealVariants}
                  className="text-red-600 text-2xl font-black tracking-tight mb-1"
                >
                  SARAS DYNAMICS
                </TimelineContent>

                <TimelineContent
                  as="div"
                  animationNum={13}
                  timelineRef={heroRef}
                  customVariants={revealVariants}
                  className="text-gray-500 font-medium text-xs uppercase tracking-wider mb-6"
                >
                  Enterprise AI &bull; Systems Architecture
                </TimelineContent>

                <TimelineContent
                  as="div"
                  animationNum={14}
                  timelineRef={heroRef}
                  customVariants={revealVariants}
                  className="mb-6"
                >
                  <p className="text-gray-900 font-medium text-sm leading-relaxed">
                    Planning an in-person meeting or technical architecture review? We welcome scheduled visits across both our global offices.
                  </p>
                </TimelineContent>
              </div>

              <TimelineContent
                as="div"
                animationNum={15}
                timelineRef={heroRef}
                customVariants={revealVariants}
                className="w-full md:w-auto"
              >
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById("contact-globe-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="bg-neutral-900 hover:bg-neutral-950 shadow-lg shadow-neutral-900/20 border border-neutral-700 flex w-full md:w-fit md:ml-auto items-center justify-center gap-2 hover:gap-3 transition-all duration-300 ease-in-out text-white px-5 py-3 rounded-xl cursor-pointer font-semibold text-sm"
                >
                  <span>SCHEDULE A VISIT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </TimelineContent>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
