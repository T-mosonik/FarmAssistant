import React from "react";
import { Link } from "react-router-dom";
import {
  Home,
  MessageSquare,
  Package,
  Settings,
  LogOut,
  BarChart3,
  CalendarCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface NavigationItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  description?: string;
}

interface ResponsiveNavProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}

const navigationItems: NavigationItem[] = [
  {
    name: "Dashboard",
    path: "/",
    icon: <Home className="h-5 w-5" />,
    description: "View your farm overview",
  },
  {
    name: "Task Planner",
    path: "/task-planner",
    icon: <CalendarCheck className="h-5 w-5" />,
    description: "Manage your farm tasks and activities",
  },
  {
    name: "Garden Identifier",
    path: "/garden-identifier",
    icon: <MessageSquare className="h-5 w-5" />,
    description: "Identify and track garden pests and diseases",
  },
  {
    name: "Inventory",
    path: "/inventory",
    icon: <Package className="h-5 w-5" />,
    description: "Track inputs and outputs",
  },
  {
    name: "Market Prices",
    path: "/market",
    icon: <BarChart3 className="h-5 w-5" />,
    description: "View market prices and trends",
  },
  {
    name: "Settings",
    path: "/settings",
    icon: <Settings className="h-5 w-5" />,
    description: "Configure app preferences",
  },
];

const ResponsiveNav = ({
  isOpen,
  onClose,
  userName = "John Farmer",
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=farmer",
}: ResponsiveNavProps) => {
  // Try to get user info from auth context
  try {
    const { useAuth } = require("@/contexts/AuthContext");
    const { user } = useAuth();
    if (user) {
      userName = user.name || userName;
      userAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;
    }
  } catch (error) {
    console.log("Auth context not available");
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-background border-r border-border transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex flex-col h-full p-4">
        {/* Header with close button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={userAvatar} alt={userName} />
              <AvatarFallback>
                {userName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-medium truncate">{userName}</h2>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Separator className="mb-4" />

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto">
          <TooltipProvider>
            {navigationItems.map((item) => (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.path}
                    onClick={() => {
                      // Close nav on mobile when clicking a link
                      if (window.innerWidth < 768) onClose();
                    }}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left h-12 hover:bg-accent"
                    >
                      <span className="inline-flex items-center">
                        {item.icon}
                        <span className="ml-3">{item.name}</span>
                      </span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                {item.description && (
                  <TooltipContent side="right">
                    {item.description}
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>

        <Separator className="my-4" />

        {/* Logout Button */}
        <div>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              try {
                const { useAuth } = require("@/contexts/AuthContext");
                const { signOut } = useAuth();
                signOut().then(() => {
                  window.location.href = "/login";
                });
              } catch (error) {
                console.log("Auth context not available, using direct method");
                const { supabase } = require("@/lib/supabase");
                supabase.auth.signOut().then(() => {
                  window.location.href = "/login";
                });
              }
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default ResponsiveNav;
