"use client";

import * as React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Tag, Plus, Trash2, Edit2, Percent, DollarSign, Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminDiscountsPage() {
  const discounts = useQuery(api.discounts.list) || [];
  const createDiscount = useMutation(api.discounts.create);
  const updateDiscount = useMutation(api.discounts.update);
  const removeDiscount = useMutation(api.discounts.remove);
  const logAudit = useMutation(api.audit.logAction);

  const [showNewModal, setShowNewModal] = React.useState(false);
  const [form, setForm] = React.useState({
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    value: 10,
    minSpend: 100,
    expiryDate: "",
    maxUses: 100,
    isActive: true,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) return;

    try {
      const id = await createDiscount({
        code: form.code,
        discountType: form.discountType,
        value: form.value,
        minSpend: form.minSpend || undefined,
        expiryDate: form.expiryDate || undefined,
        maxUses: form.maxUses || undefined,
        isActive: form.isActive,
      });

      await logAudit({
        adminEmail: "admin@lunalimoz.com",
        action: "CREATE_DISCOUNT_CODE",
        entity: "discounts",
        entityId: id,
        newValue: JSON.stringify(form),
      });

      setShowNewModal(false);
      setForm({
        code: "",
        discountType: "percentage",
        value: 10,
        minSpend: 100,
        expiryDate: "",
        maxUses: 100,
        isActive: true,
      });
    } catch (err: any) {
      alert(err.message || "Failed to create discount code");
    }
  };

  const handleToggleActive = async (discount: any) => {
    await updateDiscount({
      id: discount._id,
      isActive: !discount.isActive,
    });
    await logAudit({
      adminEmail: "admin@lunalimoz.com",
      action: "TOGGLE_DISCOUNT_STATUS",
      entity: "discounts",
      entityId: discount._id,
      newValue: String(!discount.isActive),
    });
  };

  const handleDelete = async (id: any) => {
    if (!confirm("Are you sure you want to delete this discount code?")) return;
    await removeDiscount({ id });
    await logAudit({
      adminEmail: "admin@lunalimoz.com",
      action: "DELETE_DISCOUNT_CODE",
      entity: "discounts",
      entityId: id,
    });
  };

  return (
    <div className="p-4 sm:p-8 md:p-12 space-y-12 pb-24 bg-background text-foreground transition-colors duration-200">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-4">
          <h1 className="font-serif text-3xl md:text-5xl font-black italic uppercase text-foreground tracking-tight">
            Promotional <span className="text-gold">Discounts</span>
          </h1>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
            Create and track promotional codes and corporate vouchers
          </p>
        </div>
        <Button
          onClick={() => setShowNewModal(true)}
          className="bg-gold hover:bg-gold-dark text-primary-foreground rounded-none text-[10px] font-black uppercase tracking-widest py-6 px-6 flex items-center gap-2 shadow-md"
        >
          <Plus className="h-4 w-4" /> Create Promo Code
        </Button>
      </header>

      {/* Discounts List */}
      <section className="bg-card border border-border shadow-sm">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
            <Tag className="h-4 w-4" /> Configured Promo Codes
          </h2>
          <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
            {discounts.length} Codes
          </span>
        </div>

        {discounts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs uppercase font-bold tracking-widest">
            No discount codes created yet. Click above to add your first code.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {discounts.map((discount: any) => (
              <div
                key={discount._id}
                className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-secondary/40 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-2xl font-black italic tracking-widest text-gold">
                      {discount.code}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest ${
                        discount.isActive
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                          : "bg-destructive/10 text-destructive border border-destructive/30"
                      }`}
                    >
                      {discount.isActive ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground font-medium">
                    <span>
                      Value:{" "}
                      <strong className="text-foreground">
                        {discount.discountType === "percentage" ? `${discount.value}% OFF` : `$${discount.value} OFF`}
                      </strong>
                    </span>
                    {discount.minSpend && (
                      <span>
                        Min Spend: <strong className="text-foreground">${discount.minSpend}</strong>
                      </span>
                    )}
                    {discount.expiryDate && (
                      <span>
                        Expires: <strong className="text-foreground">{discount.expiryDate}</strong>
                      </span>
                    )}
                    <span>
                      Usage:{" "}
                      <strong className="text-foreground">
                        {discount.timesUsed || 0} {discount.maxUses ? `/ ${discount.maxUses}` : "uses"}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleActive(discount)}
                    className="rounded-none text-[9px] font-black uppercase tracking-widest border-border text-foreground hover:bg-secondary"
                  >
                    {discount.isActive ? "Disable" : "Enable"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(discount._id)}
                    className="rounded-none text-[9px] font-black uppercase tracking-widest border-destructive/30 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* New Discount Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <h3 className="font-serif text-xl font-black italic uppercase text-foreground">
                Create Promo Code
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-muted-foreground hover:text-foreground text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-black uppercase tracking-widest text-muted-foreground mb-1">
                  Code String (e.g. SEATTLEVIP20) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="LUNA10"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full bg-secondary border border-border p-3 text-foreground font-bold uppercase outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-black uppercase tracking-widest text-muted-foreground mb-1">
                    Discount Type
                  </label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value as any })}
                    className="w-full bg-secondary border border-border p-3 text-foreground font-bold outline-none focus:border-gold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Dollar ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-black uppercase tracking-widest text-muted-foreground mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-secondary border border-border p-3 text-foreground font-bold outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-black uppercase tracking-widest text-muted-foreground mb-1">
                    Minimum Spend ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.minSpend}
                    onChange={(e) => setForm({ ...form, minSpend: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-secondary border border-border p-3 text-foreground font-bold outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block font-black uppercase tracking-widest text-muted-foreground mb-1">
                    Max Redemptions
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.maxUses}
                    onChange={(e) => setForm({ ...form, maxUses: parseInt(e.target.value) || 0 })}
                    className="w-full bg-secondary border border-border p-3 text-foreground font-bold outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-black uppercase tracking-widest text-muted-foreground mb-1">
                  Expiration Date (Optional)
                </label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  className="w-full bg-secondary border border-border p-3 text-foreground font-bold outline-none focus:border-gold"
                />
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewModal(false)}
                  className="rounded-none text-[10px] font-black uppercase tracking-widest"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gold hover:bg-gold-dark text-primary-foreground rounded-none text-[10px] font-black uppercase tracking-widest px-6"
                >
                  Create Code
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
