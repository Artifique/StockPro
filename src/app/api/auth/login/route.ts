import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const { email, password } = body as { email?: string; password?: string };

  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
  }

  const supabase = await createClient();

  // 1. Sign in with Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error || !data.user) {
    console.error("Erreur de connexion Supabase:", error);
    return NextResponse.json(
      { error: "Identifiants incorrects ou accès refusé" },
      { status: 401 }
    );
  }

  // 2. Fetch the user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json(
      { error: "Profil utilisateur introuvable" },
      { status: 403 }
    );
  }

  return NextResponse.json({ user: profile });
}
