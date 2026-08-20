"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Mail, Eye, Trash2, CheckCheck, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { Doc } from "@/convex/_generated/dataModel";

type FilterMode = "all" | "unread" | "read";

export default function AdminContactPage() {
  const [filter, setFilter] = React.useState<FilterMode>("all");
  const [selectedInquiry, setSelectedInquiry] = React.useState<Doc<"contactInquiries"> | null>(null);

  const inquiries = useQuery(api.contact.list, filter === "all" ? {} : { isRead: filter === "unread" ? false : true });
  const unreadCount = useQuery(api.contact.getUnreadCount);
  const markAsRead = useMutation(api.contact.markAsRead);
  const markAllAsRead = useMutation(api.contact.markAllAsRead);
  const removeInquiry = useMutation(api.contact.remove);

  const handleMarkAsRead = async (id: Doc<"contactInquiries">["_id"]) => {
    await markAsRead({ id });
    if (selectedInquiry?._id === id) {
      setSelectedInquiry(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setSelectedInquiry(null);
  };

  const handleDelete = async (id: Doc<"contactInquiries">["_id"]) => {
    if (!confirm("Delete this inquiry? This cannot be undone.")) return;
    await removeInquiry({ id });
    if (selectedInquiry?._id === id) {
      setSelectedInquiry(null);
    }
  };

  if (inquiries === undefined) {
    return <div className="p-12 text-center text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em]">Loading inquiries...</div>;
  }

  return (
    <div className="p-4 sm:p-8 md:p-12 space-y-8 sm:space-y-12 pb-24 relative">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 sm:space-y-4 text-center md:text-left">
          <h1 className="font-serif text-3xl sm:text-5xl font-black italic uppercase text-white tracking-tight">
            Contact <span className="text-gold">Inquiries</span>
          </h1>
          <p className="text-neutral-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">
            {unreadCount ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-neutral-900 border border-neutral-800">
            {(["all", "unread", "read"] as FilterMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                className={`px-4 py-3 text-[9px] font-black uppercase tracking-widest transition-colors ${
                  filter === mode
                    ? "bg-gold text-white"
                    : "text-neutral-500 hover:text-white"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          {unreadCount ? (
            <Button
              onClick={handleMarkAllAsRead}
              className="bg-transparent border border-gold/30 text-gold hover:bg-gold hover:text-white rounded-none py-5 px-6 text-[9px] font-black uppercase tracking-widest flex items-center gap-2"
            >
              <CheckCheck className="h-3 w-3" />
              Mark All Read
            </Button>
          ) : null}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          {inquiries.length === 0 ? (
            <div className="text-center py-20 border border-neutral-800 bg-neutral-900/30">
              <Mail className="h-8 w-8 text-neutral-700 mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">No inquiries found</p>
            </div>
          ) : (
            inquiries.map((inquiry) => (
              <button
                key={inquiry._id}
                onClick={() => setSelectedInquiry(inquiry)}
                className={`w-full text-left p-4 border transition-all ${
                  selectedInquiry?._id === inquiry._id
                    ? "bg-neutral-900 border-l-4 border-l-gold border-neutral-700"
                    : "bg-neutral-900/50 border-neutral-800 hover:border-gold/30"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`text-sm font-bold truncate flex-1 ${inquiry.isRead ? "text-neutral-400" : "text-white"}`}>
                    {inquiry.name}
                  </h3>
                  {!inquiry.isRead && (
                    <div className="w-2 h-2 rounded-full bg-gold flex-shrink-0 ml-2 mt-1" />
                  )}
                </div>
                <p className="text-[10px] text-gold font-black uppercase tracking-widest truncate">{inquiry.subject}</p>
                <p className="text-[10px] text-neutral-600 mt-1 truncate">{inquiry.message}</p>
                <p className="text-[8px] text-neutral-700 mt-2 uppercase tracking-widest">
                  {new Date(inquiry.createdAt).toLocaleString()}
                </p>
              </button>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedInquiry ? (
            <div className="bg-neutral-900/50 border border-neutral-800 p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-serif text-2xl font-black italic uppercase text-white">{selectedInquiry.subject}</h2>
                  <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mt-2">
                    From: {selectedInquiry.name} ({selectedInquiry.email})
                  </p>
                </div>
                <div className="flex gap-2">
                  {!selectedInquiry.isRead && (
                    <Button
                      onClick={() => handleMarkAsRead(selectedInquiry._id)}
                      variant="outline"
                      size="sm"
                      className="bg-transparent text-gold border-gold/30 hover:bg-gold hover:text-white rounded-none text-[9px] font-black uppercase tracking-widest flex items-center gap-2"
                    >
                      <Eye className="h-3 w-3" />
                      Mark Read
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDelete(selectedInquiry._id)}
                    variant="outline"
                    size="sm"
                    className="bg-transparent text-red-500 border-red-900/50 hover:bg-red-900 hover:text-white rounded-none text-[9px] font-black uppercase tracking-widest flex items-center gap-2"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>

              <div className="border-t border-neutral-800 pt-6">
                <p className="text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">{selectedInquiry.message}</p>
              </div>

              <div className="border-t border-neutral-800 pt-4 flex justify-between items-center">
                <p className="text-[10px] text-neutral-600 uppercase tracking-widest">
                  Received: {new Date(selectedInquiry.createdAt).toLocaleString()}
                </p>
                <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest border ${
                  selectedInquiry.isRead
                    ? "bg-neutral-800/30 text-neutral-500 border-neutral-700"
                    : "bg-gold/10 text-gold border-gold/30"
                }`}>
                  {selectedInquiry.isRead ? "Read" : "Unread"}
                </span>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border border-neutral-800 bg-neutral-900/30 min-h-[400px]">
              <div className="text-center space-y-4">
                <Mail className="h-12 w-12 text-neutral-700 mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Select an inquiry to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
