import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Moon,
  Sun,
  Smartphone,
  Save,
  RefreshCw,
} from "lucide-react";
// AppLayout is already provided in App.tsx route
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Profile settings state
  const [profileSettings, setProfileSettings] = useState({
    name: "John Farmer",
    email: "john@farmassistant.com",
    phone: "+1 (555) 123-4567",
    farmName: "Green Valley Farm",
    farmDescription:
      "A 50-acre mixed farm with vegetables, fruit trees, and some livestock.",
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: true,
    weatherAlerts: true,
    marketUpdates: false,
  });

  // App settings state
  const [appSettings, setAppSettings] = useState({
    autoSync: true,
    dataUsage: "medium", // low, medium, high
    offlineMode: false,
    locationServices: true,
  });

  // Handle profile settings change
  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setProfileSettings((prev) => ({ ...prev, [name]: value }));
  };

  // Handle notification toggle
  const handleNotificationToggle = (
    setting: keyof typeof notificationSettings,
  ) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  // Handle app settings toggle
  const handleAppSettingToggle = (setting: keyof typeof appSettings) => {
    if (typeof appSettings[setting] === "boolean") {
      setAppSettings((prev) => ({
        ...prev,
        [setting]: !prev[setting],
      }));
    }
  };

  // Load theme preference from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Handle theme toggle
  const handleThemeToggle = () => {
    const newThemeMode = !isDarkMode;
    setIsDarkMode(newThemeMode);

    // Update theme in localStorage and apply it
    localStorage.setItem("theme", newThemeMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark");

    toast({
      title: `${newThemeMode ? "Dark" : "Light"} mode activated`,
      description: `Theme has been changed to ${newThemeMode ? "dark" : "light"} mode.`,
    });
  };

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedProfileSettings = localStorage.getItem("profileSettings");
    const savedNotificationSettings = localStorage.getItem(
      "notificationSettings",
    );
    const savedAppSettings = localStorage.getItem("appSettings");

    if (savedProfileSettings) {
      setProfileSettings(JSON.parse(savedProfileSettings));
    }

    if (savedNotificationSettings) {
      setNotificationSettings(JSON.parse(savedNotificationSettings));
    }

    if (savedAppSettings) {
      setAppSettings(JSON.parse(savedAppSettings));
    }
  }, []);

  // Handle save settings
  const handleSaveSettings = async () => {
    setIsLoading(true);

    try {
      // Save settings to localStorage
      localStorage.setItem("profileSettings", JSON.stringify(profileSettings));
      localStorage.setItem(
        "notificationSettings",
        JSON.stringify(notificationSettings),
      );
      localStorage.setItem("appSettings", JSON.stringify(appSettings));

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "There was a problem saving your settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center mb-6">
        <SettingsIcon className="mr-2 h-6 w-6" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4 md:mb-6 w-full">
          <TabsTrigger value="profile" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="app" className="flex items-center">
            <Smartphone className="mr-2 h-4 w-4" />
            App Settings
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your personal and farm information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={profileSettings.name}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profileSettings.email}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={profileSettings.phone}
                  onChange={handleProfileChange}
                />
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <Label htmlFor="profilePicture">Profile Picture</Label>
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full overflow-hidden border border-border">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profileSettings.name}`}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <Button type="button" variant="outline" size="sm">
                    Upload New
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended size: 200x200 pixels
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="farmName">Farm Name</Label>
                <Input
                  id="farmName"
                  name="farmName"
                  value={profileSettings.farmName}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="farmDescription">Farm Description</Label>
                <Textarea
                  id="farmDescription"
                  name="farmDescription"
                  rows={4}
                  value={profileSettings.farmDescription}
                  onChange={handleProfileChange}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveSettings} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you receive notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={() =>
                    handleNotificationToggle("emailNotifications")
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications on your device
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={() =>
                    handleNotificationToggle("pushNotifications")
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Task Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminders for upcoming and overdue tasks
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.taskReminders}
                  onCheckedChange={() =>
                    handleNotificationToggle("taskReminders")
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weather Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts for severe weather conditions
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.weatherAlerts}
                  onCheckedChange={() =>
                    handleNotificationToggle("weatherAlerts")
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Market Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Get updates on market prices and trends
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.marketUpdates}
                  onCheckedChange={() =>
                    handleNotificationToggle("marketUpdates")
                  }
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveSettings} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* App Settings */}
        <TabsContent value="app">
          <Card>
            <CardHeader>
              <CardTitle>App Settings</CardTitle>
              <CardDescription>
                Configure application preferences and behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark mode
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Sun className="h-5 w-5 text-muted-foreground" />
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={handleThemeToggle}
                  />
                  <Moon className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync data when connected
                  </p>
                </div>
                <Switch
                  checked={appSettings.autoSync}
                  onCheckedChange={() => handleAppSettingToggle("autoSync")}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Offline Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable offline functionality
                  </p>
                </div>
                <Switch
                  checked={appSettings.offlineMode}
                  onCheckedChange={() => handleAppSettingToggle("offlineMode")}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Location Services</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow app to access your location
                  </p>
                </div>
                <Switch
                  checked={appSettings.locationServices}
                  onCheckedChange={() =>
                    handleAppSettingToggle("locationServices")
                  }
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveSettings} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
