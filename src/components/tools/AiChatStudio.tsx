import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Plus, Trash2, Edit2, Copy, Check, RefreshCw, Square, Download, Settings, Search, ShieldCheck, AlertCircle, ShieldAlert } from "lucide-react";
import { ChatConversation, ChatMessage } from "../../types";
import { copyToClipboard, downloadText } from "../../utils/fileHelpers";

export const AiChatStudio: React.FC = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    const saved = localStorage.getItem("toolnest_ai_conversations");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved conversations", e);
      }
    }
    const initialId = "conv-" + Date.now();
    return [
      {
        id: initialId,
        title: "Productivity & Research Assistant",
        systemInstruction: "You are ToolNest Pro AI Assistant, a concise, knowledgeable, and helpful productivity AI.",
        temperature: 0.7,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: "msg-1",
            role: "assistant",
            content: "Hello! I am your ToolNest Pro AI assistant. I can help summarize documents, draft content, refactor code, plan project timelines, or solve technical problems. How can I assist your workflow today?",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      },
    ];
  });

  const [activeConvId, setActiveConvId] = useState<string>(() => conversations[0]?.id || "");
  const [inputText, setInputText] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [serverStatus, setServerStatus] = useState<"checking" | "connected" | "fallback">("checking");
  const [userCustomKey, setUserCustomKey] = useState<string>(() => localStorage.getItem("toolnest_user_ai_key") || "");
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("toolnest_ai_conversations", JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem("toolnest_user_ai_key", userCustomKey);
  }, [userCustomKey]);

  // Check health of backend proxy
  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch("/api/health");
        if (res.ok) {
          const data = await res.json();
          setServerStatus(data.hasServerGeminiKey ? "connected" : "fallback");
        } else {
          setServerStatus("fallback");
        }
      } catch (err) {
        setServerStatus("fallback");
      }
    };
    checkServer();
  }, []);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages, isGenerating]);

  const handleCreateNew = () => {
    const newConv: ChatConversation = {
      id: "conv-" + Date.now(),
      title: "New Conversation",
      systemInstruction: "You are ToolNest Pro AI Assistant, a concise, knowledgeable, and helpful productivity AI.",
      temperature: 0.7,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: "msg-" + Date.now(),
          role: "assistant",
          content: "Started a new conversation. What would you like to explore or build?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newConv.id);
  };

  const handleDeleteConv = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (conversations.length <= 1) {
      handleCreateNew();
    }
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConvId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      if (remaining.length > 0) setActiveConvId(remaining[0].id);
    }
  };

  const handleSendMessage = async (retryContent?: string) => {
    const textToSend = retryContent || inputText;
    if (!textToSend.trim() || isGenerating) return;

    setErrorMessage(null);
    const userMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = retryContent ? activeConv.messages : [...activeConv.messages, userMsg];

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConv.id
          ? {
              ...c,
              messages: updatedMessages,
              title: c.title === "New Conversation" ? textToSend.slice(0, 30) : c.title,
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );

    if (!retryContent) setInputText("");
    setIsGenerating(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      // Send to server backend proxy
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          systemInstruction: activeConv.systemInstruction,
          temperature: activeConv.temperature,
          apiKey: userCustomKey || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: "msg-" + Date.now(),
        role: "assistant",
        content: data.text || "No response received.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConv.id
            ? { ...c, messages: [...c.messages, assistantMsg], updatedAt: new Date().toISOString() }
            : c
        )
      );
    } catch (err: unknown) {
      if ((err as Error).name === "AbortError") {
        console.log("Generation stopped by user");
      } else {
        const msg = err instanceof Error ? err.message : "Error generating AI response";
        setErrorMessage(msg);
      }
    } finally {
      setIsGenerating(false);
      setAbortController(null);
    }
  };

  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setIsGenerating(false);
      setAbortController(null);
    }
  };

  const handleCopyMessage = async (id: string, text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleExportConversation = (format: "json" | "markdown") => {
    if (!activeConv) return;
    if (format === "json") {
      downloadText(JSON.stringify(activeConv, null, 2), `${activeConv.title.replace(/\s+/g, "-")}.json`, "application/json");
    } else {
      let md = `# ${activeConv.title}\n*Exported from ToolNest Pro AI Chat Studio on ${new Date().toLocaleDateString()}*\n\n---\n\n`;
      activeConv.messages.forEach((m) => {
        md += `### ${m.role === "user" ? "You" : "ToolNest AI"} (${m.timestamp})\n\n${m.content}\n\n---\n\n`;
      });
      downloadText(md, `${activeConv.title.replace(/\s+/g, "-")}.md`, "text/markdown");
    }
  };

  const handleClearConversation = () => {
    if (!activeConv) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConv.id ? { ...c, messages: [] } : c))
    );
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            AI Chat Studio
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Intelligent productivity assistant powered by Gemini 3.8 Flash via a protected backend proxy.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
              serverStatus === "connected"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>
              {serverStatus === "connected"
                ? "Backend Proxy Active"
                : userCustomKey
                ? "Using Custom Key"
                : "API Config Needed"}
            </span>
          </div>
          <button
            id="ai-chat-settings-btn"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition-colors"
            title="Chat Settings & API Key"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Settings Drawer / Modal */}
      {isSettingsOpen && (
        <div className="p-6 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 space-y-4 animate-in fade-in duration-100 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              AI Chat Settings & Security Architecture
            </h2>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label htmlFor="ai-chat-sys-instruction" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                System Instruction
              </label>
              <textarea
                id="ai-chat-sys-instruction"
                rows={3}
                value={activeConv?.systemInstruction || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setConversations((prev) =>
                    prev.map((c) => (c.id === activeConv.id ? { ...c, systemInstruction: val } : c))
                  );
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Instruct how the AI should behave (e.g. tone, role, format)..."
              />

              <div>
                <label htmlFor="ai-chat-temp-slider" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex justify-between">
                  <span>Temperature (Creativity)</span>
                  <span>{activeConv?.temperature ?? 0.7}</span>
                </label>
                <input
                  id="ai-chat-temp-slider"
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.1"
                  value={activeConv?.temperature ?? 0.7}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setConversations((prev) =>
                      prev.map((c) => (c.id === activeConv.id ? { ...c, temperature: val } : c))
                    );
                  }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label htmlFor="ai-chat-custom-key-input" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Custom API Key / Demonstration Override
              </label>
              <input
                id="ai-chat-custom-key-input"
                type="password"
                value={userCustomKey}
                onChange={(e) => setUserCustomKey(e.target.value)}
                placeholder="Enter custom Gemini API key (optional)..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                <strong>Production Security Rule:</strong> In production deployments, secret keys must never be hard-coded or exposed in client bundles. ToolNest Pro routes all chat calls through our server-side proxy (<code className="font-mono text-indigo-600 dark:text-indigo-400">/api/chat</code>) which injects the server-side environment variable securely.
              </p>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-200 text-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs font-bold uppercase hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Studio Interface */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[720px] rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs overflow-hidden">
        {/* Left Sidebar: Conversations list */}
        <div className="md:col-span-4 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full bg-slate-50/70 dark:bg-slate-950/40">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2">
            <button
              id="ai-new-conversation-btn"
              onClick={handleCreateNew}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white shadow-xs hover:bg-indigo-500 transition-colors"
            >
              <Plus className="h-4 w-4" /> New Conversation
            </button>

            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="ai-search-conversations-input"
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredConversations.map((conv) => {
              const isActive = conv.id === activeConv.id;
              const isEditing = editingTitleId === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-left transition-all ${
                    isActive
                      ? "bg-white shadow-xs border border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white"
                      : "text-slate-600 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-slate-900/50"
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    {isEditing ? (
                      <input
                        type="text"
                        autoFocus
                        value={editTitleValue}
                        onChange={(e) => setEditTitleValue(e.target.value)}
                        onBlur={() => {
                          if (editTitleValue.trim()) {
                            setConversations((prev) =>
                              prev.map((c) => (c.id === conv.id ? { ...c, title: editTitleValue.trim() } : c))
                            );
                          }
                          setEditingTitleId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            if (editTitleValue.trim()) {
                              setConversations((prev) =>
                                prev.map((c) => (c.id === conv.id ? { ...c, title: editTitleValue.trim() } : c))
                              );
                            }
                            setEditingTitleId(null);
                          }
                        }}
                        className="w-full text-xs font-semibold bg-white border border-indigo-500 rounded px-1 py-0.5"
                      />
                    ) : (
                      <p className="text-xs font-semibold truncate">{conv.title}</p>
                    )}
                    <span className="text-[10px] text-slate-400">
                      {conv.messages.length} message{conv.messages.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTitleId(conv.id);
                        setEditTitleValue(conv.title);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      title="Rename"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteConv(conv.id, e)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Chat Area */}
        <div className="md:col-span-8 flex flex-col h-full bg-white dark:bg-slate-900">
          {/* Top Bar of Active Conversation */}
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {activeConv?.title}
              </h2>
              <span className="text-[11px] text-slate-400">Model: Gemini 3.8 Flash • Proxy Mode</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="ai-export-markdown-btn"
                onClick={() => handleExportConversation("markdown")}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg dark:text-slate-300 dark:hover:bg-slate-800"
                title="Export as Markdown"
              >
                <Download className="h-3.5 w-3.5" /> Markdown
              </button>
              <button
                id="ai-export-json-btn"
                onClick={() => handleExportConversation("json")}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg dark:text-slate-300 dark:hover:bg-slate-800"
                title="Export as JSON"
              >
                <Download className="h-3.5 w-3.5" /> JSON
              </button>
              <button
                id="ai-clear-messages-btn"
                onClick={handleClearConversation}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                title="Clear current messages"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {activeConv?.messages.map((msg) => {
              const isUser = msg.role === "user";

              return (
                <div
                  key={msg.id}
                  id={`chat-msg-${msg.id}`}
                  className={`flex gap-3 max-w-3xl ${isUser ? "ml-auto justify-end" : "mr-auto justify-start"}`}
                >
                  {!isUser && (
                    <div className="h-8 w-8 shrink-0 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div className={`space-y-1 ${isUser ? "items-end text-right" : "items-start text-left"}`}>
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-[11px] font-semibold text-slate-400">
                        {isUser ? "You" : "ToolNest Pro AI"}
                      </span>
                      <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                    </div>

                    <div
                      className={`relative group rounded-2xl p-4 text-sm leading-relaxed shadow-xs ${
                        isUser
                          ? "bg-indigo-600 text-white rounded-tr-xs"
                          : "bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-tl-xs border border-slate-200/60 dark:border-slate-700/60"
                      }`}
                    >
                      {/* Message Content */}
                      <div className="whitespace-pre-wrap select-text break-words">
                        {msg.content}
                      </div>

                      {/* Action buttons on message hover */}
                      <div
                        className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ${
                          isUser ? "text-indigo-200" : "text-slate-400"
                        }`}
                      >
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                        {!isUser && (
                          <button
                            onClick={() => {
                              // Find previous user message
                              const idx = activeConv.messages.findIndex((m) => m.id === msg.id);
                              const prevUser = activeConv.messages.slice(0, idx).reverse().find((m) => m.role === "user");
                              if (prevUser) handleSendMessage(prevUser.content);
                            }}
                            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                            title="Regenerate"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {isUser && (
                    <div className="h-8 w-8 shrink-0 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isGenerating && (
              <div className="flex items-center gap-3 text-slate-400 text-xs py-2">
                <div className="h-8 w-8 shrink-0 rounded-xl bg-indigo-600 flex items-center justify-center text-white animate-pulse">
                  <Bot className="h-4 w-4" />
                </div>
                <span className="animate-pulse font-medium">Generating intelligent response...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Prompt Input */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
            <div className="relative flex items-center">
              <textarea
                id="ai-prompt-input"
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask anything, draft code, convert ideas, or brainstorm... (Press Enter to send)"
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white py-3 pl-4 pr-24 text-sm text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />

              <div className="absolute right-2 flex items-center gap-1.5">
                {isGenerating ? (
                  <button
                    id="ai-stop-btn"
                    onClick={handleStopGeneration}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-600 text-white hover:bg-rose-500 transition-colors"
                    title="Stop generation"
                  >
                    <Square className="h-3.5 w-3.5 fill-current" />
                  </button>
                ) : (
                  <button
                    id="ai-send-btn"
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim()}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs hover:bg-indigo-500 disabled:opacity-40 transition-colors"
                    title="Send message"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
              <span>Shift + Enter for new lines</span>
              <span>Encrypted transport via backend proxy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
