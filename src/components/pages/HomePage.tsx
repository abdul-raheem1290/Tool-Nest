import React, { useState } from "react";
import {
  FileArchive,
  ImageDown,
  FileSpreadsheet,
  Bot,
  QrCode,
  FileText,
  Sparkles,
  CheckSquare,
  Calculator,
  KeyRound,
  ScanText,
  ArrowRight,
  Shield,
  Zap,
  Lock,
  Cpu,
  Star,
  Search,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { TOOLS_REGISTRY, CATEGORIES_LIST } from "../../data/toolsData";
import { ToolDefinition } from "../../types";

interface HomePageProps {
  onSelectTool: (toolId: string) => void;
  onOpenSearch: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectTool, onOpenSearch }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("toolnest_favs");
    return saved ? JSON.parse(saved) : ["image-compressor", "password-generator", "ai-chat"];
  });

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      localStorage.setItem("toolnest_favs", JSON.stringify(next));
      return next;
    });
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "FileArchive":
        return <FileArchive className="h-6 w-6" />;
      case "ImageDown":
        return <ImageDown className="h-6 w-6" />;
      case "FileSpreadsheet":
        return <FileSpreadsheet className="h-6 w-6" />;
      case "Bot":
        return <Bot className="h-6 w-6" />;
      case "QrCode":
        return <QrCode className="h-6 w-6" />;
      case "FileText":
        return <FileText className="h-6 w-6" />;
      case "Sparkles":
        return <Sparkles className="h-6 w-6" />;
      case "CheckSquare":
        return <CheckSquare className="h-6 w-6" />;
      case "Calculator":
        return <Calculator className="h-6 w-6" />;
      case "KeyRound":
        return <KeyRound className="h-6 w-6" />;
      case "ScanText":
        return <ScanText className="h-6 w-6" />;
      default:
        return <Cpu className="h-6 w-6" />;
    }
  };

  // Filter tools
  const filteredTools = TOOLS_REGISTRY.filter((tool) => {
    const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;
    const matchesQuery =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  const favoriteTools = TOOLS_REGISTRY.filter((t) => favorites.includes(t.id));

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-4 text-center sm:pt-14 sm:pb-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Architecture Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-4 py-1.5 text-xs font-semibold text-indigo-700 backdrop-blur-xs dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Browser-Native Execution • Client-Side Security First</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl dark:text-white leading-[1.15]">
            Powerful Everyday Tools. <br />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 bg-clip-text text-transparent dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-300">
              One Professional Workspace.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Engineered for developers, academics, and creators. Perform high-performance image compression, format transcoding, document authoring, cryptographic generation, and AI assistance with zero data transmission.
          </p>

          {/* Quick Search & Filter Trigger */}
          <div className="mx-auto max-w-xl pt-2">
            <div
              onClick={onOpenSearch}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm transition-all hover:border-indigo-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 cursor-pointer"
            >
              <div className="flex items-center gap-3 pl-3 text-slate-400 dark:text-slate-500">
                <Search className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-medium">Search any utility (e.g., 'WebP', 'Passphrase', 'Markdown')...</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <span>Ctrl K</span>
              </div>
            </div>

            {/* Quick Pill Suggestions */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Popular:</span>
              <button
                onClick={() => onSelectTool("image-compressor")}
                className="rounded-full bg-slate-100 px-3 py-1 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                Image Compressor
              </button>
              <button
                onClick={() => onSelectTool("password-generator")}
                className="rounded-full bg-slate-100 px-3 py-1 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                Passphrase Generator
              </button>
              <button
                onClick={() => onSelectTool("qr-generator")}
                className="rounded-full bg-slate-100 px-3 py-1 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                QR Code Studio
              </button>
              <button
                onClick={() => onSelectTool("ai-chat")}
                className="rounded-full bg-slate-100 px-3 py-1 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                AI Chat Studio
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pinned / Favorited Quick Access (if any) */}
      {favoriteTools.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
              <span>Pinned Quick Access ({favoriteTools.length})</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteTools.map((tool) => (
              <div
                key={tool.id}
                onClick={() => onSelectTool(tool.id)}
                className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-600 shadow-xs cursor-pointer group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                    {getIcon(tool.iconName)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {tool.tagline}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => toggleFavorite(e, tool.id)}
                  className="p-1.5 text-amber-500 hover:text-amber-600"
                  title="Remove from pinned"
                >
                  <Star className="h-4 w-4 fill-amber-400" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Workspace Directory Section */}
      <section className="space-y-8" id="tools-directory">
        {/* Category Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto scrollbar-none">
            {CATEGORIES_LIST.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    selectedCategory === cat.id
                      ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900"
                      : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Inline Filter count */}
          <span className="text-xs text-slate-400">
            Showing {filteredTools.length} of {TOOLS_REGISTRY.length} tools
          </span>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => {
            const isFav = favorites.includes(tool.id);

            return (
              <div
                key={tool.id}
                onClick={() => onSelectTool(tool.id)}
                className="flex flex-col justify-between p-6 rounded-3xl border border-slate-200 bg-white hover:border-indigo-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-600 shadow-xs hover:shadow-lg transition-all cursor-pointer group"
              >
                <div>
                  {/* Top Bar: Icon, Category Badge & Favorite Star */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                      {getIcon(tool.iconName)}
                    </div>
                    <div className="flex items-center gap-2">
                      {tool.badge && (
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                            tool.badge === "Popular"
                              ? "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/50"
                              : tool.badge === "AI Powered"
                              ? "bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400 border border-violet-200/50 dark:border-violet-900/50"
                              : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/50"
                          }`}
                        >
                          {tool.badge}
                        </span>
                      )}
                      <button
                        onClick={(e) => toggleFavorite(e, tool.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isFav
                            ? "text-amber-500 hover:text-amber-600"
                            : "text-slate-300 dark:text-slate-600 hover:text-amber-400"
                        }`}
                        title={isFav ? "Remove favorite" : "Add to favorites"}
                      >
                        <Star className={`h-4 w-4 ${isFav ? "fill-amber-400" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                    {tool.description}
                  </p>

                  {/* Key Features bullet list */}
                  <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
                    {tool.features.slice(0, 3).map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer Action */}
                <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <Shield className="h-3 w-3 text-emerald-500" />
                    <span>{tool.isClientSideOnly ? "100% Private Client" : "Encrypted API Proxy"}</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform dark:text-indigo-400">
                    <span>Launch</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Engineering Pillars & Architecture Dossier */}
      <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-8 sm:p-12 dark:border-slate-800 dark:bg-slate-900/40 space-y-10">
        <div className="max-w-2xl">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Architectural Philosophy
          </h2>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Built for rigorous academic portfolios and production workloads.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            ToolNest Pro avoids generic bloated templates. Every tool operates under strict client-side sandboxing, hardware Web Crypto entropy, and zero tracking cookies.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Zero Cloud Ingestion</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Images, spreadsheets, and confidential documents are processed strictly via Canvas2D and client memory buffers without hitting servers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Sub-50ms Latency</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              By removing external roundtrips for utility tasks, operations complete at bare-metal browser speed even on unstable networks.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Web Crypto RNG</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Passphrase and key generators leverage <code className="font-mono text-[11px]">crypto.getRandomValues</code> for true cryptographic entropy.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Secure Proxy Gateway</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              AI Chat requests are routed via an Express server proxy that validates payloads and guards sensitive credentials from client inspection.
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Transparent answers regarding data privacy, accuracy, and technical design.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "Does ToolNest Pro store my uploaded photos, images, or documents?",
              a: "No. For all image tools (Compressor, Converter, Enhancer) and document tools (Converter, Writer), processing happens entirely in-memory on your local device via HTML5 Canvas, FileReader, and Blob APIs. No byte of your file is transmitted over the internet.",
            },
            {
              q: "How does the AI Chat Studio protect API keys?",
              a: "The client frontend never receives or references the Gemini API key. All prompt dispatches travel to the authenticated backend proxy (/api/chat), which interfaces with the Google GenAI SDK securely on the server side.",
            },
            {
              q: "Can I use ToolNest Pro offline?",
              a: "Yes! Once loaded, all client-side tools (Image Compressor, QR Studio, Document Writer, Password Generator, Text Analyzer, Smart Calculator) continue functioning seamlessly without an active internet connection.",
            },
            {
              q: "Can I export my project tasks and calculation histories?",
              a: "Yes. Both the Project Manager and Smart Calculator provide one-click exports to CSV and JSON formats, allowing complete data portability and local backup retention.",
            },
          ].map((faq, index) => (
            <details
              key={index}
              className="group rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
                <span>{faq.q}</span>
                <span className="ml-4 transition-transform group-open:rotate-180 text-slate-400">
                  <ChevronDown className="h-4 w-4" />
                </span>
              </summary>
              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400 border-t border-slate-100 pt-3 dark:border-slate-800">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="rounded-3xl bg-indigo-600 p-8 sm:p-12 text-center text-white shadow-xl space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Ready to streamline your workflow?
        </h2>
        <p className="mx-auto max-w-xl text-sm text-indigo-100 leading-relaxed">
          Access all 10+ professional utilities instantly without creating an account or providing credit card credentials.
        </p>
        <div className="pt-2">
          <button
            onClick={() => onSelectTool("image-compressor")}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-xs font-bold text-indigo-600 shadow-lg hover:bg-slate-50 transition-all"
          >
            <span>Explore Popular Tools</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
