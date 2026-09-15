import React, { useState, useEffect, useRef } from "react";
import { Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3, List, ListOrdered, CheckSquare, Quote, Code, AlignLeft, AlignCenter, AlignRight, Download, UploadCloud, Printer, Trash2, Eye, Edit3, Columns, Maximize2, Minimize2, Check, Clock, FileText } from "lucide-react";
import { downloadText, copyToClipboard } from "../../utils/fileHelpers";

const TEMPLATES: Record<string, { title: string; content: string }> = {
  scholarship: {
    title: "Scholarship Personal Statement",
    content: `# Academic & Professional Statement of Purpose\n\n**Candidate Name:** Alex Johnson  \n**Target Program:** Master of Science in Computer Science / Advanced Software Systems  \n**Date:** October 2026\n\n## 1. Executive Motivation\nMy academic journey has centered around building high-utility, privacy-conscious digital tools. Software is most impactful when engineered with rigorous attention to client-side performance, accessibility, and zero-compromise security architectures.\n\n## 2. Research & Engineering Contributions\nDuring my capstone development, I engineered multi-format media processors that perform high-speed matrix compression entirely in-browser using HTML5 Canvas and the Web Crypto API, eliminating unnecessary server-side data transit.\n\n## 3. Long-Term Vision & Scholarship Impact\nReceiving this scholarship will enable me to expand my research into decentralized productivity software, contributing open-source tools that empower academic institutions worldwide.\n\n### Anticipated Milestones:\n- [x] Complete architecture evaluation of client-side web utilities\n- [ ] Publish peer-reviewed study on zero-knowledge browser data pipelines\n- [ ] Mentor incoming engineering undergraduates in systems architecture`,
  },
  rfc: {
    title: "RFC 042: High-Performance Browser Utilities",
    content: `# RFC 042: Standardized Web-Worker Pipeline for Local Processing\n\n**Status:** Proposal  \n**Author:** Architecture Committee  \n**Target Release:** Q1 2027\n\n## Summary\nThis document outlines a standardized architecture for executing file transformations, image transcoding, and cryptography operations exclusively on the client machine.\n\n## Motivation\n- Zero cloud storage costs for transient workflows\n- Absolute GDPR/CCPA data sovereignty compliance\n- Sub-50ms latency for document transcoding\n\n## Technical Specification\n\`\`\`typescript\ninterface ProcessingTask {\n  id: string;\n  blob: Blob;\n  options: CompressionConfig;\n  onProgress: (pct: number) => void;\n}\n\`\`\`\n\n## Security Considerations\nAll binary parsing happens within isolated memory envelopes to prevent cross-origin memory leaks.`,
  },
  meeting: {
    title: "Engineering Sync & Sprint Planning",
    content: `# Weekly Architecture & Sprint Planning\n\n**Date:** September 15, 2026  \n**Attendees:** Alex, Elena, Marcus, Sarah\n\n## Key Agenda Topics\n1. Review of ToolNest Pro performance metrics\n2. Image compression benchmarks across Safari, Firefox, and Chromium\n3. Accessibility testing compliance report (WCAG 2.1 AA)\n\n## Action Items\n- [x] Integrate Web Crypto API for secure key derivation\n- [ ] Benchmark WebP multi-threading performance\n- [ ] Finalize responsive touch targets across mobile breakpoints\n\n> "Consistency in user experience reflects rigor in software engineering."`,
  },
  blank: {
    title: "Untitled Document",
    content: `# Untitled Workspace Document\n\nStart typing your content here...`,
  },
};

