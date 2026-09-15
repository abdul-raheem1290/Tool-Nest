import React, { useState, useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { Breadcrumbs } from "./components/layout/Breadcrumbs";
import { SearchModal } from "./components/layout/SearchModal";
import { TOOLS_REGISTRY } from "./data/toolsData";

// Tool Components
import { ImageCompressor } from "./components/tools/ImageCompressor";
import { ImageConverter } from "./components/tools/ImageConverter";
import { DocumentConverter } from "./components/tools/DocumentConverter";
import { AiChatStudio } from "./components/tools/AiChatStudio";
import { QrCodeStudio } from "./components/tools/QrCodeStudio";
import { DocumentWriter } from "./components/tools/DocumentWriter";
import { ImageEnhancer } from "./components/tools/ImageEnhancer";
import { ProjectManager } from "./components/tools/ProjectManager";
import { SmartCalculator } from "./components/tools/SmartCalculator";
import { PasswordGenerator } from "./components/tools/PasswordGenerator";
import { TextAnalyzer } from "./components/tools/TextAnalyzer";

// Informational Pages
import { HomePage } from "./components/pages/HomePage";
import { AboutPage } from "./components/pages/AboutPage";
import { PrivacyPage } from "./components/pages/PrivacyPage";
import { TermsPage } from "./components/pages/TermsPage";
import { StatusPage } from "./components/pages/StatusPage";

export default function App() {
  const getInitialRoute = () => {
    if (typeof window === "undefined") return "home";
    const hash = window.location.hash.replace(/^#\/?/, "");
    return hash || "home";
  };

  const [currentRoute, setCurrentRoute] = useState<string>(getInitialRoute);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Sync route with URL hash for deep-linking and browser navigation history
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, "");
      setCurrentRoute(hash || "home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleNavigate = (route: string) => {
    setCurrentRoute(route);
    window.location.hash = route === "home" ? "" : route;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Find active tool metadata if current route is a tool
  const currentTool = TOOLS_REGISTRY.find(
    (t) => t.id === currentRoute || t.slug === currentRoute
  );

  // Compute breadcrumbs
  const getBreadcrumbItems = () => {
    if (currentRoute === "home") return [];

    if (currentTool) {
      return [
        { label: currentTool.categoryLabel, route: "home" },
        { label: currentTool.name },
      ];
    }

    if (currentRoute === "about") return [{ label: "About & Methodology" }];
    if (currentRoute === "privacy") return [{ label: "Privacy Policy" }];
    if (currentRoute === "terms") return [{ label: "Terms of Service" }];
    if (currentRoute === "status") return [{ label: "System Health Status" }];

    return [{ label: currentRoute }];
  };

  const breadcrumbs = getBreadcrumbItems();

  // Render main view based on currentRoute
  const renderCurrentView = () => {
    switch (currentRoute) {
      case "home":
        return (
          <HomePage
            onSelectTool={handleNavigate}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        );

      case "image-compressor":
        return <ImageCompressor />;

      case "image-converter":
        return <ImageConverter />;

      case "document-converter":
        return <DocumentConverter />;

      case "ai-chat":
        return <AiChatStudio />;

      case "qr-generator":
        return <QrCodeStudio />;

      case "document-writer":
        return <DocumentWriter />;

      case "image-enhancer":
        return <ImageEnhancer />;

      case "project-manager":
        return <ProjectManager />;

      case "smart-calculator":
        return <SmartCalculator />;

      case "password-generator":
        return <PasswordGenerator />;

      case "text-analyzer":
        return <TextAnalyzer />;

      case "about":
        return <AboutPage />;

      case "privacy":
        return <PrivacyPage />;

      case "terms":
        return <TermsPage />;

      case "status":
        return <StatusPage />;

      default:
        return (
          <HomePage
            onSelectTool={handleNavigate}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        );
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors">
        {/* Navigation Bar */}
        <Navbar
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        {/* Main Content Area */}
        <main
          id="main-app-content"
          className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
        >
          {/* Breadcrumb row on sub-pages */}
          {breadcrumbs.length > 0 && (
            <div className="mb-6">
              <Breadcrumbs items={breadcrumbs} onNavigate={handleNavigate} />
            </div>
          )}

          {/* Active View */}
          {renderCurrentView()}
        </main>

        {/* Global Footer */}
        <Footer onNavigate={handleNavigate} />

        {/* Fast Palette Search Modal (Ctrl+K) */}
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectTool={handleNavigate}
        />
      </div>
    </ThemeProvider>
  );
}
