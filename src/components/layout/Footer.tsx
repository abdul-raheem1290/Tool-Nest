import React from "react";
import { Layers, ShieldCheck, Cpu, HardDrive, Globe } from "lucide-react";
import { TOOLS_REGISTRY } from "../../data/toolsData";

interface FooterProps {
  onNavigate: (route: string, filter?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer
      id="main-app-footer"
      className="border-t border-slate-200 bg-slate-900 text-slate-300 dark:border-slate-800 dark:bg-black transition-colors"
    >
      {/* Top Value Banner */}
      <div className="border-b border-slate-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Privacy-First Architecture</p>
              <p className="text-xs text-slate-400">Processing occurs right in your browser</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Client-Side Canvas Speed</p>
              <p className="text-xs text-slate-400">Zero mandatory cloud uploads or delays</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Secure Local Storage</p>
              <p className="text-xs text-slate-400">Your documents & tasks stay on your device</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Production Ready</p>
              <p className="text-xs text-slate-400">Standardized API & export workflows</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-md">
                <Layers className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                ToolNest <span className="text-indigo-400">Pro</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Powerful Everyday Tools. One Professional Workspace. Designed for researchers, developers, creators, and students demanding speed, accuracy, and absolute data privacy.
            </p>
            <div className="pt-2 text-xs text-slate-500">
              <p>Built with React 19, TypeScript, Tailwind CSS, Web Crypto API, HTML5 Canvas, and Gemini AI Proxy.</p>
            </div>
          </div>

          {/* Tools Col 1 */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Media & Docs
            </p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => onNavigate("image-compressor")} className="hover:text-white transition-colors">
                  Image Compressor
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("image-converter")} className="hover:text-white transition-colors">
                  Image Converter
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("image-enhancer")} className="hover:text-white transition-colors">
                  Image Enhancer
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("document-converter")} className="hover:text-white transition-colors">
                  Document Converter
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("document-writer")} className="hover:text-white transition-colors">
                  Document Writer
                </button>
              </li>
            </ul>
          </div>

          {/* Tools Col 2 */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Productivity & AI
            </p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => onNavigate("ai-chat")} className="hover:text-white transition-colors">
                  AI Chat Studio
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("qr-generator")} className="hover:text-white transition-colors">
                  QR Code Studio
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("project-manager")} className="hover:text-white transition-colors">
                  Project Manager
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("smart-calculator")} className="hover:text-white transition-colors">
                  Smart Calculator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("password-generator")} className="hover:text-white transition-colors">
                  Password Generator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("text-analyzer")} className="hover:text-white transition-colors">
                  Text Analyzer
                </button>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Organization
            </p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => onNavigate("about")} className="hover:text-white transition-colors">
                  About Us & Mission
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("privacy")} className="hover:text-white transition-colors">
                  Privacy Architecture
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("terms")} className="hover:text-white transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("contact")} className="hover:text-white transition-colors">
                  Contact Support
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("tools")} className="hover:text-white transition-colors">
                  All {TOOLS_REGISTRY.length} Tools Index
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ToolNest Pro. All rights reserved. Designed for academic and scholarship portfolio presentation.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate("privacy")} className="hover:text-slate-300">Privacy Policy</button>
            <button onClick={() => onNavigate("terms")} className="hover:text-slate-300">Terms</button>
            <button onClick={() => onNavigate("contact")} className="hover:text-slate-300">Security Inquiries</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
