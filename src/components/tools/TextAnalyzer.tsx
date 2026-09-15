import React, { useState, useMemo } from "react";
import { ScanText, Copy, Check, Download, Trash2, ShieldCheck, Sparkles, Filter, FileText, ArrowDownAZ, RefreshCw } from "lucide-react";
import { copyToClipboard, downloadText } from "../../utils/fileHelpers";

const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
  "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can't",
  "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
  "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having",
  "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how",
  "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself",
  "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once",
  "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she",
  "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the",
  "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll",
  "they're", "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't",
  "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where",
  "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't",
  "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves"
]);

export const TextAnalyzer: React.FC = () => {
  const [text, setText] = useState<string>(
    "ToolNest Pro is an engineering productivity platform designed with client-side execution, security, and privacy as first-class architectural principles. By executing media compression, cryptographic generation, and document parsing locally within the browser engine, ToolNest eliminates unnecessary network overhead while safeguarding sensitive research data against third-party exposure.\n\nStudents, researchers, and professional developers benefit from transparent latency, offline resilience, and robust standards-compliant outputs."
  );
  const [filterStopWords, setFilterStopWords] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Analysis computations
  const analysis = useMemo(() => {
    const raw = text;
    const charsWithSpaces = raw.length;
    const charsNoSpaces = raw.replace(/\s/g, "").length;

    // Words
    const wordList = raw.toLowerCase().match(/\b[a-z0-9'-]+\b/g) || [];
    const totalWords = wordList.length;

    // Sentences
    const sentenceList = raw.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const totalSentences = Math.max(1, sentenceList.length);

    // Paragraphs
    const paragraphList = raw.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    const totalParagraphs = Math.max(1, paragraphList.length);

    // Unique words & Lexical Density
    const uniqueWordSet = new Set(wordList);
    const uniqueWords = uniqueWordSet.size;
    const lexicalDensity = totalWords > 0 ? Math.round((uniqueWords / totalWords) * 100) : 0;

    // Average word & sentence length
    const avgWordLength = totalWords > 0 ? (charsNoSpaces / totalWords).toFixed(1) : "0";
    const avgSentenceLength = totalWords > 0 ? (totalWords / totalSentences).toFixed(1) : "0";

    // Reading & Speaking times
    const readingTimeSec = totalWords > 0 ? Math.ceil((totalWords / 225) * 60) : 0;
    const speakingTimeSec = totalWords > 0 ? Math.ceil((totalWords / 130) * 60) : 0;

    // Syllables estimation
    let totalSyllables = 0;
    wordList.forEach((w) => {
      const match = w.match(/[aeiouy]{1,2}/g);
      totalSyllables += match ? match.length : 1;
    });

    // Flesch Reading Ease = 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
    let fleschScore = 0;
    let fleschGrade = "Plain English";
    if (totalWords > 0 && totalSentences > 0) {
      fleschScore = Math.round(
        206.835 - 1.015 * (totalWords / totalSentences) - 84.6 * (totalSyllables / totalWords)
      );
      if (fleschScore >= 90) fleschGrade = "Very Easy (5th grade)";
      else if (fleschScore >= 80) fleschGrade = "Easy (6th grade)";
      else if (fleschScore >= 70) fleschGrade = "Fairly Easy (7th grade)";
      else if (fleschScore >= 60) fleschGrade = "Standard (8th-9th grade)";
      else if (fleschScore >= 50) fleschGrade = "Fairly Difficult (High School)";
      else if (fleschScore >= 30) fleschGrade = "Difficult (College Student)";
      else fleschGrade = "Very Difficult (Academic / Graduate)";
    }

    // Flesch-Kincaid Grade Level = 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
    let kincaidLevel = "0.0";
    if (totalWords > 0 && totalSentences > 0) {
      const val = 0.39 * (totalWords / totalSentences) + 11.8 * (totalSyllables / totalWords) - 15.59;
      kincaidLevel = Math.max(0, val).toFixed(1);
    }

    // Word frequency
    const freqMap: Record<string, number> = {};
    wordList.forEach((w) => {
      if (filterStopWords && STOP_WORDS.has(w)) return;
      if (w.length <= 1) return;
      freqMap[w] = (freqMap[w] || 0) + 1;
    });

    const topKeywords = Object.entries(freqMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({
        word,
        count,
        percentage: totalWords > 0 ? ((count / totalWords) * 100).toFixed(1) : "0",
      }));

    // Character distribution
    const uppercaseCount = (raw.match(/[A-Z]/g) || []).length;
    const lowercaseCount = (raw.match(/[a-z]/g) || []).length;
    const numbersCount = (raw.match(/[0-9]/g) || []).length;
    const punctuationCount = (raw.match(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'<>@]/g) || []).length;
    const whitespaceCount = (raw.match(/\s/g) || []).length;

    return {
      charsWithSpaces,
      charsNoSpaces,
      totalWords,
      totalSentences,
      totalParagraphs,
      uniqueWords,
      lexicalDensity,
      avgWordLength,
      avgSentenceLength,
      readingTimeSec,
      speakingTimeSec,
      fleschScore,
      fleschGrade,
      kincaidLevel,
      topKeywords,
      uppercaseCount,
      lowercaseCount,
      numbersCount,
      punctuationCount,
      whitespaceCount,
    };
  }, [text, filterStopWords]);

  // Transformations
  const transformCase = (type: string) => {
    switch (type) {
      case "upper":
        setText(text.toUpperCase());
        break;
      case "lower":
        setText(text.toLowerCase());
        break;
      case "title":
        setText(
          text.replace(
            /\w\S*/g,
            (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
          )
        );
        break;
      case "sentence":
        setText(
          text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase())
        );
        break;
      case "clean-spaces":
        setText(text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim());
        break;
      case "remove-duplicate-lines":
        const lines = text.split("\n");
        const unique = Array.from(new Set(lines));
        setText(unique.join("\n"));
        break;
      case "sort-az":
        const sortedLines = text.split("\n").sort((a, b) => a.localeCompare(b));
        setText(sortedLines.join("\n"));
        break;
      case "strip-html":
        setText(text.replace(/<[^>]*>/g, ""));
        break;
      default:
        break;
    }
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportReport = () => {
    const report = {
      title: "ToolNest Pro Text Analysis Report",
      generatedAt: new Date().toISOString(),
      metrics: {
        words: analysis.totalWords,
        characters: analysis.charsWithSpaces,
        charactersNoSpaces: analysis.charsNoSpaces,
        sentences: analysis.totalSentences,
        paragraphs: analysis.totalParagraphs,
        uniqueWords: analysis.uniqueWords,
        lexicalDensity: `${analysis.lexicalDensity}%`,
        fleschReadingEase: analysis.fleschScore,
        fleschKincaidGrade: analysis.kincaidLevel,
      },
      topKeywords: analysis.topKeywords,
    };
    downloadText(JSON.stringify(report, null, 2), `text-analysis-${Date.now()}.json`, "application/json");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Text Analyzer & Readability Studio
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Lexical density, keyword distribution, Flesch reading index, casing manipulation, and text cleanup.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold w-fit">
          <ShieldCheck className="h-4 w-4" />
          <span>Local Natural Language Processor</span>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Words</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{analysis.totalWords}</p>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Characters</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{analysis.charsWithSpaces}</p>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Sentences</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{analysis.totalSentences}</p>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Lexical Density</p>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{analysis.lexicalDensity}%</p>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Reading Time</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {analysis.readingTimeSec < 60 ? `${analysis.readingTimeSec}s` : `${Math.ceil(analysis.readingTimeSec / 60)}m`}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Flesch Score</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{analysis.fleschScore}</p>
        </div>
      </div>

      {/* Editor & Transformation Bar */}
      <div className="space-y-4">
        {/* Transformations Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => transformCase("upper")}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            >
              UPPERCASE
            </button>
            <button
              onClick={() => transformCase("lower")}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            >
              lowercase
            </button>
            <button
              onClick={() => transformCase("title")}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            >
              Title Case
            </button>
            <button
              onClick={() => transformCase("sentence")}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            >
              Sentence case
            </button>

            <span className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

            <button
              onClick={() => transformCase("clean-spaces")}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            >
              Clean Spaces
            </button>
            <button
              onClick={() => transformCase("remove-duplicate-lines")}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            >
              Deduplicate Lines
            </button>
            <button
              onClick={() => transformCase("sort-az")}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            >
              Sort A-Z
            </button>
            <button
              onClick={() => transformCase("strip-html")}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            >
              Strip HTML
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
            <button
              onClick={() => setText("")}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
              title="Clear text"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Textarea Input */}
        <textarea
          id="text-analyzer-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or write any document text to immediately evaluate readability, density, and frequency..."
          rows={8}
          className="w-full p-6 rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 font-sans text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
        />
      </div>

      {/* Analytical Deep Dive Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Readability and Linguistic Indices */}
        <div className="lg:col-span-6 space-y-6 p-6 rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Readability & Comprehension Indices</span>
          </h2>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Flesch Reading Ease</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{analysis.fleschGrade}</p>
              </div>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{analysis.fleschScore}/100</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Flesch-Kincaid Grade Level</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Approximate US school grade needed to comprehend</p>
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white">Grade {analysis.kincaidLevel}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-500">Avg Word Length</span>
                <p className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">{analysis.avgWordLength} characters</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-500">Avg Sentence Length</span>
                <p className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">{analysis.avgSentenceLength} words</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-500">Speaking Duration</span>
                <p className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">~{Math.ceil(analysis.speakingTimeSec / 60)} minutes</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-500">Unique Vocabulary</span>
                <p className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">{analysis.uniqueWords} unique terms</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Keyword Frequency & Character Makeup */}
        <div className="lg:col-span-6 space-y-6 p-6 rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Keyword Density (Top 10)
            </h2>
            <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
              <input
                type="checkbox"
                checked={filterStopWords}
                onChange={(e) => setFilterStopWords(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Filter common stop words
            </label>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {analysis.topKeywords.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No words detected.</p>
            ) : (
              analysis.topKeywords.map((k, idx) => (
                <div
                  key={k.word}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono w-4">{idx + 1}.</span>
                    <span className="font-bold text-slate-900 dark:text-white">{k.word}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">{k.count} occurrences</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950">
                      {k.percentage}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Character Breakdown */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Character Characterization
            </p>
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400">Uppercase</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{analysis.uppercaseCount}</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400">Lowercase</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{analysis.lowercaseCount}</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400">Digits</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{analysis.numbersCount}</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400">Punctuation</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{analysis.punctuationCount}</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400">Spaces</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{analysis.whitespaceCount}</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleExportReport}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> Export Analysis JSON Dossier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
