"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Github } from "lucide-react";
import { cn } from "@/lib/utils";

/* -----------------------------------------------------------------------------
 * VECTOR TECHNOLOGY LOGO COMPONENTS
 * Comprehensive engineering stack: React, TypeScript, Next.js, Tailwind,
 * Node.js, Python, Docker, Google Cloud, AWS, Swift, Kotlin, Flutter, PostgreSQL, Firebase
 * -------------------------------------------------------------------------- */

const TECH_LOGOS = [
  // React / React Native
  () => (
    <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-zinc-200/90 text-zinc-900 shadow-2xs hover:border-cyan-500/50 hover:bg-zinc-50 transition-all duration-200 select-none whitespace-nowrap">
      <svg viewBox="-11.5 -10.23174 23 20.46348" className="h-5 w-auto">
        <circle cx="0" cy="0" r="2.05" fill="#61dafb" />
        <g stroke="#61dafb" strokeWidth="1" fill="none">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </svg>
      <span className="font-semibold text-xs sm:text-sm tracking-tight text-zinc-900">React</span>
    </div>
  ),

  // TypeScript
  () => (
    <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-zinc-200/90 text-zinc-900 shadow-2xs hover:border-blue-500/50 hover:bg-zinc-50 transition-all duration-200 select-none whitespace-nowrap">
      <svg viewBox="0 0 128 128" className="h-5 w-5 rounded-sm">
        <rect width="128" height="128" rx="16" fill="#3178C6" />
        <path d="M77.6 57.6h17.9v48.2c-4.4 2.2-9.7 3.5-15.8 3.5-17.7 0-26.6-9.8-26.6-25.2 0-16.1 10.3-26.5 28.5-26.5 6.6 0 12.1 1.4 16.5 3.7v13.5c-4.8-2.7-9.8-3.9-15.5-3.9-9.9 0-14.8 5.4-14.8 13.5 0 8.3 4.6 13.5 14.5 13.5 3.3 0 6.2-.7 8.5-1.9V69.7h-13.2v-12.1zm-43.2 0h34.6v12.4h-10.7v38.8H45.2V70H34.4V57.6z" fill="#FFF" />
      </svg>
      <span className="font-semibold text-xs sm:text-sm tracking-tight text-zinc-900">TypeScript</span>
    </div>
  ),

  // Next.js
  () => (
    <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-zinc-200/90 text-zinc-900 shadow-2xs hover:border-zinc-400 hover:bg-zinc-50 transition-all duration-200 select-none whitespace-nowrap">
      <svg className="h-4 sm:h-5 w-auto fill-zinc-900" viewBox="0 0 394 79">
        <path d="M261.919 0.0330722H330.547V12.7H303.323V79.339H289.71V12.7H261.919V0.0330722Z" />
        <path d="M149.052 0.0330722V12.7H94.0421V33.0772H138.281V45.7441H94.0421V66.6721H149.052V79.339H80.43V12.7H80.4243V0.0330722H149.052Z" />
        <path d="M183.32 0.0661486H165.506L229.312 79.3721H247.178L215.271 39.7464L247.127 0.126654L229.312 0.154184L206.352 28.6697L183.32 0.0661486Z" />
        <path d="M201.6 56.7148L192.679 45.6229L165.455 79.4326H183.32L201.6 56.7148Z" />
        <path clipRule="evenodd" d="M80.907 79.339L17.0151 0H0V79.3059H13.6121V16.9516L63.8067 79.339H80.907Z" fillRule="evenodd" />
      </svg>
      <span className="font-semibold text-xs sm:text-sm tracking-tight text-zinc-900">Next.js</span>
    </div>
  ),

  // Tailwind CSS
  () => (
    <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-zinc-200/90 text-zinc-900 shadow-2xs hover:border-cyan-400 hover:bg-zinc-50 transition-all duration-200 select-none whitespace-nowrap">
      <svg className="h-4 sm:h-5 w-auto" viewBox="0 0 54 33" fill="none">
        <path
          className="fill-cyan-500"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M27 0C19.8 0 15.3 3.6 13.5 10.8C16.2 7.2 19.35 5.85 22.95 6.75C25.004 7.263 26.472 8.754 28.097 10.403C30.744 13.09 33.808 16.2 40.5 16.2C47.7 16.2 52.2 12.6 54 5.4C51.3 9 48.15 10.35 44.55 9.45C42.496 8.937 41.028 7.446 39.403 5.797C36.756 3.11 33.692 0 27 0ZM13.5 16.2C6.3 16.2 1.8 19.8 0 27C2.7 23.4 5.85 22.05 9.45 22.95C11.504 23.464 12.972 24.954 14.597 26.603C17.244 29.29 20.308 32.4 27 32.4C34.2 32.4 38.7 28.8 40.5 21.6C37.8 25.2 34.65 26.55 31.05 25.65C28.996 25.137 27.528 23.646 25.903 21.997C23.256 19.31 20.192 16.2 13.5 16.2Z"
        />
      </svg>
      <span className="font-semibold text-xs sm:text-sm tracking-tight text-zinc-900">Tailwind CSS</span>
    </div>
  ),

  // Node.js
  () => (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-zinc-200/90 text-zinc-900 shadow-2xs hover:border-emerald-500/50 hover:bg-zinc-50 transition-all duration-200 select-none whitespace-nowrap">
      <svg viewBox="0 0 32 32" className="h-5 w-5">
        <path fill="#539E43" d="M16 2.2L2.7 9.8v15.2L16 32.8l13.3-7.8V9.8L16 2.2z" />
      </svg>
      <span className="font-semibold text-xs sm:text-sm tracking-tight text-zinc-900">Node.js</span>
    </div>
  ),

  // Python
  () => (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-zinc-200/90 text-zinc-900 shadow-2xs hover:border-yellow-500/50 hover:bg-zinc-50 transition-all duration-200 select-none whitespace-nowrap">
      <svg viewBox="0 0 128 128" className="h-5 w-5">
        <path fill="#3776AB" d="M63.5 5.5c-29.2 0-27.4 12.7-27.4 12.7l.03 13.1h27.9v3.9H25.4S5.5 33 5.5 62.4c0 29.5 17.4 28.5 17.4 28.5h10.4V76.8s-.6-17.4 17.1-17.4h29.5s16.5.3 16.5-16.1V18.2s2.5-12.7-32.9-12.7zm-14.7 9.5a4.2 4.2 0 1 1 0 8.4 4.2 4.2 0 0 1 0-8.4z" />
        <path fill="#FFD43B" d="M64.5 122.5c29.2 0 27.4-12.7 27.4-12.7l-.03-13.1H64v-3.9h38.6s19.9 2.2 19.9-27.2c0-29.5-17.4-28.5-17.4-28.5H94.7v14.1s.6 17.4-17.1 17.4H48.1s-16.5-.3-16.5 16.1v25.1s-2.5 12.7 32.9 12.7zm14.7-9.5a4.2 4.2 0 1 1 0-8.4 4.2 4.2 0 0 1 0 8.4z" />
      </svg>
      <span className="font-semibold text-xs sm:text-sm tracking-tight text-zinc-900">Python</span>
    </div>
  ),

  // Docker
  () => (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-zinc-200/90 text-zinc-900 shadow-2xs hover:border-blue-400 hover:bg-zinc-50 transition-all duration-200 select-none whitespace-nowrap">
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#2496ED]">
        <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.186.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.186.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.186.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.929 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186h-2.119a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186h-2.119a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185m-2.928 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186H2.208a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185m21.758.337c-.365-.246-1.58-.337-2.735-.337-.365 0-.73.017-1.077.051-.264-1.39-1.28-2.22-2.584-2.22-.442 0-.877.094-1.28.272V8.406a.434.434 0 00-.434-.434H.434A.434.434 0 000 8.406v3.298c0 5.43 4.298 9.89 9.61 9.89 6.837 0 11.536-4.52 13.923-8.895.27-.492.483-1.006.634-1.536z" />
      </svg>
      <span className="font-semibold text-xs sm:text-sm tracking-tight text-zinc-900">Docker</span>
    </div>
  ),

  // Swift (iOS)
  () => (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-zinc-200/90 text-zinc-900 shadow-2xs hover:border-orange-500/50 hover:bg-zinc-50 transition-all duration-200 select-none whitespace-nowrap">
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#F05138]">
        <path d="M21.94 14.12c-.08-.18-1.54-3.37-4.42-5.71 1.72 2.37 2.33 4.54 2.33 4.54s-2.07-1.3-4.6-1.3c-2.3 0-4.66 1.1-6.17 2.68-1.5 1.58-2.18 3.73-2.18 5.67 0 .2.02.4.04.6C3.26 18.06 1 14.34 1 10.15 1 4.54 5.54 0 11.15 0c4.19 0 7.82 2.55 9.4 6.18-.08.06-2.14 1.52-4.14 3.7 2.87-1.8 5.54-1.3 5.54-1.3s-1.83 2.1-3.6 3.65c2.47-.3 3.59.89 3.59.89z" />
      </svg>
      <span className="font-semibold text-xs sm:text-sm tracking-tight text-zinc-900">Swift (iOS)</span>
    </div>
  ),

  // Kotlin (Android)
  () => (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-zinc-200/90 text-zinc-900 shadow-2xs hover:border-purple-500/50 hover:bg-zinc-50 transition-all duration-200 select-none whitespace-nowrap">
      <svg viewBox="0 0 24 24" className="h-5 w-5 rounded-xs">
        <defs>
          <linearGradient id="kg" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C711E1" />
            <stop offset="50%" stopColor="#7F52FF" />
            <stop offset="100%" stopColor="#0095D5" />
          </linearGradient>
        </defs>
        <polygon points="24,0 0,0 0,24 24,0" fill="url(#kg)" />
        <polygon points="0,24 12,12 24,24" fill="url(#kg)" />
      </svg>
      <span className="font-semibold text-xs sm:text-sm tracking-tight text-zinc-900">Kotlin (Android)</span>
    </div>
  ),

  // Flutter
  () => (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-zinc-200/90 text-zinc-900 shadow-2xs hover:border-blue-400 hover:bg-zinc-50 transition-all duration-200 select-none whitespace-nowrap">
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#02569B]">
        <path d="M14.314 0L2.3 12 6 15.7 21.684 0h-7.37zm.07 11.393l-6.85 6.85 3.7 3.7 3.15-3.15 6.23 6.207h7.386L14.384 11.393z" />
      </svg>
      <span className="font-semibold text-xs sm:text-sm tracking-tight text-zinc-900">Flutter</span>
    </div>
  ),

  // Google Cloud
  () => (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-zinc-200/90 text-zinc-900 shadow-2xs hover:border-blue-500/50 hover:bg-zinc-50 transition-all duration-200 select-none whitespace-nowrap">
      <svg viewBox="0 0 24 24" className="h-5 w-5">
        <path fill="#4285F4" d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
      </svg>
      <span className="font-semibold text-xs sm:text-sm tracking-tight text-zinc-900">Google Cloud</span>
    </div>
  ),

  // AWS
  () => (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-zinc-200/90 text-zinc-900 shadow-2xs hover:border-amber-500/50 hover:bg-zinc-50 transition-all duration-200 select-none whitespace-nowrap">
      <svg className="h-5 w-auto fill-zinc-900" viewBox="-45.101 -44.95 390.872 269.7">
        <g transform="translate(-1.668 -1.1)">
          <path
            d="M86.4 66.4c0 3.7.4 6.7 1.1 8.9.8 2.2 1.8 4.6 3.2 7.2.5.8.7 1.6.7 2.3 0 1-.6 2-1.9 3L83.2 92c-.9.6-1.8.9-2.6.9-1 0-2-.5-3-1.4-1.4-1.5-2.6-3.1-3.6-4.7-1-1.7-2-3.6-3.1-5.9Q59.2 94.7 41.5 94.7c-8.4 0-15.1-2.4-20-7.2s-7.4-11.2-7.4-19.2c0-8.5 3-15.4 9.1-20.6s14.2-7.8 24.5-7.8c3.4 0 6.9.3 10.6.8s7.5 1.3 11.5 2.2v-7.3c0-7.6-1.6-12.9-4.7-16-3.2-3.1-8.6-4.6-16.3-4.6-3.5 0-7.1.4-10.8 1.3s-7.3 2-10.8 3.4c-1.6.7-2.8 1.1-3.5 1.3s-1.2.3-1.6.3c-1.4 0-2.1-1-2.1-3.1v-4.9c0-1.6.2-2.8.7-3.5s1.4-1.4 2.8-2.1Q28.75 5 36.1 3.2C41 1.9 46.2 1.3 51.7 1.3c11.9 0 20.6 2.7 26.2 8.1 5.5 5.4 8.3 13.6 8.3 24.6v32.4zM45.8 81.6c3.3 0 6.7-.6 10.3-1.8s6.8-3.4 9.5-6.4c1.6-1.9 2.8-4 3.4-6.4s1-5.3 1-8.7v-4.2c-2.9-.7-6-1.3-9.2-1.7s-6.3-.6-9.4-.6c-6.7 0-11.6 1.3-14.9 4s-4.9 6.5-4.9 11.5c0 4.7 1.2 8.2 3.7 10.6 2.4 2.5 5.9 3.7 10.5 3.7"
            className="fill-zinc-900"
          />
          <path
            d="M273.5 143.7c-32.9 24.3-80.7 37.2-121.8 37.2-57.6 0-109.5-21.3-148.7-56.7-3.1-2.8-.3-6.6 3.4-4.4 42.4 24.6 94.7 39.5 148.8 39.5 36.5 0 76.6-7.6 113.5-23.2 5.5-2.5 10.2 3.6 4.8 7.6"
            fill="#f90"
          />
          <path
            d="M287.2 128.1c-4.2-5.4-27.8-2.6-38.5-1.3-3.2.4-3.7-2.4-.8-4.5 18.8-13.2 49.7-9.4 53.3-5 3.6 4.5-1 35.4-18.6 50.2-2.7 2.3-5.3 1.1-4.1-1.9 4-9.9 12.9-32.2 8.7-37.5"
            fill="#f90"
          />
        </g>
      </svg>
      <span className="font-semibold text-xs sm:text-sm tracking-tight text-zinc-900">AWS</span>
    </div>
  ),

  // PostgreSQL
  () => (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-zinc-200/90 text-zinc-900 shadow-2xs hover:border-blue-600/50 hover:bg-zinc-50 transition-all duration-200 select-none whitespace-nowrap">
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#336791]">
        <path d="M11.96 0C5.355 0 0 5.355 0 11.96c0 6.606 5.355 11.96 11.96 11.96 6.606 0 11.96-5.354 11.96-11.96C23.92 5.355 18.566 0 11.96 0zm.04 2.8a9.16 9.16 0 019.16 9.16c0 5.06-4.1 9.16-9.16 9.16a9.16 9.16 0 01-9.16-9.16c0-5.06 4.1-9.16 9.16-9.16zm-1.8 3.2c-2.3 0-3.9 1.6-3.9 3.9 0 1.8 1.1 3.2 2.6 3.7v3.2h2.5v-3.1c.3 0 .6.1.9.1 2.3 0 3.9-1.6 3.9-3.9 0-2.3-1.6-3.9-3.9-3.9h-2.1zm.4 2.1h1.7c1.1 0 1.8.7 1.8 1.8 0 1.1-.7 1.8-1.8 1.8h-1.7V8.1z" />
      </svg>
      <span className="font-semibold text-xs sm:text-sm tracking-tight text-zinc-900">PostgreSQL</span>
    </div>
  ),

  // Firebase
  () => (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-zinc-200/90 text-zinc-900 shadow-2xs hover:border-amber-400 hover:bg-zinc-50 transition-all duration-200 select-none whitespace-nowrap">
      <svg viewBox="0 0 24 24" className="h-5 w-5">
        <path fill="#FFA000" d="M3.89 15.67L6.46 2.31c.07-.37.53-.49.77-.2l2.94 3.65-6.28 9.91z" />
        <path fill="#F57C00" d="M13.88 7.42l-2.65-4.99c-.16-.31-.61-.31-.77 0L2.14 18.04l8.69 4.88c.36.2.8.2 1.16 0l8.7-4.88L13.88 7.42z" />
        <path fill="#FFCA28" d="M20.69 18.04L15.34 8.01c-.16-.3-.6-.31-.77-.02L2.14 18.04l8.69 4.88c.36.2.8.2 1.16 0l8.7-4.88z" />
      </svg>
      <span className="font-semibold text-xs sm:text-sm tracking-tight text-zinc-900">Firebase</span>
    </div>
  ),
];

