"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

interface Member {
  memberId: string
  namaLengkap: string
  namaPanggilan: string | null
  region: string | null
  isOnline: boolean
}

interface Message {
  id: string
  senderId: string
  content: string
  imageUrl: string | null
  isEdited: boolean
  isDeleted: boolean
  createdAt: string
}

interface Conversation {
  id: string
  type: string
  name: string | null
}

export default function ChatDetailPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.id as string

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [currentMemberId, setCurrentMemberId] = useState<string>("")
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editMessage, setEditMessage] = useState<Message | null>(null)
  const [editContent, setEditContent] = useState("")
  const [showMenu, setShowMenu] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Fetch current member first, then load conversation
    const init = async () => {
      try {
        const meRes = await fetch("/api/member/me")
        if (meRes.ok) {
          const meData = await meRes.json()
          if (meData.memberId) setCurrentMemberId(meData.memberId)
        }
      } catch {}
      await fetchData()
    }
    init()
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [conversationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/member/conversations/${conversationId}`)
      if (res.status === 403) {
        router.push("/member/chat")
        return
      }
      if (res.ok) {
        const data = await res.json()
        setConversation(data.conversation)
        setMessages(data.messages)
        setMembers(data.members)
      }
    } catch {}
    setLoading(false)
  }

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/member/conversations/${conversationId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages)
      }
    } catch {}
  }

  const getMemberInfo = (memberId: string) => {
    return members.find((m) => m.memberId === memberId)
  }

  const isMe = (senderId: string) => senderId === currentMemberId

  const handleSend = async () => {
    if ((!input.trim() && !input) || sending) return
    if (!input.trim()) return

    setSending(true)
    try {
      const res = await fetch(`/api/member/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input.trim() }),
      })
      if (res.ok) {
        const data = await res.json()
        setMessages((prev) => [...prev, data.message])
        setInput("")
      }
    } catch {}
    setSending(false)
    inputRef.current?.focus()
  }

  const handleEdit = async () => {
    if (!editMessage || !editContent.trim()) return

    try {
      const res = await fetch(`/api/member/messages/${editMessage.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent.trim() }),
      })
      if (res.ok) {
        const data = await res.json()
        setMessages((prev) =>
          prev.map((m) => (m.id === editMessage.id ? data.message : m))
        )
        setEditMessage(null)
        setEditContent("")
      }
    } catch {}
  }

  const handleDelete = async (messageId: string) => {
    if (!confirm("Hapus pesan ini?")) return

    try {
      const res = await fetch(`/api/member/messages/${messageId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, isDeleted: true, content: "" }
              : m
          )
        )
      }
    } catch {}
    setShowMenu(null)
  }

  const getOtherMember = () => {
    return members.find((m) => m.memberId !== currentMemberId) || members[0]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    )
  }

  const other = getOtherMember()

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <Link href="/member/chat" className="text-white/70 hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="relative">
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">
            {other ? (other.namaPanggilan || other.namaLengkap).charAt(0).toUpperCase() : "?"}
          </div>
          {other?.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-red-600" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{other ? (other.namaPanggilan || other.namaLengkap) : "Loading..."}</p>
          <p className="text-[10px] text-white/70">
            {other?.isOnline ? "Online" : other?.region || ""}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {messages.map((msg) => {
          const sender = getMemberInfo(msg.senderId)
          const me = isMe(msg.senderId)
          const showSender = !me // show name for other person

          return (
            <div key={msg.id} className={`flex ${me ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] relative group ${
                  me
                    ? "bg-red-600 text-white rounded-2xl rounded-br-md"
                    : "bg-white text-gray-900 rounded-2xl rounded-bl-md shadow-sm"
                } px-3.5 py-2`}
              >
                {/* Sender name (for group or when showing other) */}
                {showSender && sender && (
                  <p className={`text-[10px] font-semibold mb-0.5 ${me ? "text-red-200" : "text-red-600"}`}>
                    {sender.namaPanggilan || sender.namaLengkap}
                  </p>
                )}

                {msg.isDeleted ? (
                  <p className={`text-xs italic ${me ? "text-red-200" : "text-gray-400"}`}>
                    Pesan已被hapus
                  </p>
                ) : (
                  <>
                    {msg.imageUrl && (
                      <img
                        src={msg.imageUrl}
                        alt="Lampiran"
                        className="rounded-lg mb-1 max-h-48 object-cover cursor-pointer"
                        onClick={() => window.open(msg.imageUrl!, "_blank")}
                      />
                    )}
                    {msg.content && (
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    )}
                  </>
                )}

                {/* Time + edited */}
                <div className={`flex items-center gap-1 mt-1 ${me ? "justify-end" : "justify-start"}`}>
                  <span className={`text-[9px] ${me ? "text-red-200" : "text-gray-400"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {msg.isEdited && (
                    <span className={`text-[9px] ${me ? "text-red-200" : "text-gray-400"}`}>
                      diedit
                    </span>
                  )}
                  {me && (
                    <svg className={`w-3 h-3 ${me ? "text-red-200" : "text-gray-400"}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  )}
                </div>

                {/* Menu button (for own messages) */}
                {me && !msg.isDeleted && (
                  <>
                    <button
                      onClick={() => setShowMenu(showMenu === msg.id ? null : msg.id)}
                      className={`absolute top-1 ${me ? "-left-6" : "-right-6"} opacity-0 group-hover:opacity-100 transition-opacity`}
                    >
                      <svg className={`w-4 h-4 ${me ? "text-red-400" : "text-gray-400"}`} fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="12" cy="19" r="1.5" />
                      </svg>
                    </button>
                    {showMenu === msg.id && (
                      <div className="absolute top-8 right-0 bg-white rounded-lg shadow-lg border z-10 min-w-[120px]">
                        <button
                          onClick={() => {
                            setEditMessage(msg)
                            setEditContent(msg.content)
                            setShowMenu(null)
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-t-lg"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Edit Message Bar */}
      {editMessage && (
        <div className="bg-amber-50 border-t border-amber-200 px-4 py-2 flex items-center gap-2">
          <div className="flex-1">
            <p className="text-[10px] text-amber-600 font-medium">Mengedit pesan</p>
            <input
              type="text"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEdit()}
              className="w-full text-sm bg-transparent outline-none"
              autoFocus
            />
          </div>
          <button
            onClick={() => setEditMessage(null)}
            className="text-amber-600 hover:text-amber-800"
          >
            ✕
          </button>
          <button
            onClick={handleEdit}
            className="bg-amber-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-amber-700"
          >
            Simpan
          </button>
        </div>
      )}

      {/* Input Bar */}
      <div className="bg-white border-t border-gray-200 px-3 py-2 sticky bottom-0 z-40">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ketik pesan..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="bg-red-600 text-white rounded-full p-2.5 hover:bg-red-700 disabled:opacity-40 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
