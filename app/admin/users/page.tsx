"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Users, Search, Shield, ShieldOff, Edit2, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function AdminUsersPage() {
  const users = useQuery(api.users.list);
  const makeAdmin = useMutation(api.users.makeAdmin);
  const updateUser = useMutation(api.users.update);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<Id<"users"> | null>(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "" });

  const filteredUsers = users?.filter(u => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q)
    );
  });

  const handleToggleAdmin = async (userId: Id<"users">) => {
    const user = users?.find(u => u._id === userId);
    if (!user) return;
    await makeAdmin({ userId, isAdmin: !user.isAdmin });
  };

  const handleEditUser = (user: { _id: Id<"users">; name?: string; phone?: string }) => {
    setEditingUser(user._id);
    setEditForm({ name: user.name || "", phone: user.phone || "" });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    await updateUser({ id: editingUser, ...editForm });
    setEditingUser(null);
  };

  return (
    <div className="p-4 sm:p-8 md:p-12 space-y-8 pb-24 bg-background text-foreground transition-colors duration-200">
      <header className="space-y-4">
        <h1 className="font-serif text-3xl md:text-5xl font-black italic uppercase text-foreground tracking-tight">
          User <span className="text-gold">Management</span>
        </h1>
        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
          Manage accounts, admin access, and customer profiles
        </p>
      </header>

      {/* Search Bar */}
      <div className="bg-card border border-border p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by name, email, or phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary border border-border pl-10 pr-4 py-3 text-xs text-foreground focus:border-gold outline-none"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border shadow-sm">
        <div className="p-6 border-b border-border flex items-center gap-2">
          <Users className="h-4 w-4 text-gold" />
          <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em]">
            Registered Users ({filteredUsers?.length || 0})
          </h2>
        </div>

        {filteredUsers === undefined ? (
          <div className="p-12 text-center text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">
            No users found
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredUsers.map((user) => (
              <div key={user._id} className="p-4 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-secondary/40 transition-colors">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-3">
                    <p className="text-foreground font-bold text-sm truncate">{user.name || "Unnamed User"}</p>
                    {user.isAdmin && (
                      <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest bg-gold/10 text-gold border border-gold/30">
                        Admin
                      </span>
                    )}
                    {user.isAnonymous && (
                      <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest bg-secondary text-muted-foreground border border-border">
                        Anonymous
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-[9px] font-bold text-muted-foreground">
                    {user.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {user.email}
                      </span>
                    )}
                    {user.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {user.phone}
                      </span>
                    )}
                    {user.pushAlertSubscriberId && (
                      <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest bg-emerald-950 text-emerald-400 border border-emerald-900/50">
                        Push Enabled
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 lg:items-end">
                  <Button 
                    onClick={() => handleEditUser(user)}
                    variant="outline" 
                    size="sm" 
                    className="bg-transparent text-muted-foreground border-border hover:text-foreground rounded-none text-[9px] font-black uppercase tracking-widest h-8"
                  >
                    <Edit2 className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button 
                    onClick={() => handleToggleAdmin(user._id)}
                    variant="outline" 
                    size="sm" 
                    className={`bg-transparent border rounded-none text-[9px] font-black uppercase tracking-widest h-8 ${
                      user.isAdmin 
                        ? "text-destructive border-destructive/30 hover:bg-destructive/10" 
                        : "text-gold border-gold/30 hover:bg-gold hover:text-primary-foreground"
                    }`}
                  >
                    {user.isAdmin ? <ShieldOff className="h-3 w-3 mr-1" /> : <Shield className="h-3 w-3 mr-1" />}
                    {user.isAdmin ? "Remove Admin" : "Make Admin"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-md p-8 shadow-2xl">
            <h3 className="font-serif text-xl font-black italic uppercase text-foreground mb-6">Edit User</h3>
            <div className="space-y-4">
              <div>
                <label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Name</label>
                <input 
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full bg-secondary border border-border p-3 text-xs text-foreground focus:border-gold outline-none"
                />
              </div>
              <div>
                <label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Phone</label>
                <input 
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  className="w-full bg-secondary border border-border p-3 text-xs text-foreground focus:border-gold outline-none"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <Button onClick={handleSaveEdit} className="flex-1 bg-gold hover:bg-gold-dark text-primary-foreground rounded-none py-4 text-[10px] font-black uppercase tracking-widest shadow-md">
                  Save
                </Button>
                <Button onClick={() => setEditingUser(null)} variant="outline" className="bg-transparent border-border text-muted-foreground hover:text-foreground rounded-none py-4 text-[10px] font-black uppercase tracking-widest px-6">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
