"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

// ==================== TYPES ====================
interface Member {
  memberId: string
  namaLengkap: string
  namaPanggilan: string | null
  region: string | null
  isOnline: boolean
}

interface LastMessage {
  id: string
  content: string
  senderId: string
  imageUrl: string | null
  createdAt: string
  isDeleted: boolean
}

interface Conversation {
  id: string
  type: string
  name: string | null
  otherMembers: Member[]
  lastMessage: LastMessage | null
  createdAt: string
}

interface NgobrolMessage {
  id: string
  senderId: string
  content: string
  imageUrl: string | null
  isEdited: boolean
  isDeleted: boolean
  createdAt: string
}

// ==================== MAIN PAGE ====================
export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" /></div>}>
      <ChatPageContent />
    </Suspense>
  )
}

function ChatPageContent() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<"chat" | "ngobrol">(
    (searchParams.get("tab") as "chat" | "ngobrol") || "chat"
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center gap-2">
          <Link href="/member" className="text-white/70 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="font-semibold text-sm">Pesan</span>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/20">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors relative ${
              activeTab === "chat"
                ? "text-white"
                : "text-white/60 hover:text-white/80"
            }`}
          >
            Chat
            {activeTab === "chat" && (
              <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-white rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("ngobrol")}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors relative ${
              activeTab === "ngobrol"
                ? "text-white"
                : "text-white/60 hover:text-white/80"
            }`}
          >
            💬 Ngobrol Bareng
            {activeTab === "ngobrol" && (
              <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-white rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "chat" ? <DMList /> : <NgobrolChat />}
    </div>
  )
}

