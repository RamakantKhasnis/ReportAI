import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface ExportPdfOptions {
  elementId: string
  filename?: string
  reportTitle?: string
}

export async function exportReportToPdf({
  elementId,
  filename = "report",
  reportTitle
}: ExportPdfOptions): Promise<void> {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found for PDF export`)
  }

  // Clone or capture with optimized print styling
  const canvas = await html2canvas(element, {
    scale: 2, // High DPI for crisp text and graphics
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
    onclone: (clonedDoc) => {
      const clonedElement = clonedDoc.getElementById(elementId)
      if (clonedElement) {
        // Enforce printable light theme for executive export
        clonedElement.style.color = "#1e293b"
        clonedElement.style.background = "#ffffff"
        clonedElement.style.padding = "24px"
        clonedElement.style.boxShadow = "none"
        clonedElement.style.border = "none"

        // Ensure all headings and text inside are dark and crisp
        const headings = clonedElement.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li, span, strong")
        headings.forEach((el) => {
          const htmlEl = el as HTMLElement
          if (htmlEl.tagName === "H1" || htmlEl.tagName === "H2" || htmlEl.tagName === "H3") {
            htmlEl.style.color = "#0f172a"
          } else {
            htmlEl.style.color = "#334155"
          }
        })

        // Enhance code blocks and tables for print
        const tables = clonedElement.querySelectorAll("table, th, td")
        tables.forEach((t) => {
          const htmlEl = t as HTMLElement
          htmlEl.style.borderColor = "#cbd5e1"
        })
      }
    }
  })

  const imgData = canvas.toDataURL("image/jpeg", 0.95)
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  })

  const pageWidth = 210
  const pageHeight = 297
  const margin = 12
  const printableWidth = pageWidth - margin * 2

  const imgWidth = printableWidth
  const imgHeight = (canvas.height * printableWidth) / canvas.width

  let heightLeft = imgHeight
  let position = margin
  let pageNumber = 1

  // First Page
  pdf.addImage(imgData, "JPEG", margin, position, imgWidth, imgHeight, undefined, "FAST")

  // Add footer to first page
  addFooter(pdf, pageNumber, reportTitle)

  heightLeft -= pageHeight - margin * 2

  // Multiple pages if document exceeds single A4 page
  while (heightLeft > 0) {
    pageNumber++
    position = margin - (imgHeight - heightLeft)
    pdf.addPage()
    pdf.addImage(imgData, "JPEG", margin, position, imgWidth, imgHeight, undefined, "FAST")
    addFooter(pdf, pageNumber, reportTitle)
    heightLeft -= pageHeight - margin * 2
  }

  const cleanFilename = (filename || "report")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_+/g, "_")

  pdf.save(`${cleanFilename}.pdf`)
}

function addFooter(pdf: jsPDF, pageNum: number, title?: string) {
  const pageHeight = 297
  const pageWidth = 210

  pdf.setFontSize(8)
  pdf.setTextColor(148, 163, 184) // Slate 400

  if (title) {
    pdf.text(title.slice(0, 40), 12, pageHeight - 8)
  }

  const pageStr = `Page ${pageNum}`
  pdf.text(pageStr, pageWidth - 12 - pdf.getTextWidth(pageStr), pageHeight - 8)
}
