// Theme management utilities

/**
 * Initialize theme based on user preference or system preference
 */
export const initializeTheme = () => {
  // Check if theme is stored in localStorage
  const storedTheme = localStorage.getItem("theme");

  if (storedTheme === "dark") {
    document.documentElement.classList.add("dark");
    return "dark";
  } else if (storedTheme === "light") {
    document.documentElement.classList.remove("dark");
    return "light";
  } else {
    // If no stored preference, check system preference
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    if (systemPrefersDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      return "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      return "light";
    }
  }
};

/**
 * Set theme to dark or light
 */
export const setTheme = (theme: "dark" | "light") => {
  localStorage.setItem("theme", theme);

  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  return theme;
};

/**
 * Toggle between dark and light theme
 */
export const toggleTheme = () => {
  const currentTheme = localStorage.getItem("theme") || "light";
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  return setTheme(newTheme);
};
