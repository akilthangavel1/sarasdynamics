import { useState } from "react";

export default function BlogCards() {
  const [imagesLoaded, setImagesLoaded] = useState({
    img1: true,
    img2: true,
    img3: true,
  });

  return (
    <section id="latest-blog-section" className="w-full py-20 px-6 bg-white dark:bg-zinc-950 border-t border-zinc-200/80 dark:border-zinc-800 transition-colors">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        .blog-cards-font, .blog-cards-font * {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>

      {/* Контейнер с колонкой */}
      <div className="blog-cards-font flex flex-col items-center w-full max-w-6xl mx-auto px-4">
        {/* Brand Title Header */}
        <div className="w-full grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6 md:gap-10 lg:gap-12 mb-12 sm:mb-16">
          {/* Left Column: Eyebrow with red accent line & Title */}
          <div className="flex flex-col items-start gap-3">
            <div className="flex items-center gap-3.5">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-zinc-900 dark:text-zinc-100">
                Engineering &amp; Insights
              </span>
              <span
                className="inline-block w-20 sm:w-24 h-[2px] bg-[#c30000] rounded-sm shrink-0"
                aria-hidden="true"
              />
            </div>
            <h2 id="blog-heading" className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white sm:text-4xl md:text-5xl leading-[1.08] text-balance">
              Latest Blog
            </h2>
          </div>

          {/* Center Divider: Vertical separator line */}
          <div
            className="hidden md:block w-px h-16 lg:h-20 bg-zinc-200 dark:bg-zinc-800 shrink-0"
            aria-hidden="true"
          />

          {/* Right Column: Description positioned at right */}
          <div className="flex flex-col justify-center max-w-md md:ml-auto">
            <p id="blog-description" className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Stay ahead of the curve with fresh content on code, design, startups, and everything in between.
            </p>
          </div>
        </div>

        {/* Карточки */}
        <div id="blog-cards-grid" className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full">
          <article id="blog-card-1" className="w-full hover:-translate-y-1 transition duration-300 group cursor-pointer">
            <div className="overflow-hidden rounded-xl bg-slate-100 dark:bg-zinc-900 aspect-[16/10]">
              <img
                className="w-full h-full object-cover rounded-xl transition duration-300 group-hover:scale-105"
                src={imagesLoaded.img1 
                  ? "https://cdn.21st.dev/assets/mirror/6f/6f1c926bae8d6e71a611ff4516129defb81169307e6ed04bb285252af9a35082.jpg"
                  : "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80"}
                onError={() => setImagesLoaded(prev => ({ ...prev, img1: false }))}
                alt="Color Psychology in UI"
                loading="lazy"
              />
            </div>
            <h3 className="text-base text-slate-900 dark:text-zinc-100 font-medium mt-3 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Color Psychology in UI: How to Choose the Right Palette
            </h3>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">UI/UX design</p>
          </article>

          <article id="blog-card-2" className="w-full hover:-translate-y-1 transition duration-300 group cursor-pointer">
            <div className="overflow-hidden rounded-xl bg-slate-100 dark:bg-zinc-900 aspect-[16/10]">
              <img
                className="w-full h-full object-cover rounded-xl transition duration-300 group-hover:scale-105"
                src={imagesLoaded.img2 
                  ? "https://cdn.21st.dev/assets/mirror/53/532743c99df6086cd352dddd6c4123c731174ce078fbf8aa6b95d66a239ffb9b.jpg"
                  : "https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=600&auto=format&fit=crop&q=80"}
                onError={() => setImagesLoaded(prev => ({ ...prev, img2: false }))}
                alt="Understanding Typography"
                loading="lazy"
              />
            </div>
            <h3 className="text-base text-slate-900 dark:text-zinc-100 font-medium mt-3 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Understanding Typography: Crafting a Visual Voice for Your Brand
            </h3>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">Branding</p>
          </article>

          <article id="blog-card-3" className="w-full hover:-translate-y-1 transition duration-300 group cursor-pointer">
            <div className="overflow-hidden rounded-xl bg-slate-100 dark:bg-zinc-900 aspect-[16/10]">
              <img
                className="w-full h-full object-cover rounded-xl transition duration-300 group-hover:scale-105"
                src={imagesLoaded.img3 
                  ? "https://cdn.21st.dev/assets/mirror/6c/6cfc99c18d9a71ed731d82d84406a209b30f7fa76f3e5b7ecdfa48efbd62f613.jpg"
                  : "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80"}
                onError={() => setImagesLoaded(prev => ({ ...prev, img3: false }))}
                alt="Design Thinking in Practice"
                loading="lazy"
              />
            </div>
            <h3 className="text-base text-slate-900 dark:text-zinc-100 font-medium mt-3 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Design Thinking in Practice: How to Solve Real User Problems
            </h3>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">Product Design</p>
          </article>

          <article id="blog-card-4" className="w-full hover:-translate-y-1 transition duration-300 group cursor-pointer">
            <div className="overflow-hidden rounded-xl bg-slate-100 dark:bg-zinc-900 aspect-[16/10]">
              <img
                className="w-full h-full object-cover rounded-xl transition duration-300 group-hover:scale-105"
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80"
                alt="Architecting AI Agents"
                loading="lazy"
              />
            </div>
            <h3 className="text-base text-slate-900 dark:text-zinc-100 font-medium mt-3 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Architecting AI Agents: Multi-Modal LLMs in Modern Software
            </h3>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">AI Architecture</p>
          </article>
        </div>
        </div>
      </div>
    </section>
  );
}
