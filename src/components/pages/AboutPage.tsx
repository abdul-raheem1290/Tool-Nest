import React from "react";
import { ShieldCheck, Cpu, Code2, Award, Zap, CheckCircle2, Lock, Terminal, Layers } from "lucide-react";

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4">
      {/* Hero */}
      <div className="space-y-4 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold">
          <Award className="h-4 w-4 text-indigo-600" />
          <span>Academic & Engineering Portfolio Dossier</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          About ToolNest Pro
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          A modern, full-stack multi-utility ecosystem architected around client-side performance, data privacy by default, and rigorous software craftsmanship.
        </p>
      </div>

      {/* Mission */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Mission & Context
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Too many contemporary web utility websites rely on ad-infested templates, slow round-trip cloud servers, or surreptitiously harvest user data when converting files.
          ToolNest Pro was conceived to prove that comprehensive productivity tools—from image compression and format transcoding to cryptographic password derivation—can run seamlessly, privately, and instantaneously directly inside the modern browser engine.
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Developed as part of a competitive university scholarship and software engineering portfolio, this application adheres to production-grade architectural standards: semantic TypeScript, responsive WCAG AA accessibility, zero mock data, and an authenticated backend API gateway for LLM capabilities.
        </p>
      </section>

      {/* Architectural Pillars */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Technical Architecture
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Client-Side Sandboxing</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Image compression, conversion, QR code drawing, and text manipulation execute strictly inside HTML5 Canvas contexts and Web Worker threads. Files never touch a remote filesystem.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
              <Lock className="h-4 w-4 text-indigo-500" />
              <span>Hardware Web Crypto Entropy</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Passwords and passphrases leverage the browser's native <code className="font-mono text-[11px]">window.crypto.getRandomValues</code> API, delivering true cryptographic entropy and protecting against pseudo-random PRNG predictability.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
              <Cpu className="h-4 w-4 text-violet-500" />
              <span>Secure Full-Stack AI Proxy</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              AI requests pass through an Express-based Node.js backend proxy. This shields sensitive Gemini API keys from browser DevTools, enforces rate-limiting safeguards, and provides clean error handling.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
              <Zap className="h-4 w-4 text-amber-500" />
              <span>Zero-Storage Local Persistence</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Project management boards, document drafts, and calculation histories are stored solely in the client's browser <code className="font-mono text-[11px]">localStorage</code>, with one-click JSON/CSV export options.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack Specs */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          System Specifications & Tooling
        </h2>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 p-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <dt className="font-bold text-slate-500 dark:text-slate-400">Frontend Framework</dt>
              <dd className="font-semibold text-slate-900 dark:text-white mt-0.5">React 18, Vite, TypeScript 5</dd>
            </div>
            <div>
              <dt className="font-bold text-slate-500 dark:text-slate-400">Design System & Styling</dt>
              <dd className="font-semibold text-slate-900 dark:text-white mt-0.5">Tailwind CSS v4 with Light/Dark Theme Context</dd>
            </div>
            <div>
              <dt className="font-bold text-slate-500 dark:text-slate-400">Backend Server Architecture</dt>
              <dd className="font-semibold text-slate-900 dark:text-white mt-0.5">Express.js API Proxy with Google GenAI SDK</dd>
            </div>
            <div>
              <dt className="font-bold text-slate-500 dark:text-slate-400">Accessibility & SEO</dt>
              <dd className="font-semibold text-slate-900 dark:text-white mt-0.5">WCAG AA Compliant, Schema.org JSON-LD, BreadcrumbList</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
};
