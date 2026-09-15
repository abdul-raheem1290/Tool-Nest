import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { QrCode as QrIcon, Download, Copy, Check, Sparkles, Wifi, Globe, UserCheck, Mail, Phone, RefreshCw, AlertTriangle, ShieldCheck } from "lucide-react";
import { copyToClipboard, downloadBlob } from "../../utils/fileHelpers";

type QrType = "url" | "text" | "wifi" | "vcard" | "email" | "phone";
type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export const QrCodeStudio: React.FC = () => {
  const [activeType, setActiveType] = useState<QrType>("url");

  // Form Fields
  const [urlVal, setUrlVal] = useState("https://toolnest.pro");
  const [textVal, setTextVal] = useState("Empowering productivity with ToolNest Pro.");
  // WiFi
  const [wifiSsid, setWifiSsid] = useState("Office_5G");
  const [wifiPass, setWifiPass] = useState("SuperSecurePass2026");
  const [wifiAuth, setWifiAuth] = useState<"WPA" | "WEP" | "nopass">("WPA");
  const [wifiHidden, setWifiHidden] = useState(false);
  // VCard
  const [vcardName, setVcardName] = useState("Alex Johnson");
  const [vcardOrg, setVcardOrg] = useState("ToolNest Research");
  const [vcardTitle, setVcardTitle] = useState("Senior Architect");
  const [vcardEmail, setVcardEmail] = useState("alex@toolnest.pro");
  const [vcardPhone, setVcardPhone] = useState("+1-555-0199");
  // Email
  const [emailTo, setEmailTo] = useState("contact@toolnest.pro");
  const [emailSubject, setEmailSubject] = useState("Inquiry regarding ToolNest Pro");
  const [emailBody, setEmailBody] = useState("Hello ToolNest team,\n\nI would like to discuss...");
  // Phone
  const [phoneNum, setPhoneNum] = useState("+15550199");

  // QR Customization
  const [fgColor, setFgColor] = useState("#0f172a");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [qrSize, setQrSize] = useState<number>(380);
  const [margin, setMargin] = useState<number>(2);
  const [ecLevel, setEcLevel] = useState<ErrorCorrectionLevel>("M");
  const [centerLogo, setCenterLogo] = useState<string | null>(null);

  // Output
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Compute Raw String based on active type
  const getRawContent = (): string => {
    switch (activeType) {
      case "url":
        return urlVal.trim();
      case "text":
        return textVal;
      case "wifi":
        return `WIFI:S:${wifiSsid};T:${wifiAuth};P:${wifiPass};H:${wifiHidden ? "true" : "false"};;`;
      case "vcard":
        return `BEGIN:VCARD\nVERSION:3.0\nN:${vcardName}\nFN:${vcardName}\nORG:${vcardOrg}\nTITLE:${vcardTitle}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nEND:VCARD`;
      case "email":
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      case "phone":
        return `tel:${phoneNum.trim()}`;
      default:
        return urlVal;
    }
  };

  // Generate QR Canvas
  useEffect(() => {
    const raw = getRawContent();
    if (!raw) return;

    QRCode.toCanvas(
      canvasRef.current,
      raw,
      {
        width: qrSize,
        margin: margin,
        errorCorrectionLevel: ecLevel,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      },
      (error) => {
        if (error) {
          console.error("QR Generation error:", error);
          return;
        }

        // Draw overlay logo if present
        if (centerLogo && canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const img = new Image();
            img.onload = () => {
              const logoSize = Math.floor(canvas.width * 0.22);
              const pos = (canvas.width - logoSize) / 2;

              // White backdrop badge for logo legibility
              ctx.fillStyle = bgColor;
              ctx.beginPath();
              ctx.arc(canvas.width / 2, canvas.height / 2, logoSize / 1.7, 0, 2 * Math.PI);
              ctx.fill();

              ctx.drawImage(img, pos, pos, logoSize, logoSize);
              setQrDataUrl(canvas.toDataURL("image/png"));
            };
            img.src = centerLogo;
            return;
          }
        }

        if (canvasRef.current) {
          setQrDataUrl(canvasRef.current.toDataURL("image/png"));
        }
      }
    );
  }, [activeType, urlVal, textVal, wifiSsid, wifiPass, wifiAuth, wifiHidden, vcardName, vcardOrg, vcardTitle, vcardEmail, vcardPhone, emailTo, emailSubject, emailBody, phoneNum, fgColor, bgColor, qrSize, margin, ecLevel, centerLogo]);

  // Contrast checker
  const hexToLuminance = (hex: string) => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const lumFg = hexToLuminance(fgColor);
  const lumBg = hexToLuminance(bgColor);
  const contrastRatio = (Math.max(lumFg, lumBg) + 0.05) / (Math.min(lumFg, lumBg) + 0.05);
  const isHighContrast = contrastRatio >= 4.5;

  const handleDownload = (format: "png" | "jpeg" | "svg") => {
    if (!canvasRef.current) return;

    if (format === "svg") {
      QRCode.toString(
        getRawContent(),
        {
          type: "svg",
          margin,
          errorCorrectionLevel: ecLevel,
          color: { dark: fgColor, light: bgColor },
        },
        (err, svgString) => {
          if (!err && svgString) {
            const blob = new Blob([svgString], { type: "image/svg+xml" });
            downloadBlob(blob, `toolnest-qr-${activeType}.svg`);
          }
        }
      );
      return;
    }

    const mime = format === "jpeg" ? "image/jpeg" : "image/png";
    canvasRef.current.toBlob((blob) => {
      if (blob) {
        downloadBlob(blob, `toolnest-qr-${activeType}.${format === "jpeg" ? "jpg" : "png"}`);
      }
    }, mime);
  };

  const handleCopy = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          // Fallback to copying raw string
          const success = await copyToClipboard(getRawContent());
          if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }
        }
      }, "image/png");
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCenterLogo(ev.target?.result as string);
        setEcLevel("H"); // Upgrade error correction so logo doesn't disrupt reading
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            QR Code Generator & Studio
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate customized vector QR codes for websites, Wi-Fi passwords, contact cards, and email messages.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold w-fit">
          <ShieldCheck className="h-4 w-4" />
          <span>Offline Generator • No Redirect Tracking</span>
        </div>
      </div>

      {/* Content Type Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
        <button
          onClick={() => setActiveType("url")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeType === "url"
              ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <Globe className="h-3.5 w-3.5" /> Website URL
        </button>
        <button
          onClick={() => setActiveType("wifi")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeType === "wifi"
              ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <Wifi className="h-3.5 w-3.5" /> Wi-Fi Network
        </button>
        <button
          onClick={() => setActiveType("vcard")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeType === "vcard"
              ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <UserCheck className="h-3.5 w-3.5" /> vCard Contact
        </button>
        <button
          onClick={() => setActiveType("email")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeType === "email"
              ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <Mail className="h-3.5 w-3.5" /> Email Mailto
        </button>
        <button
          onClick={() => setActiveType("phone")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeType === "phone"
              ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <Phone className="h-3.5 w-3.5" /> Phone Number
        </button>
        <button
          onClick={() => setActiveType("text")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeType === "text"
              ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <QrIcon className="h-3.5 w-3.5" /> Plain Text
        </button>
      </div>

      {/* Workspace: Configuration Form + Live Preview Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Controls */}
        <div className="lg:col-span-7 space-y-6 p-6 rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            1. Payload Content
          </h2>

          {/* Conditional Input Fields */}
          {activeType === "url" && (
            <div className="space-y-1.5">
              <label htmlFor="qr-url-input" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Target URL
              </label>
              <input
                id="qr-url-input"
                type="url"
                value={urlVal}
                onChange={(e) => setUrlVal(e.target.value)}
                placeholder="https://yourdomain.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {activeType === "wifi" && (
            <div className="space-y-3">
              <div>
                <label htmlFor="qr-wifi-ssid-input" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Network SSID (Name)
                </label>
                <input
                  id="qr-wifi-ssid-input"
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="qr-wifi-pass-input" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Password
                  </label>
                  <input
                    id="qr-wifi-pass-input"
                    type="password"
                    value={wifiPass}
                    onChange={(e) => setWifiPass(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="qr-wifi-auth-select" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Security Type
                  </label>
                  <select
                    id="qr-wifi-auth-select"
                    value={wifiAuth}
                    onChange={(e) => setWifiAuth(e.target.value as "WPA" | "WEP" | "nopass")}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="WPA">WPA / WPA2 / WPA3</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None (Open)</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wifiHidden}
                  onChange={(e) => setWifiHidden(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                Hidden SSID Network
              </label>
            </div>
          )}

          {activeType === "vcard" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={vcardName}
                  onChange={(e) => setVcardName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Organization</label>
                <input
                  type="text"
                  value={vcardOrg}
                  onChange={(e) => setVcardOrg(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Job Title</label>
                <input
                  type="text"
                  value={vcardTitle}
                  onChange={(e) => setVcardTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Email Address</label>
                <input
                  type="email"
                  value={vcardEmail}
                  onChange={(e) => setVcardEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Phone</label>
                <input
                  type="text"
                  value={vcardPhone}
                  onChange={(e) => setVcardPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
          )}

          {activeType === "email" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Recipient Email</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Message Body</label>
                <textarea
                  rows={2}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
          )}

          {activeType === "phone" && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Telephone Number</label>
              <input
                type="tel"
                value={phoneNum}
                onChange={(e) => setPhoneNum(e.target.value)}
                placeholder="+1 555 0199"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          )}

          {activeType === "text" && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Plain Content</label>
              <textarea
                rows={3}
                value={textVal}
                onChange={(e) => setTextVal(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          )}

          {/* Styling & Customization Section */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              2. Design & Color Styling
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {/* Foreground Color */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Pattern Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="qr-fg-color-picker"
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="h-9 w-12 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-full font-mono text-xs uppercase rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Background Color */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Background
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="qr-bg-color-picker"
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-9 w-12 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full font-mono text-xs uppercase rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Error correction & Quiet Zone */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="qr-ec-level-select" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Error Level
                </label>
                <select
                  id="qr-ec-level-select"
                  value={ecLevel}
                  onChange={(e) => setEcLevel(e.target.value as ErrorCorrectionLevel)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value="L">L (7% recovery)</option>
                  <option value="M">M (15% standard)</option>
                  <option value="Q">Q (25% high)</option>
                  <option value="H">H (30% best for logo)</option>
                </select>
              </div>

              <div>
                <label htmlFor="qr-quiet-zone-select" className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Quiet Zone
                </label>
                <select
                  id="qr-quiet-zone-select"
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <option value={0}>0 (No border)</option>
                  <option value={1}>1 module</option>
                  <option value={2}>2 modules (Recommended)</option>
                  <option value={4}>4 modules (Standard)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Center Logo
                </label>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full py-2 px-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 truncate"
                >
                  {centerLogo ? "Change Logo" : "Upload Badge"}
                </button>
              </div>
            </div>

            {centerLogo && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-xs text-indigo-700 dark:text-indigo-300">
                <span>Center badge enabled (Error Correction elevated to Level H).</span>
                <button
                  onClick={() => setCenterLogo(null)}
                  className="text-indigo-500 hover:text-indigo-700 font-bold"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Preview Card */}
        <div className="lg:col-span-5 flex flex-col items-center justify-between p-6 rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Render Canvas</span>
            <div
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                isHighContrast
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
              }`}
            >
              {isHighContrast ? (
                <ShieldCheck className="h-3.5 w-3.5" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5" />
              )}
              <span>{isHighContrast ? "High Contrast (Scannable)" : "Low Contrast Warning"}</span>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center">
            <canvas ref={canvasRef} className="max-w-full h-auto rounded-xl shadow-xs" />
          </div>

          {/* Download & Copy Bar */}
          <div className="w-full space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <button
                id="qr-download-png-btn"
                onClick={() => handleDownload("png")}
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 shadow-xs transition-colors"
              >
                <Download className="h-3.5 w-3.5" /> PNG
              </button>
              <button
                id="qr-download-jpeg-btn"
                onClick={() => handleDownload("jpeg")}
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 transition-colors"
              >
                <Download className="h-3.5 w-3.5" /> JPEG
              </button>
              <button
                id="qr-download-svg-btn"
                onClick={() => handleDownload("svg")}
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 transition-colors"
              >
                <Download className="h-3.5 w-3.5" /> SVG
              </button>
            </div>

            <button
              id="qr-copy-btn"
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? "Copied to Clipboard!" : "Copy QR Image to Clipboard"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
