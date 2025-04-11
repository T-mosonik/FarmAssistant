import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import NavigationDrawer from "@/components/navigation/NavigationDrawer";

interface AppLayoutProps {
  children?: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps = {}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Check if screen is mobile size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setDrawerOpen(window.innerWidth >= 768);
    };

    // Initial check
    checkMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close drawer on route change for mobile
  useEffect(() => {
    if (isMobile) {
      setDrawerOpen(false);
    }
  }, [location.pathname, isMobile]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Navigation Drawer - fixed position with proper mobile handling */}
      <div
        className={cn(
          "z-50 transition-transform duration-300 ease-in-out h-full fixed",
          !drawerOpen
            ? "-translate-x-full"
            : "translate-x-0 w-[280px] md:w-[300px]",
        )}
      >
        <NavigationDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
      </div>

      {/* Overlay for when drawer is open */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Main Content Area - always full width */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-14 md:h-16 border-b border-border flex items-center px-3 md:px-4 bg-background">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDrawer}
            className="mr-2 md:mr-4"
            aria-label="Toggle navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg md:text-xl font-semibold">FarmAssistant</h1>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-3 md:p-6 w-full">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
