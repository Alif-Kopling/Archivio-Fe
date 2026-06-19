import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";

import { WelcomeGreeting } from "@/components/common/WelcomeGreeting";
import { getUserFromToken, getRole } from "@/lib/auth";

export default function WelcomePage() {
  const navigate = useNavigate();
  const user = getUserFromToken();
  const role = getRole();
  const [countdown, setCountdown] = useState(4);

  const redirectToDashboard = useCallback(() => {
    if (role === "ADMIN") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, role]);

  useEffect(() => {
    if (countdown <= 0) {
      redirectToDashboard();

      return;
    }

    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);

    return () => clearTimeout(timer);
  }, [countdown, redirectToDashboard]);

  return (
    <div className="h-dvh w-full flex flex-col items-center justify-center bg-gradient-to-br from-background via-default-50 to-background relative overflow-hidden px-6">
      {/* Background decorative blur */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-8 z-10"
        initial={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <WelcomeGreeting userName={user?.name || "User"} />

        <motion.div
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4 mt-4"
          initial={{ opacity: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Button
            className="font-bold shadow-lg shadow-primary/20"
            size="lg"
            variant="primary"
            onPress={redirectToDashboard}
          >
            <LogIn size={16} />
            Enter Dashboard
          </Button>

          <p className="text-xs text-default-400">
            Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}...
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
