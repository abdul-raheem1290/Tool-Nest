import React, { useState, useEffect } from "react";
import { Sun, Moon, Search, Menu, X, Layers, Sparkles, ChevronDown } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { CATEGORIES_LIST } from "../../data/toolsData";

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string, categoryFilter?: string) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onNavigate, onOpenSearch }) => {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);

  // Close dropdowns on outside click or navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCategoriesDropdownOpen(false);
  }, [currentRoute]);

  // Global Ctrl+K hotkey
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenSearch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenSearch]);

  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/85 transition-colors"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-8">
          <button
            id="brand-logo-btn"
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                  ToolNest
                </span>
                <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  PRO
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Workspace
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              id="nav-home-btn"
              onClick={() => onNavigate("home")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentRoute === "home"
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60"
              }`}
            >
              Home
            </button>

            <button
              id="nav-all-tools-btn"
              onClick={() => onNavigate("tools")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentRoute === "tools"
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60"
              }`}
            >
              All Tools
            </button>

            {/* Categories dropdown */}
            <div className="relative">
              <button
                id="nav-categories-dropdown-btn"
                onClick={() => setIsCategoriesDropdownOpen(!isCategoriesDropdownOpen)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60 transition-colors"
                aria-expanded={isCategoriesDropdownOpen}
              >
                Categories
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {isCategoriesDropdownOpen && (
                <div
                  id="categories-dropdown-menu"
                  className="absolute left-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  {CATEGORIES_LIST.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onNavigate("tools", cat.id);
                        setIsCategoriesDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm text-slate-700 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-400 transition-colors"
                    >
                      <span>{cat.name}</span>
                      <span className="text-xs text-slate-400 font-mono">{cat.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              id="nav-about-btn"
              onClick={() => onNavigate("about")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentRoute === "about"
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60"
              }`}
            >
              About
            </button>

            <button
              id="nav-contact-btn"
              onClick={() => onNavigate("contact")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentRoute === "contact"
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60"
              }`}
            >
              Contact
            </button>
          </nav>
        </div>

        {/* Right: Search, Theme Toggle, Start Working Button */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search Button */}
          <button
            id="nav-quick-search-btn"
            onClick={onOpenSearch}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100/80 px-3 py-1.5 text-xs text-slate-500 hover:border-slate-300 hover:bg-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-700 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            title="Search tools (Ctrl + K)"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Search tools...</span>
            <kbd className="hidden sm:inline-block font-mono bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded text-[10px] border border-slate-200 dark:border-slate-700">
              Ctrl K
            </kbd>
          </button>

          {/* Theme Switcher */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4 text-amber-400" />
            )}
          </button>

          {/* Start Working / Featured Quick Launch */}
          <button
            id="nav-quick-launch-btn"
            onClick={() => onNavigate("tools")}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Explore Tools
          </button>

          {/* Mobile menu trigger */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu-drawer"
          className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 dark:border-slate-800 dark:bg-slate-950 animate-in slide-in-from-top-4 duration-150"
        >
          <div className="space-y-1">
            <button
              onClick={() => onNavigate("home")}
              className="w-full flex items-center px-3 py-2 rounded-lg text-left text-sm font-medium text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              Home
            </button>
            <button
              onClick={() => onNavigate("tools")}
              className="w-full flex items-center px-3 py-2 rounded-lg text-left text-sm font-medium text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              All Tools
            </button>

            <div className="pt-2 pb-1 border-t border-slate-100 dark:border-slate-800">
              <span className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Categories
              </span>
              <div className="grid grid-cols-2 gap-1 mt-1">
                {CATEGORIES_LIST.slice(1).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => onNavigate("tools", cat.id)}
                    className="px-3 py-1.5 rounded-md text-left text-xs text-slate-600 hover:text-indigo-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-indigo-300 dark:hover:bg-slate-900"
                  >
                    {cat.name} ({cat.count})
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => onNavigate("about")}
              className="w-full flex items-center px-3 py-2 rounded-lg text-left text-sm font-medium text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              About ToolNest Pro
            </button>
            <button
              onClick={() => onNavigate("contact")}
              className="w-full flex items-center px-3 py-2 rounded-lg text-left text-sm font-medium text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              Contact Support
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
