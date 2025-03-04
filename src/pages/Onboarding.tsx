import React from "react";
import { useNavigate } from "react-router-dom";
import FarmSetupForm from "@/components/onboarding/FarmSetupForm";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { useAuth } from "@/contexts/AuthContext";
import { updateFarmDetails } from "@/lib/profile";
import { useToast } from "@/components/ui/use-toast";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSetupComplete = async (values: any) => {
    try {
      if (!user) {
        throw new Error("You must be logged in to complete farm setup");
      }

      // Save farm details to Supabase profiles table
      await updateFarmDetails(user.id, values);

      // Mark setup as complete in local storage
      localStorage.setItem("farmSetupComplete", "true");

      toast({
        title: "Farm setup complete",
        description: "Your farm details have been saved successfully.",
        variant: "default",
      });

      navigate("/");
    } catch (error) {
      console.error("Error saving farm details:", error);
      toast({
        title: "Setup failed",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <OnboardingLayout>
      <div className="w-full max-w-2xl">
        <FarmSetupForm onSetupComplete={handleSetupComplete} />
      </div>
    </OnboardingLayout>
  );
};

export default Onboarding;
