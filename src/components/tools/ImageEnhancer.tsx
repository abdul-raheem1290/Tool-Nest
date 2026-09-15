import React, { useState, useRef, useEffect } from "react";
import { UploadCloud, Download, RefreshCw, Eye, Sparkles, Sliders, Shield, Sun, Contrast, Droplets, Wand2 } from "lucide-react";
import { downloadBlob, formatFileSize } from "../../utils/fileHelpers";

interface FilterPreset {
  name: string;
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
  sepia: number;
  grayscale: number;
}

const PRESETS: FilterPreset[] = [
  { name: "Normal", brightness: 0, contrast: 0, saturation: 100, warmth: 0, sepia: 0, grayscale: 0 },
  { name: "Vivid Pop", brightness: 5, contrast: 18, saturation: 135, warmth: 4, sepia: 0, grayscale: 0 },
  { name: "Warm Sunset", brightness: 6, contrast: 10, saturation: 115, warmth: 24, sepia: 12, grayscale: 0 },
  { name: "Cinematic Dark", brightness: -8, contrast: 25, saturation: 90, warmth: -6, sepia: 0, grayscale: 0 },
  { name: "Crisp Clean", brightness: 8, contrast: 14, saturation: 105, warmth: -4, sepia: 0, grayscale: 0 },
  { name: "B&W High Contrast", brightness: 4, contrast: 32, saturation: 0, warmth: 0, sepia: 0, grayscale: 100 },
  { name: "Vintage Sepia", brightness: -2, contrast: 8, saturation: 80, warmth: 18, sepia: 65, grayscale: 0 },
];

