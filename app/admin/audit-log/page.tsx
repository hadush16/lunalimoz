"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { History, ShieldCheck, Search, Filter } from "lucide-react";

export default function AdminAuditLogPage() {
  const [search, setSearch] = React.useState("");
  const logs = useQuery(api.audit.list, { limit: 200 }) || [];

  const filteredLogs = logs.filter((l: any) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.action?.toLowerCase().includes(q) ||
      l.adminEmail?.toLowerCase().includes(q) ||
      l.entity?.toLowerCase().includes(q) ||
      l.entityId?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-8 md:p-12 space-y-12 pb-24 bg-background text-foreground transition-colors duration-200">
      <header className="space-y-4">
        <h1 className="font-serif text-3xl md:text-5xl font-black italic uppercase text-foreground tracking-tight">
          Audit <span className="text-gold">Log Trail</span>
        </h1>
        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
          Immutable ledger of administrative actions, pricing edits, and cancellations
        </p>
      </header>

      {/* Search Bar */}
      <div className="bg-card border border-border p-4 shadow-sm max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter by action, admin, or entity ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-secondary border border-border pl-10 pr-4 py-2.5 text-xs text-foreground focus:border-gold outline-none"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <section className="bg-card border border-border shadow-sm">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
            <History className="h-4 w-4" /> Activity History ({filteredLogs.length})
          </h2>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs uppercase font-bold tracking-widest">
            No audit records matching criteria.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredLogs.map((log: any) => (
              <div
                key={log._id}
                className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-secondary/40 transition-colors text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-0.5 bg-secondary border border-border font-bold uppercase tracking-wider text-foreground">
                      {log.action}
                    </span>
                    <span className="text-gold font-bold uppercase tracking-widest text-[10px]">
                      {log.entity} : {log.entityId}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    Initiated by: <strong className="text-foreground">{log.adminEmail}</strong>
                  </p>
                  {log.newValue && (
                    <p className="text-muted-foreground text-[10px] font-mono truncate max-w-xl">
                      {log.newValue}
                    </p>
                  )}
                </div>

                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
