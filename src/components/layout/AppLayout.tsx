import React, { useState, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ResponsiveNav from "@/components/navigation/ResponsiveNav";

interface AppLayoutProps {
  children?: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps = {}) => {
  const [navOpen, setNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Check if screen is mobile size but don't auto-open nav
  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      // Don't auto-show on desktop anymore
    };

    // Initial check
    checkMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close nav on route change for mobile
  useEffect(() => {
    if (isMobile) {
      setNavOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Handle clicks outside the navigation drawer
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If nav is open and click is outside nav and not on the menu button
      if (
        navOpen &&
        navRef.current &&
        !navRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setNavOpen(false);
      }
    };

    // Add event listener for clicks on the document
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [navOpen]);

  const toggleNav = () => {
    setNavOpen(!navOpen);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Responsive Navigation */}
      <div ref={navRef}>
        <ResponsiveNav isOpen={navOpen} onClose={() => setNavOpen(false)} />
      </div>

      {/* Overlay for when nav is open on mobile */}
      {navOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-border flex items-center px-4 bg-background z-10">
          <Button
            ref={menuButtonRef}
            variant="ghost"
            size="icon"
            onClick={toggleNav}
            className="mr-4"
            aria-label="Toggle navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold truncate">FarmAssistant</h1>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 w-full">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