/* -----------------------------------------------------------------------------
 * CANVAS STAGGERED PHYSICS ENGINE
 * Calibrated outward expansion ripple: extremely smooth and slightly relaxed 
 * to feel cohesive, satisfyingly responsive, and visually distinct.
 * -------------------------------------------------------------------------- */

type Pixel = {
  x: number;
  y: number;
  color: string;
  ctx: CanvasRenderingContext2D;
  speed: number;
  size: number;
  sizeStep: number;
  minSize: number;
  maxSizeInt: number;
  maxSize: number;
  delay: number;
  counter: number;
  counterStep: number;
  isIdle: boolean;
  isReverse: boolean;
  isShimmer: boolean;
  draw: () => void;
  appear: () => void;
  disappear: () => void;
  shimmer: () => void;
};

function createPixel(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  color: string,
  baseSpeed: number,
  delay: number
): Pixel {
  const rand = (min: number, max: number) => Math.random() * (max - min) + min;

  const p: Pixel = {
    x, y, color, ctx,
    speed: rand(0.08, 0.4) * baseSpeed,
    size: 0,
    sizeStep: rand(0.12, 0.28),
    minSize: 0.5,
    maxSizeInt: 2,
    maxSize: rand(0.5, 2),
    delay,
    counter: 0,
    counterStep: rand(1.8, 3.2) + (canvas.width + canvas.height) * 0.008,
    isIdle: false,
    isReverse: false,
    isShimmer: false,
    draw() {
      const offset = p.maxSizeInt * 0.5 - p.size * 0.5;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x + offset, p.y + offset, p.size, p.size);
    },
    appear() {
      p.isIdle = false;
      if (p.counter <= p.delay) {
        p.counter += p.counterStep;
        return;
      }
      if (p.size >= p.maxSize) p.isShimmer = true;
      if (p.isShimmer) p.shimmer();
      else p.size += p.sizeStep;
      p.draw();
    },
    disappear() {
      p.isShimmer = false;
      p.counter = 0;
      if (p.size <= 0) {
        p.isIdle = true;
        return;
      }
      p.size -= 0.1;
      p.draw();
    },
    shimmer() {
      if (p.size >= p.maxSize) p.isReverse = true;
      else if (p.size <= p.minSize) p.isReverse = false;
      if (p.isReverse) p.size -= p.speed;
      else p.size += p.speed;
    },
  };

  return p;
}

