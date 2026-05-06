import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();

  const email = "admin@stockpro.com";
  const password = "adminpassword123";

  console.log(`[DEBUG-LOGIN] Attempting login for: ${email}`);

  // 1. Sign in with Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error(`[DEBUG-LOGIN] Supabase signInWithPassword failed:`, error);
    return NextResponse.json(
      { success: false, message: "Supabase signInWithPassword failed", error: error.message, details: error },
      { status: 500 }
    );
  }

  if (!data.user) {
    console.error(`[DEBUG-LOGIN] Supabase signInWithPassword returned no user data.`);
    return NextResponse.json(
      { success: false, message: "Supabase signInWithPassword returned no user data." },
      { status: 500 }
    );
  }

  // If successful, attempt to fetch profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (profileError) {
    console.error(`[DEBUG-LOGIN] Failed to fetch profile for user ${data.user.id}:`, profileError);
    return NextResponse.json(
      { success: false, message: "Failed to fetch user profile", error: profileError.message, details: profileError },
      { status: 500 }
    );
  }

  if (!profile) {
    console.error(`[DEBUG-LOGIN] No profile found for user ${data.user.id}.`);
    return NextResponse.json(
      { success: false, message: "No user profile found" },
      { status: 500 }
    );
  }


  console.log(`[DEBUG-LOGIN] Login successful for ${email}, user ID: ${data.user.id}, profile role: ${profile.role}`);
  return NextResponse.json(
    { success: true, message: "Login successful!", user: data.user, profile },
    { status: 200 }
  );
}
