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
  RotateCcw,
  Image as ImageIcon,
  UploadCloud,
  X,
  FileDown,
  Loader2
} from "lucide-react"
import { exportReportToPdf } from "@/lib/pdfExporter"

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
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const [imageProof, setImageProof] = useState<{
    file: File
    base64Data: string
    mimeType: string
    fileName: string
    previewUrl: string
    userInstruction: string
  } | null>(null)

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, or WEBP).")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Image size exceeds 10MB limit.")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64Data = event.target?.result as string
      setImageProof({
        file,
        base64Data,
        mimeType: file.type,
        fileName: file.name,
        previewUrl: URL.createObjectURL(file),
        userInstruction: ""
      })
    }
    reader.readAsDataURL(file)
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
          rawNotes,
          imageProof: imageProof
            ? {
                base64Data: imageProof.base64Data,
                mimeType: imageProof.mimeType,
                userInstruction: imageProof.userInstruction,
                fileName: imageProof.fileName
              }
            : undefined
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

    const finalMarkdown = imageProof
      ? streamedContent.replace(/PROOF_IMAGE_PLACEHOLDER/g, imageProof.base64Data)
      : streamedContent

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
          markdown_content: finalMarkdown,
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
    const textToCopy = imageProof
      ? streamedContent.replace(/PROOF_IMAGE_PLACEHOLDER/g, imageProof.base64Data)
      : streamedContent
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true)
      await exportReportToPdf({
        elementId: "report-printable-content-new",
        filename: title || selectedTemplate.name,
        reportTitle: title || selectedTemplate.name
      })
    } catch (err: unknown) {
      console.error("PDF export error:", err)
      alert(err instanceof Error ? err.message : "Failed to export PDF")
    } finally {
      setIsExportingPdf(false)
    }
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

              {/* Visual Evidence & Proof Image Upload */}
              <div className="space-y-3 bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-blue-400" />
                    <Label className="text-white text-sm font-semibold">
                      4. Visual Evidence & Proof (Optional)
                    </Label>
                  </div>
                  <span className="text-xs text-slate-400">PNG, JPG, WEBP (Max 10MB)</span>
                </div>

                {!imageProof ? (
                  <label className="border-2 border-dashed border-slate-800 hover:border-blue-500/50 hover:bg-blue-950/10 transition-all rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer group">
                    <UploadCloud className="h-8 w-8 text-slate-500 group-hover:text-blue-400 mb-2 transition-colors" />
                    <span className="text-xs font-medium text-slate-300 group-hover:text-white">
                      Click or drag proof image to attach
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      Charts, error screenshots, architecture diagrams, or receipts
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-lg p-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageProof.previewUrl}
                        alt="Preview"
                        className="h-16 w-16 object-cover rounded-md border border-slate-700 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{imageProof.fileName}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {(imageProof.file.size / 1024).toFixed(1)} KB • Attached for Vision Analysis
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setImageProof(null)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-md transition-colors"
                        title="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="image-instructions" className="text-xs text-slate-300 font-medium">
                        Vision Directive: How should AI analyze this image?
                      </Label>
                      <Input
                        id="image-instructions"
                        placeholder="e.g., Analyze the Q3 dip in the chart, extract error code from screenshot..."
                        value={imageProof.userInstruction}
                        onChange={(e) =>
                          setImageProof({ ...imageProof, userInstruction: e.target.value })
                        }
                        className="bg-slate-950 border-slate-800 text-xs text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                )}
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
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPdf}
                  disabled={isExportingPdf || isGenerating}
                  className="border-blue-500/30 bg-blue-500/10 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 text-xs h-9 flex items-center gap-1.5"
                >
                  {isExportingPdf ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="h-3.5 w-3.5" />
                      <span>Download PDF</span>
                    </>
                  )}
                </Button>

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
            <div
              id="report-printable-content-new"
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl"
            >
              <MarkdownViewer
                content={
                  imageProof
                    ? streamedContent.replace(/PROOF_IMAGE_PLACEHOLDER/g, imageProof.previewUrl || imageProof.base64Data)
                    : streamedContent
                }
                theme="dark"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
