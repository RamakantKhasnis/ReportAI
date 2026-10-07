"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MarkdownViewer } from "@/components/MarkdownViewer"
import {
  ArrowLeft,
  Save,
  Download,
  Copy,
  Check,
  Trash2,
  Eye,
  Edit3,
  Printer,
  Calendar,
  Tag
} from "lucide-react"

interface ReportData {
  id: string
  title: string
  markdown_content?: string
  template_id?: string
  tone?: string
  status?: string
  created_at: string
}

export default function ReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const reportId = params?.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<ReportData | null>(null)
  const [title, setTitle] = useState("")
  const [markdown, setMarkdown] = useState("")
  const [status, setStatus] = useState("generated")
  const [viewMode, setViewMode] = useState<"preview" | "edit">("preview")
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    async function fetchReport() {
      try {
        setLoading(true)
        const res = await fetch(`/api/reports/${reportId}`)
        if (!res.ok) {
          throw new Error("Failed to load report")
        }
        const data = await res.json()
        setReport(data.report)
        setTitle(data.report.title)
        setMarkdown(data.report.markdown_content || "")
        setStatus(data.report.status || "generated")
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load report"
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    if (reportId) {
      fetchReport()
    }
  }, [reportId])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          markdown_content: markdown,
          status
        })
      })

      if (!res.ok) throw new Error("Failed to save changes")
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2500)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save changes"
      alert(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this report? This cannot be undone.")) return
    try {
      const res = await fetch(`/api/reports/${reportId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete report")
      router.push("/dashboard")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete report"
      alert(message)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `${title.toLowerCase().replace(/\s+/g, "_")}.md`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <span>Loading report...</span>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-center text-slate-300">
        <h2 className="text-xl font-bold text-white mb-2">Report Not Found</h2>
        <p className="text-slate-400 mb-6">{error || "The requested report does not exist."}</p>
        <Link href="/dashboard">
          <Button variant="outline">Return to Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 pb-24 print:bg-white print:text-black">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-0.5 flex items-center mr-2">
              <button
                type="button"
                onClick={() => setViewMode("preview")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewMode === "preview" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("edit")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewMode === "edit" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Source</span>
              </button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="text-slate-300 hover:text-white hover:bg-slate-800 text-xs h-9"
            >
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownloadMarkdown}
              title="Download Markdown (.md)"
              className="text-slate-300 hover:text-white hover:bg-slate-800 text-xs h-9"
            >
              <Download className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrint}
              title="Print or Export to PDF"
              className="text-slate-300 hover:text-white hover:bg-slate-800 text-xs h-9"
            >
              <Printer className="h-4 w-4" />
            </Button>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs h-9 flex items-center gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Changes"}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-red-400 hover:text-red-300 hover:bg-red-950/40 text-xs h-9"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 print:p-0 print:max-w-none">
        {/* Document Header Metadata */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 mb-8 print:hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-transparent border-none text-2xl md:text-3xl font-bold text-white px-0 focus-visible:ring-0 focus-visible:border-b focus-visible:border-blue-500 rounded-none placeholder:text-slate-500"
                placeholder="Report Title..."
              />
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    Created {new Date(report.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  <span className="capitalize">{report.template_id?.replace("-", " ")}</span>
                </div>
                <span className="text-slate-500">•</span>
                <span className="capitalize text-blue-400">{report.tone} tone</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="generated">Generated</option>
                <option value="finalized">Finalized</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* View Mode: Preview or Markdown Editor */}
        {viewMode === "preview" ? (
          <article className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-12 shadow-2xl print:border-none print:shadow-none print:p-0 print:bg-transparent">
            <MarkdownViewer content={markdown} theme="dark" />
          </article>
        ) : (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
              <span>Markdown Source Editor</span>
              <span>{markdown.length} characters</span>
            </div>
            <Textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              rows={24}
              className="bg-slate-950 border-slate-800 text-slate-200 font-mono text-sm leading-relaxed"
            />
          </div>
        )}
      </main>
    </div>
  )
}
