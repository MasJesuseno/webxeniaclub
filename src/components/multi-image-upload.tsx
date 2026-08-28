"use client"

import { useState, useRef } from "react"

interface MultiImageUploadProps {
  onUploadComplete: (urls: string[]) => void
  albumId: string
  label?: string
  hint?: string
}

interface UploadedFile {
  url: string
  filename: string
}

export function MultiImageUpload({ onUploadComplete, albumId, label = "Foto", hint }: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith("image/"))
    if (fileArray.length === 0) {
      setError("Pilih file gambar (PNG, JPG, WebP)")
      return
    }

    // Validate sizes
    const oversized = fileArray.find(f => f.size > 5 * 1024 * 1024)
    if (oversized) {
      setError(`File "${oversized.name}" melebihi 5MB`)
      return
    }

    setError("")
    setUploading(true)
    setProgress({ current: 0, total: fileArray.length })

    const uploadedUrls: string[] = []

    for (let i = 0; i < fileArray.length; i++) {
      setProgress({ current: i + 1, total: fileArray.length })
      
      try {
        const formData = new FormData()
        formData.append("file", fileArray[i])

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!res.ok) {
          const data = await res.json()
          console.error(`Upload gagal: ${data.error}`)
          continue
        }

        const data = await res.json()
        uploadedUrls.push(data.url)
      } catch (err) {
        console.error(`Upload error: ${err}`)
      }
    }

    setUploading(false)
    setProgress({ current: 0, total: 0 })

    if (uploadedUrls.length > 0) {
      onUploadComplete(uploadedUrls)
    } else {
      setError("Gagal mengupload semua file")
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    if (e.dataTransfer.files?.length) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFiles(e.target.files)
    }
    // Reset input so same files can be selected again
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {hint && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{hint}</span>
        </div>
      )}

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`
          relative w-full px-4 py-8 rounded-xl border-2 border-dashed
          transition-all cursor-pointer text-center
          ${dragOver
            ? "border-green-500 bg-green-50"
            : "border-gray-300 hover:border-green-400 hover:bg-green-50/30"
          }
          ${uploading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-green-600">Mengupload {progress.current}/{progress.total}</span>
              <span className="text-gray-400"> file...</span>
            </div>
            {/* Progress bar */}
            <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <div>
              <span className="text-sm font-semibold text-green-600">Klik untuk upload banyak foto</span>
              <span className="text-sm text-gray-500"> atau drag & drop</span>
            </div>
            <span className="text-xs text-gray-400">Bisa pilih banyak file sekaligus (PNG, JPG, WebP — max 5MB per file)</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}
    </div>
  )
}
