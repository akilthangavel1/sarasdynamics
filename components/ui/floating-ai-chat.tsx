"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Sparkles } from "lucide-react";
import { AIChatCard } from "@/components/ui/ai-chat-card";

export function FloatingAIChat() {
  const [isOpen, setIsOpen] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  const handleSend = (message: string) => {
    if (!message.trim()) return;
    setNotification("Message received! Connecting with SarasDynamics AI…");
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  return (
    <div
      id="floating-ai-chat-widget"
      className="fixed bottom-5 right-5 z-50 flex flex-col items-end pointer-events-none select-none font-sans"
    >
      <div className="pointer-events-auto flex flex-col items-end">
        {/* Chat Notification Toast */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="mb-2 max-w-[320px] rounded-xl bg-zinc-900 text-white px-4 py-2.5 text-xs font-medium shadow-xl border border-zinc-800"
            >
              {notification}
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Chat Card Modal / Popup */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 24, originX: 1, originY: 1 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 24 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="mb-3 w-[360px] max-w-[calc(100vw-32px)] shadow-2xl rounded-[24px] border border-zinc-200/80 dark:border-zinc-800 overflow-hidden bg-white dark:bg-neutral-950"
            >
              <AIChatCard
                title="Saras AI Chat"
                subtitle="Ask about our AI systems & software"
                greeting="Hello there!"
                prompt="Ask about our tech stack, services, or recent developments."
                placeholder="Ask Saras AI anything…"
                onSend={handleSend}
                onClose={() => setIsOpen(false)}
                className="w-full"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Toggle Button */}
        <motion.button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          aria-label={isOpen ? "Close AI chat" : "Open AI chat"}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-zinc-950 text-white shadow-xl hover:bg-zinc-800 transition-colors border border-zinc-800 cursor-pointer"
        >
          {/* Subtle Red pulsing ping ring */}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-[#c30000] border-2 border-white" />
            </span>
          )}

          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                <MessageSquare className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}

export default FloatingAIChat;