export const ImageEnhancer: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ name: string; size: number; width: number; height: number } | null>(null);

  // Adjustments
  const [brightness, setBrightness] = useState<number>(0); // -100 to 100
  const [contrast, setContrast] = useState<number>(0); // -100 to 100
  const [saturation, setSaturation] = useState<number>(100); // 0 to 200
  const [warmth, setWarmth] = useState<number>(0); // -50 to 50
  const [sepia, setSepia] = useState<number>(0); // 0 to 100
  const [grayscale, setGrayscale] = useState<number>(0); // 0 to 100
  const [blur, setBlur] = useState<number>(0); // 0 to 10px

  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/jpeg");
  const [exportQuality, setExportQuality] = useState<number>(92);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rawImageRef = useRef<HTMLImageElement | null>(null);

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImageSrc(url);

    const img = new Image();
    img.onload = () => {
      rawImageRef.current = img;
      setImageMeta({
        name: file.name,
        size: file.size,
        width: img.width,
        height: img.height,
      });
      renderCanvas();
    };
    img.src = url;
  };

  const applyPreset = (p: FilterPreset) => {
    setBrightness(p.brightness);
    setContrast(p.contrast);
    setSaturation(p.saturation);
    setWarmth(p.warmth);
    setSepia(p.sepia);
    setGrayscale(p.grayscale);
    setBlur(0);
  };

  const resetAdjustments = () => {
    applyPreset(PRESETS[0]);
  };

  const renderCanvas = () => {
    const img = rawImageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (isComparing) {
      // Draw untouched original
      ctx.filter = "none";
      ctx.drawImage(img, 0, 0);
      return;
    }

    // Combine CSS Canvas Filters
    // Brightness: 100% is neutral
    const b = 100 + brightness;
    // Contrast: 100% is neutral
    const c = 100 + contrast;
    // Saturation: 100% is neutral
    const s = saturation;
    // Sepia: 0% is neutral
    const sep = sepia;
    // Grayscale: 0% is neutral
    const gray = grayscale;
    // Blur
    const blr = blur;

    ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%) sepia(${sep}%) grayscale(${gray}%) blur(${blr}px)`;
    ctx.drawImage(img, 0, 0);

    // Warmth tint via overlay color blend
    if (warmth !== 0) {
      ctx.save();
      if (warmth > 0) {
        // Warm orange/amber overlay
        ctx.fillStyle = `rgba(255, 140, 0, ${Math.min(0.4, (warmth / 50) * 0.25)})`;
        ctx.globalCompositeOperation = "color";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        // Cool blue overlay
        ctx.fillStyle = `rgba(0, 120, 255, ${Math.min(0.4, (Math.abs(warmth) / 50) * 0.25)})`;
        ctx.globalCompositeOperation = "color";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.restore();
    }
  };

  useEffect(() => {
    renderCanvas();
  }, [brightness, contrast, saturation, warmth, sepia, grayscale, blur, isComparing]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const ext = exportFormat === "image/jpeg" ? "jpg" : exportFormat === "image/webp" ? "webp" : "png";
        const baseName = imageMeta?.name.substring(0, imageMeta.name.lastIndexOf(".")) || "enhanced-image";
        downloadBlob(blob, `${baseName}-enhanced.${ext}`);
      },
      exportFormat,
      exportQuality / 100
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Client-Side Image Enhancer
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time filter grading, color balance, contrast dynamics, and warmth rendering completely inside your browser.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold w-fit">
          <Shield className="h-4 w-4" />
          <span>GPU-Accelerated Canvas Engine</span>
        </div>
      </div>

      {!imageSrc ? (
        /* Empty Upload State */
        <div
          id="enhancer-upload-drop-zone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) handleImageUpload(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="group cursor-pointer rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-12 text-center transition-all hover:border-indigo-500 hover:bg-indigo-50/20 dark:border-slate-800 dark:bg-slate-900/40"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
          />
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm group-hover:scale-110 transition-transform dark:bg-indigo-950 dark:text-indigo-400">
              <Wand2 className="h-8 w-8" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                Upload photo to enhance
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Drop your image here or click to browse. Processing is completely instantaneous and private.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Active Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Canvas Preview */}
          <div className="lg:col-span-8 flex flex-col items-center justify-between p-6 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-4">
            <div className="w-full flex items-center justify-between">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-sm">
                {imageMeta?.name} ({imageMeta?.width} × {imageMeta?.height} px)
              </div>
              <div className="flex items-center gap-2">
                <button
                  onMouseDown={() => setIsComparing(true)}
                  onMouseUp={() => setIsComparing(false)}
                  onTouchStart={() => setIsComparing(true)}
                  onTouchEnd={() => setIsComparing(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 select-none cursor-pointer"
                  title="Press and hold to view original"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Hold for Original</span>
                </button>
              </div>
            </div>

            {/* Canvas Display */}
            <div className="relative w-full max-h-[500px] overflow-hidden rounded-xl bg-slate-950 flex items-center justify-center p-2">
              <canvas
                ref={canvasRef}
                className="max-h-[480px] max-w-full object-contain rounded-lg shadow-2xl transition-all"
              />
              {isComparing && (
                <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                  Original Image
                </div>
              )}
            </div>

            {/* Change Image or Reset */}
            <div className="w-full flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setImageSrc(null);
                  setImageMeta(null);
                }}
                className="text-xs text-slate-500 hover:text-indigo-600 underline"
              >
                Change Photo
              </button>
              <button
                onClick={resetAdjustments}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Reset Adjustments
              </button>
            </div>
          </div>

          {/* Right Controls Panel */}
          <div className="lg:col-span-4 space-y-6 p-6 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            {/* Filter Presets Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                1-Click Grading Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => applyPreset(p)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 transition-colors text-left truncate"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Fine Tune Adjustments
              </label>

              {/* Brightness */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5"><Sun className="h-3 w-3" /> Brightness</span>
                  <span>{brightness > 0 ? `+${brightness}` : brightness}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5"><Contrast className="h-3 w-3" /> Contrast</span>
                  <span>{contrast > 0 ? `+${contrast}` : contrast}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600"
                />
              </div>

              {/* Saturation */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5"><Droplets className="h-3 w-3" /> Saturation</span>
                  <span>{saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600"
                />
              </div>

              {/* Warmth */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>Color Temperature (Warmth)</span>
                  <span>{warmth > 0 ? `+${warmth}` : warmth}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={warmth}
                  onChange={(e) => setWarmth(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-amber-500"
                />
              </div>

              {/* Sepia & Grayscale */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Sepia</span>
                    <span>{sepia}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sepia}
                    onChange={(e) => setSepia(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Grayscale</span>
                    <span>{grayscale}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={grayscale}
                    onChange={(e) => setGrayscale(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600"
                  />
                </div>
              </div>
            </div>

            {/* Export Settings */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="image/jpeg">JPEG Image</option>
                  <option value="image/png">PNG Image</option>
                  <option value="image/webp">WebP Image</option>
                </select>
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 shadow-xs"
                >
                  <Download className="h-3.5 w-3.5" /> Save Enhanced
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
