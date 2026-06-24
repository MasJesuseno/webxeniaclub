"use client"

import { useState, useRef, useCallback } from "react"

interface ContentEditorProps {
  value: string
  onChange: (value: string) => void
}

export function ContentEditor({ value, onChange }: ContentEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showEmbedInput, setShowEmbedInput] = useState(false)
  const [showImageInput, setShowImageInput] = useState(false)
  const [embedUrl, setEmbedUrl] = useState("")
  const [embedHeight, setEmbedHeight] = useState("450")
  const [imageUrl, setImageUrl] = useState("")
  const [imageUploading, setImageUploading] = useState(false)
  const [imageDragOver, setImageDragOver] = useState(false)

  const insertTag = useCallback((openTag: string, closeTag: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + openTag + selectedText + closeTag + value.substring(end)

    onChange(newText)

    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + openTag.length + (selectedText ? selectedText.length : 0)
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }, [value, onChange])

  const insertImageTag = useCallback((url: string) => {
    const imgTag = `<img src="${url}" alt="Gambar" />`
    insertTag(imgTag, "")
    setImageUrl("")
    setShowImageInput(false)
  }, [insertTag])

  const handleImageFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return
    if (file.size > 5 * 1024 * 1024) return

    setImageUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Upload gagal")
      const data = await res.json()
      insertImageTag(data.url)
    } catch {
      // Silently fail - user can try again
    } finally {
      setImageUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }, [insertImageTag])

  const handleImageDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setImageDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleImageFileUpload(file)
  }, [handleImageFileUpload])

  const handleImageFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleImageFileUpload(file)
  }, [handleImageFileUpload])

  const insertLink = useCallback(() => {
    const url = prompt("Masukkan URL tautan:")
    if (url) {
      insertTag(`<a href="${url}" target="_blank">`, "</a>")
    }
  }, [insertTag])

  const insertEmbed = useCallback(() => {
    if (!embedUrl.trim()) return
    const iframeHtml = `<div class="iframe-wrapper">\n  <iframe src="${embedUrl.trim()}" width="100%" height="${embedHeight || "450"}" style="border:0;" allowfullscreen loading="lazy"></iframe>\n</div>`
    insertTag(iframeHtml, "")
    setEmbedUrl("")
    setEmbedHeight("450")
    setShowEmbedInput(false)
  }, [embedUrl, embedHeight, insertTag])

  const tools = [
    { label: "B", title: "Bold", action: () => insertTag("<strong>", "</strong>"), className: "font-bold" },
    { label: "I", title: "Italic", action: () => insertTag("<em>", "</em>"), className: "italic" },
    { label: "U", title: "Underline", action: () => insertTag("<u>", "</u>"), className: "underline" },
    { type: "divider" as const },
    { label: "H2", title: "Heading 2", action: () => insertTag("<h2>", "</h2>"), className: "font-bold text-sm" },
    { label: "H3", title: "Heading 3", action: () => insertTag("<h3>", "</h3>"), className: "font-bold text-sm" },
    { type: "divider" as const },
    { label: "•", title: "Bullet List", action: () => insertTag("<ul>\n  <li>", "</li>\n</ul>"), className: "text-lg" },
    { label: "1.", title: "Numbered List", action: () => insertTag("<ol>\n  <li>", "</li>\n</ol>"), className: "text-lg" },
    { type: "divider" as const },
    { label: "🔗", title: "Link", action: insertLink },
    { label: "🖼", title: "Image", action: () => { setShowImageInput(!showImageInput); setImageUrl(""); }, className: showImageInput ? "bg-white text-red-600 shadow-sm" : "" },
    { label: "🔲", title: "Embed Iframe", action: () => { setShowEmbedInput(!showEmbedInput); setEmbedUrl(""); setEmbedHeight("450"); }, className: showEmbedInput ? "bg-white text-red-600 shadow-sm" : "" },
    { label: "—", title: "Horizontal Rule", action: () => insertTag("\n<hr />\n", ""), className: "text-lg" },
    { label: "</>", title: "Code", action: () => insertTag("<code>", "</code>"), className: "font-mono text-xs" },
    { label: "❝", title: "Blockquote", action: () => insertTag("<blockquote>", "</blockquote>"), className: "text-lg" },
  ]

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 bg-gray-50 border-b border-gray-200">
        {tools.map((tool, i) => {
          if ("type" in tool && tool.type === "divider") {
            return <div key={i} className="w-px h-6 bg-gray-200 mx-1" />
          }
          if ("action" in tool) {
            return (
              <button
                key={i}
                type="button"
                onClick={tool.action}
                title={tool.title}
                className={`px-2.5 py-1.5 rounded-lg text-sm text-gray-700 hover:bg-white hover:text-red-600 hover:shadow-sm transition-all ${tool.className || ""}`}
              >
                {tool.label}
              </button>
            )
          }
          return null
        })}
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            showPreview ? "bg-red-600 text-white" : "text-gray-500 hover:text-red-600"
          }`}
        >
          {showPreview ? "Edit" : "Preview"}
        </button>
      </div>

      {/* Image Upload Panel */}
      {showImageInput && (
        <div className="p-3 bg-purple-50 border-b border-purple-200 space-y-3">
          <p className="text-xs font-medium text-purple-700 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Sisipkan Gambar
          </p>

          {/* Upload Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setImageDragOver(true); }}
            onDragLeave={() => setImageDragOver(false)}
            onDrop={handleImageDrop}
            onClick={() => !imageUploading && fileInputRef.current?.click()}
            className={`
              relative w-full px-4 py-6 rounded-xl border-2 border-dashed cursor-pointer text-center transition-all
              ${imageDragOver ? "border-purple-500 bg-purple-100" : "border-purple-300 hover:border-purple-400 hover:bg-purple-100/50"}
              ${imageUploading ? "pointer-events-none opacity-60" : ""}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              className="hidden"
            />
            {imageUploading ? (
              <div className="flex flex-col items-center gap-2">
                <svg className="animate-spin w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-sm text-gray-500">Mengupload...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm text-purple-700 font-medium">Klik untuk upload</span>
                <span className="text-xs text-gray-500">atau drag & drop gambar</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <div className="flex-1 border-t border-purple-200" />
            <span className="text-xs text-purple-400">atau masukkan URL</span>
            <div className="flex-1 border-t border-purple-200" />
          </div>

          {/* URL Input */}
          <div className="flex gap-2">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://contoh.com/gambar.jpg"
              className="flex-1 px-3 py-2 rounded-lg border border-purple-300 focus:ring-2 focus:ring-purple-400 outline-none text-sm bg-white"
            />
            <button
              type="button"
              onClick={() => insertImageTag(imageUrl)}
              disabled={!imageUrl.trim()}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-all disabled:opacity-50"
            >
              Sisipkan
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setShowImageInput(false); setImageUrl(""); }}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold border border-purple-300 text-purple-700 hover:bg-purple-100 transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Embed Input (optional) */}
      {showEmbedInput && (
        <div className="p-3 bg-blue-50 border-b border-blue-200 space-y-2">
          <p className="text-xs font-medium text-blue-700 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Embed Iframe — URL eksternal (Google Maps, YouTube, dll.)
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              value={embedUrl}
              onChange={(e) => setEmbedUrl(e.target.value)}
              placeholder="https://www.google.com/maps/embed?pb=..."
              className="flex-1 px-3 py-2 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-400 outline-none text-sm bg-white"
            />
            <input
              type="number"
              value={embedHeight}
              onChange={(e) => setEmbedHeight(e.target.value)}
              placeholder="Tinggi"
              className="w-20 px-3 py-2 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-400 outline-none text-sm bg-white text-center"
              title="Tinggi dalam piksel"
            />
            <span className="text-xs text-blue-600 self-center">px</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={insertEmbed}
              disabled={!embedUrl.trim()}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              Sisipkan
            </button>
            <button
              type="button"
              onClick={() => { setShowEmbedInput(false); setEmbedUrl(""); setEmbedHeight("450"); }}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold border border-blue-300 text-blue-700 hover:bg-blue-100 transition-all"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Editor / Preview */}
      {showPreview ? (
        <div
          className="editor-content p-4 min-h-[300px] bg-white"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-4 min-h-[300px] outline-none resize-y text-sm font-mono leading-relaxed bg-white"
          placeholder="Tulis konten Anda di sini... Gunakan tombol toolbar untuk memformat teks."
        />
      )}
    </div>
  )
}