// ==================== DM LIST ====================
function DMList() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewChat, setShowNewChat] = useState(false)
  const [memberIdInput, setMemberIdInput] = useState("")
  const [searching, setSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<Member | null>(null)
  const [searchError, setSearchError] = useState("")

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(fetchConversations, 15000)
    return () => clearInterval(interval)
  }, [])

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/member/conversations")
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      }
    } catch {}
    setLoading(false)
  }

  const handleSearchMember = async () => {
    if (!memberIdInput.trim()) return
    setSearching(true)
    setSearchError("")
    setSearchResult(null)

    try {
      const res = await fetch(`/api/member/public/${memberIdInput.trim()}`)
      if (res.ok) {
        const data = await res.json()
        if (data.member) {
          setSearchResult(data.member)
        } else {
          setSearchError("Member tidak ditemukan")
        }
      } else {
        setSearchError("Member tidak ditemukan")
      }
    } catch {
      setSearchError("Gagal mencari member")
    }
    setSearching(false)
  }

  const handleStartChat = async (targetMemberId: string) => {
    setSearchError("")
    try {
      const res = await fetch("/api/member/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetMemberId }),
      })
      const data = await res.json()
      if (res.ok && data.conversationId) {
        setShowNewChat(false)
        setMemberIdInput("")
        setSearchResult(null)
        router.push(`/member/chat/${data.conversationId}`)
      } else {
        setSearchError(data.error || "Gagal membuat percakapan")
      }
    } catch (e) {
      setSearchError("Gagal membuat percakapan")
    }
  }

  const getInitial = (name: string) => name.charAt(0).toUpperCase()
  const getDisplayName = (m: Member) => m.namaPanggilan || m.namaLengkap

  return (
    <>
      {/* FAB New Chat */}
      <button
        onClick={() => setShowNewChat(true)}
        className="fixed bottom-24 right-4 bg-red-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-red-700 transition-all z-30"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* List */}
      <div className="divide-y divide-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">Belum ada percakapan</p>
            <p className="text-gray-400 text-xs mt-1">Klik tombol + untuk mulai chat</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const other = conv.otherMembers[0]
            if (!other) return null
            return (
              <Link
                key={conv.id}
                href={`/member/chat/${conv.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-700 font-bold text-lg">
                    {getInitial(getDisplayName(other))}
                  </div>
                  {other.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-gray-900 truncate">
                      {getDisplayName(other)}
                    </span>
                    {conv.lastMessage && (
                      <span className="text-[10px] text-gray-400 ml-2 flex-shrink-0">
                        {formatTime(conv.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-gray-500 truncate">
                      {conv.lastMessage
                        ? conv.lastMessage.isDeleted
                          ? "Pesan已被hapus"
                          : conv.lastMessage.content || "📷 Gambar"
                        : "Mulai percakapan..."}
                    </p>
                    {other.region && (
                      <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded ml-2 flex-shrink-0">
                        {other.region}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>

      {/* Modal New Chat */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Chat Baru</h3>
              <button
                onClick={() => {
                  setShowNewChat(false)
                  setMemberIdInput("")
                  setSearchResult(null)
                  setSearchError("")
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">ID Member tujuan</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={memberIdInput}
                    onChange={(e) => setMemberIdInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchMember()}
                    placeholder="Contoh: DXIC-BEN-001"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                  <button
                    onClick={handleSearchMember}
                    disabled={searching}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                  >
                    {searching ? "..." : "Cari"}
                  </button>
                </div>
              </div>
              {searchError && (
                <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">{searchError}</p>
              )}
              {searchResult && (
                <div className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-700 font-bold">
                      {getInitial(getDisplayName(searchResult))}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{getDisplayName(searchResult)}</p>
                      <p className="text-xs text-gray-500">
                        {searchResult.memberId} · {searchResult.region || "No region"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartChat(searchResult.memberId!)}
                    className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-700"
                  >
                    Chat
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ==================== NGOBROL CHAT ====================
function NgobrolChat() {
  const [messages, setMessages] = useState<NgobrolMessage[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [currentMemberId, setCurrentMemberId] = useState<string>("")
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showMenu, setShowMenu] = useState<string | null>(null)
  const [editMessage, setEditMessage] = useState<NgobrolMessage | null>(null)
  const [editContent, setEditContent] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchData = async () => {
    try {
      const res = await fetch("/api/member/ngobrol")
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
        setMembers(data.members || [])
        setCurrentMemberId(data.currentMemberId || "")
      }
    } catch {}
    setLoading(false)
  }

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/member/ngobrol")
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
        setMembers(data.members || [])
        if (!currentMemberId && data.currentMemberId) {
          setCurrentMemberId(data.currentMemberId)
        }
      }
    } catch {}
  }

  const getMemberInfo = (memberId: string) => members.find((m) => m.memberId === memberId)
  const isMe = (senderId: string) => senderId === currentMemberId

  const handleSend = async () => {
    if (!input.trim() || sending) return
    setSending(true)
    try {
      const res = await fetch("/api/member/ngobrol", {
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
        setMessages((prev) => prev.map((m) => (m.id === editMessage.id ? data.message : m)))
        setEditMessage(null)
        setEditContent("")
      }
    } catch {}
  }

  const handleDelete = async (messageId: string) => {
    if (!confirm("Hapus pesan ini?")) return
    try {
      const res = await fetch(`/api/member/messages/${messageId}`, { method: "DELETE" })
      if (res.ok) {
        setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, isDeleted: true, content: "" } : m)))
      }
    } catch {}
    setShowMenu(null)
  }

  // Group messages by date
  const groupedMessages = messages.reduce<{ date: string; msgs: NgobrolMessage[] }[]>((acc, msg) => {
    const date = new Date(msg.createdAt).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
    })
    const lastGroup = acc[acc.length - 1]
    if (lastGroup && lastGroup.date === date) {
      lastGroup.msgs.push(msg)
    } else {
      acc.push({ date, msgs: [msg] })
    }
    return acc
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    )
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 100px)" }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {groupedMessages.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-gray-500 text-sm">Belum ada pesan</p>
            <p className="text-gray-400 text-xs mt-1">Mulai ngobrol bareng teman-teman!</p>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              <div className="flex items-center justify-center my-4">
                <span className="bg-gray-200 text-gray-600 text-[10px] px-3 py-1 rounded-full">
                  {group.date}
                </span>
              </div>
              <div className="space-y-2">
                {group.msgs.map((msg) => {
                  const sender = getMemberInfo(msg.senderId)
                  const me = isMe(msg.senderId)
                  return (
                    <div key={msg.id} className={`flex ${me ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] relative group ${
                        me
                          ? "bg-red-600 text-white rounded-2xl rounded-br-md"
                          : "bg-white text-gray-900 rounded-2xl rounded-bl-md shadow-sm"
                      } px-3.5 py-2`}>
                        {!me && sender && (
                          <p className="text-[10px] font-semibold mb-0.5 text-red-600">
                            {sender.namaPanggilan || sender.namaLengkap}
                          </p>
                        )}
                        {msg.isDeleted ? (
                          <p className={`text-xs italic ${me ? "text-red-200" : "text-gray-400"}`}>Pesan已被hapus</p>
                        ) : (
                          <>
                            {msg.imageUrl && (
                              <img src={msg.imageUrl} alt="Lampiran" className="rounded-lg mb-1 max-h-48 object-cover cursor-pointer" onClick={() => window.open(msg.imageUrl!, "_blank")} />
                            )}
                            {msg.content && <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>}
                          </>
                        )}
                        <div className={`flex items-center gap-1 mt-1 ${me ? "justify-end" : "justify-start"}`}>
                          <span className={`text-[9px] ${me ? "text-red-200" : "text-gray-400"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {msg.isEdited && <span className={`text-[9px] ${me ? "text-red-200" : "text-gray-400"}`}>diedit</span>}
                          {!me && sender?.region && (
                            <span className="text-[8px] bg-gray-100 text-gray-500 px-1 rounded">{sender.region}</span>
                          )}
                        </div>
                        {me && !msg.isDeleted && (
                          <>
                            <button onClick={() => setShowMenu(showMenu === msg.id ? null : msg.id)} className="absolute top-1 -left-6 opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
                            </button>
                            {showMenu === msg.id && (
                              <div className="absolute top-8 right-0 bg-white rounded-lg shadow-lg border z-10 min-w-[120px]">
                                <button onClick={() => { setEditMessage(msg); setEditContent(msg.content); setShowMenu(null) }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-t-lg">✏️ Edit</button>
                                <button onClick={() => handleDelete(msg.id)} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg">🗑️ Hapus</button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Edit Bar */}
      {editMessage && (
        <div className="bg-amber-50 border-t border-amber-200 px-4 py-2 flex items-center gap-2">
          <div className="flex-1">
            <p className="text-[10px] text-amber-600 font-medium">Mengedit pesan</p>
            <input type="text" value={editContent} onChange={(e) => setEditContent(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleEdit()} className="w-full text-sm bg-transparent outline-none" autoFocus />
          </div>
          <button onClick={() => setEditMessage(null)} className="text-amber-600 hover:text-amber-800">✕</button>
          <button onClick={handleEdit} className="bg-amber-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-amber-700">Simpan</button>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-3 py-2">
        <div className="flex items-center gap-2">
          <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Ketik pesan untuk semua..." className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" disabled={sending} />
          <button onClick={handleSend} disabled={!input.trim() || sending} className="bg-red-600 text-white rounded-full p-2.5 hover:bg-red-700 disabled:opacity-40 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== HELPERS ====================
function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
  if (diffDays === 1) return "Kemarin"
  if (diffDays < 7) return date.toLocaleDateString("id-ID", { weekday: "long" })
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })
}
