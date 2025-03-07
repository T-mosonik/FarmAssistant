import React from "react";
import { Link } from "react-router-dom";
import {
  Home,
  MessageSquare,
  Package,
  Settings,
  ChevronRight,
  LogOut,
  BarChart3,
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

interface NavigationDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
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
    name: "AI Assistant",
    path: "/ai-chat",
    icon: <MessageSquare className="h-5 w-5" />,
    description: "AI chat and plant identification",
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

const NavigationDrawer = ({
  isOpen = true,
  onClose = () => {},
  userName = "John Farmer",
  userEmail = "john@farmassistant.com",
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=farmer",
}: NavigationDrawerProps) => {
  // Try to get user info from auth context
  try {
    const { useAuth } = require("@/contexts/AuthContext");
    const { user } = useAuth();
    if (user) {
      userName = user.name || userName;
      // Don't display email in the UI
      userAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;
    }
  } catch (error) {
    console.log("Auth context not available");
  }
  return (
    <div
      className={cn(
        "flex flex-col h-screen w-[280px] md:w-[300px] bg-background border-r border-border p-3 md:p-4 transition-all duration-300 ease-in-out",
      )}
    >
      {/* User Profile Section */}
      <div className="flex items-center space-x-4 mb-6 p-2">
        <Avatar className="h-12 w-12">
          <AvatarImage src={userAvatar} alt={userName} />
          <AvatarFallback>
            {userName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-medium truncate">{userName}</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="md:hidden"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <Separator className="mb-4" />

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        <TooltipProvider>
          {navigationItems.map((item) => (
            <Tooltip key={item.path}>
              <TooltipTrigger asChild>
                <Link to={item.path}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left h-12 mb-1 hover:bg-accent"
                  >
                    <span className="inline-flex items-center">
                      {item.icon}
                      <span className="ml-3">{item.name}</span>
                    </span>
                  </Button>
                </Link>
              </TooltipTrigger>
              {item.description && (
                <TooltipContent side="right">{item.description}</TooltipContent>
              )}
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>

      <Separator className="my-4" />

      {/* Logout Button */}
      <div className="mt-auto">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => {
            try {
              const { useAuth } = require("@/contexts/AuthContext");
              const { logout } = useAuth();
              logout().then(() => {
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
  );
};

export default NavigationDrawer;
