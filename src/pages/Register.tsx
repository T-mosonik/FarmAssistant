import React from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "@/components/auth/RegisterForm";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const Register = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleRegister = async (values: {
    email: string;
    password: string;
  }) => {
    setIsLoading(true);
    try {
      const result = await signUp(values.email, values.password);
      if (result.success) {
        toast({
          title: "Registration successful",
          description: "Your account has been created. Please log in.",
        });
        navigate("/login");
      } else {
        toast({
          title: "Registration failed",
          description:
            result.error || "Please try again with different credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Registration error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <RegisterForm
        onRegister={handleRegister}
        onLoginClick={() => navigate("/login")}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Register;
