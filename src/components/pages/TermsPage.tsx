import React from "react";
import { FileText, CheckCircle2, AlertTriangle, Shield } from "lucide-react";

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-10 py-4">
      {/* Header */}
      <div className="space-y-4 border-b border-slate-200 pb-8 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-semibold">
          <FileText className="h-4 w-4" />
          <span>Operational Terms</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Terms of Service
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Last revised: September 2026
        </p>
      </div>

      <section className="space-y-6 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or utilizing ToolNest Pro, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            2. Permitted Use & Academic Portfolio Context
          </h2>
          <p>
            ToolNest Pro is provided free of charge for personal, academic, research, and professional productivity workflows. You agree not to use the application or its underlying API proxy to transmit malicious payloads, violate applicable data privacy statutes, or attempt unauthorized reverse-engineering of rate limits.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            3. Disclaimer of Warranties
          </h2>
          <p>
            All utilities, conversions, calculations, and AI recommendations are provided on an "as is" and "as available" basis without warranties of any kind. While high precision and adherence to mathematical standards (IEEE 754, Web Crypto) are engineered into the codebase, users are encouraged to independently verify mission-critical computations.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            4. Limitation of Liability
          </h2>
          <p>
            In no event shall ToolNest Pro, its developers, or academic sponsors be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the platform.
          </p>
        </div>
      </section>
    </div>
  );
};
