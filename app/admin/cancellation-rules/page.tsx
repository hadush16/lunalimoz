"use client";

import * as React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ShieldAlert, Plus, Edit2, Save, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminCancellationRulesPage() {
  const rules = useQuery(api.cancellation.listRules) || [];
  const updateRule = useMutation(api.cancellation.updateRule);
  const createRule = useMutation(api.cancellation.createRule);
  const logAudit = useMutation(api.audit.logAction);

  const [editingRule, setEditingRule] = React.useState<any | null>(null);
  const [form, setForm] = React.useState({
    feePercentage: 0,
    description: "",
    isActive: true,
  });

  const [showNewModal, setShowNewModal] = React.useState(false);
  const [newRuleForm, setNewRuleForm] = React.useState({
    tierHours: 12,
    feePercentage: 25,
    description: "",
    ruleType: "standard",
    isActive: true,
  });

  const handleEdit = (rule: any) => {
    setEditingRule(rule);
    setForm({
      feePercentage: rule.feePercentage,
      description: rule.description,
      isActive: rule.isActive ?? true,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule?._id || editingRule._id.startsWith("default_")) return;

    try {
      await updateRule({
        id: editingRule._id,
        feePercentage: form.feePercentage,
        description: form.description,
        isActive: form.isActive,
      });

      await logAudit({
        adminEmail: "admin@lunalimoz.com",
        action: "UPDATE_CANCELLATION_RULE",
        entity: "cancellationRules",
        entityId: editingRule._id,
        previousValue: JSON.stringify(editingRule),
        newValue: JSON.stringify(form),
      });

      setEditingRule(null);
    } catch (err) {
      console.error("Failed to update rule:", err);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = await createRule(newRuleForm);
      await logAudit({
        adminEmail: "admin@lunalimoz.com",
        action: "CREATE_CANCELLATION_RULE",
        entity: "cancellationRules",
        entityId: id,
        newValue: JSON.stringify(newRuleForm),
      });
      setShowNewModal(false);
      setNewRuleForm({
        tierHours: 12,
        feePercentage: 25,
        description: "",
        ruleType: "standard",
        isActive: true,
      });
    } catch (err) {
      console.error("Failed to create rule:", err);
    }
  };

  return (
    <div className="p-4 sm:p-8 md:p-12 space-y-12 pb-24 bg-background text-foreground transition-colors duration-200">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-4">
          <h1 className="font-serif text-3xl md:text-5xl font-black italic uppercase text-foreground tracking-tight">
            Cancellation &amp; <span className="text-gold">No-Show Rules</span>
          </h1>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
            Configure automated refund tiers and penalty percentages
          </p>
        </div>
        <Button
          onClick={() => setShowNewModal(true)}
          className="bg-gold hover:bg-gold-dark text-primary-foreground rounded-none text-[10px] font-black uppercase tracking-widest py-6 px-6 flex items-center gap-2 shadow-md"
        >
          <Plus className="h-4 w-4" /> Add Custom Tier
        </Button>
      </header>

      {/* Rules Table / Cards */}
      <section className="bg-card border border-border shadow-sm">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" /> Active Policy Calculation Rules
          </h2>
          <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
            {rules.length} Configured Tiers
          </span>
        </div>

        <div className="divide-y divide-border">
          {rules.map((rule: any) => (
            <div
              key={rule._id || rule.description}
              className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-secondary/40 transition-colors"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-gold/10 border border-gold/30 text-gold text-[10px] font-black uppercase tracking-widest">
                    {rule.tierHours > 0
                      ? `${rule.tierHours}+ Hours Advance Notice`
                      : rule.tierHours === 0
                      ? "Within 2 Hours / Dispatched"
                      : "No-Show Violation"}
                  </span>
                  <span className="font-serif text-lg font-black italic text-foreground">
                    {rule.feePercentage}% Cancellation Fee
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  {rule.description}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(rule)}
                  className="rounded-none text-[9px] font-black uppercase tracking-widest border-border text-foreground hover:bg-secondary"
                >
                  <Edit2 className="h-3 w-3 mr-1" /> Edit Tier
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Edit Rule Modal */}
      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <h3 className="font-serif text-xl font-black italic uppercase text-foreground">
                Edit Cancellation Tier
              </h3>
              <button onClick={() => setEditingRule(null)} className="text-muted-foreground hover:text-foreground text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-black uppercase tracking-widest text-muted-foreground mb-1">
                  Fee Percentage (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.feePercentage}
                  onChange={(e) => setForm({ ...form, feePercentage: parseInt(e.target.value) || 0 })}
                  className="w-full bg-secondary border border-border p-3 text-foreground font-bold outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block font-black uppercase tracking-widest text-muted-foreground mb-1">
                  Description / Explanation
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-secondary border border-border p-3 text-foreground font-medium outline-none focus:border-gold"
                />
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingRule(null)}
                  className="rounded-none text-[10px] font-black uppercase tracking-widest"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gold hover:bg-gold-dark text-primary-foreground rounded-none text-[10px] font-black uppercase tracking-widest px-6"
                >
                  Save Tier
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Rule Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <h3 className="font-serif text-xl font-black italic uppercase text-foreground">
                Add Cancellation Tier
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-muted-foreground hover:text-foreground text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="block font-black uppercase tracking-widest text-muted-foreground mb-1">
                  Hours Prior to Pickup Threshold
                </label>
                <input
                  type="number"
                  min="0"
                  value={newRuleForm.tierHours}
                  onChange={(e) => setNewRuleForm({ ...newRuleForm, tierHours: parseInt(e.target.value) || 0 })}
                  className="w-full bg-secondary border border-border p-3 text-foreground font-bold outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block font-black uppercase tracking-widest text-muted-foreground mb-1">
                  Fee Percentage (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newRuleForm.feePercentage}
                  onChange={(e) => setNewRuleForm({ ...newRuleForm, feePercentage: parseInt(e.target.value) || 0 })}
                  className="w-full bg-secondary border border-border p-3 text-foreground font-bold outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block font-black uppercase tracking-widest text-muted-foreground mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newRuleForm.description}
                  onChange={(e) => setNewRuleForm({ ...newRuleForm, description: e.target.value })}
                  placeholder="e.g. Cancellations under 12 hours..."
                  className="w-full bg-secondary border border-border p-3 text-foreground font-medium outline-none focus:border-gold"
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
                  Create Rule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
