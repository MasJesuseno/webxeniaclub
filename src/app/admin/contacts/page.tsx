import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import { markContactRead, deleteContact } from "@/lib/actions"

export default async function AdminContactsPage() {
  const contacts = await prisma.contact.findMany({ orderBy: { createdAt: "desc" } })
  const unreadCount = contacts.filter((c) => !c.isRead).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pesan Masuk</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-red-600 mt-1">{unreadCount} pesan belum dibaca</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {contacts.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {contacts.map((contact) => (
              <div key={contact.id} className={`p-6 hover:bg-gray-50 transition-colors ${!contact.isRead ? "bg-red-50/50" : ""}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`text-sm ${!contact.isRead ? "font-bold" : "font-medium"} text-gray-900`}>
                        {contact.name}
                      </h3>
                      {!contact.isRead && (
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                      )}
                      <span className="text-xs text-gray-400">{contact.email}</span>
                    </div>
                    {contact.subject && (
                      <p className="text-sm text-gray-700 font-medium mb-1">{contact.subject}</p>
                    )}
                    <p className="text-sm text-gray-500 whitespace-pre-wrap line-clamp-3">{contact.message}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                      <span>{formatDate(contact.createdAt)}</span>
                      {contact.phone && <span>• {contact.phone}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <form action={markContactRead.bind(null, contact.id) as unknown as (formData: FormData) => void}>
                      <button
                        type="submit"
                        className={`p-2 rounded-lg transition-all ${
                          contact.isRead
                            ? "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                            : "text-red-600 hover:bg-red-50"
                        }`}
                        title={contact.isRead ? "Tandai belum dibaca" : "Tandai sudah dibaca"}
                      >
                        <svg className="w-4 h-4" fill={contact.isRead ? "none" : "currentColor"} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </form>
                    <form action={deleteContact.bind(null, contact.id) as unknown as (formData: FormData) => void} onSubmit={(e) => { if (!confirm("Hapus pesan ini?")) e.preventDefault(); }}>
                      <button type="submit" className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Hapus">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500">Belum ada pesan masuk</p>
          </div>
        )}
      </div>
    </div>
  )
}
