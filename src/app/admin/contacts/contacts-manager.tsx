"use client";

import { useState } from "react";
import { markContactRead, deleteContact } from "./actions";

type Contact = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
};

export function ContactsManager({ contacts: initialContacts }: { contacts: Contact[] }) {
  const [contacts, setContacts] = useState(initialContacts);
  const [selected, setSelected] = useState<Contact | null>(null);

  async function handleMarkRead(id: number) {
    try { await markContactRead(id); window.location.reload(); }
    catch { alert("Gagal"); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus pesan ini?")) return;
    try { await deleteContact(id); window.location.reload(); }
    catch { alert("Gagal menghapus"); }
  }

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pesan Masuk</h1>
        <p className="text-gray-500 mt-1">Pesan dari form kontak website</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {contacts.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Belum ada pesan</div>
            ) : (
              contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => setSelected(contact)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                    selected?.id === contact.id ? "bg-primary-50" : ""
                  } ${!contact.isRead ? "border-l-4 border-primary-500" : ""}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm text-gray-900">{contact.name}</p>
                    {!contact.isRead && (
                      <span className="w-2 h-2 bg-primary-500 rounded-full" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{contact.subject}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(contact.createdAt)}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selected.subject}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Dari {selected.name} &lt;{selected.email}&gt;
                  </p>
                </div>
                <div className="flex gap-2">
                  {!selected.isRead && (
                    <button onClick={() => handleMarkRead(selected.id)}
                      className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                      Tandai Dibaca
                    </button>
                  )}
                  <button onClick={() => handleDelete(selected.id)}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                    Hapus
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Nama:</span>
                    <p className="font-medium">{selected.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="font-medium">{selected.email}</p>
                  </div>
                  {selected.phone && (
                    <div>
                      <span className="text-gray-500">Telepon:</span>
                      <p className="font-medium">{selected.phone}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Tanggal:</span>
                    <p className="font-medium">{formatDate(selected.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Pesan:</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selected.message}</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
              Pilih pesan untuk melihat detail
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
