"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { REPORT_TEMPLATES, ReportTemplate } from "@/lib/templates"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MarkdownViewer } from "@/components/MarkdownViewer"
import {
  FileText,
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Users,
  BookOpen,
  Wand2,
  Save,
  RotateCcw
} from "lucide-react"

import type { LucideIcon } from "lucide-react"

const templateIcons: Record<string, LucideIcon> = {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Users,
  BookOpen
}

export default function NewReportPage() {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate>(REPORT_TEMPLATES[0])
  const [title, setTitle] = useState("")
  const [tone, setTone] = useState<"professional" | "technical" | "casual" | "academic">("professional")
  const [detailLevel, setDetailLevel] = useState<"concise" | "balanced" | "comprehensive">("balanced")
  const [rawNotes, setRawNotes] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamedContent, setStreamedContent] = useState("")
  const [copied, setCopied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleSelectTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template)
    if (!title || REPORT_TEMPLATES.some((t) => t.name === title)) {
      setTitle(template.name)
    }
  }

  const handleLoadSample = () => {
    setRawNotes(selectedTemplate.sampleNotes)
    if (!title) {
      setTitle(selectedTemplate.name)
    }
  }

  const handleGenerate = async () => {
    if (!rawNotes.trim()) return

    setIsGenerating(true)
    setStreamedContent("")
    setSaveError(null)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || selectedTemplate.name,
          templateId: selectedTemplate.id,
          tone,
          detailLevel,
          rawNotes
        })
      })

      if (!response.ok || !response.body) {
        throw new Error("Failed to generate report")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        accumulated += text
        setStreamedContent(accumulated)
      }
    } catch (err: unknown) {
      console.error(err)
      const message = err instanceof Error ? err.message : "An error occurred during generation."
      setSaveError(message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveReport = async () => {
    if (!streamedContent) return
    setIsSaving(true)
    setSaveError(null)

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || selectedTemplate.name,
          template_id: selectedTemplate.id,
          tone,
          detail_level: detailLevel,
          raw_input: rawNotes,
          markdown_content: streamedContent,
          tags: [selectedTemplate.id]
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to save report")
      }

      router.push(`/dashboard/reports/${data.report.id}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save report"
      setSaveError(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(streamedContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 pb-24">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400 font-medium">New Report Generator</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {!streamedContent ? (
          /* Step 1: Input & Configuration Form */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              {/* Template Selector */}
              <div>
                <Label className="text-white text-base font-semibold mb-3 block">
                  1. Select a Report Template
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {REPORT_TEMPLATES.map((tmpl) => {
                    const IconComponent = templateIcons[tmpl.icon] || FileText
                    const isSelected = selectedTemplate.id === tmpl.id
                    return (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => handleSelectTemplate(tmpl)}
                        className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between ${
                          isSelected
                            ? "bg-blue-600/15 border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500"
                            : "bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                        }`}
                      >
                        <div>
                          <div
                            className={`h-9 w-9 rounded-lg flex items-center justify-center mb-3 ${
                              isSelected ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <h4 className="font-medium text-white text-sm leading-tight mb-1">
                            {tmpl.name}
                          </h4>
                          <p className="text-xs text-slate-400 line-clamp-2">
                            {tmpl.description}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white text-sm font-semibold">
                  2. Report Title
                </Label>
                <Input
                  id="title"
                  placeholder={selectedTemplate.name}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
                />
              </div>

              {/* Raw Notes Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notes" className="text-white text-sm font-semibold">
                    3. Raw Notes, Transcripts, or Ideas
                  </Label>
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium underline-offset-4 hover:underline"
                  >
                    <Wand2 className="h-3 w-3" />
                    Load Sample Notes
                  </button>
                </div>
                <Textarea
                  id="notes"
                  rows={9}
                  placeholder={`Paste unorganized meeting notes, bullet points, brain dumps, or conversation transcripts...\n\nExample:\n- Project Alpha kicked off yesterday\n- Budget approved at $20k\n- Key obstacle: waiting on API token from security team`}
                  value={rawNotes}
                  onChange={(e) => setRawNotes(e.target.value)}
                  className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 font-mono text-sm leading-relaxed"
                />
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Markdown & bullet points supported</span>
                  <span>{rawNotes.length} characters</span>
                </div>
              </div>

              {/* Generate Button */}
              <div>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !rawNotes.trim()}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-5 w-5" />
                  {isGenerating ? "Synthesizing Report..." : "Generate Structured Report"}
                </Button>
                {saveError && (
                  <p className="text-sm text-red-400 mt-2 text-center">{saveError}</p>
                )}
              </div>
            </div>

            {/* Sidebar Controls */}
            <div className="lg:col-span-4 space-y-6">
              {/* Tone Control */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <h4 className="font-semibold text-white text-sm">Tone & Audience</h4>
                <div className="grid grid-cols-2 gap-2">
                  {(["professional", "technical", "casual", "academic"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      className={`text-xs font-medium py-2 px-3 rounded-lg border capitalize transition-all ${
                        tone === t
                          ? "bg-blue-600/20 border-blue-500 text-blue-300"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detail Level */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <h4 className="font-semibold text-white text-sm">Depth & Length</h4>
                <div className="grid grid-cols-3 gap-2">
                  {(["concise", "balanced", "comprehensive"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDetailLevel(d)}
                      className={`text-xs font-medium py-2 px-2.5 rounded-lg border capitalize transition-all ${
                        detailLevel === d
                          ? "bg-blue-600/20 border-blue-500 text-blue-300"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Suggested Sections Guide */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-3">
                <h4 className="font-semibold text-white text-sm">Target Report Structure</h4>
                <ul className="space-y-2">
                  {selectedTemplate.suggestedSections.map((sec, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      <span>{sec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          /* Step 2: Live Streamed Report Preview & Actions */
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 sticky top-20 z-30 backdrop-blur">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                <h3 className="font-semibold text-white text-base">
                  {title || selectedTemplate.name}
                </h3>
                <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded capitalize">
                  {tone}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={handleCopy}
                  className="text-slate-300 hover:text-white hover:bg-slate-800 text-xs h-9"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy Markdown
                    </>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setStreamedContent("")}
                  disabled={isGenerating}
                  className="text-slate-400 hover:text-white hover:bg-slate-800 text-xs h-9"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Edit Inputs
                </Button>

                <Button
                  onClick={handleSaveReport}
                  disabled={isSaving || isGenerating}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs h-9"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {isSaving ? "Saving..." : "Save to My Reports"}
                </Button>
              </div>
            </div>

            {saveError && (
              <div className="p-3 bg-red-900/40 border border-red-800 text-red-200 rounded-lg text-sm">
                {saveError}
              </div>
            )}

            {/* Generated Content Box */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl">
              <MarkdownViewer content={streamedContent} theme="dark" />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
