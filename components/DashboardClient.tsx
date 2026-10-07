"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  FileText,
  Plus,
  Search,
  LogOut,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Users,
  BookOpen,
  Trash2
} from "lucide-react"

interface ReportItem {
  id: string
  title: string
  template_id: string
  tone: string
  status: string
  created_at: string
  updated_at: string
}

interface DashboardClientProps {
  userEmail: string
  initialReports: ReportItem[]
}

import type { LucideIcon } from "lucide-react"

const templateIcons: Record<string, LucideIcon> = {
  "executive-summary": TrendingUp,
  "incident-postmortem": AlertTriangle,
  "project-status": CheckCircle2,
  "meeting-minutes": Users,
  "research-brief": BookOpen
}

export function DashboardClient({ userEmail, initialReports }: DashboardClientProps) {
  const router = useRouter()
  const [reports, setReports] = useState<ReportItem[]>(initialReports)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this report?")) return

    try {
      const res = await fetch(`/api/reports/${id}`, { method: "DELETE" })
      if (res.ok) {
        setReports(reports.filter((r) => r.id !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.template_id?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || r.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalGenerated = reports.length
  const finalizedCount = reports.filter((r) => r.status === "finalized").length

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">ReportAI</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs sm:text-sm text-slate-400 font-medium">
                {userEmail}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-slate-400 hover:text-white hover:bg-slate-800 text-xs flex items-center gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Hero */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Your Reports</h1>
            <p className="text-slate-400 text-sm mt-1">
              Create, synthesize, and export your intelligent reports
            </p>
          </div>

          <Link href="/dashboard/new">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-600/20 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Create New Report</span>
            </Button>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Total Reports
            </div>
            <div className="text-3xl font-bold text-white">{totalGenerated}</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Finalized & Approved
            </div>
            <div className="text-3xl font-bold text-green-400">{finalizedCount}</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Average Generation Time
            </div>
            <div className="text-3xl font-bold text-blue-400">~2.4s</div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports by title or tag..."
              className="pl-9 bg-slate-900 border-slate-800 text-sm text-white placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {["all", "draft", "generated", "finalized"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`text-xs px-3 py-1.5 rounded-lg border capitalize transition-all ${
                  statusFilter === st
                    ? "bg-blue-600/20 border-blue-500 text-blue-300 font-medium"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Report Cards Grid */}
        {filteredReports.length === 0 ? (
          <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-12 text-center">
            <div className="h-12 w-12 rounded-xl bg-blue-600/10 text-blue-500 mx-auto flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No reports found</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
              {search
                ? "No reports matched your query. Try a different search keyword."
                : "You haven't generated any reports yet. Turn your meeting notes, logs, or ideas into a polished document."}
            </p>
            <Link href="/dashboard/new">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white font-medium">
                Create First Report
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredReports.map((report) => {
              const IconComp = templateIcons[report.template_id] || FileText
              return (
                <Link
                  key={report.id}
                  href={`/dashboard/reports/${report.id}`}
                  className="group bg-slate-900/70 border border-slate-800 hover:border-blue-500/50 rounded-xl p-5 transition-all flex flex-col justify-between hover:shadow-xl hover:shadow-blue-950/20"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-8 w-8 rounded-lg bg-blue-950/60 border border-blue-800/40 text-blue-400 flex items-center justify-center">
                        <IconComp className="h-4 w-4" />
                      </div>
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                          report.status === "finalized"
                            ? "bg-green-950/40 border-green-800 text-green-400"
                            : "bg-blue-950/40 border-blue-800 text-blue-400"
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                      {report.title}
                    </h3>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 mt-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {new Date(report.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric"
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleDelete(report.id, e)}
                        className="p-1 hover:text-red-400 transition-colors"
                        title="Delete report"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
