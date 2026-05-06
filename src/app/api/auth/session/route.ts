import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  
  // 1. Get the authenticated user from Supabase
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ user: null });
  }

  // 2. Fetch the corresponding profile or create if not found
  let profile;
  const { data: existingProfile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine
    console.error("Erreur lors de la récupération du profil:", profileError);
    return NextResponse.json({ error: "Erreur lors de la récupération du profil" }, { status: 500 });
  }

  if (existingProfile) {
    profile = existingProfile;
  } else {
    // Profile not found, create a new one
    const newProfileData = {
      id: user.id,
      email: user.email,
      role: "Caissier", // Default role
      nom: user.email?.split('@')[0] || "Nouvel Utilisateur",
      avatar: user.email?.charAt(0).toUpperCase() || "NU",
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
      return NextResponse.json({ error: "Impossible de créer le profil utilisateur" }, { status: 500 });
    }
    profile = newProfile;
  }

  return NextResponse.json({ user: profile });
}