export const DocumentWriter: React.FC = () => {
  const [docTitle, setDocTitle] = useState<string>(() => {
    return localStorage.getItem("toolnest_writer_title") || "Academic Research Statement";
  });
  const [content, setContent] = useState<string>(() => {
    return localStorage.getItem("toolnest_writer_content") || TEMPLATES.scholarship.content;
  });
  const [viewMode, setViewMode] = useState<"edit" | "split" | "preview">("split");
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<string>("Saved just now");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save to localStorage
  useEffect(() => {
    const handler = setTimeout(() => {
      localStorage.setItem("toolnest_writer_title", docTitle);
      localStorage.setItem("toolnest_writer_content", content);
      setLastSaved(`Auto-saved at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
    }, 800);
    return () => clearTimeout(handler);
  }, [docTitle, content]);

  // Statistics calculation
  const charCountWithSpaces = content.length;
  const charCountNoSpaces = content.replace(/\s/g, "").length;
  const words = content.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const paragraphCount = content.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 225));

  // Toolbar action helpers
  const insertSyntax = (before: string, after: string = "", defaultText: string = "") => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selectedText = content.substring(start, end) || defaultText;
    const replacement = `${before}${selectedText}${after}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 20);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${docTitle}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 3rem; line-height: 1.6; color: #111827; max-width: 800px; margin: 0 auto; }
            h1 { border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
            blockquote { border-left: 4px solid #6366f1; padding-left: 1rem; color: #4b5563; font-style: italic; }
            pre { background: #f3f4f6; padding: 1rem; border-radius: 6px; overflow-x: auto; }
            ul, ol { padding-left: 1.5rem; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <article>
            ${renderMarkdownToHtml(content)}
          </article>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const renderMarkdownToHtml = (src: string) => {
    return src
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/gim, "<em>$1</em>")
      .replace(/~~(.*?)~~/gim, "<del>$1</del>")
      .replace(/^\> (.*$)/gim, "<blockquote>$1</blockquote>")
      .replace(/```([\s\S]*?)```/gim, "<pre><code>$1</code></pre>")
      .replace(/`([^`]+)`/gim, "<code>$1</code>")
      .replace(/^- \[x\] (.*$)/gim, '<div class="flex items-center gap-2"><input type="checkbox" checked disabled /> <span>$1</span></div>')
      .replace(/^- \[ \] (.*$)/gim, '<div class="flex items-center gap-2"><input type="checkbox" disabled /> <span>$1</span></div>')
      .replace(/^\- (.*$)/gim, "<ul><li>$1</li></ul>")
      .replace(/^\d+\. (.*$)/gim, "<ol><li>$1</li></ol>")
      .replace(/\n\n/gim, "</p><p>")
      .replace(/<\/ul>\s*<ul>/gim, "")
      .replace(/<\/ol>\s*<ol>/gim, "");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
    setDocTitle(nameWithoutExt);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setContent((ev.target?.result as string) || "");
    };
    reader.readAsText(file, "UTF-8");
  };

  return (
    <div className={`space-y-6 ${isFocusMode ? "fixed inset-0 z-50 bg-white dark:bg-slate-950 p-6 overflow-y-auto" : ""}`}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          <input
            id="writer-document-title-input"
            type="text"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            className="text-xl sm:text-2xl font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none text-slate-900 dark:text-white px-1"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Auto-save indicator */}
          <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-2">
            <Check className="h-3 w-3 text-emerald-500" /> {lastSaved}
          </span>

          {/* View Toggles */}
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800">
            <button
              onClick={() => setViewMode("edit")}
              className={`p-1.5 rounded text-xs font-semibold ${
                viewMode === "edit" ? "bg-white shadow-xs text-indigo-600 dark:bg-slate-900 dark:text-indigo-400" : "text-slate-500"
              }`}
              title="Edit Mode"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`p-1.5 rounded text-xs font-semibold ${
                viewMode === "split" ? "bg-white shadow-xs text-indigo-600 dark:bg-slate-900 dark:text-indigo-400" : "text-slate-500"
              }`}
              title="Split View"
            >
              <Columns className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`p-1.5 rounded text-xs font-semibold ${
                viewMode === "preview" ? "bg-white shadow-xs text-indigo-600 dark:bg-slate-900 dark:text-indigo-400" : "text-slate-500"
              }`}
              title="Reading Preview"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            onClick={() => setIsFocusMode(!isFocusMode)}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Toggle Distraction-Free Focus Mode"
          >
            {isFocusMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Formatting Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div className="flex flex-wrap items-center gap-1">
          {/* Headings */}
          <button
            onClick={() => insertSyntax("# ", "", "Heading 1")}
            className="p-1.5 rounded text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertSyntax("## ", "", "Heading 2")}
            className="p-1.5 rounded text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertSyntax("### ", "", "Heading 3")}
            className="p-1.5 rounded text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </button>

          <span className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

          {/* Text Styling */}
          <button
            onClick={() => insertSyntax("**", "**", "bold text")}
            className="p-1.5 rounded text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertSyntax("*", "*", "italic text")}
            className="p-1.5 rounded text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertSyntax("~~", "~~", "strikethrough")}
            className="p-1.5 rounded text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </button>

          <span className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

          {/* Lists */}
          <button
            onClick={() => insertSyntax("- ", "", "List item")}
            className="p-1.5 rounded text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertSyntax("1. ", "", "First item")}
            className="p-1.5 rounded text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertSyntax("- [ ] ", "", "Pending task")}
            className="p-1.5 rounded text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            title="Task Checklist"
          >
            <CheckSquare className="h-4 w-4" />
          </button>

          <span className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

          {/* Blocks */}
          <button
            onClick={() => insertSyntax("> ", "", "Important quotation")}
            className="p-1.5 rounded text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            title="Blockquote"
          >
            <Quote className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertSyntax("```typescript\n", "\n```", "const x = 1;")}
            className="p-1.5 rounded text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            title="Code Block"
          >
            <Code className="h-4 w-4" />
          </button>
        </div>

        {/* Templates Selector */}
        <div className="flex items-center gap-2">
          <select
            id="writer-template-select"
            onChange={(e) => {
              const tmpl = TEMPLATES[e.target.value];
              if (tmpl) {
                if (window.confirm("Load template? Current text will be replaced.")) {
                  setDocTitle(tmpl.title);
                  setContent(tmpl.content);
                }
              }
            }}
            className="text-xs rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            defaultValue=""
          >
            <option value="" disabled>Load Template...</option>
            <option value="scholarship">Scholarship Statement</option>
            <option value="rfc">Engineering RFC</option>
            <option value="meeting">Meeting Sync</option>
            <option value="blank">Blank Workspace</option>
          </select>
        </div>
      </div>

      {/* Editor & Preview Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[550px]">
        {/* Editor Area */}
        {(viewMode === "edit" || viewMode === "split") && (
          <div className={`${viewMode === "split" ? "md:col-span-6" : "md:col-span-12"} flex flex-col`}>
            <textarea
              ref={textareaRef}
              id="writer-content-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thesis, essay, technical notes, or documentation..."
              className="w-full flex-1 min-h-[500px] p-6 rounded-2xl border border-slate-200 bg-white font-mono text-sm leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs resize-none"
            />
          </div>
        )}

        {/* Reading Preview */}
        {(viewMode === "preview" || viewMode === "split") && (
          <div className={`${viewMode === "split" ? "md:col-span-6" : "md:col-span-12"} flex flex-col`}>
            <div
              id="writer-preview-pane"
              className="w-full flex-1 min-h-[500px] p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-y-auto shadow-xs prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(content) }}
            />
          </div>
        )}
      </div>

      {/* Live Statistics & Export Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {/* Metrics Counter */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
          <div>
            <span className="font-bold text-slate-900 dark:text-white">{wordCount}</span> words
          </div>
          <span>•</span>
          <div>
            <span className="font-bold text-slate-900 dark:text-white">{charCountWithSpaces}</span> characters ({charCountNoSpaces} no spaces)
          </div>
          <span>•</span>
          <div>
            <span className="font-bold text-slate-900 dark:text-white">{paragraphCount}</span> paragraphs
          </div>
          <span>•</span>
          <div className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
            <Clock className="h-3.5 w-3.5" />
            <span>~{readingTimeMinutes} min read</span>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.txt,.html"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <UploadCloud className="h-3.5 w-3.5" /> Import
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Printer className="h-3.5 w-3.5" /> PDF / Print
          </button>
          <button
            onClick={() => downloadText(content, `${docTitle.replace(/\s+/g, "-")}.md`, "text/markdown")}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> Export .MD
          </button>
        </div>
      </div>
    </div>
  );
};
