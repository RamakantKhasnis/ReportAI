import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { REPORT_TEMPLATES, type ReportTemplate } from "@/lib/templates"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const { title, templateId, tone, detailLevel, rawNotes, customInstructions } = await req.json()

    if (!rawNotes || typeof rawNotes !== "string" || !rawNotes.trim()) {
      return NextResponse.json({ error: "Raw notes are required" }, { status: 400 })
    }

    const template = REPORT_TEMPLATES.find((t) => t.id === templateId) || REPORT_TEMPLATES[0]

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY

    // Tone and detail directives
    const toneInstructions: Record<string, string> = {
      professional: "Maintain a sharp, polished corporate and executive tone suitable for C-suite and clients.",
      technical: "Use precise technical and engineering terminology with deep analytical depth.",
      casual: "Adopt an approachable, direct, and conversational tone for internal team communication.",
      academic: "Adopt an objective, formal academic prose style with structured rationale."
    }

    const detailInstructions: Record<string, string> = {
      concise: "Keep the report extremely tight, punchy, and bullet-driven. Omit unnecessary elaboration.",
      balanced: "Provide an optimal balance of thorough contextual explanation and structured bullet points.",
      comprehensive: "Deliver a deep-dive, comprehensive report covering background, nuances, detailed metrics, and forward-looking risks."
    }

    const prompt = `
${template.systemPrompt}

TARGET TITLE: ${title || template.name}
TONE: ${toneInstructions[tone] || toneInstructions.professional}
DETAIL LEVEL: ${detailInstructions[detailLevel] || detailInstructions.balanced}
${customInstructions ? `CUSTOM INSTRUCTIONS: ${customInstructions}` : ""}

EXPECTED STRUCTURE & SECTIONS:
${template.suggestedSections.map((s, idx) => `${idx + 1}. ${s}`).join("\n")}

RAW INPUT NOTES:
"""
${rawNotes}
"""

Generate the complete, publication-ready report in GitHub-flavored Markdown. 
Start directly with the top-level Markdown title (# ${title || template.name}), followed by each section (## Section Name).
Do not wrap your entire output in a single triple backtick code fence. Write pure Markdown.
`

    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey)
      const candidateModels = [
        "gemini-3.5-flash",
        "gemini-3.5-flash-lite",
        "gemini-flash-latest",
        "gemini-2.5-pro"
      ]

      let result = null
      for (const modelName of candidateModels) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName })
          result = await model.generateContentStream(prompt)
          break
        } catch (err: unknown) {
          console.warn(`Model ${modelName} unavailable, attempting next model...`, err)
        }
      }

      if (result) {
        const stream = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of result.stream) {
                const text = chunk.text()
                if (text) {
                  controller.enqueue(new TextEncoder().encode(text))
                }
              }
              controller.close()
            } catch (err) {
              controller.error(err)
            }
          }
        })

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Transfer-Encoding": "chunked",
            "Cache-Control": "no-cache, no-transform"
          }
        })
      }
    }

    // Fallback: Intelligent Simulated Streaming if no Gemini API Key is configured yet
    const fallbackText = generateFallbackReport(template, title, rawNotes)
    const stream = new ReadableStream({
      async start(controller) {
        const words = fallbackText.split(" ")
        for (let i = 0; i < words.length; i += 4) {
          const chunk = words.slice(i, i + 4).join(" ") + " "
          controller.enqueue(new TextEncoder().encode(chunk))
          await new Promise((r) => setTimeout(r, 25))
        }
        controller.close()
      }
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache, no-transform"
      }
    })
  } catch (error: unknown) {
    console.error("Report generation error:", error)
    const message = error instanceof Error ? error.message : "Failed to generate report"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function generateFallbackReport(template: ReportTemplate, title?: string, notes?: string): string {
  const reportTitle = title || template.name
  return `# ${reportTitle}

> **Notice:** Generated in Preview Mode (To enable live Gemini AI generation, add \`GEMINI_API_KEY\` to \`.env.local\`).

---

## 1. Executive Summary
This document synthesizes and structures the input notes captured during the session. The objective is to provide stakeholders with clear visibility, strategic takeaways, and actionable next steps without unnecessary overhead.

Key insights derived from the provided input:
- Primary initiatives are moving forward with measurable operational impact.
- Key bottlenecks and systemic blockers have been cataloged with mitigation plans.
- Near-term deliverables and milestones are outlined to ensure cross-functional alignment.

---

## 2. Key Findings & Synthesized Inputs

Based on the raw notes:
${(notes || "")
  .split("\n")
  .filter((l) => l.trim().length > 0)
  .slice(0, 6)
  .map((line) => `- **Observation:** ${line.replace(/^[-*•]\s*/, "")}`)
  .join("\n")}

---

## 3. Detailed Analysis & Operational Impact

| Dimension | Assessment | Recommended Action | Priority |
| :--- | :--- | :--- | :--- |
| **Operational Velocity** | On Track | Continue weekly cadence and sprint checkpoints | High |
| **Systemic Risk** | Moderate | Introduce automated safeguards and guardrails | Medium |
| **Stakeholder Alignment** | High | Distribute finalized summary to core team | P1 |

---

## 4. Strategic Recommendations & Action Items

- [ ] **Action Item 1:** Review and sign off on target deliverables by Friday.
- [ ] **Action Item 2:** Allocate necessary engineering and operational resources to clear current bottlenecks.
- [ ] **Action Item 3:** Schedule follow-up sync to evaluate metrics against projections.

---
*Report synthesized and structured by ReportAI on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.*
`
}
