import React from "react";
import { ShieldCheck, Lock, EyeOff, Server, HardDrive, CheckCircle2 } from "lucide-react";

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-10 py-4">
      {/* Header */}
      <div className="space-y-4 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Privacy by Design Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Last revised: September 2026 • Effective immediately
        </p>
      </div>

      {/* Overview */}
      <section className="space-y-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        <p>
          At <strong>ToolNest Pro</strong>, privacy is not an afterthought or an optional toggle—it is the foundational constraint that governs how every tool was engineered.
          We believe that everyday utility software should never require giving up your personal files, identity, or browsing behavior.
        </p>
      </section>

      {/* Key Declarations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
            <EyeOff className="h-4 w-4 text-emerald-500" />
            <span>Zero Tracking or Profiling</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            We do not use advertising trackers, marketing pixels, or third-party fingerprinting scripts. Your session is entirely anonymous.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
            <HardDrive className="h-4 w-4 text-indigo-500" />
            <span>Client-Side Local Storage</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Project tasks, calculator records, and document notes are stored purely in your browser's local sandbox and are never uploaded to a cloud database.
          </p>
        </div>
      </div>

      {/* Sections */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            1. File Processing & In-Memory Execution
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            When you use the Image Compressor, Image Converter, Image Enhancer, QR Code Studio, or Document Converter, all computations occur exclusively within the local browser runtime memory using HTML5 Canvas, FileReader, and Blob APIs.
            At no point are your uploaded photos, images, or documents transmitted to our servers or any third-party infrastructure.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            2. AI Chat Studio Dispatches
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            When interacting with the AI Chat Studio, your prompt text is forwarded via our secure server proxy directly to the Gemini API endpoint to generate responses.
            Our server does not retain, index, or store prompt logs beyond the lifecycle of the active HTTP request.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            3. Password & Cryptographic Derivation
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            The Password Generator uses the browser's hardware-backed <code className="font-mono text-[11px]">window.crypto.getRandomValues()</code>. Generated credentials exist solely in RAM until the tab is refreshed or closed. We never transmit or log generated passwords.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            4. User Data Retention & Deletion
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Because all application state resides in your browser's <code className="font-mono text-[11px]">localStorage</code>, you can permanently delete all records at any time simply by clearing your browser cache or using the in-app "Clear All" buttons.
          </p>
        </div>
      </section>
    </div>
  );
};
