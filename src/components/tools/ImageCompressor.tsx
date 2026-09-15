import React, { useState, useRef, useCallback } from "react";
import { UploadCloud, Download, Trash2, Sliders, RefreshCw, Eye, Check, AlertCircle, Archive, ArrowRight, Shield } from "lucide-react";
import JSZip from "jszip";
import { formatFileSize, downloadBlob } from "../../utils/fileHelpers";
import { ProcessedImageItem } from "../../types";

export const ImageCompressor: React.FC = () => {
  const [items, setItems] = useState<ProcessedImageItem[]>([]);
  const [quality, setQuality] = useState<number>(80);
  const [format, setFormat] = useState<"image/jpeg" | "image/png" | "image/webp">("image/webp");
  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [maxHeight, setMaxHeight] = useState<number>(1080);
  const [maintainRatio, setMaintainRatio] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeCompareItem, setActiveCompareItem] = useState<ProcessedImageItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback(
    async (
      item: ProcessedImageItem,
      targetQuality: number,
      targetFormat: "image/jpeg" | "image/png" | "image/webp",
      wConstraint: number,
      hConstraint: number,
      keepRatio: boolean
    ): Promise<ProcessedImageItem> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          try {
            let targetW = img.width;
            let targetH = img.height;

            if (keepRatio) {
              const ratio = Math.min(wConstraint / img.width, hConstraint / img.height, 1);
              targetW = Math.max(1, Math.round(img.width * ratio));
              targetH = Math.max(1, Math.round(img.height * ratio));
            } else {
              targetW = Math.min(img.width, wConstraint);
              targetH = Math.min(img.height, hConstraint);
            }

            const canvas = document.createElement("canvas");
            canvas.width = targetW;
            canvas.height = targetH;
            const ctx = canvas.getContext("2d");

            if (!ctx) {
              resolve({
                ...item,
                status: "error",
                error: "Unable to create 2D canvas context",
              });
              return;
            }

            // Fill white background for transparent PNG converted to JPEG
            if (targetFormat === "image/jpeg") {
              ctx.fillStyle = "#FFFFFF";
              ctx.fillRect(0, 0, targetW, targetH);
            }

            ctx.drawImage(img, 0, 0, targetW, targetH);

            const q = targetQuality / 100;
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  resolve({
                    ...item,
                    status: "error",
                    error: "Blob encoding failed in browser",
                  });
                  return;
                }
                const outputUrl = URL.createObjectURL(blob);
                resolve({
                  ...item,
                  outputBlob: blob,
                  outputUrl,
                  outputSize: blob.size,
                  outputWidth: targetW,
                  outputHeight: targetH,
                  format: targetFormat,
                  quality: targetQuality,
                  status: "done",
                  error: undefined,
                });
              },
              targetFormat,
              q
            );
          } catch (err: unknown) {
            resolve({
              ...item,
              status: "error",
              error: err instanceof Error ? err.message : "Canvas rendering failed",
            });
          }
        };
        img.onerror = () => {
          resolve({
            ...item,
            status: "error",
            error: "Failed to decode image file",
          });
        };
        img.src = item.originalUrl;
      });
    },
    []
  );

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp") {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      setErrorMessage("Please select valid image files (JPEG, PNG, or WebP).");
      return;
    }

    const newItems: ProcessedImageItem[] = validFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      originalFile: file,
      name: file.name,
      originalSize: file.size,
      originalWidth: 0,
      originalHeight: 0,
      originalUrl: URL.createObjectURL(file),
      format,
      quality,
      status: "pending",
    }));

    setItems((prev) => [...prev, ...newItems]);

    // Read dimensions and run initial compression
    newItems.forEach((newItem) => {
      const img = new Image();
      img.onload = async () => {
        const itemWithDims: ProcessedImageItem = {
          ...newItem,
          originalWidth: img.width,
          originalHeight: img.height,
        };
        const processed = await processImage(
          itemWithDims,
          quality,
          format,
          maxWidth,
          maxHeight,
          maintainRatio
        );
        setItems((current) =>
          current.map((item) => (item.id === newItem.id ? processed : item))
        );
      };
      img.src = newItem.originalUrl;
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleRecompressAll = async (
    q = quality,
    fmt = format,
    mw = maxWidth,
    mh = maxHeight,
    ratio = maintainRatio
  ) => {
    if (items.length === 0) return;
    setIsProcessing(true);
    const updated = await Promise.all(
      items.map((item) => processImage(item, q, fmt, mw, mh, ratio))
    );
    setItems(updated);
    setIsProcessing(false);
  };

  const handleDownloadSingle = (item: ProcessedImageItem) => {
    if (!item.outputBlob) return;
    const ext = item.format === "image/jpeg" ? "jpg" : item.format === "image/webp" ? "webp" : "png";
    const nameWithoutExt = item.name.substring(0, item.name.lastIndexOf(".")) || item.name;
    const downloadName = `${nameWithoutExt}-compressed.${ext}`;
    downloadBlob(item.outputBlob, downloadName);
  };

  const handleDownloadAllZip = async () => {
    const readyItems = items.filter((item) => item.outputBlob && item.status === "done");
    if (readyItems.length === 0) return;

    const zip = new JSZip();
    readyItems.forEach((item) => {
      const ext = item.format === "image/jpeg" ? "jpg" : item.format === "image/webp" ? "webp" : "png";
      const nameWithoutExt = item.name.substring(0, item.name.lastIndexOf(".")) || item.name;
      zip.file(`${nameWithoutExt}-compressed.${ext}`, item.outputBlob!);
    });

    const zipBlob = await zip.generateAsync({ type: "blob" });
    downloadBlob(zipBlob, `toolnest-compressed-images-${Date.now()}.zip`);
  };

  const handleRemove = (id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.originalUrl) URL.revokeObjectURL(target.originalUrl);
      if (target?.outputUrl) URL.revokeObjectURL(target.outputUrl);
      return prev.filter((item) => item.id !== id);
    });
    if (activeCompareItem?.id === id) {
      setActiveCompareItem(null);
    }
  };

  const handleClearAll = () => {
    items.forEach((item) => {
      if (item.originalUrl) URL.revokeObjectURL(item.originalUrl);
      if (item.outputUrl) URL.revokeObjectURL(item.outputUrl);
    });
    setItems([]);
    setActiveCompareItem(null);
    setErrorMessage(null);
  };

  // Calculations
  const totalOriginalSize = items.reduce((acc, i) => acc + i.originalSize, 0);
  const totalOutputSize = items.reduce((acc, i) => acc + (i.outputSize || i.originalSize), 0);
  const totalSavingsPct =
    totalOriginalSize > 0
      ? Math.max(0, Math.round(((totalOriginalSize - totalOutputSize) / totalOriginalSize) * 100))
      : 0;

  return (
    <div className="space-y-8">
      {/* Header & Privacy Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Image Compressor
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Compress JPEG, PNG, and WebP assets locally with zero quality loss and full privacy.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold w-fit">
          <Shield className="h-4 w-4" />
          <span>100% Client-Side • Zero Server Upload</span>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-200 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Configuration Controls Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        {/* Quality */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="compressor-quality-slider" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Quality: {quality}%
            </label>
            <span className="text-[11px] text-slate-400">
              {quality > 85 ? "High fidelity" : quality > 60 ? "Balanced" : "Max compression"}
            </span>
          </div>
          <input
            id="compressor-quality-slider"
            type="range"
            min="10"
            max="100"
            step="5"
            value={quality}
            onChange={(e) => {
              const val = Number(e.target.value);
              setQuality(val);
              handleRecompressAll(val, format, maxWidth, maxHeight, maintainRatio);
            }}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600"
          />
        </div>

        {/* Target Format */}
        <div className="space-y-2">
          <label htmlFor="compressor-target-format-select" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Output Format
          </label>
          <select
            id="compressor-target-format-select"
            value={format}
            onChange={(e) => {
              const val = e.target.value as "image/jpeg" | "image/png" | "image/webp";
              setFormat(val);
              handleRecompressAll(quality, val, maxWidth, maxHeight, maintainRatio);
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="image/webp">WebP (Recommended • High efficiency)</option>
            <option value="image/jpeg">JPEG (Universal compatibility)</option>
            <option value="image/png">PNG (Lossless compression)</option>
          </select>
        </div>

        {/* Max Dimensions */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Max Bounds (W × H)
          </label>
          <div className="flex items-center gap-2">
            <input
              id="compressor-max-width-input"
              type="number"
              min="100"
              max="7680"
              value={maxWidth}
              onChange={(e) => {
                const val = Number(e.target.value);
                setMaxWidth(val);
              }}
              onBlur={() => handleRecompressAll(quality, format, maxWidth, maxHeight, maintainRatio)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Width"
            />
            <span className="text-slate-400 text-sm">×</span>
            <input
              id="compressor-max-height-input"
              type="number"
              min="100"
              max="4320"
              value={maxHeight}
              onChange={(e) => {
                const val = Number(e.target.value);
                setMaxHeight(val);
              }}
              onBlur={() => handleRecompressAll(quality, format, maxWidth, maxHeight, maintainRatio)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Height"
            />
          </div>
        </div>

        {/* Aspect Ratio & Refresh */}
        <div className="flex flex-col justify-between space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Aspect Ratio Lock
          </label>
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                id="compressor-aspect-ratio-checkbox"
                type="checkbox"
                checked={maintainRatio}
                onChange={(e) => {
                  const val = e.target.checked;
                  setMaintainRatio(val);
                  handleRecompressAll(quality, format, maxWidth, maxHeight, val);
                }}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              Lock proportions
            </label>
            <button
              id="compressor-reprocess-btn"
              onClick={() => handleRecompressAll()}
              disabled={isProcessing || items.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isProcessing ? "animate-spin" : ""}`} />
              Re-apply
            </button>
          </div>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        id="compressor-drop-zone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="group relative cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-8 text-center transition-all hover:border-indigo-500 hover:bg-indigo-50/30 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-indigo-500/60"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm group-hover:scale-110 transition-transform dark:bg-indigo-950 dark:text-indigo-400">
            <UploadCloud className="h-7 w-7" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-white">
              Drop your images here, or <span className="text-indigo-600 dark:text-indigo-400">browse files</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports JPEG, PNG, and WebP up to 50MB per file. Multi-file batch compression enabled.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats & Batch Actions */}
      {items.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-6 text-xs sm:text-sm">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Total Images: </span>
              <span className="font-bold text-slate-900 dark:text-white">{items.length}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Original: </span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{formatFileSize(totalOriginalSize)}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Compressed: </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatFileSize(totalOutputSize)}</span>
            </div>
            {totalSavingsPct > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-extrabold">
                ↓ {totalSavingsPct}% Saved
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="compressor-clear-all-btn"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-300 dark:hover:bg-rose-950/40 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear All
            </button>
            <button
              id="compressor-download-zip-btn"
              onClick={handleDownloadAllZip}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 transition-colors"
            >
              <Archive className="h-4 w-4" />
              Download All (.ZIP)
            </button>
          </div>
        </div>
      )}

      {/* Files List */}
      {items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => {
            const savings =
              item.outputSize && item.originalSize > 0
                ? Math.round(((item.originalSize - item.outputSize) / item.originalSize) * 100)
                : 0;

            return (
              <div
                key={item.id}
                id={`compressor-item-${item.id}`}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs"
              >
                {/* Thumbnail & File Details */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                    <img
                      src={item.outputUrl || item.originalUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                      <span>
                        Orig: {formatFileSize(item.originalSize)} ({item.originalWidth}×{item.originalHeight})
                      </span>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      {item.outputSize ? (
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatFileSize(item.outputSize)} ({item.outputWidth}×{item.outputHeight})
                        </span>
                      ) : (
                        <span>Processing...</span>
                      )}
                      {savings > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                          -{savings}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    id={`compare-btn-${item.id}`}
                    onClick={() => setActiveCompareItem(item)}
                    className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400 transition-colors"
                    title="Compare Before & After"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    id={`download-single-btn-${item.id}`}
                    onClick={() => handleDownloadSingle(item)}
                    disabled={!item.outputBlob}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 transition-colors disabled:opacity-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                  <button
                    id={`remove-item-btn-${item.id}`}
                    onClick={() => handleRemove(item.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Remove file"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comparison Modal */}
      {activeCompareItem && (
        <div
          id="compressor-compare-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs"
          onClick={() => setActiveCompareItem(null)}
        >
          <div
            className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Before & After Comparison: {activeCompareItem.name}
              </h2>
              <button
                onClick={() => setActiveCompareItem(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Original */}
              <div className="space-y-2 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Original ({formatFileSize(activeCompareItem.originalSize)})
                </p>
                <div className="aspect-video rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700">
                  <img
                    src={activeCompareItem.originalUrl}
                    alt="Original"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>

              {/* Compressed */}
              <div className="space-y-2 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Compressed ({formatFileSize(activeCompareItem.outputSize || 0)})
                </p>
                <div className="aspect-video rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700">
                  <img
                    src={activeCompareItem.outputUrl || activeCompareItem.originalUrl}
                    alt="Compressed"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => handleDownloadSingle(activeCompareItem)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500"
              >
                <Download className="h-4 w-4" /> Download Compressed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
