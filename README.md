# ReportAI 📊✨

An AI-powered document intelligence platform that transforms unstructured notes, meetings, and visual evidence into publication-ready executive reports.

Built with **Next.js 14**, **Supabase (PostgreSQL + RLS)**, and **Google Gemini 3.5 Flash**.

---

## ✨ Features

- ⚡ **Real-Time AI Streaming**: Live report generation using Google Gemini with customizable tone and depth.
- 📋 **Pre-Built Templates**: Executive Summaries, Incident Postmortems, Project Status, Meeting Minutes, and Research Briefs.
- 🔐 **Secure Authentication**: Supabase SSR authentication with server cookie management and Row-Level Security (RLS).
- 📝 **Dual-Mode Editor**: Seamlessly switch between rich Markdown Preview and raw Markdown editing.
- 📄 **Export Ready**: Download as Markdown (`.md`), copy formatted text, or print/export directly to PDF.
- 🎨 **Modern Dark UI**: Built with Tailwind CSS, Lucide React, and Radix UI primitives.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + Row-Level Security)
- **AI Engine**: [Google Gemini API](https://aistudio.google.com/) (`@google/generative-ai`)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Markdown Rendering**: React Markdown + Remark GFM

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/RamakantKhasnis/ReportAI.git
cd ReportAI
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Google Gemini API Key
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Initialize Supabase Database

Execute the SQL script located in [`supabase/schema.sql`](supabase/schema.sql) in your Supabase project's **SQL Editor**. This will create the `profiles`, `reports`, and `report_assets` tables alongside RLS security policies.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
