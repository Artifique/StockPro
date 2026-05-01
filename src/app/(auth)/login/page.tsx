"use client";

import { useRouter } from "next/navigation";
import { LoginPage } from "@/features/auth/login-page";
import { addLog } from "@/lib/app-logs";
import { showToast } from "@/lib/app-toast";
import { Profile } from "@/models/system.model";

export default function LoginRoutePage() {
  const router = useRouter();

  const handleLogin = (loggedInUser: Profile) => {
    addLog(
      "LOGIN",
      loggedInUser.nom,
      loggedInUser.role,
      "Connexion réussie",
      { device: navigator.userAgent.split(" ").slice(-2).join(" ") }
    );
    router.push("/dashboard");
    setTimeout(() => {
      showToast(`Bienvenue, ${loggedInUser.nom} !`, "success");
    }, 500);
  };

  return <LoginPage onLogin={handleLogin} />;
}
