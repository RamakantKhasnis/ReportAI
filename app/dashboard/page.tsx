import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardClient } from "@/components/DashboardClient"

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/login")
  }

  // Fetch user's reports from Supabase
  const { data: reports } = await supabase
    .from("reports")
    .select("id, title, template_id, tone, status, created_at, updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <DashboardClient
      userEmail={user.email || "User"}
      initialReports={reports || []}
    />
  )
}