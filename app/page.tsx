import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, FileInput, Download } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <nav className="border-b border-slate-800 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold text-white">ReportAI</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-slate-300 hover:text-white">Login</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Turn messy notes into professional reports
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Transform your unstructured thoughts into polished, professional documents with AI-powered assistance.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                <FileInput className="h-6 w-6 text-blue-500" />
              </div>
              <CardTitle className="text-white">AI Structured</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-400">
                AI automatically structures your input into coherent sections with proper headings and formatting.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-purple-500" />
              </div>
              <CardTitle className="text-white">Multi-Input</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-400">
                Accepts text, voice recordings, uploaded files, and images to create comprehensive reports.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-4">
                <Download className="h-6 w-6 text-green-500" />
              </div>
              <CardTitle className="text-white">Export Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-400">
                Export your reports in multiple formats: PDF, DOCX, Markdown, or copy to clipboard.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-slate-400">
            <p>&copy; 2024 ReportAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
