import React from "react";
import { Outlet } from "react-router-dom";
import { Leaf } from "lucide-react";

interface OnboardingLayoutProps {
  children?: React.ReactNode;
}

const OnboardingLayout = ({ children }: OnboardingLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 sm:px-6 flex justify-center">
        <div className="flex items-center space-x-2">
          <Leaf className="h-8 w-8 text-green-600 dark:text-green-400" />
          <h1 className="text-2xl font-bold text-green-800 dark:text-green-300">
            FarmAssistant
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        {children || <Outlet />}
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© {new Date().getFullYear()} FarmAssistant. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default OnboardingLayout;
