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

  // 2. Fetch the user profile or create if not found
  let profile;
  const { data: existingProfile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine
    console.error("Erreur lors de la récupération du profil:", profileError);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du profil" },
      { status: 500 }
    );
  }

  if (existingProfile) {
    profile = existingProfile;
  } else {
    // Profile not found, create a new one
    const newProfileData = {
      id: data.user.id,
      email: data.user.email,
      role: "Caissier", // Default role
      nom: data.user.email?.split('@')[0] || "Nouvel Utilisateur",
      avatar: data.user.email?.charAt(0).toUpperCase() || "NU",
      color: "#" + Math.floor(Math.random()*16777215).toString(16), // Random color
      statut: "actif",
    };

    const { data: newProfile, error: createProfileError } = await supabase
      .from("profiles")
      .insert([newProfileData])
      .select("*")
      .single();

    if (createProfileError || !newProfile) {
      console.error("Erreur lors de la création du profil:", createProfileError);
      return NextResponse.json(
        { error: "Impossible de créer le profil utilisateur" },
        { status: 500 }
      );
    }
    profile = newProfile;
  }

  return NextResponse.json({ user: profile });
}
