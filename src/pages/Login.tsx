import React from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async (values: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const result = await signIn(values.email, values.password);
      if (result.success) {
        navigate("/");
      } else {
        toast({
          title: "Login failed",
          description:
            result.error || "Please check your credentials and try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    toast({
      title: "Password reset",
      description: "Password reset functionality will be implemented soon.",
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <LoginForm
        onLogin={handleLogin}
        onForgotPassword={handleForgotPassword}
        onRegisterClick={() => navigate("/register")}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Login;
