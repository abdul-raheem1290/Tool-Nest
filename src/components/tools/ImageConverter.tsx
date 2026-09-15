import React, { useState, useRef } from "react";
import { UploadCloud, Download, Trash2, ArrowRight, Shield, Archive, RefreshCw, AlertCircle } from "lucide-react";
import JSZip from "jszip";
import { formatFileSize, downloadBlob } from "../../utils/fileHelpers";

interface ConvertedFileItem {
  id: string;
  originalFile: File;
  name: string;
  customFilename: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalFormat: string;
  originalUrl: string;
  outputBlob?: Blob;
  outputUrl?: string;
  outputSize?: number;
  outputWidth?: number;
  outputHeight?: number;
  targetFormat: "image/png" | "image/jpeg" | "image/webp";
  status: "pending" | "done" | "error";
  error?: string;
}

export const ImageConverter: React.FC = () => {
  const [items, setItems] = useState<ConvertedFileItem[]>([]);
  const [targetFormat, setTargetFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/webp");
  const [quality, setQuality] = useState<number>(90);
  const [customWidth, setCustomWidth] = useState<number | "">("");
  const [customHeight, setCustomHeight] = useState<number | "">("");
  const [maintainRatio, setMaintainRatio] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertSingle = (
    item: ConvertedFileItem,
    fmt: "image/png" | "image/jpeg" | "image/webp",
    q: number,
    cw: number | "",
    ch: number | "",
    ratio: boolean
  ): Promise<ConvertedFileItem> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          let w = img.width;
          let h = img.height;

          if (typeof cw === "number" && cw > 0 && typeof ch === "number" && ch > 0) {
            if (ratio) {
              const scale = Math.min(cw / img.width, ch / img.height);
              w = Math.round(img.width * scale);
              h = Math.round(img.height * scale);
            } else {
              w = cw;
              h = ch;
            }
          } else if (typeof cw === "number" && cw > 0) {
            w = cw;
            h = ratio ? Math.round((img.height / img.width) * cw) : img.height;
          } else if (typeof ch === "number" && ch > 0) {
            h = ch;
            w = ratio ? Math.round((img.width / img.height) * ch) : img.width;
          }

          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, w);
          canvas.height = Math.max(1, h);
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            resolve({ ...item, status: "error", error: "Failed to initialize 2D canvas context" });
            return;
          }

          if (fmt === "image/jpeg") {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve({ ...item, status: "error", error: "Blob creation failed" });
                return;
              }
              const outputUrl = URL.createObjectURL(blob);
              resolve({
                ...item,
                outputBlob: blob,
                outputUrl,
                outputSize: blob.size,
                outputWidth: canvas.width,
                outputHeight: canvas.height,
                targetFormat: fmt,
                status: "done",
                error: undefined,
              });
            },
            fmt,
            q / 100
          );
        } catch (err: unknown) {
          resolve({
            ...item,
            status: "error",
            error: err instanceof Error ? err.message : "Conversion failure",
          });
        }
      };
      img.onerror = () => {
        resolve({ ...item, status: "error", error: "Failed to load image file" });
      };
      img.src = item.originalUrl;
    });
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.type.startsWith("image/")) validFiles.push(f);
    }

    if (validFiles.length === 0) {
      setErrorMessage("Please select valid image files.");
      return;
    }

    const newItems: ConvertedFileItem[] = validFiles.map((file) => {
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      return {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        originalFile: file,
        name: file.name,
        customFilename: nameWithoutExt,
        originalSize: file.size,
        originalWidth: 0,
        originalHeight: 0,
        originalFormat: file.type.replace("image/", "").toUpperCase(),
        originalUrl: URL.createObjectURL(file),
        targetFormat,
        status: "pending",
      };
    });

    setItems((prev) => [...prev, ...newItems]);

    newItems.forEach((newItem) => {
      const img = new Image();
      img.onload = async () => {
        const itemWithDims: ConvertedFileItem = {
          ...newItem,
          originalWidth: img.width,
          originalHeight: img.height,
        };
        const converted = await convertSingle(
          itemWithDims,
          targetFormat,
          quality,
          customWidth,
          customHeight,
          maintainRatio
        );
        setItems((current) =>
          current.map((item) => (item.id === newItem.id ? converted : item))
        );
      };
      img.src = newItem.originalUrl;
    });
  };

  const handleReconvertAll = async (
    fmt = targetFormat,
    q = quality,
    cw = customWidth,
    ch = customHeight,
    ratio = maintainRatio
  ) => {
    if (items.length === 0) return;
    setIsProcessing(true);
    const updated = await Promise.all(
      items.map((item) => convertSingle(item, fmt, q, cw, ch, ratio))
    );
    setItems(updated);
    setIsProcessing(false);
  };

  const handleDownloadSingle = (item: ConvertedFileItem) => {
    if (!item.outputBlob) return;
    const ext = item.targetFormat === "image/jpeg" ? "jpg" : item.targetFormat === "image/webp" ? "webp" : "png";
    const filename = `${item.customFilename || "converted"}.${ext}`;
    downloadBlob(item.outputBlob, filename);
  };

  const handleDownloadAllZip = async () => {
    const readyItems = items.filter((item) => item.outputBlob && item.status === "done");
    if (readyItems.length === 0) return;

    const zip = new JSZip();
    readyItems.forEach((item, index) => {
      const ext = item.targetFormat === "image/jpeg" ? "jpg" : item.targetFormat === "image/webp" ? "webp" : "png";
      const filename = `${item.customFilename || `image-${index + 1}`}.${ext}`;
      zip.file(filename, item.outputBlob!);
    });

    const zipBlob = await zip.generateAsync({ type: "blob" });
    downloadBlob(zipBlob, `toolnest-converted-images-${Date.now()}.zip`);
  };

  const handleRemove = (id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.originalUrl) URL.revokeObjectURL(target.originalUrl);
      if (target?.outputUrl) URL.revokeObjectURL(target.outputUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleClearAll = () => {
    items.forEach((item) => {
      if (item.originalUrl) URL.revokeObjectURL(item.originalUrl);
      if (item.outputUrl) URL.revokeObjectURL(item.outputUrl);
    });
    setItems([]);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Image Format Converter
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Convert image collections between PNG, JPEG, and WebP with optional dimension controls.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold w-fit">
          <Shield className="h-4 w-4" />
          <span>Local Client-Side Canvas Engine</span>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-200 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Target Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        {/* Format Selector */}
        <div className="space-y-2">
          <label htmlFor="converter-target-format-select" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Convert To
          </label>
          <select
            id="converter-target-format-select"
            value={targetFormat}
            onChange={(e) => {
              const val = e.target.value as "image/png" | "image/jpeg" | "image/webp";
              setTargetFormat(val);
              handleReconvertAll(val, quality, customWidth, customHeight, maintainRatio);
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="image/webp">WebP (.webp) - Modern & Compact</option>
            <option value="image/png">PNG (.png) - Lossless Transparency</option>
            <option value="image/jpeg">JPEG (.jpg) - Universal Photo</option>
          </select>
        </div>

        {/* Quality (only for jpeg and webp) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="converter-quality-slider" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Quality: {targetFormat === "image/png" ? "Lossless (100%)" : `${quality}%`}
            </label>
          </div>
          <input
            id="converter-quality-slider"
            type="range"
            min="10"
            max="100"
            step="5"
            disabled={targetFormat === "image/png"}
            value={quality}
            onChange={(e) => {
              const val = Number(e.target.value);
              setQuality(val);
              handleReconvertAll(targetFormat, val, customWidth, customHeight, maintainRatio);
            }}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600 disabled:opacity-40"
          />
        </div>

        {/* Dimensions */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Target Size (Optional)
          </label>
          <div className="flex items-center gap-2">
            <input
              id="converter-custom-width-input"
              type="number"
              placeholder="Width (px)"
              value={customWidth}
              onChange={(e) => setCustomWidth(e.target.value ? Number(e.target.value) : "")}
              onBlur={() => handleReconvertAll(targetFormat, quality, customWidth, customHeight, maintainRatio)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
            <span className="text-slate-400">×</span>
            <input
              id="converter-custom-height-input"
              type="number"
              placeholder="Height (px)"
              value={customHeight}
              onChange={(e) => setCustomHeight(e.target.value ? Number(e.target.value) : "")}
              onBlur={() => handleReconvertAll(targetFormat, quality, customWidth, customHeight, maintainRatio)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {/* Proportions & Action */}
        <div className="flex flex-col justify-between space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Aspect Ratio
          </label>
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                id="converter-ratio-checkbox"
                type="checkbox"
                checked={maintainRatio}
                onChange={(e) => {
                  setMaintainRatio(e.target.checked);
                  handleReconvertAll(targetFormat, quality, customWidth, customHeight, e.target.checked);
                }}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              Lock ratio
            </label>
            <button
              id="converter-reprocess-btn"
              onClick={() => handleReconvertAll()}
              disabled={isProcessing || items.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isProcessing ? "animate-spin" : ""}`} />
              Re-convert
            </button>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        id="converter-drop-zone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className="group relative cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-8 text-center transition-all hover:border-indigo-500 hover:bg-indigo-50/30 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-indigo-500/60"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm group-hover:scale-110 transition-transform dark:bg-indigo-950 dark:text-indigo-400">
            <UploadCloud className="h-7 w-7" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-white">
              Drag images here or <span className="text-indigo-600 dark:text-indigo-400">browse from computer</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports any image format decoded by browser (PNG, JPG, WebP, GIF, BMP, SVG).
            </p>
          </div>
        </div>
      </div>

      {/* Batch Actions */}
      {items.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {items.length} image{items.length > 1 ? "s" : ""} in queue
          </div>
          <div className="flex items-center gap-2">
            <button
              id="converter-clear-btn"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-300 dark:hover:bg-rose-950/40"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear All
            </button>
            <button
              id="converter-download-all-zip-btn"
              onClick={handleDownloadAllZip}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white shadow-sm hover:bg-indigo-500"
            >
              <Archive className="h-4 w-4" /> Download All (.ZIP)
            </button>
          </div>
        </div>
      )}

      {/* Items list */}
      {items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              id={`converter-row-${item.id}`}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                  <img
                    src={item.outputUrl || item.originalUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <input
                      id={`custom-filename-input-${item.id}`}
                      type="text"
                      value={item.customFilename}
                      onChange={(e) => {
                        const val = e.target.value;
                        setItems((current) =>
                          current.map((i) => (i.id === item.id ? { ...i, customFilename: val } : i))
                        );
                      }}
                      className="text-sm font-semibold text-slate-900 dark:text-white bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 focus:outline-none focus:border-indigo-500 px-0 py-0.5"
                      title="Edit output filename"
                    />
                    <span className="text-xs text-slate-400 font-mono">
                      .{item.targetFormat === "image/jpeg" ? "jpg" : item.targetFormat === "image/webp" ? "webp" : "png"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      {item.originalFormat} ({formatFileSize(item.originalSize)})
                    </span>
                    <ArrowRight className="h-3 w-3 text-slate-400" />
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {item.targetFormat.replace("image/", "").toUpperCase()}{" "}
                      {item.outputSize ? `(${formatFileSize(item.outputSize)})` : ""}
                    </span>
                    {item.outputWidth && (
                      <span className="text-slate-400">
                        [{item.outputWidth}×{item.outputHeight}]
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  id={`converter-download-single-${item.id}`}
                  onClick={() => handleDownloadSingle(item)}
                  disabled={!item.outputBlob}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
                <button
                  id={`converter-remove-single-${item.id}`}
                  onClick={() => handleRemove(item.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
