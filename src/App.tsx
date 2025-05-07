import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import AuthGuard from "./components/auth/AuthGuard";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import AppLayout from "./components/layout/AppLayout";

// Lazy load pages for better performance
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const AiChatNew = lazy(() => import("./pages/AiChatNew"));
const PlantIdentifier = lazy(() => import("./pages/PlantIdentifier"));
const GardenIdentifier = lazy(() => import("./pages/GardenIdentifier"));
const IdentificationResults = lazy(
  () => import("./pages/IdentificationResults"),
);
const Inventory = lazy(() => import("./pages/Inventory"));
const Settings = lazy(() => import("./pages/Settings"));
const Market = lazy(() => import("./pages/Market"));
const TaskPlanner = lazy(() => import("./pages/TaskPlanner"));

function App() {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading...</span>
          </div>
        }
      >
        <>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route
              path="/"
              element={
                <AuthGuard>
                  <AppLayout>
                    <Home />
                  </AppLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/garden-identifier"
              element={
                <AuthGuard>
                  <AppLayout>
                    <GardenIdentifier />
                  </AppLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/plant-identifier"
              element={
                <AuthGuard>
                  <AppLayout>
                    <PlantIdentifier />
                  </AppLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/inventory"
              element={
                <AuthGuard>
                  <AppLayout>
                    <Inventory />
                  </AppLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/settings"
              element={
                <AuthGuard>
                  <AppLayout>
                    <Settings />
                  </AppLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/market"
              element={
                <AuthGuard>
                  <AppLayout>
                    <Market />
                  </AppLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/task-planner"
              element={
                <AuthGuard>
                  <AppLayout>
                    <TaskPlanner />
                  </AppLayout>
                </AuthGuard>
              }
            />
            <Route
              path="/identification-results"
              element={
                <AuthGuard>
                  <IdentificationResults />
                </AuthGuard>
              }
            />
            {/* Add tempobook route for Tempo platform */}
            {import.meta.env.VITE_TEMPO === "true" && (
              <Route path="/tempobook/*" />
            )}
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        </>
      </Suspense>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
