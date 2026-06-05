import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, email, role, status } = await request.json();

    if (!email || !name) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      // Return a 500 but log clearly that the service key is missing
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable.");
      return NextResponse.json({ error: "Server configuration error: Missing service role key." }, { status: 500 });
    }

    // Create a Supabase client with the Service Role key to bypass RLS and use Admin API
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Send the invite email
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);

    if (authError) {
      console.error("Supabase Admin Auth Error:", authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // 2. Insert into the public.users table
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from("users")
      .insert([{
        name,
        email,
        role,
        status,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (dbError) {
      console.error("Supabase Admin DB Error:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: dbData });
  } catch (error: any) {
    console.error("Invite User API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
