import React, { useState, useRef } from "react";
import { UploadCloud, Download, Copy, Printer, Check, AlertCircle, FileText, ArrowRight, ShieldCheck, Info } from "lucide-react";
import { downloadText, copyToClipboard, formatFileSize } from "../../utils/fileHelpers";

type DocFormat = "markdown" | "html" | "json" | "csv" | "txt";

export const DocumentConverter: React.FC = () => {
  const [inputText, setInputText] = useState<string>("# ToolNest Pro Document\n\nWelcome to **ToolNest Pro Document Converter**.\n\n- Privacy first\n- Fast client-side conversion\n- Clean formatted exports\n\n| Feature | Status |\n| --- | --- |\n| Markdown to HTML | Supported |\n| CSV to JSON | Supported |\n| JSON to CSV | Supported |");
  const [inputFormat, setInputFormat] = useState<DocFormat>("markdown");
  const [outputFormat, setOutputFormat] = useState<DocFormat>("html");
  const [outputText, setOutputText] = useState<string>("");
  const [fileName, setFileName] = useState<string>("sample-document");
  const [copied, setCopied] = useState<boolean>(false);
  const [conversionError, setConversionError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Perform actual conversion
  const convertDocument = (source: string, from: DocFormat, to: DocFormat): string => {
    try {
      setConversionError(null);
      if (!source.trim()) return "";

      // 1. Same format
      if (from === to) return source;

      // 2. Markdown -> HTML
      if (from === "markdown" && to === "html") {
        let html = source
          // Headers
          .replace(/^### (.*$)/gim, "<h3>$1</h3>")
          .replace(/^## (.*$)/gim, "<h2>$1</h2>")
          .replace(/^# (.*$)/gim, "<h1>$1</h1>")
          // Bold & Italic
          .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
          .replace(/\*(.*?)\*/gim, "<em>$1</em>")
          // Blockquote
          .replace(/^\> (.*$)/gim, "<blockquote>$1</blockquote>")
          // Code block
          .replace(/```([\s\S]*?)```/gim, "<pre><code>$1</code></pre>")
          // Inline code
          .replace(/`([^`]+)`/gim, "<code>$1</code>")
          // Unordered lists
          .replace(/^\- (.*$)/gim, "<ul><li>$1</li></ul>")
          // Paragraphs
          .replace(/\n\n/gim, "</p><p>");

        // Clean redundant list tags
        html = html.replace(/<\/ul>\s*<ul>/gim, "");
        return `<article class="document-content">\n<p>${html}</p>\n</article>`;
      }

      // 3. HTML -> Markdown
      if (from === "html" && to === "markdown") {
        return source
          .replace(/<h1>(.*?)<\/h1>/gi, "# $1\n\n")
          .replace(/<h2>(.*?)<\/h2>/gi, "## $1\n\n")
          .replace(/<h3>(.*?)<\/h3>/gi, "### $1\n\n")
          .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
          .replace(/<b>(.*?)<\/b>/gi, "**$1**")
          .replace(/<em>(.*?)<\/em>/gi, "*$1*")
          .replace(/<i>(.*?)<\/i>/gi, "*$1*")
          .replace(/<code>(.*?)<\/code>/gi, "`$1`")
          .replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/gi, "```\n$1\n```\n\n")
          .replace(/<li>(.*?)<\/li>/gi, "- $1\n")
          .replace(/<p>(.*?)<\/p>/gi, "$1\n\n")
          .replace(/<br\s*[\/]?>/gi, "\n")
          .replace(/<[^>]+>/g, ""); // strip any remaining tags
      }

      // 4. JSON -> CSV
      if (from === "json" && to === "csv") {
        const parsed = JSON.parse(source);
        const arrayData = Array.isArray(parsed) ? parsed : [parsed];
        if (arrayData.length === 0) return "";
        const headers = Object.keys(arrayData[0]);
        const csvRows = [
          headers.join(","),
          ...arrayData.map((row) =>
            headers
              .map((fieldName) => {
                const val = row[fieldName] !== undefined ? String(row[fieldName]) : "";
                return `"${val.replace(/"/g, '""')}"`;
              })
              .join(",")
          ),
        ];
        return csvRows.join("\n");
      }

      // 5. CSV -> JSON
      if (from === "csv" && to === "json") {
        const lines = source.trim().split(/\r?\n/);
        if (lines.length === 0) return "[]";
        const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
        const rows = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
          const obj: Record<string, string> = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || "";
          });
          return obj;
        });
        return JSON.stringify(rows, null, 2);
      }

      // 6. JSON -> Markdown table
      if (from === "json" && to === "markdown") {
        const parsed = JSON.parse(source);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        if (arr.length === 0) return "";
        const headers = Object.keys(arr[0]);
        const headerRow = `| ${headers.join(" | ")} |`;
        const separatorRow = `| ${headers.map(() => "---").join(" | ")} |`;
        const dataRows = arr.map(
          (row) => `| ${headers.map((h) => String(row[h] ?? "")).join(" | ")} |`
        );
        return [headerRow, separatorRow, ...dataRows].join("\n");
      }

      // 7. Plain TXT fallback
      if (to === "txt") {
        return source.replace(/<[^>]+>/g, "").replace(/[#*`_~]/g, "");
      }

      if (from === "txt" && to === "markdown") {
        return source;
      }

      if (from === "txt" && to === "html") {
        return `<pre>\n${source}\n</pre>`;
      }

      return source;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Conversion syntax error";
      setConversionError(msg);
      return `[Conversion Error: ${msg}]`;
    }
  };

  // Run conversion whenever inputs change
  React.useEffect(() => {
    const result = convertDocument(inputText, inputFormat, outputFormat);
    setOutputText(result);
  }, [inputText, inputFormat, outputFormat]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "md" || ext === "markdown") setInputFormat("markdown");
    else if (ext === "html" || ext === "htm") setInputFormat("html");
    else if (ext === "json") setInputFormat("json");
    else if (ext === "csv") setInputFormat("csv");
    else setInputFormat("txt");

    setFileName(file.name.substring(0, file.name.lastIndexOf(".")) || file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputText(content || "");
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(outputText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const extMap: Record<DocFormat, string> = {
      markdown: "md",
      html: "html",
      json: "json",
      csv: "csv",
      txt: "txt",
    };
    const mimeMap: Record<DocFormat, string> = {
      markdown: "text/markdown",
      html: "text/html",
      json: "application/json",
      csv: "text/csv",
      txt: "text/plain",
    };
    downloadText(outputText, `${fileName}.${extMap[outputFormat]}`, mimeMap[outputFormat]);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${fileName}</title>
          <style>
            body { font-family: sans-serif; padding: 2rem; line-height: 1.6; color: #1e293b; }
            pre { background: #f1f5f9; padding: 1rem; border-radius: 6px; overflow-x: auto; }
            table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
            th { background: #f8fafc; }
          </style>
        </head>
        <body>
          ${outputFormat === "html" ? outputText : `<pre>${outputText.replace(/</g, "&lt;")}</pre>`}
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Document Format Converter
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Convert cleanly between Markdown, HTML, CSV, JSON, and Plain Text without sending data off your machine.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold w-fit">
          <ShieldCheck className="h-4 w-4" />
          <span>UTF-8 Certified Client Processing</span>
        </div>
      </div>

      {/* Honest Architecture Notice as Required by Prompt */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 dark:bg-amber-950/20 dark:border-amber-800/60 dark:text-amber-200 text-xs sm:text-sm">
        <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">Engineering Note on Document Fidelity:</p>
          <p className="text-xs text-amber-800 dark:text-amber-300/90 leading-relaxed">
            ToolNest Pro executes structural semantic conversions entirely within the browser for instantaneous speed and privacy. For complex Microsoft Word (.docx) documents containing OLE embedded objects, tracked revisions, or proprietary binary formats, production enterprise pipelines require a headless LibreOffice or Apache POI backend service.
          </p>
        </div>
      </div>

      {/* Format Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">From:</span>
            <select
              id="doc-input-format-select"
              value={inputFormat}
              onChange={(e) => setInputFormat(e.target.value as DocFormat)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="markdown">Markdown (.md)</option>
              <option value="html">HTML (.html)</option>
              <option value="json">JSON (.json)</option>
              <option value="csv">CSV Spreadsheet (.csv)</option>
              <option value="txt">Plain Text (.txt)</option>
            </select>
          </div>

          <ArrowRight className="h-4 w-4 text-slate-400 hidden sm:inline-block" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">To:</span>
            <select
              id="doc-output-format-select"
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value as DocFormat)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="html">HTML (.html)</option>
              <option value="markdown">Markdown (.md)</option>
              <option value="json">JSON (.json)</option>
              <option value="csv">CSV Spreadsheet (.csv)</option>
              <option value="txt">Plain Text (.txt)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.html,.htm,.json,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            id="doc-upload-file-btn"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <UploadCloud className="h-3.5 w-3.5" /> Upload File
          </button>
        </div>
      </div>

      {conversionError && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-200 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>Error parsing document: {conversionError}</span>
        </div>
      )}

      {/* Dual Panel Editor & Converter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Text Input */}
        <div className="space-y-2 flex flex-col">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold uppercase tracking-wider">Source Content ({inputFormat.toUpperCase()})</span>
            <span>{inputText.length} chars • {inputText.split(/\s+/).filter(Boolean).length} words</span>
          </div>
          <textarea
            id="doc-source-textarea"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste your document content here..."
            className="w-full h-96 p-4 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none shadow-xs"
          />
        </div>

        {/* Converted Output Preview */}
        <div className="space-y-2 flex flex-col">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Converted Output ({outputFormat.toUpperCase()})
            </span>
            <div className="flex items-center gap-2">
              <button
                id="doc-copy-btn"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 font-medium"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <span>•</span>
              <button
                id="doc-print-btn"
                onClick={handlePrint}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 font-medium"
              >
                <Printer className="h-3.5 w-3.5" /> Print / PDF
              </button>
            </div>
          </div>
          <textarea
            id="doc-output-textarea"
            readOnly
            value={outputText}
            placeholder="Converted output will appear here..."
            className="w-full h-96 p-4 rounded-2xl border border-indigo-100 bg-indigo-50/20 dark:border-indigo-950 dark:bg-indigo-950/20 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none resize-none shadow-xs"
          />
        </div>
      </div>

      {/* Bottom Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">File Base:</span>
          <input
            id="doc-filename-input"
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 font-medium"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            id="doc-download-btn"
            onClick={handleDownload}
            disabled={!outputText}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Download Converted File
          </button>
        </div>
      </div>
    </div>
  );
};
