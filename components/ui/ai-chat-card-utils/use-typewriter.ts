"use client";

import { useState, useEffect, useRef } from "react";

export type TypewriterPhase = "typing" | "holding" | "deleting" | "gap" | "idle";

export interface TypewriterOptions {
  typeMs?: number;
  deleteMs?: number;
  holdMs?: number;
  gapMs?: number;
  enabled?: boolean;
}

export function useTypewriter(
  prompts: string[],
  {
    typeMs = 48,
    deleteMs = 14,
    holdMs = 3400,
    gapMs = 900,
    enabled = true,
  }: TypewriterOptions = {}
) {
  const [promptIndex, setPromptIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<TypewriterPhase>("typing");

  const promptsRef = useRef(prompts);
  promptsRef.current = prompts;

  useEffect(() => {
    if (!enabled || !prompts.length) {
      setPhase("idle");
      return;
    }

    const currentPrompt = promptsRef.current[promptIndex % promptsRef.current.length] || "";
    let timeoutId: ReturnType<typeof setTimeout>;

    switch (phase) {
      case "typing": {
        if (text.length < currentPrompt.length) {
          timeoutId = setTimeout(() => {
            setText(currentPrompt.slice(0, text.length + 1));
          }, typeMs);
        } else {
          setPhase("holding");
        }
        break;
      }
      case "holding": {
        timeoutId = setTimeout(() => {
          setPhase("deleting");
        }, holdMs);
        break;
      }
      case "deleting": {
        if (text.length > 0) {
          timeoutId = setTimeout(() => {
            setText(currentPrompt.slice(0, text.length - 1));
          }, deleteMs);
        } else {
          setPhase("gap");
        }
        break;
      }
      case "gap": {
        timeoutId = setTimeout(() => {
          setPromptIndex((prev) => (prev + 1) % promptsRef.current.length);
          setPhase("typing");
        }, gapMs);
        break;
      }
      case "idle": {
        setPhase("typing");
        break;
      }
    }

    return () => clearTimeout(timeoutId);
  }, [text, phase, promptIndex, enabled, typeMs, deleteMs, holdMs, gapMs, prompts.length]);

  return { text, phase, index: promptIndex };
}

export default useTypewriter;
