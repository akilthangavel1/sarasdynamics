import React from "react";
import { ArrowUp } from "lucide-react";

function handleScrollTop() {
  window.scroll({
    top: 0,
    behavior: "smooth",
  });
}

/**
 * Footer action component with smooth scroll to top.
 * Per user request, the black and white theme toggles are omitted.
 */
const Footer = () => {
  return (
    <div className="flex items-center justify-center py-2">
      <div className="flex items-center rounded-full border border-dotted border-zinc-300 bg-white px-3 py-1.5 shadow-sm hover:border-zinc-400 transition-colors">
        <button
          type="button"
          onClick={handleScrollTop}
          aria-label="Back to top"
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer"
        >
          <ArrowUp className="h-3.5 w-3.5" />
          <span>Back to top</span>
        </button>
      </div>
    </div>
  );
};

export default Footer;
