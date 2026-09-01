"use client";

import { useSafeQuery, useSafeMutation } from "@/lib/convex-safe";
import { api } from "@/convex/_generated/api";
import { Mail, Eye, Trash2, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as React from "react";

type FilterMode = "all" | "unread" | "read";

export default function AdminContactPage() {
  const [filter, setFilter] = React.useState<FilterMode>("all");
  const [selectedInquiry, setSelectedInquiry] = React.useState<any | null>(null);

  const inquiriesData = useSafeQuery(api.contact.list, filter === "all" ? {} : { isRead: filter === "unread" ? false : true });
  const unreadCountData = useSafeQuery(api.contact.getUnreadCount);
  const markAsRead = useSafeMutation(api.contact.markAsRead);
  const markAllAsRead = useSafeMutation(api.contact.markAllAsRead);
  const removeInquiry = useSafeMutation(api.contact.remove);

  const inquiries = inquiriesData || [
    {
      _id: "c1",
      name: "Eleanor Vance",
      email: "eleanor.vance@executive.com",
      subject: "Corporate Account Inquiry",
      message: "We would like to set up a monthly billing corporate account for our executive team flights arriving at SEA airport.",
      isRead: false,
      createdAt: Date.now() - 3600000 * 4
    },
    {
      _id: "c2",
      name: "David Harrison",
      email: "david@harrisonlaw.com",
      subject: "Event Logistics Request",
      message: "Requesting 3 Executive Vans for an upcoming legal symposium in Bellevue on September 15th.",
      isRead: true,
      createdAt: Date.now() - 86400000 * 3
    }
  ];

  const unreadCount = unreadCountData ?? inquiries.filter((i: any) => !i.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    await markAsRead({ id });
    if (selectedInquiry?._id === id) {
      setSelectedInquiry(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setSelectedInquiry(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this inquiry? This cannot be undone.")) return;
    await removeInquiry({ id });
    if (selectedInquiry?._id === id) {
      setSelectedInquiry(null);
    }
  };

  return (
    <div className="p-4 sm:p-8 md:p-12 space-y-8 sm:space-y-12 pb-24 relative bg-background text-foreground transition-colors duration-200">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 sm:space-y-4 text-center md:text-left">
          <h1 className="font-serif text-3xl sm:text-5xl font-black italic uppercase text-foreground tracking-tight">
            Contact <span className="text-gold">Inquiries</span>
          </h1>
          <p className="text-muted-foreground text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">
            {unreadCount ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-secondary border border-border">
            {(["all", "unread", "read"] as FilterMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                className={`px-4 py-3 text-[9px] font-black uppercase tracking-widest transition-colors ${
                  filter === mode
                    ? "bg-gold text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          {unreadCount ? (
            <Button
              onClick={handleMarkAllAsRead}
              className="bg-transparent border border-gold/30 text-gold hover:bg-gold hover:text-primary-foreground rounded-none py-5 px-6 text-[9px] font-black uppercase tracking-widest flex items-center gap-2"
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
            <div className="text-center py-20 border border-border bg-card">
              <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No inquiries found</p>
            </div>
          ) : (
            inquiries.map((inquiry: any) => (
              <button
                key={inquiry._id}
                onClick={() => setSelectedInquiry(inquiry)}
                className={`w-full text-left p-4 border transition-all ${
                  selectedInquiry?._id === inquiry._id
                    ? "bg-card border-l-4 border-l-gold border-border shadow-md"
                    : "bg-secondary/50 border-border hover:border-gold/40"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`text-sm font-bold truncate flex-1 ${inquiry.isRead ? "text-muted-foreground" : "text-foreground"}`}>
                    {inquiry.name}
                  </h3>
                  {!inquiry.isRead && (
                    <div className="w-2 h-2 rounded-full bg-gold flex-shrink-0 ml-2 mt-1 shadow-[0_0_6px_var(--gold)]" />
                  )}
                </div>
                <p className="text-[10px] text-gold font-black uppercase tracking-widest truncate">{inquiry.subject}</p>
                <p className="text-[10px] text-muted-foreground mt-1 truncate">{inquiry.message}</p>
                <p className="text-[8px] text-muted-foreground/80 mt-2 uppercase tracking-widest">
                  {new Date(inquiry.createdAt).toLocaleString()}
                </p>
              </button>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedInquiry ? (
            <div className="bg-card border border-border p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-serif text-2xl font-black italic uppercase text-foreground">{selectedInquiry.subject}</h2>
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-2">
                    From: {selectedInquiry.name} ({selectedInquiry.email})
                  </p>
                </div>
                <div className="flex gap-2">
                  {!selectedInquiry.isRead && (
                    <Button
                      onClick={() => handleMarkAsRead(selectedInquiry._id)}
                      variant="outline"
                      size="sm"
                      className="bg-transparent text-gold border-gold/30 hover:bg-gold hover:text-primary-foreground rounded-none text-[9px] font-black uppercase tracking-widest flex items-center gap-2"
                    >
                      <Eye className="h-3 w-3" />
                      Mark Read
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDelete(selectedInquiry._id)}
                    variant="outline"
                    size="sm"
                    className="bg-transparent text-destructive border-destructive/30 hover:bg-destructive/10 rounded-none text-[9px] font-black uppercase tracking-widest flex items-center gap-2"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{selectedInquiry.message}</p>
              </div>

              <div className="border-t border-border pt-4 flex justify-between items-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  Received: {new Date(selectedInquiry.createdAt).toLocaleString()}
                </p>
                <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest border ${
                  selectedInquiry.isRead
                    ? "bg-secondary text-muted-foreground border-border"
                    : "bg-gold/10 text-gold border-gold/30"
                }`}>
                  {selectedInquiry.isRead ? "Read" : "Unread"}
                </span>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border border-border bg-card min-h-[400px]">
              <div className="text-center space-y-4">
                <Mail className="h-12 w-12 text-muted-foreground/40 mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select an inquiry to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
