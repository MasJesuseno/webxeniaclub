"use client"

import { useEffect, useRef, useState, useCallback } from "react"

// Dynamic import for pdfjs to avoid SSR issues
let pdfjsLib: any = null

async function getPdfjs() {
  if (!pdfjsLib) {
    pdfjsLib = await import("pdfjs-dist")
    // Use local worker file (copied from node_modules to public/ )
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js"
  }
  return pdfjsLib
}

interface PdfViewerProps {
  url: string
  title: string
}

function destroyPdf(doc: any) {
  if (!doc) return
  // In pdfjs-dist v6, destroy() was removed; cleanup is optional
  try { if (typeof doc.destroy === "function") doc.destroy() } catch {}
  try { if (typeof doc.cleanup === "function") doc.cleanup() } catch {}
}

export function PdfViewer({ url, title }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [pageNum, setPageNum] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1.2)
  const pdfDocRef = useRef<any>(null)
  const renderTaskRef = useRef<any>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const renderPage = useCallback(async (num: number) => {
    if (!pdfDocRef.current || !canvasRef.current) return

    // Cancel previous render
    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel()
      } catch {}
    }

    const pdf = pdfDocRef.current
    const page = await pdf.getPage(num)

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const viewport = page.getViewport({ scale })
    canvas.width = viewport.width
    canvas.height = viewport.height

    const renderContext = {
      canvasContext: ctx,
      viewport,
    }

    try {
      renderTaskRef.current = page.render(renderContext)
      await renderTaskRef.current.promise
      renderTaskRef.current = null
    } catch (err: any) {
      if (err?.name !== "RenderingCancelledException") {
        console.error("Render error:", err)
      }
    }
  }, [scale])

  useEffect(() => {
    let cancelled = false

    async function loadPdf() {
      try {
        setLoading(true)
        setError("")
        const pdfjs = await getPdfjs()

        const loadingTask = pdfjs.getDocument({ url })
        pdf = await loadingTask.promise

        if (cancelled) {
          destroyPdf(pdf)
          return
        }

        pdfDocRef.current = pdf
        setTotalPages(pdf.numPages)
        setPageNum(1)
        setLoading(false)

        // Render halaman pertama langsung (tanpa menunggu useEffect)
        // karena pageNum sudah 1 sejak awal, React tidak akan trigger ulang
        renderPage(1)
      } catch (err: any) {
        if (!cancelled) {
          setError("Gagal memuat dokumen PDF")
          setLoading(false)
          console.error("PDF load error:", err)
        }
        // pdf cleanup already handled in unmount if needed
      }
    }

    let pdf: any = null
    loadPdf()

    return () => {
      cancelled = true
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel() } catch {}
      }
      destroyPdf(pdf)
    }
  }, [url])

  useEffect(() => {
    if (pdfDocRef.current && pageNum > 0) {
      renderPage(pageNum)
    }
  }, [pageNum, renderPage])

  const goToPrev = useCallback(() => {
    setPageNum((p) => Math.max(p - 1, 1))
  }, [])

  const goToNext = useCallback(() => {
    setPageNum((p) => Math.min(p + 1, totalPages))
  }, [totalPages])

  const zoomIn = useCallback(() => setScale((s) => Math.min(s + 0.2, 3)), [])
  const zoomOut = useCallback(() => setScale((s) => Math.max(s - 0.2, 0.4)), [])

  // Prevent right-click on canvas
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    return false
  }

  // Prevent drag and drop of images
  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault()
    return false
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <svg className="w-16 h-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p className="text-gray-600 font-medium mb-2">Gagal Memuat Dokumen</p>
        <p className="text-sm text-gray-400">Dokumen mungkin rusak atau tidak dapat diakses.</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-xl" ref={containerRef}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2 min-w-0">
          <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span className="text-sm text-gray-200 font-medium truncate">{title}</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Zoom controls */}
          <button
            onClick={zoomOut}
            className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-all"
            title="Perkecil"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-xs text-gray-400 w-12 text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={zoomIn}
            className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-all"
            title="Perbesar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          <div className="w-px h-6 bg-gray-700 mx-2" />

          {/* Page Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrev}
              disabled={pageNum <= 1}
              className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              title="Halaman sebelumnya"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-xs text-gray-300 mx-2">
              {pageNum} / {totalPages}
            </span>
            <button
              onClick={goToNext}
              disabled={pageNum >= totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              title="Halaman selanjutnya"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Area — canvas always rendered so ref is always available */}
      <div className="flex items-center justify-center p-4 bg-gray-900 min-h-[400px] overflow-auto relative">
        <div className="shadow-2xl rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            onContextMenu={handleContextMenu}
            onDragStart={handleDragStart}
            className="max-w-full h-auto bg-white cursor-default"
            style={{ userSelect: "none", WebkitUserSelect: "none" }}
          />
        </div>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm text-gray-400">Memuat dokumen...</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Info */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          Halaman {pageNum} dari {totalPages}
        </p>
        <p className="text-xs text-gray-500">
          Dokumen hanya dapat dilihat, tidak dapat diunduh
        </p>
      </div>
    </div>
  )
}