type PixelCanvasProps = {
  colors: string[];
  gap?: number;
  speed?: number;
};

function PixelCanvas({ colors, gap = 5, speed = 30 }: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pixelsRef = useRef<Pixel[]>([]);
  const animationRef = useRef<number>(0);
  const lastFrameRef = useRef(performance.now());
  const reducedMotionRef = useRef(false);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || colors.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = wrap.getBoundingClientRect();
    const w = Math.floor(width);
    const h = Math.floor(height);
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const effectiveSpeed = reducedMotionRef.current ? 0 : Math.min(speed, 100) * 0.001;
    const pixels: Pixel[] = [];

    for (let x = 0; x < w; x += gap) {
      for (let y = 0; y < h; y += gap) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const dx = x - w / 2;
        const dy = y - h / 2;
        const delay = reducedMotionRef.current ? 0 : Math.sqrt(dx * dx + dy * dy) * 0.65;
        pixels.push(createPixel(ctx, canvas, x, y, color, effectiveSpeed, delay));
      }
    }

    pixelsRef.current = pixels;
  }, [colors, gap, speed]);

  const animate = useCallback((mode: "appear" | "disappear") => {
    cancelAnimationFrame(animationRef.current);
    const frameInterval = 1000 / 60;

    const loop = () => {
      animationRef.current = requestAnimationFrame(loop);

      const now = performance.now();
      const elapsed = now - lastFrameRef.current;
      if (elapsed < frameInterval) return;
      lastFrameRef.current = now - (elapsed % frameInterval);

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const pixels = pixelsRef.current;
      for (const pixel of pixels) pixel[mode]();

      if (pixels.every((p) => p.isIdle)) {
        cancelAnimationFrame(animationRef.current);
      }
    };

    animationRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    init();

    const resizeObserver = new ResizeObserver(() => init());
    if (wrapRef.current) resizeObserver.observe(wrapRef.current);

    animate("appear");

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationRef.current);
    };
  }, [init, animate]);

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}

