import { useState } from "react";

export default function BlogCards() {
  const [imagesLoaded, setImagesLoaded] = useState({
    img1: true,
    img2: true,
    img3: true,
  });

  return (
    <section id="latest-blog-section" className="w-full py-20 px-6 bg-white border-t border-zinc-200/80">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        .blog-cards-font, .blog-cards-font * {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>

      {/* Контейнер с колонкой */}
      <div className="blog-cards-font flex flex-col items-center w-full max-w-6xl mx-auto">
        {/* Заголовок сверху */}
        <h2 id="blog-heading" className="text-3xl sm:text-4xl font-semibold text-slate-900 text-center tracking-tight">
          Latest Blog
        </h2>
        <p id="blog-description" className="text-sm sm:text-base text-slate-500 mt-2 max-w-lg text-center leading-relaxed">
          Stay ahead of the curve with fresh content on code, design, startups, and everything in between.
        </p>

        {/* Карточки */}
        <div id="blog-cards-grid" className="mt-12 flex flex-wrap justify-center gap-8 w-full">
          <article id="blog-card-1" className="max-w-72 w-full hover:-translate-y-1 transition duration-300 group cursor-pointer">
            <div className="overflow-hidden rounded-xl bg-slate-100 aspect-[16/10]">
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
            <h3 className="text-base text-slate-900 font-medium mt-3 leading-snug group-hover:text-indigo-600 transition-colors">
              Color Psychology in UI: How to Choose the Right Palette
            </h3>
            <p className="text-xs text-indigo-600 font-medium mt-1">UI/UX design</p>
          </article>

          <article id="blog-card-2" className="max-w-72 w-full hover:-translate-y-1 transition duration-300 group cursor-pointer">
            <div className="overflow-hidden rounded-xl bg-slate-100 aspect-[16/10]">
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
            <h3 className="text-base text-slate-900 font-medium mt-3 leading-snug group-hover:text-indigo-600 transition-colors">
              Understanding Typography: Crafting a Visual Voice for Your Brand
            </h3>
            <p className="text-xs text-indigo-600 font-medium mt-1">Branding</p>
          </article>

          <article id="blog-card-3" className="max-w-72 w-full hover:-translate-y-1 transition duration-300 group cursor-pointer">
            <div className="overflow-hidden rounded-xl bg-slate-100 aspect-[16/10]">
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
            <h3 className="text-base text-slate-900 font-medium mt-3 leading-snug group-hover:text-indigo-600 transition-colors">
              Design Thinking in Practice: How to Solve Real User Problems
            </h3>
            <p className="text-xs text-indigo-600 font-medium mt-1">Product Design</p>
          </article>
        </div>
      </div>
    </section>
  );
}
