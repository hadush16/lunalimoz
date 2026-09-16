"use client";

import * as React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  DollarSign,
  Save,
  Car,
  Plane,
  Clock,
  Sparkles,
  TrendingUp,
  Percent,
  CheckCircle2,
  Edit2,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminPricingPage() {
  const carTypes = useQuery(api.carTypes.list) || [];
  const settings = useQuery(api.settings.get);
  const updateSettings = useMutation(api.settings.update);
  const updateCarType = useMutation(api.carTypes.update);
  const logAudit = useMutation(api.audit.logAction);

  // Global settings state
  const [surcharges, setSurcharges] = React.useState({
    baseAirportFee: 20.0,
    meetAndGreetFee: 35.0,
    additionalStopFee: 30.0,
    waitingTimePerMinuteRate: 1.5,
    complimentaryWaitMinutes: 15,
    weekendSurgeMultiplier: 1.1,
    holidaySurgeMultiplier: 1.25,
    taxRatePercent: 10.25,
    minimumFare: 75.0,
  });

  const [savingSettings, setSavingSettings] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  // Selected vehicle editing state
  const [editingCar, setEditingCar] = React.useState<any | null>(null);
  const [carForm, setCarForm] = React.useState({
    baseFare: 35.0,
    perMileRate: 4.5,
    hourlyRate: 135.0,
    minFare: 75.0,
    minMiles: 5.0,
    multiplier: 1.0,
    isActive: true,
  });
  const [savingCar, setSavingCar] = React.useState(false);

  React.useEffect(() => {
    if (settings) {
      setSurcharges({
        baseAirportFee: settings.baseAirportFee ?? 20.0,
        meetAndGreetFee: settings.meetAndGreetFee ?? 35.0,
        additionalStopFee: settings.additionalStopFee ?? 30.0,
        waitingTimePerMinuteRate: settings.waitingTimePerMinuteRate ?? 1.5,
        complimentaryWaitMinutes: settings.complimentaryWaitMinutes ?? 15,
        weekendSurgeMultiplier: settings.weekendSurgeMultiplier ?? 1.1,
        holidaySurgeMultiplier: settings.holidaySurgeMultiplier ?? 1.25,
        taxRatePercent: settings.taxRatePercent ?? 10.25,
        minimumFare: settings.minimumFare ?? 75.0,
      });
    }
  }, [settings]);

  const handleSaveSurcharges = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await updateSettings(surcharges);
      await logAudit({
        adminEmail: "admin@lunalimoz.com",
        action: "UPDATE_PRICING_SETTINGS",
        entity: "settings",
        entityId: "global_settings",
        newValue: JSON.stringify(surcharges),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update surcharges:", err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleOpenCarEdit = (car: any) => {
    setEditingCar(car);
    setCarForm({
      baseFare: car.baseFare || 35.0,
      perMileRate: car.perMileRate || 4.5,
      hourlyRate: car.hourlyRate || 135.0,
      minFare: car.minFare || 75.0,
      minMiles: car.minMiles || 5.0,
      multiplier: car.multiplier || 1.0,
      isActive: car.isActive ?? true,
    });
  };

  const handleSaveCarRates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCar?._id || editingCar._id.startsWith("fallback_")) return;

    setSavingCar(true);
    try {
      await updateCarType({
        id: editingCar._id,
        baseFare: carForm.baseFare,
        perMileRate: carForm.perMileRate,
        hourlyRate: carForm.hourlyRate,
        minFare: carForm.minFare,
        minMiles: carForm.minMiles,
        multiplier: carForm.multiplier,
        isActive: carForm.isActive,
      });

      await logAudit({
        adminEmail: "admin@lunalimoz.com",
        action: "UPDATE_VEHICLE_PRICING",
        entity: "carTypes",
        entityId: editingCar._id,
        previousValue: JSON.stringify(editingCar),
        newValue: JSON.stringify(carForm),
      });

      setEditingCar(null);
    } catch (err) {
      console.error("Failed to update vehicle rates:", err);
    } finally {
      setSavingCar(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 md:p-12 space-y-12 pb-24 bg-background text-foreground transition-colors duration-200">
      {/* Header */}
      <header className="space-y-4">
        <h1 className="font-serif text-3xl md:text-5xl font-black italic uppercase text-foreground tracking-tight">
          Pricing &amp; <span className="text-gold">Surcharges</span>
        </h1>
        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
          Centralized server-side rate management and fee configuration
        </p>
      </header>

      {/* Fleet Rates Grid */}
      <section className="space-y-6">
        <div className="flex justify-between items-center pb-2 border-b border-border">
          <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
            <Car className="h-4 w-4" /> Fleet Vehicle Rates
          </h2>
          <span className="text-[10px] text-muted-foreground font-bold uppercase">
            {carTypes.length} Active Classes
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {carTypes.map((car: any) => (
            <div
              key={car.name}
              className="bg-card border border-border p-6 space-y-4 shadow-sm relative group hover:border-gold/50 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest ${car.isActive ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30" : "bg-destructive/10 text-destructive border border-destructive/30"}`}>
                    {car.isActive ? "Active Rate" : "Inactive"}
                  </span>
                  <h3 className="font-serif text-lg font-black italic uppercase text-foreground mt-2">
                    {car.name}
                  </h3>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenCarEdit(car)}
                  className="text-[9px] font-black uppercase tracking-widest border-border text-foreground hover:bg-secondary"
                >
                  <Edit2 className="h-3 w-3 mr-1" /> Edit
                </Button>
              </div>

              <div className="space-y-2 text-xs border-t border-border pt-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Base Flag Drop</span>
                  <span className="font-bold text-foreground font-serif text-sm">${car.baseFare?.toFixed(2) || "35.00"}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Per-Mile Rate</span>
                  <span className="font-bold text-foreground font-serif text-sm">${car.perMileRate?.toFixed(2) || "4.50"}/mi</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Hourly Charter</span>
                  <span className="font-bold text-foreground font-serif text-sm">${car.hourlyRate?.toFixed(2) || "135.00"}/hr</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Minimum Fare</span>
                  <span className="font-bold text-gold font-serif text-sm">${car.minFare?.toFixed(2) || "75.00"}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Capacity</span>
                  <span className="font-bold text-foreground">{car.capacity} Pass / {car.luggageCapacity || car.capacity} Bags</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Quote Preview Simulator */}
      <section className="bg-card border border-border shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="space-y-1">
            <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Live Pricing Preview &amp; Fare Simulator
            </h2>
            <p className="text-muted-foreground text-xs">
              Test rate calculations with cumulative mileage tiers and surcharges before saving.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4 lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                  Sample Distance (Miles)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  defaultValue="22.0"
                  id="previewDistance"
                  className="w-full bg-secondary border border-border p-3 text-sm text-foreground font-bold outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                  Estimated Duration (Minutes)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  defaultValue="30"
                  id="previewDuration"
                  className="w-full bg-secondary border border-border p-3 text-sm text-foreground font-bold outline-none focus:border-gold"
                />
              </div>
            </div>

            <div className="p-4 bg-secondary/50 border border-border text-xs text-muted-foreground space-y-2">
              <span className="font-bold text-foreground block uppercase text-[10px] tracking-wider">
                Sea-Tac Tiered Rate Simulation:
              </span>
              <p>• Miles 0–10: $6.50/mi | Miles 10–30: $5.25/mi | Miles 30–75: $4.50/mi | 75+ mi: $3.95/mi</p>
              <p>• Surcharges: Airport Pickup ($25), Meet &amp; Greet ($35), Child Seat ($25), WA Sales Tax (10.25%), Gratuity (20%).</p>
            </div>
          </div>

          <div className="bg-secondary p-6 border border-border flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-gold block">
                Sample Escalade 22-Mile Transfer Quote
              </span>
              <div className="space-y-1 text-xs divide-y divide-border">
                <div className="flex justify-between py-1 text-muted-foreground">
                  <span>Base Fare</span>
                  <span className="font-bold text-foreground">$40.00</span>
                </div>
                <div className="flex justify-between py-1 text-muted-foreground">
                  <span>Mileage Tiers (0-10 &amp; 10-22 mi)</span>
                  <span className="font-bold text-foreground">$128.00</span>
                </div>
                <div className="flex justify-between py-1 text-muted-foreground">
                  <span>Traffic Time (30 mins @ $0.80)</span>
                  <span className="font-bold text-foreground">$24.00</span>
                </div>
                <div className="flex justify-between py-1 text-muted-foreground">
                  <span>Sea-Tac Airport Fee</span>
                  <span className="font-bold text-foreground">$25.00</span>
                </div>
                <div className="flex justify-between py-1 text-muted-foreground">
                  <span>Sales Tax (10.25%)</span>
                  <span className="font-bold text-foreground">$22.24</span>
                </div>
                <div className="flex justify-between py-1 text-muted-foreground">
                  <span>Gratuity (20%)</span>
                  <span className="font-bold text-foreground">$43.40</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-baseline justify-between mt-4">
              <span className="text-xs font-black uppercase tracking-widest text-foreground">Total Quoted</span>
              <span className="font-serif text-2xl font-black italic text-gold">$282.64</span>
            </div>
          </div>
        </div>
      </section>

      {/* Global Surcharges & Rules Form */}
      <section className="bg-card border border-border shadow-sm">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> Global Surcharges, Airport Fees &amp; Surge Multipliers
          </h2>
          {saveSuccess && (
            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1 animate-pulse">
              <CheckCircle2 className="h-3.5 w-3.5" /> Pricing Applied Live
            </span>
          )}
        </div>

        <form onSubmit={handleSaveSurcharges} className="p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Airport Fee */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Plane className="h-3 w-3 text-gold" /> Sea-Tac Airport Fee ($)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={surcharges.baseAirportFee}
                onChange={(e) => setSurcharges({ ...surcharges, baseAirportFee: parseFloat(e.target.value) || 0 })}
                className="w-full bg-secondary border border-border p-3 text-sm text-foreground focus:border-gold outline-none"
              />
            </div>

            {/* Meet & Greet */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-gold" /> Airport Meet &amp; Greet ($)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={surcharges.meetAndGreetFee}
                onChange={(e) => setSurcharges({ ...surcharges, meetAndGreetFee: parseFloat(e.target.value) || 0 })}
                className="w-full bg-secondary border border-border p-3 text-sm text-foreground focus:border-gold outline-none"
              />
            </div>

            {/* Stop Fee */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <DollarSign className="h-3 w-3 text-gold" /> Additional Intermediate Stop ($)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={surcharges.additionalStopFee}
                onChange={(e) => setSurcharges({ ...surcharges, additionalStopFee: parseFloat(e.target.value) || 0 })}
                className="w-full bg-secondary border border-border p-3 text-sm text-foreground focus:border-gold outline-none"
              />
            </div>

            {/* Wait Rate */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-gold" /> Waiting Time Rate ($/Minute)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={surcharges.waitingTimePerMinuteRate}
                onChange={(e) => setSurcharges({ ...surcharges, waitingTimePerMinuteRate: parseFloat(e.target.value) || 0 })}
                className="w-full bg-secondary border border-border p-3 text-sm text-foreground focus:border-gold outline-none"
              />
            </div>

            {/* Complimentary Wait */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-gold" /> Complimentary Wait Period (Minutes)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={surcharges.complimentaryWaitMinutes}
                onChange={(e) => setSurcharges({ ...surcharges, complimentaryWaitMinutes: parseInt(e.target.value) || 0 })}
                className="w-full bg-secondary border border-border p-3 text-sm text-foreground focus:border-gold outline-none"
              />
            </div>

            {/* Weekend Surge */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3 text-gold" /> Weekend Surge Multiplier (e.g. 1.1x)
              </label>
              <input
                type="number"
                step="0.05"
                min="1.0"
                value={surcharges.weekendSurgeMultiplier}
                onChange={(e) => setSurcharges({ ...surcharges, weekendSurgeMultiplier: parseFloat(e.target.value) || 1.0 })}
                className="w-full bg-secondary border border-border p-3 text-sm text-foreground focus:border-gold outline-none"
              />
            </div>

            {/* Holiday Surge */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3 text-gold" /> Holiday / Peak Multiplier (e.g. 1.25x)
              </label>
              <input
                type="number"
                step="0.05"
                min="1.0"
                value={surcharges.holidaySurgeMultiplier}
                onChange={(e) => setSurcharges({ ...surcharges, holidaySurgeMultiplier: parseFloat(e.target.value) || 1.0 })}
                className="w-full bg-secondary border border-border p-3 text-sm text-foreground focus:border-gold outline-none"
              />
            </div>

            {/* Tax Rate */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Percent className="h-3 w-3 text-gold" /> Tax &amp; Local Surcharge Rate (%)
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                value={surcharges.taxRatePercent}
                onChange={(e) => setSurcharges({ ...surcharges, taxRatePercent: parseFloat(e.target.value) || 0 })}
                className="w-full bg-secondary border border-border p-3 text-sm text-foreground focus:border-gold outline-none"
              />
            </div>

            {/* Global Minimum Fare */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <DollarSign className="h-3 w-3 text-gold" /> Global Floor Minimum Fare ($)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={surcharges.minimumFare}
                onChange={(e) => setSurcharges({ ...surcharges, minimumFare: parseFloat(e.target.value) || 0 })}
                className="w-full bg-secondary border border-border p-3 text-sm text-foreground focus:border-gold outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              disabled={savingSettings}
              className="bg-gold hover:bg-gold-dark text-primary-foreground rounded-none px-8 py-6 text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-2"
            >
              <Save className="h-4 w-4" /> {savingSettings ? "Updating Rates..." : "Save All Surcharge Rules"}
            </Button>
          </div>
        </form>
      </section>

      {/* Edit Vehicle Rates Modal */}
      {editingCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <h3 className="font-serif text-xl font-black italic uppercase text-foreground">
                Edit Rates: <span className="text-gold">{editingCar.name}</span>
              </h3>
              <button onClick={() => setEditingCar(null)} className="text-muted-foreground hover:text-foreground text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCarRates} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-black uppercase tracking-widest text-muted-foreground mb-1">
                    Base Fare ($)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={carForm.baseFare}
                    onChange={(e) => setCarForm({ ...carForm, baseFare: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-secondary border border-border p-3 text-foreground font-bold outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block font-black uppercase tracking-widest text-muted-foreground mb-1">
                    Per-Mile Rate ($/mi)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={carForm.perMileRate}
                    onChange={(e) => setCarForm({ ...carForm, perMileRate: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-secondary border border-border p-3 text-foreground font-bold outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block font-black uppercase tracking-widest text-muted-foreground mb-1">
                    Hourly Rate ($/hr)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={carForm.hourlyRate}
                    onChange={(e) => setCarForm({ ...carForm, hourlyRate: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-secondary border border-border p-3 text-foreground font-bold outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block font-black uppercase tracking-widest text-muted-foreground mb-1">
                    Minimum Fare ($)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={carForm.minFare}
                    onChange={(e) => setCarForm({ ...carForm, minFare: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-secondary border border-border p-3 text-foreground font-bold outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={carForm.isActive}
                    onChange={(e) => setCarForm({ ...carForm, isActive: e.target.checked })}
                    className="h-4 w-4 accent-gold cursor-pointer"
                  />
                  <span className="font-bold uppercase tracking-wider text-foreground">
                    Vehicle Class Active &amp; Bookable Online
                  </span>
                </label>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingCar(null)}
                  className="rounded-none text-[10px] font-black uppercase tracking-widest"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingCar}
                  className="bg-gold hover:bg-gold-dark text-primary-foreground rounded-none text-[10px] font-black uppercase tracking-widest px-6"
                >
                  {savingCar ? "Saving..." : "Save Vehicle Rates"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
