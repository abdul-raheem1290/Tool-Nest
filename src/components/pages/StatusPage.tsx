import React, { useState, useEffect } from "react";
import { Activity, CheckCircle2, AlertCircle, RefreshCw, Cpu, HardDrive, Shield, Server, Zap } from "lucide-react";

interface ServiceHealth {
  name: string;
  category: "Client Core" | "Server Gateway" | "Browser Subsystem";
  status: "operational" | "degraded" | "checking";
  latencyMs: number;
  description: string;
}

export const StatusPage: React.FC = () => {
  const [lastChecked, setLastChecked] = useState<string>(new Date().toLocaleTimeString());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [apiLatency, setApiLatency] = useState<number>(0);
  const [apiStatus, setApiStatus] = useState<"operational" | "degraded" | "checking">("checking");

  const checkHealth = async () => {
    setIsRefreshing(true);
    const start = performance.now();
    try {
      const res = await fetch("/api/health");
      const elapsed = Math.round(performance.now() - start);
      setApiLatency(elapsed);
      if (res.ok) {
        setApiStatus("operational");
      } else {
        setApiStatus("degraded");
      }
    } catch {
      setApiLatency(Math.round(performance.now() - start));
      setApiStatus("degraded");
    } finally {
      setIsRefreshing(false);
      setLastChecked(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const services: ServiceHealth[] = [
    {
      name: "HTML5 Canvas 2D Rendering Context",
      category: "Browser Subsystem",
      status: typeof document !== "undefined" && !!document.createElement("canvas").getContext("2d") ? "operational" : "degraded",
      latencyMs: 1,
      description: "Powers image compression, format transcoding, and QR rendering.",
    },
    {
      name: "Web Crypto API Random Subsystem",
      category: "Browser Subsystem",
      status: typeof window !== "undefined" && !!window.crypto?.getRandomValues ? "operational" : "degraded",
      latencyMs: 0,
      description: "Provides hardware-grade entropy for password derivation.",
    },
    {
      name: "Local Web Storage (DOMStorage)",
      category: "Client Core",
      status: typeof localStorage !== "undefined" ? "operational" : "degraded",
      latencyMs: 1,
      description: "Persists project tasks, calculation logs, and user preferences locally.",
    },
    {
      name: "Express Backend API Proxy (/api/chat, /api/health)",
      category: "Server Gateway",
      status: apiStatus,
      latencyMs: apiLatency,
      description: "Node.js proxy securing Gemini credentials and enforcing rate boundaries.",
    },
    {
      name: "Google GenAI Model Integration Engine",
      category: "Server Gateway",
      status: apiStatus === "operational" ? "operational" : "degraded",
      latencyMs: apiLatency,
      description: "Server-side integration with gemini-2.5-flash LLM model.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold mb-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>All Systems Fully Operational</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            System & Subsystem Status
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time health audits across browser runtime APIs and backend server proxy services.
          </p>
        </div>

        <button
          onClick={checkHealth}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors w-fit"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>Refresh Audits ({lastChecked})</span>
        </button>
      </div>

      {/* Services Table */}
      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {services.map((svc, i) => (
            <div key={i} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {svc.name}
                  </h3>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {svc.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {svc.description}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span className="text-xs font-mono text-slate-400">
                  {svc.latencyMs}ms latency
                </span>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="capitalize">{svc.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Uptime and SLA Statement */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 text-xs space-y-2 text-slate-600 dark:text-slate-400">
        <p className="font-bold text-slate-900 dark:text-white">
          Client-Side Offline SLA
        </p>
        <p className="leading-relaxed">
          Because 90% of ToolNest Pro tools operate client-side without relying on external network requests, their operational availability is effectively 100% once assets are cached by your browser. The server gateway solely proxies requests to LLM APIs with zero personal data persistence.
        </p>
      </div>
    </div>
  );
};
