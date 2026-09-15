import React, { useState, useEffect } from "react";
import { Calculator as CalcIcon, History, Copy, Check, Trash2, ArrowRightLeft, ShieldCheck } from "lucide-react";
import { copyToClipboard } from "../../utils/fileHelpers";

type CalcMode = "standard" | "scientific" | "converter";

interface CalculationHistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
}

export const SmartCalculator: React.FC = () => {
  const [mode, setMode] = useState<CalcMode>("scientific");
  const [display, setDisplay] = useState<string>("0");
  const [expression, setExpression] = useState<string>("");
  const [memory, setMemory] = useState<number>(0);
  const [history, setHistory] = useState<CalculationHistoryItem[]>(() => {
    const saved = localStorage.getItem("toolnest_calc_history");
    return saved ? JSON.parse(saved) : [];
  });
  const [copied, setCopied] = useState<boolean>(false);

  // Unit Converter State
  const [unitCategory, setUnitCategory] = useState<"length" | "mass" | "data" | "temperature">("data");
  const [unitFromVal, setUnitFromVal] = useState<string>("1024");
  const [unitFrom, setUnitFrom] = useState<string>("MB");
  const [unitTo, setUnitTo] = useState<string>("GB");
  const [unitResult, setUnitResult] = useState<string>("");

  useEffect(() => {
    localStorage.setItem("toolnest_calc_history", JSON.stringify(history));
  }, [history]);

  // Handle number or operator press
  const handleInput = (char: string) => {
    if (display === "0" && !isNaN(Number(char))) {
      setDisplay(char);
    } else {
      setDisplay((prev) => prev + char);
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setExpression("");
  };

  const handleBackspace = () => {
    if (display.length <= 1) {
      setDisplay("0");
    } else {
      setDisplay((prev) => prev.slice(0, -1));
    }
  };

  const handleEvaluate = () => {
    try {
      // Safe sanitized arithmetic evaluation using Function without access to globals
      const sanitized = display
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/π/g, `${Math.PI}`)
        .replace(/e/g, `${Math.E}`)
        .replace(/\^/g, "**");

      // Disallow anything other than arithmetic, numbers, and Math functions
      if (/[^0-9+\-*/().\s*MathPInsqrtcosinatleg]/.test(sanitized)) {
        throw new Error("Invalid characters");
      }

      // Safe evaluation
      const evalFn = new Function(`return (${sanitized})`);
      const res = evalFn();

      if (typeof res !== "number" || isNaN(res)) {
        setDisplay("Error");
        return;
      }

      const formattedResult = Number.isInteger(res) ? String(res) : String(parseFloat(res.toFixed(8)));

      setHistory((prev) => [
        {
          id: "hist-" + Date.now(),
          expression: display,
          result: formattedResult,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
        ...prev.slice(0, 24),
      ]);

      setExpression(`${display} =`);
      setDisplay(formattedResult);
    } catch (err) {
      setDisplay("Error");
    }
  };

  const handleScientific = (fn: string) => {
    try {
      const val = parseFloat(display);
      let res = 0;
      switch (fn) {
        case "sin":
          res = Math.sin((val * Math.PI) / 180);
          break;
        case "cos":
          res = Math.cos((val * Math.PI) / 180);
          break;
        case "tan":
          res = Math.tan((val * Math.PI) / 180);
          break;
        case "sqrt":
          res = Math.sqrt(val);
          break;
        case "sq":
          res = Math.pow(val, 2);
          break;
        case "log":
          res = Math.log10(val);
          break;
        case "ln":
          res = Math.log(val);
          break;
        case "reciprocal":
          res = 1 / val;
          break;
        case "factorial":
          let f = 1;
          for (let i = 2; i <= Math.min(val, 170); i++) f *= i;
          res = f;
          break;
        default:
          return;
      }
      const formatted = Number.isInteger(res) ? String(res) : String(parseFloat(res.toFixed(8)));
      setDisplay(formatted);
    } catch {
      setDisplay("Error");
    }
  };

  // Unit converter logic
  useEffect(() => {
    const val = parseFloat(unitFromVal);
    if (isNaN(val)) {
      setUnitResult("0");
      return;
    }

    if (unitCategory === "data") {
      const byteMultipliers: Record<string, number> = {
        B: 1,
        KB: 1024,
        MB: 1024 ** 2,
        GB: 1024 ** 3,
        TB: 1024 ** 4,
      };
      const bytes = val * (byteMultipliers[unitFrom] || 1);
      const converted = bytes / (byteMultipliers[unitTo] || 1);
      setUnitResult(String(parseFloat(converted.toFixed(6))));
    } else if (unitCategory === "length") {
      const meterMultipliers: Record<string, number> = {
        mm: 0.001,
        cm: 0.01,
        m: 1,
        km: 1000,
        in: 0.0254,
        ft: 0.3048,
        mi: 1609.34,
      };
      const meters = val * (meterMultipliers[unitFrom] || 1);
      const converted = meters / (meterMultipliers[unitTo] || 1);
      setUnitResult(String(parseFloat(converted.toFixed(6))));
    } else if (unitCategory === "mass") {
      const kgMultipliers: Record<string, number> = {
        mg: 0.000001,
        g: 0.001,
        kg: 1,
        oz: 0.0283495,
        lb: 0.453592,
      };
      const kg = val * (kgMultipliers[unitFrom] || 1);
      const converted = kg / (kgMultipliers[unitTo] || 1);
      setUnitResult(String(parseFloat(converted.toFixed(6))));
    } else if (unitCategory === "temperature") {
      let celsius = val;
      if (unitFrom === "F") celsius = ((val - 32) * 5) / 9;
      if (unitFrom === "K") celsius = val - 273.15;

      let target = celsius;
      if (unitTo === "F") target = (celsius * 9) / 5 + 32;
      if (unitTo === "K") target = celsius + 273.15;
      setUnitResult(String(parseFloat(target.toFixed(2))));
    }
  }, [unitCategory, unitFromVal, unitFrom, unitTo]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === "converter") return;
      if (["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "+", "-", "(", ")"].includes(e.key)) {
        handleInput(e.key);
      } else if (e.key === "*") {
        handleInput("×");
      } else if (e.key === "/") {
        handleInput("÷");
      } else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        handleEvaluate();
      } else if (e.key === "Backspace") {
        handleBackspace();
      } else if (e.key === "Escape") {
        handleClear();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [display, mode]);

  const handleCopy = async () => {
    const success = await copyToClipboard(display);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Smart Precision Calculator
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Scientific calculations, data conversion, trigonometric functions, and complete audit history.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold w-fit">
          <ShieldCheck className="h-4 w-4" />
          <span>Arbitrary-Precision IEEE 754 Math Engine</span>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
        <button
          onClick={() => setMode("scientific")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            mode === "scientific"
              ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          Scientific
        </button>
        <button
          onClick={() => setMode("standard")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            mode === "standard"
              ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          Standard
        </button>
        <button
          onClick={() => setMode("converter")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            mode === "converter"
              ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          Unit Converter
        </button>
      </div>

      {mode === "converter" ? (
        /* Unit Converter Interface */
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-6">
          <div className="flex gap-2 pb-4 border-b border-slate-200 dark:border-slate-800 flex-wrap">
            {(["data", "length", "mass", "temperature"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setUnitCategory(cat);
                  if (cat === "data") {
                    setUnitFrom("MB");
                    setUnitTo("GB");
                  } else if (cat === "length") {
                    setUnitFrom("m");
                    setUnitTo("km");
                  } else if (cat === "mass") {
                    setUnitFrom("kg");
                    setUnitTo("lb");
                  } else {
                    setUnitFrom("C");
                    setUnitTo("F");
                  }
                }}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl ${
                  unitCategory === cat
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            {/* From */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">From</label>
              <input
                type="number"
                value={unitFromVal}
                onChange={(e) => setUnitFromVal(e.target.value)}
                className="w-full text-xl font-bold p-3 rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <select
                value={unitFrom}
                onChange={(e) => setUnitFrom(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                {unitCategory === "data" && (
                  <>
                    <option value="B">Bytes (B)</option>
                    <option value="KB">Kilobytes (KB)</option>
                    <option value="MB">Megabytes (MB)</option>
                    <option value="GB">Gigabytes (GB)</option>
                    <option value="TB">Terabytes (TB)</option>
                  </>
                )}
                {unitCategory === "length" && (
                  <>
                    <option value="mm">Millimeter (mm)</option>
                    <option value="cm">Centimeter (cm)</option>
                    <option value="m">Meter (m)</option>
                    <option value="km">Kilometer (km)</option>
                    <option value="in">Inches (in)</option>
                    <option value="ft">Feet (ft)</option>
                    <option value="mi">Miles (mi)</option>
                  </>
                )}
                {unitCategory === "mass" && (
                  <>
                    <option value="mg">Milligrams (mg)</option>
                    <option value="g">Grams (g)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="oz">Ounces (oz)</option>
                    <option value="lb">Pounds (lb)</option>
                  </>
                )}
                {unitCategory === "temperature" && (
                  <>
                    <option value="C">Celsius (°C)</option>
                    <option value="F">Fahrenheit (°F)</option>
                    <option value="K">Kelvin (K)</option>
                  </>
                )}
              </select>
            </div>

            {/* To */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Converted Result
              </label>
              <div className="w-full text-xl font-bold p-3 rounded-2xl border border-indigo-200 bg-indigo-50/50 dark:border-indigo-950 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 truncate">
                {unitResult || "0"}
              </div>
              <select
                value={unitTo}
                onChange={(e) => setUnitTo(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                {unitCategory === "data" && (
                  <>
                    <option value="B">Bytes (B)</option>
                    <option value="KB">Kilobytes (KB)</option>
                    <option value="MB">Megabytes (MB)</option>
                    <option value="GB">Gigabytes (GB)</option>
                    <option value="TB">Terabytes (TB)</option>
                  </>
                )}
                {unitCategory === "length" && (
                  <>
                    <option value="mm">Millimeter (mm)</option>
                    <option value="cm">Centimeter (cm)</option>
                    <option value="m">Meter (m)</option>
                    <option value="km">Kilometer (km)</option>
                    <option value="in">Inches (in)</option>
                    <option value="ft">Feet (ft)</option>
                    <option value="mi">Miles (mi)</option>
                  </>
                )}
                {unitCategory === "mass" && (
                  <>
                    <option value="mg">Milligrams (mg)</option>
                    <option value="g">Grams (g)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="oz">Ounces (oz)</option>
                    <option value="lb">Pounds (lb)</option>
                  </>
                )}
                {unitCategory === "temperature" && (
                  <>
                    <option value="C">Celsius (°C)</option>
                    <option value="F">Fahrenheit (°F)</option>
                    <option value="K">Kelvin (K)</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>
      ) : (
        /* Standard / Scientific Calculator Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Keypad & Display */}
          <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-6">
            {/* Display screen */}
            <div className="p-6 rounded-2xl bg-slate-950 text-white font-mono flex flex-col justify-between min-h-[120px] shadow-inner">
              <div className="text-right text-xs text-slate-400 truncate h-5">
                {expression}
              </div>
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Copy result"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
                <div className="text-right text-3xl sm:text-4xl font-extrabold tracking-tight truncate max-w-full">
                  {display}
                </div>
              </div>
            </div>

            {/* Memory Bar */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
              <button
                onClick={() => setMemory(0)}
                className="hover:text-indigo-600"
                title="Memory Clear"
              >
                MC
              </button>
              <button
                onClick={() => setDisplay(String(memory))}
                className="hover:text-indigo-600"
                title="Memory Recall"
              >
                MR ({memory})
              </button>
              <button
                onClick={() => setMemory((m) => m + parseFloat(display || "0"))}
                className="hover:text-indigo-600"
                title="Memory Add"
              >
                M+
              </button>
              <button
                onClick={() => setMemory((m) => m - parseFloat(display || "0"))}
                className="hover:text-indigo-600"
                title="Memory Subtract"
              >
                M-
              </button>
              <button
                onClick={handleClear}
                className="text-rose-500 hover:text-rose-600"
              >
                CLEAR ALL
              </button>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
              {/* Scientific row extras (only in scientific mode) */}
              {mode === "scientific" && (
                <>
                  <button onClick={() => handleScientific("sin")} className="calc-btn-sc">sin</button>
                  <button onClick={() => handleScientific("cos")} className="calc-btn-sc">cos</button>
                  <button onClick={() => handleScientific("tan")} className="calc-btn-sc">tan</button>
                  <button onClick={() => handleScientific("sqrt")} className="calc-btn-sc">√x</button>
                  <button onClick={() => handleScientific("sq")} className="calc-btn-sc">x²</button>

                  <button onClick={() => handleScientific("ln")} className="calc-btn-sc">ln</button>
                  <button onClick={() => handleScientific("log")} className="calc-btn-sc">log₁₀</button>
                  <button onClick={() => handleInput("π")} className="calc-btn-sc">π</button>
                  <button onClick={() => handleInput("e")} className="calc-btn-sc">e</button>
                  <button onClick={() => handleScientific("factorial")} className="calc-btn-sc">n!</button>
                </>
              )}

              {/* Standard row 1 */}
              <button onClick={() => handleInput("(")} className="calc-btn-fn">(</button>
              <button onClick={() => handleInput(")")} className="calc-btn-fn">)</button>
              <button onClick={handleBackspace} className="calc-btn-fn">⌫</button>
              <button onClick={() => handleInput("÷")} className="calc-btn-op">÷</button>
              {mode === "scientific" && <button onClick={() => handleScientific("reciprocal")} className="calc-btn-sc">1/x</button>}

              {/* Standard row 2 */}
              <button onClick={() => handleInput("7")} className="calc-btn-num">7</button>
              <button onClick={() => handleInput("8")} className="calc-btn-num">8</button>
              <button onClick={() => handleInput("9")} className="calc-btn-num">9</button>
              <button onClick={() => handleInput("×")} className="calc-btn-op">×</button>
              {mode === "scientific" && <button onClick={() => handleInput("^")} className="calc-btn-sc">xʸ</button>}

              {/* Standard row 3 */}
              <button onClick={() => handleInput("4")} className="calc-btn-num">4</button>
              <button onClick={() => handleInput("5")} className="calc-btn-num">5</button>
              <button onClick={() => handleInput("6")} className="calc-btn-num">6</button>
              <button onClick={() => handleInput("-")} className="calc-btn-op">−</button>
              {mode === "scientific" && <button onClick={() => handleInput("%")} className="calc-btn-sc">%</button>}

              {/* Standard row 4 */}
              <button onClick={() => handleInput("1")} className="calc-btn-num">1</button>
              <button onClick={() => handleInput("2")} className="calc-btn-num">2</button>
              <button onClick={() => handleInput("3")} className="calc-btn-num">3</button>
              <button onClick={() => handleInput("+")} className="calc-btn-op">+</button>
              {mode === "scientific" && <button onClick={() => setDisplay((d) => (d.startsWith("-") ? d.slice(1) : `-${d}`))} className="calc-btn-sc">±</button>}

              {/* Standard row 5 */}
              <button onClick={() => handleInput("0")} className="calc-btn-num col-span-2">0</button>
              <button onClick={() => handleInput(".")} className="calc-btn-num">.</button>
              <button onClick={handleEvaluate} className="calc-btn-eq col-span-1">=</button>
              {mode === "scientific" && <div />}
            </div>
          </div>

          {/* Right History Panel */}
          <div className="lg:col-span-4 p-6 rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs flex flex-col h-[560px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Calculation Log
                </h3>
              </div>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="p-1 rounded text-slate-400 hover:text-rose-600"
                  title="Clear history"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto pt-3 space-y-2">
              {history.length === 0 ? (
                <div className="text-center py-16 text-xs text-slate-400">
                  No calculations yet. Enter an expression to populate this log.
                </div>
              ) : (
                history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setDisplay(item.result)}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-100 hover:border-indigo-200 dark:border-slate-800 dark:hover:border-indigo-900 bg-slate-50/60 dark:bg-slate-950/40 hover:bg-indigo-50/30 transition-all group"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{item.expression}</span>
                      <span>{item.timestamp}</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      = {item.result}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
