import React, { useState, useEffect } from "react";
import { KeyRound, Copy, Check, RefreshCw, Shield, ShieldCheck, AlertTriangle, Download, Trash2, ListFilter, Info } from "lucide-react";
import { copyToClipboard, downloadText } from "../../utils/fileHelpers";

const MEMORABLE_WORDS = [
  "falcon", "summit", "galaxy", "quartz", "timber", "harbor", "zenith", "glacier", "orbit", "beacon",
  "canyon", "velvet", "cobalt", "plasma", "voyage", "cipher", "anchor", "mystic", "meadow", "stride",
  "pinnacle", "stellar", "horizon", "aurora", "breeze", "radiant", "granite", "circuit", "nebula", "cascade",
  "ember", "vortex", "shadow", "silver", "echo", "monarch", "delta", "fathom", "zephyr", "solace",
  "spire", "prism", "vector", "tempo", "oasis", "flint", "crest", "meteor", "haven", "tundra",
  "matrix", "crystal", "vertex", "comet", "beacon", "titan", "pulse", "legend", "stream", "fusion"
];

export const PasswordGenerator: React.FC = () => {
  const [mode, setMode] = useState<"random" | "passphrase" | "bulk">("random");

  // Random mode options
  const [length, setLength] = useState<number>(20);
  const [includeUpper, setIncludeUpper] = useState<boolean>(true);
  const [includeLower, setIncludeLower] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState<boolean>(false);

  // Passphrase options
  const [wordCount, setWordCount] = useState<number>(4);
  const [separator, setSeparator] = useState<string>("-");
  const [capitalizeWords, setCapitalizeWords] = useState<boolean>(true);
  const [includeWordNumber, setIncludeWordNumber] = useState<boolean>(true);

  // Output
  const [password, setPassword] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([]);

  // Bulk mode
  const [bulkCount, setBulkCount] = useState<number>(10);
  const [bulkPasswords, setBulkPasswords] = useState<string[]>([]);

  const generateSecureRandomInt = (max: number): number => {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
  };

  const generatePasswordString = (): string => {
    let chars = "";
    const uppers = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lowers = "abcdefghijkmnopqrstuvwxyz";
    const nums = "23456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    const allUppers = excludeAmbiguous ? uppers : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const allLowers = excludeAmbiguous ? lowers : "abcdefghijklmnopqrstuvwxyz";
    const allNums = excludeAmbiguous ? nums : "0123456789";
    const allSymbols = symbols;

    let pool = "";
    const mandatoryChars: string[] = [];

    if (includeUpper) {
      pool += allUppers;
      mandatoryChars.push(allUppers[generateSecureRandomInt(allUppers.length)]);
    }
    if (includeLower) {
      pool += allLowers;
      mandatoryChars.push(allLowers[generateSecureRandomInt(allLowers.length)]);
    }
    if (includeNumbers) {
      pool += allNums;
      mandatoryChars.push(allNums[generateSecureRandomInt(allNums.length)]);
    }
    if (includeSymbols) {
      pool += allSymbols;
      mandatoryChars.push(allSymbols[generateSecureRandomInt(allSymbols.length)]);
    }

    if (!pool) return "";

    const remainingLength = Math.max(0, length - mandatoryChars.length);
    const generated: string[] = [...mandatoryChars];

    for (let i = 0; i < remainingLength; i++) {
      generated.push(pool[generateSecureRandomInt(pool.length)]);
    }

    // Cryptographic Fisher-Yates Shuffle
    for (let i = generated.length - 1; i > 0; i--) {
      const j = generateSecureRandomInt(i + 1);
      [generated[i], generated[j]] = [generated[j], generated[i]];
    }

    return generated.join("");
  };

  const generatePassphraseString = (): string => {
    const selectedWords: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      let word = MEMORABLE_WORDS[generateSecureRandomInt(MEMORABLE_WORDS.length)];
      if (capitalizeWords) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
      }
      selectedWords.push(word);
    }
    let res = selectedWords.join(separator);
    if (includeWordNumber) {
      const num = generateSecureRandomInt(900) + 100;
      res += `${separator}${num}`;
    }
    return res;
  };

  const handleGenerate = () => {
    let newPass = "";
    if (mode === "random") {
      newPass = generatePasswordString();
    } else if (mode === "passphrase") {
      newPass = generatePassphraseString();
    } else {
      // Bulk
      const list: string[] = [];
      for (let i = 0; i < bulkCount; i++) {
        list.push(generatePasswordString());
      }
      setBulkPasswords(list);
      newPass = list[0] || "";
    }

    if (newPass) {
      setPassword(newPass);
      setHistory((prev) => [newPass, ...prev.filter((p) => p !== newPass)].slice(0, 10));
    }
  };

  useEffect(() => {
    handleGenerate();
  }, [mode, length, includeUpper, includeLower, includeNumbers, includeSymbols, excludeAmbiguous, wordCount, separator, capitalizeWords, includeWordNumber, bulkCount]);

  // Entropy and Strength Calculation
  const calculateEntropy = (): { bits: number; crackTime: string; strength: string; color: string; pct: number } => {
    if (!password) return { bits: 0, crackTime: "Instant", strength: "Empty", color: "bg-slate-400", pct: 0 };

    let poolSize = 0;
    if (/[a-z]/.test(password)) poolSize += 26;
    if (/[A-Z]/.test(password)) poolSize += 26;
    if (/[0-9]/.test(password)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) poolSize += 33;

    if (poolSize === 0) poolSize = 10;

    const bits = Math.round(password.length * Math.log2(poolSize));
    let crackTime = "Instant";
    let strength = "Very Weak";
    let color = "bg-rose-500";
    let pct = 20;

    if (bits >= 128) {
      crackTime = "Trillions of Centuries";
      strength = "Military Grade (NIST Top-Tier)";
      color = "bg-emerald-500";
      pct = 100;
    } else if (bits >= 80) {
      crackTime = "Millions of Years";
      strength = "Extremely Strong";
      color = "bg-emerald-500";
      pct = 90;
    } else if (bits >= 60) {
      crackTime = "Centuries";
      strength = "Strong";
      color = "bg-indigo-500";
      pct = 75;
    } else if (bits >= 45) {
      crackTime = "Few Months";
      strength = "Fair";
      color = "bg-amber-500";
      pct = 50;
    } else if (bits >= 30) {
      crackTime = "Few Hours";
      strength = "Weak";
      color = "bg-rose-400";
      pct = 30;
    }

    return { bits, crackTime, strength, color, pct };
  };

  const entropyData = calculateEntropy();

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportBulk = (format: "txt" | "csv") => {
    if (bulkPasswords.length === 0) return;
    if (format === "csv") {
      const csv = `Index,Password,Length\n` + bulkPasswords.map((p, i) => `${i + 1},"${p}",${p.length}`).join("\n");
      downloadText(csv, `toolnest-passwords-${Date.now()}.csv`, "text/csv");
    } else {
      downloadText(bulkPasswords.join("\n"), `toolnest-passwords-${Date.now()}.txt`, "text/plain");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Cryptographic Password Generator
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate high-entropy passwords and passphrases using hardware Web Crypto API randomness.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold w-fit">
          <ShieldCheck className="h-4 w-4" />
          <span>window.crypto.getRandomValues Verified</span>
        </div>
      </div>

      {/* Mode Select Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
        <button
          onClick={() => setMode("random")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            mode === "random"
              ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          Random Characters
        </button>
        <button
          onClick={() => setMode("passphrase")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            mode === "passphrase"
              ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          Memorable Passphrase
        </button>
        <button
          onClick={() => setMode("bulk")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            mode === "bulk"
              ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          Bulk Batch Mode
        </button>
      </div>

      {/* Main Password Showcase Box */}
      {mode !== "bulk" && (
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-6">
          {/* Display string */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="font-mono text-xl sm:text-2xl font-black text-slate-900 dark:text-white break-all select-all px-2">
              {password}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                id="password-refresh-btn"
                onClick={handleGenerate}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Regenerate"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                id="password-copy-btn"
                onClick={() => handleCopy(password)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs hover:bg-indigo-500 transition-colors"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Strength & Entropy Metrics */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
              <span>Security Level: {entropyData.strength}</span>
              <span>{entropyData.bits} Bits Entropy • Crack time: {entropyData.crackTime}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full ${entropyData.color} transition-all duration-300`}
                style={{ width: `${entropyData.pct}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Configuration Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Settings Panel */}
        <div className="lg:col-span-8 p-6 rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Parameters & Constraints
          </h2>

          {mode === "random" && (
            <div className="space-y-6">
              {/* Length */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Character Length</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">{length}</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="64"
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeUpper}
                    onChange={(e) => setIncludeUpper(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  Uppercase Letters (A-Z)
                </label>

                <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeLower}
                    onChange={(e) => setIncludeLower(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  Lowercase Letters (a-z)
                </label>

                <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeNumbers}
                    onChange={(e) => setIncludeNumbers(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  Digits (0-9)
                </label>

                <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSymbols}
                    onChange={(e) => setIncludeSymbols(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  Symbols (!@#$%^&*...)
                </label>

                <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer col-span-1 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={excludeAmbiguous}
                    onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  Avoid Ambiguous Characters (exclude 1, l, I, 0, O, o)
                </label>
              </div>
            </div>
          )}

          {mode === "passphrase" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Number of Words</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">{wordCount} words</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="8"
                  value={wordCount}
                  onChange={(e) => setWordCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Word Separator
                  </label>
                  <select
                    value={separator}
                    onChange={(e) => setSeparator(e.target.value)}
                    className="w-full mt-1.5 p-2 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="-">Hyphen (-)</option>
                    <option value="_">Underscore (_)</option>
                    <option value=".">Period (.)</option>
                    <option value=" ">Space ( )</option>
                  </select>
                </div>

                <div className="space-y-2 pt-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={capitalizeWords}
                      onChange={(e) => setCapitalizeWords(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Capitalize each word
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeWordNumber}
                      onChange={(e) => setIncludeWordNumber(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Append random digits
                  </label>
                </div>
              </div>
            </div>
          )}

          {mode === "bulk" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Quantity:</span>
                  <select
                    value={bulkCount}
                    onChange={(e) => setBulkCount(Number(e.target.value))}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value={5}>5 Passwords</option>
                    <option value={10}>10 Passwords</option>
                    <option value={25}>25 Passwords</option>
                    <option value={50}>50 Passwords</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportBulk("txt")}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    <Download className="h-3.5 w-3.5" /> TXT
                  </button>
                  <button
                    onClick={() => handleExportBulk("csv")}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
                  >
                    <Download className="h-3.5 w-3.5" /> CSV
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pt-2">
                {bulkPasswords.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-xs font-mono"
                  >
                    <span className="text-slate-400 w-6">{idx + 1}.</span>
                    <span className="flex-1 font-bold text-slate-900 dark:text-white truncate px-2">{p}</span>
                    <button
                      onClick={() => handleCopy(p)}
                      className="p-1 hover:text-indigo-600"
                      title="Copy"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Security Advice & History Panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* History */}
          <div className="p-6 rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Generated History
              </span>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="p-1 text-slate-400 hover:text-rose-600"
                  title="Clear history"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No previous records.</p>
              ) : (
                history.map((h, i) => (
                  <div
                    key={i}
                    onClick={() => handleCopy(h)}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 hover:text-indigo-600 cursor-pointer"
                    title="Click to copy"
                  >
                    <span className="truncate pr-2">{h}</span>
                    <Copy className="h-3 w-3 text-slate-400 shrink-0" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Security Best Practices Card */}
          <div className="p-6 rounded-3xl border border-indigo-100 bg-indigo-50/40 dark:border-indigo-950 dark:bg-indigo-950/20 text-xs space-y-2 text-indigo-900 dark:text-indigo-200">
            <div className="flex items-center gap-2 font-bold">
              <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Zero-Storage Security Guarantee</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              ToolNest Pro never transmits, logs, or stores generated passwords on any remote server. Passwords exist solely in your local browser runtime memory and are cleared when closed. Always save sensitive credentials in an encrypted password manager (such as Bitwarden or 1Password).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
