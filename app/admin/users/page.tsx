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
    <div className="p-4 sm:p-8 md:p-12 space-y-8 pb-24">
      <header className="space-y-4">
        <h1 className="font-serif text-3xl md:text-5xl font-black italic uppercase text-white tracking-tight">
          User <span className="text-gold">Management</span>
        </h1>
        <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em]">
          Manage accounts, admin access, and customer profiles
        </p>
      </header>

      {/* Search Bar */}
      <div className="bg-neutral-900 border border-neutral-800 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input 
            type="text" 
            placeholder="Search by name, email, or phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black border border-neutral-800 pl-10 pr-4 py-3 text-xs text-white focus:border-gold outline-none"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-neutral-900 border border-neutral-800">
        <div className="p-6 border-b border-neutral-800 flex items-center gap-2">
          <Users className="h-4 w-4 text-gold" />
          <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em]">
            Registered Users ({filteredUsers?.length || 0})
          </h2>
        </div>

        {filteredUsers === undefined ? (
          <div className="p-12 text-center text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em]">
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em]">
            No users found
          </div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {filteredUsers.map((user) => (
              <div key={user._id} className="p-4 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-neutral-800/20 transition-colors">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-3">
                    <p className="text-white font-bold text-sm truncate">{user.name || "Unnamed User"}</p>
                    {user.isAdmin && (
                      <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest bg-gold/20 text-gold border border-gold/30">
                        Admin
                      </span>
                    )}
                    {user.isAnonymous && (
                      <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest bg-neutral-800 text-neutral-400 border border-neutral-700">
                        Anonymous
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-[9px] font-bold text-neutral-400">
                    {user.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-neutral-600" />
                        {user.email}
                      </span>
                    )}
                    {user.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-neutral-600" />
                        {user.phone}
                      </span>
                    )}
                    {user.pushAlertSubscriberId && (
                      <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest bg-emerald-950 text-emerald-500 border border-emerald-900/50">
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
                    className="bg-transparent text-neutral-400 border-neutral-700 hover:text-white rounded-none text-[9px] font-black uppercase tracking-widest h-8"
                  >
                    <Edit2 className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button 
                    onClick={() => handleToggleAdmin(user._id)}
                    variant="outline" 
                    size="sm" 
                    className={`bg-transparent border rounded-none text-[9px] font-black uppercase tracking-widest h-8 ${
                      user.isAdmin 
                        ? "text-red-500 border-red-900/50 hover:bg-red-900 hover:text-white" 
                        : "text-gold border-gold/30 hover:bg-gold hover:text-white"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-md p-8">
            <h3 className="font-serif text-xl font-black italic uppercase text-white mb-6">Edit User</h3>
            <div className="space-y-4">
              <div>
                <label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Name</label>
                <input 
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full bg-black border border-neutral-800 p-3 text-xs text-white focus:border-gold outline-none"
                />
              </div>
              <div>
                <label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Phone</label>
                <input 
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  className="w-full bg-black border border-neutral-800 p-3 text-xs text-white focus:border-gold outline-none"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <Button onClick={handleSaveEdit} className="flex-1 bg-gold hover:bg-gold-dark text-white rounded-none py-4 text-[10px] font-black uppercase tracking-widest">
                  Save
                </Button>
                <Button onClick={() => setEditingUser(null)} variant="outline" className="bg-transparent border-neutral-700 text-neutral-400 hover:text-white rounded-none py-4 text-[10px] font-black uppercase tracking-widest px-6">
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
