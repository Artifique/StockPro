import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  // Pour la sécurité, on désactive le quick-login en environnement réel
  // Il est préférable d'utiliser le login standard avec mot de passe
  return NextResponse.json({ error: "Quick Login désactivé. Veuillez utiliser le formulaire de connexion." }, { status: 403 });
}
