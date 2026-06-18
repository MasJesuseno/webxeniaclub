"use client";

import { useState, useRef, useCallback } from "react";

type ContentEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

type ToolbarAction = {
  label: string;
  title: string;
  icon: React.ReactNode;
  action: (textarea: HTMLTextAreaElement, currentValue: string) => string;
};

const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";
const MAX_SIZE_MB = 5;

export function ContentEditor({
  value,
  onChange,
  placeholder = "Tulis konten di sini...",
}: ContentEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [uploading, setUploading] = useState(false);

  const insertAtCursor = useCallback((before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const newText = value.substring(0, start) + before + selected + after + value.substring(end);

    onChange(newText);

    // Restore cursor position after React re-render
    requestAnimationFrame(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selected.length + after.length;
      textarea.setSelectionRange(
        selected ? start + before.length : newCursorPos,
        selected ? start + before.length + selected.length : newCursorPos
      );
    });
  }, [value, onChange]);

  const wrapSelection = useCallback((tag: string, blockTag?: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);

    if (blockTag) {
      // Block-level formatting (headings)
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const beforeLine = value.substring(lineStart, start);
      // Check if already has this tag
      const regex = new RegExp(`^<${blockTag}>`);
      if (regex.test(beforeLine)) {
        // Remove the tag
        const newText = value.substring(0, lineStart) + beforeLine.replace(regex, "") + value.substring(start);
        onChange(newText);
      } else {
        // Add the tag
        const newText = value.substring(0, lineStart) + `<${blockTag}>` + beforeLine + value.substring(start);
        onChange(newText);
      }
    } else if (selected) {
      // Inline formatting
      insertAtCursor(`<${tag}>`, `</${tag}>`);
    } else {
      // No selection - insert tag with placeholder
      insertAtCursor(`<${tag}>`, `</${tag}>`);
    }
  }, [value, onChange, insertAtCursor]);

  const insertLink = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);

    const url = prompt("Masukkan URL:", "https://");
    if (!url) return;

    if (selected) {
      insertAtCursor(`<a href="${url}" target="_blank">`, `</a>`);
    } else {
      insertAtCursor(`<a href="${url}" target="_blank">${url}</a>`);
    }
  }, [value, insertAtCursor]);

  const insertImage = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ACCEPTED_IMAGE_TYPES;

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      // Validate size
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        alert(`Ukuran file maksimal ${MAX_SIZE_MB}MB`);
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Gagal mengupload");
        }

        const data = await res.json();
        const imgTag = `<img src="${data.url}" alt="Gambar" class="max-w-full h-auto rounded-lg my-4" />`;
        insertAtCursor(imgTag);
      } catch (err: any) {
        alert(err.message || "Gagal mengupload gambar");
      } finally {
        setUploading(false);
      }
    };

    input.click();
  }, [insertAtCursor]);

  const insertList = useCallback((ordered: boolean) => {
    const tag = ordered ? "ol" : "ul";
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);

    if (selected) {
      // Wrap selected lines in list
      const lines = selected.split("\n").filter(Boolean);
      const listItems = lines.map((line) => `<li>${line}</li>`).join("\n");
      insertAtCursor(`<${tag}>\n${listItems}\n</${tag}>`);
    } else {
      // Insert sample list
      insertAtCursor(`<${tag}>\n  <li>Item 1</li>\n  <li>Item 2</li>\n  <li>Item 3</li>\n</${tag}>`);
    }
  }, [value, insertAtCursor]);

  const insertHorizontalRule = useCallback(() => {
    insertAtCursor("\n\n<hr class=\"my-8\" />\n\n");
  }, [insertAtCursor]);

  const tools: ToolbarAction[] = [
    {
      label: "B",
      title: "Tebal (Bold)",
      icon: <span className="font-bold text-sm">B</span>,
      action: () => { wrapSelection("strong"); return value; },
    },
    {
      label: "I",
      title: "Miring (Italic)",
      icon: <span className="italic text-sm font-serif">I</span>,
      action: () => { wrapSelection("em"); return value; },
    },
    {
      label: "U",
      title: "Garis Bawah (Underline)",
      icon: <span className="underline text-sm">U</span>,
      action: () => { wrapSelection("u"); return value; },
    },
    { type: "separator" as any },
    {
      label: "H2",
      title: "Heading 2",
      icon: <span className="text-sm font-bold">H2</span>,
      action: () => { wrapSelection("h2", "h2"); return value; },
    },
    {
      label: "H3",
      title: "Heading 3",
      icon: <span className="text-sm font-bold">H3</span>,
      action: () => { wrapSelection("h3", "h3"); return value; },
    },
    { type: "separator" as any },
    {
      label: "UL",
      title: "Daftar (Bullet List)",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
      action: () => { insertList(false); return value; },
    },
    {
      label: "OL",
      title: "Daftar Numbering",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
      action: () => { insertList(true); return value; },
    },
    { type: "separator" as any },
    {
      label: "Link",
      title: "Tambah Link",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
      action: () => { insertLink(); return value; },
    },
    {
      label: "IMG",
      title: "Tambah Gambar",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      action: () => { insertImage(); return value; },
    },
    { type: "separator" as any },
    {
      label: "HR",
      title: "Garis Pemisah",
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>,
      action: () => { insertHorizontalRule(); return value; },
    },
    {
      label: "Pre",
      title: "Kode (Preformatted)",
      icon: <span className="text-xs font-mono font-bold">{`</>`}</span>,
      action: () => { wrapSelection("pre"); return value; },
    },
  ] as any;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-0.5 flex-wrap bg-gray-50 border border-gray-300 rounded-t-lg p-1.5 overflow-x-auto">
        {tools.map((tool: any, i: number) =>
          tool.type === "separator" ? (
            <div key={i} className="w-px h-6 bg-gray-300 mx-1" />
          ) : (
            <button
              key={i}
              type="button"
              title={tool.title}
              onClick={() => tool.action()}
              className="px-2.5 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-md transition-colors text-sm"
            >
              {tool.icon}
            </button>
          )
        )}

        {/* Upload indicator */}
        {uploading && (
          <div className="flex items-center gap-1.5 ml-2 px-2.5 py-1.5 text-xs text-primary-600">
            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Mengupload gambar...
          </div>
        )}
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={18}
        required
        className="w-full px-4 py-3 border border-gray-300 border-t-0 rounded-b-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono leading-relaxed"
        placeholder={placeholder}
      />

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>HTML didukung. Gunakan toolbar di atas untuk formatting cepat.</span>
        <span className="text-gray-300">{value.length} karakter</span>
      </div>
    </div>
  );
}
