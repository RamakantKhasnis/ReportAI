"use client"

import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface MarkdownViewerProps {
  content: string
  className?: string
  theme?: "dark" | "light"
}

export function MarkdownViewer({ content, className = "", theme = "dark" }: MarkdownViewerProps) {
  const isLight = theme === "light"

  return (
    <div
      className={`prose ${isLight ? "prose-slate max-w-none text-slate-800" : "prose-invert max-w-none text-slate-200"} ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className={`text-2xl md:text-3xl font-bold tracking-tight pb-3 mb-6 border-b ${isLight ? "text-slate-900 border-slate-200" : "text-white border-slate-800"}`}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={`text-xl md:text-2xl font-semibold tracking-tight mt-8 mb-4 ${isLight ? "text-slate-900" : "text-blue-400"}`}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={`text-lg md:text-xl font-medium mt-6 mb-3 ${isLight ? "text-slate-800" : "text-slate-100"}`}>
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className={`leading-relaxed mb-4 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-4 space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 mb-4 space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className={`leading-relaxed ${isLight ? "text-slate-700" : "text-slate-300"}`}>
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className={`pl-4 border-l-4 italic my-4 ${isLight ? "border-blue-500 bg-blue-50/60 text-slate-700 p-3 rounded-r" : "border-blue-500 bg-blue-950/20 text-slate-300 p-3 rounded-r"}`}>
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6 rounded-lg border border-slate-800">
              <table className={`w-full text-left text-sm ${isLight ? "text-slate-700" : "text-slate-300"}`}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className={`border-b ${isLight ? "bg-slate-100 border-slate-200 text-slate-900" : "bg-slate-900/80 border-slate-800 text-slate-200"}`}>
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className={`px-4 py-3 border-b text-sm ${isLight ? "border-slate-200" : "border-slate-800/60"}`}>
              {children}
            </td>
          ),
          hr: () => (
            <hr className={`my-8 border-t ${isLight ? "border-slate-200" : "border-slate-800"}`} />
          ),
          img: ({ src, alt }) => (
            <span className="block my-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt || "Proof Evidence"}
                className="max-h-[450px] w-auto max-w-full rounded-xl border border-slate-700/80 shadow-xl object-contain bg-slate-950/40 mx-auto"
              />
              {alt && (
                <span className="block text-center text-xs text-slate-400 mt-2 italic">
                  {alt}
                </span>
              )}
            </span>
          ),
          code: ({ children, className }) => {
            const isInline = !className
            if (isInline) {
              return (
                <code className={`px-1.5 py-0.5 rounded text-xs font-mono ${isLight ? "bg-slate-100 text-pink-600" : "bg-slate-800 text-pink-400"}`}>
                  {children}
                </code>
              )
            }
            return (
              <pre className={`p-4 rounded-lg overflow-x-auto text-xs font-mono my-4 ${isLight ? "bg-slate-100 text-slate-900 border border-slate-200" : "bg-slate-950 text-slate-200 border border-slate-800"}`}>
                <code>{children}</code>
              </pre>
            )
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
