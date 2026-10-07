import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = createClient()

  const { email, password } = await request.json()

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
    },
  })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  if (authData.user && !authData.session) {
    return NextResponse.json(
      { requiresVerification: true },
      { status: 200 }
    )
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