/* -----------------------------------------------------------------------------
 * HERO COMPONENT
 * -------------------------------------------------------------------------- */

export interface PixelHeroProps {
  word1?: string;
  word2?: string;
  description?: string;
  primaryCta?: string;
  primaryCtaMobile?: string;
  secondaryCta?: string;
  secondaryCtaMobile?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  githubUrl?: string;
  className?: string;
}

export function PixelHero({
  word1 = "Minds Behind",
  word2 = "The Machine",
  description = "SarasDynamics builds software, AI systems and intelligent automation for people creating the next generation of technology.",
  primaryCta = "Explore Design",
  primaryCtaMobile = "Explore",
  secondaryCta = "View GitHub",
  secondaryCtaMobile = "GitHub",
  onPrimaryClick,
  onSecondaryClick,
  githubUrl = "https://github.com",
  className = "",
}: PixelHeroProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [themeColors, setThemeColors] = useState<string[]>([
    "rgba(148, 163, 184, 0.4)",
    "rgba(100, 116, 139, 0.4)",
    "rgba(71, 85, 105, 0.4)",
    "rgba(24, 24, 27, 0.6)",
    "rgba(14, 165, 233, 0.5)",
  ]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    try {
      const div = document.createElement("div");
      document.body.appendChild(div);
      div.className = "text-muted-foreground";
      const muted = getComputedStyle(div).color;
      div.className = "text-primary";
      const primary = getComputedStyle(div).color;
      document.body.removeChild(div);
      
      if (muted && primary) {
        setThemeColors([muted, muted, muted, muted, primary]);
      }
    } catch {
      // Use initial state fallback
    }

    const loadTimer = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(loadTimer);
  }, []);

  return (
    <div className={cn("relative w-full min-h-[62vh] md:min-h-[70vh] lg:min-h-[74vh] bg-background flex flex-col justify-center items-center py-14 md:py-20 px-4 sm:px-6 overflow-hidden select-none isolate", className)}>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        .tahoe-glass-text {
            color: transparent;
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(71, 85, 105, 0.7) 25%, rgba(148, 163, 184, 0.45) 45%, rgba(15, 23, 42, 0.95) 55%, rgba(51, 65, 85, 0.75) 75%, rgba(15, 23, 42, 0.95) 100%);
            background-size: 200% auto;
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-stroke: 1px rgba(15, 23, 42, 0.15);
            filter: drop-shadow(0 10px 24px rgba(0,0,0,0.08));
            animation: shimmer 8s linear infinite;
        }
        .dark .tahoe-glass-text {
            background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.4) 25%, rgba(255, 255, 255, 0.1) 45%, rgba(255, 255, 255, 0.9) 55%, rgba(255, 255, 255, 0.2) 75%, rgba(255, 255, 255, 1) 100%);
            background-size: 200% auto;
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.3);
            filter: drop-shadow(0 15px 35px rgba(0,0,0,0.4)) drop-shadow(0 5px 10px rgba(0,0,0,0.2));
        }
        @keyframes shimmer {
            0% { background-position: 200% center; }
            100% { background-position: 0% center; }
        }
      `}</style>

      {/* Permanent canvas background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {themeColors.length > 0 && <PixelCanvas colors={themeColors} gap={6} speed={30} />}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--background)_100%)] pointer-events-none opacity-80" />
      </div>

      {/* Top Container: Tahoe Glass Header */}
      <div className="flex flex-col items-center justify-center text-center mt-3 sm:mt-2 pointer-events-none w-full z-10">
        <h1 className="tahoe-glass-text flex flex-row items-center justify-center gap-2 sm:gap-4 lg:gap-5 px-1 w-full flex-wrap text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-none">
          <span className="font-serif italic font-medium">{word1}</span>
          <span className="font-sans font-extrabold tracking-tighter">{word2}</span>
        </h1>
      </div>

      {/* Center Container: Description */}
      <div className="flex flex-col items-center justify-center text-center px-1 w-full pointer-events-none z-10 mt-4 md:mt-5">
        <p className="text-sm sm:text-base md:text-lg font-light text-foreground/85 max-w-[95%] sm:max-w-md md:max-w-xl px-1 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Bottom Container: CTA Row */}
      <div
        className={cn("pointer-events-auto flex flex-row items-center justify-center gap-3 mt-6 md:mt-8 transition-all duration-1000 transform px-1 z-10", isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}
        style={{ transitionDelay: "450ms" }}
      >
        <button onClick={onPrimaryClick} className="relative inline-flex h-10 md:h-12 items-center justify-center gap-1.5 md:gap-2 rounded-xl bg-gradient-to-b from-primary/90 to-primary px-5 md:px-8 text-xs md:text-sm font-semibold text-primary-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_2px_4px_rgba(0,0,0,0.15),0_12px_24px_rgba(0,0,0,0.15)] ring-1 ring-primary/20 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
          <span className="inline md:hidden">{primaryCtaMobile}</span>
          <span className="hidden md:inline">{primaryCta}</span>
          <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>
        <a
          href={githubUrl}
          target={githubUrl?.startsWith("http") ? "_blank" : undefined}
          rel={githubUrl?.startsWith("http") ? "noopener noreferrer" : undefined}
          onClick={onSecondaryClick}
          className="relative inline-flex h-10 md:h-12 items-center justify-center gap-1.5 md:gap-2 rounded-xl bg-gradient-to-b from-card/80 to-card px-5 md:px-8 text-xs md:text-sm font-semibold text-card-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.05)] ring-1 ring-border/50 backdrop-blur-md transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Github className="w-3.5 h-3.5 md:w-4 md:h-4" />
          <span className="inline md:hidden">{secondaryCtaMobile}</span>
          <span className="hidden md:inline">{secondaryCta}</span>
        </a>
      </div>

      {/* Marquee Block (Responsive for all screen sizes) */}
      <div
        className={cn("w-full max-w-5xl z-10 pointer-events-auto flex flex-col items-center justify-center gap-3 mt-10 md:mt-14 transition-all duration-1000 transform", isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}
        style={{ transitionDelay: "600ms" }}
      >
        <span className="text-[11px] md:text-xs uppercase tracking-wider text-zinc-600 font-semibold select-none">
          Technologies & Engineering Stack
        </span>
        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)]">
          <div className="flex w-max gap-4 sm:gap-6 md:gap-8 py-2 animate-marquee">
            <div className="flex gap-4 sm:gap-6 md:gap-8 items-center">{TECH_LOGOS.map((Logo, i) => <Logo key={i} />)}</div>
            <div className="flex gap-4 sm:gap-6 md:gap-8 items-center" aria-hidden="true">{TECH_LOGOS.map((Logo, i) => <Logo key={`c-${i}`} />)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PixelHero;
