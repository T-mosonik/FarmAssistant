import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { resetPassword } from "@/lib/auth";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  // Get the redirect path from location state or default to home
  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      await signIn(values.email, values.password);

      // Mark user as returning (not new)
      localStorage.setItem("isNewUser", "false");

      toast({
        title: "Login successful",
        description: "Welcome back to FarmAssistant!",
        variant: "default",
      });

      navigate(from, { replace: true });
    } catch (error) {
      toast({
        title: "Login failed",
        description:
          error instanceof Error
            ? error.message
            : "Please check your credentials",
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (values: {
    email: string;
    password: string;
    name: string;
  }) => {
    try {
      await signUp(values.email, values.password, values.name);

      // Mark user as new to direct them to onboarding
      localStorage.setItem("isNewUser", "true");

      toast({
        title: "Registration successful",
        description: "Please complete your farm setup",
        variant: "default",
      });

      navigate("/onboarding");
    } catch (error) {
      toast({
        title: "Registration failed",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleForgotPassword = async () => {
    const email = prompt("Please enter your email address");
    if (!email) return;

    try {
      await resetPassword(email);
      toast({
        title: "Password reset email sent",
        description: "Please check your email for password reset instructions",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Password reset failed",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <OnboardingLayout>
      <div className="w-full max-w-md">
        {isLogin ? (
          <LoginForm
            onLogin={handleLogin}
            onForgotPassword={handleForgotPassword}
            onRegisterClick={() => setIsLogin(false)}
          />
        ) : (
          <RegisterForm
            onRegister={handleRegister}
            onLoginClick={() => setIsLogin(true)}
          />
        )}
      </div>
    </OnboardingLayout>
  );
};

export default Login;
