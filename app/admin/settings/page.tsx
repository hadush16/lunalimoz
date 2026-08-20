"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Settings, Save, Building, Phone, Mail, DollarSign, Clock, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function AdminSettingsPage() {
  const currentSettings = useQuery(api.settings.get);
  const updateSettings = useMutation(api.settings.update);
  
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    address: "",
    surgeMultiplier: 1.0,
    minimumFare: 50.0,
    notificationsEmail: true,
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (currentSettings) {
      setFormData({
         companyName: currentSettings.companyName || "",
         email: currentSettings.email || "",
         phone: currentSettings.phone || "",
         address: currentSettings.address || "",
         surgeMultiplier: currentSettings.surgeMultiplier || 1.0,
         minimumFare: currentSettings.minimumFare || 50.0,
         notificationsEmail: currentSettings.notificationsEmail ?? true,
      });
    }
  }, [currentSettings]);

  if (currentSettings === undefined) {
    return (
      <div className="p-12 text-center text-neutral-500 font-bold uppercase tracking-widest text-xs h-[80vh] flex items-center justify-center">
        Loading System Configuration...
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? (value === "" ? 0 : Number(value)) : value
    }));
    setSaveSuccess(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update settings", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 md:p-12 space-y-12 pb-24 max-w-4xl">
      <header className="space-y-4">
        <h1 className="font-serif text-3xl md:text-5xl font-black italic uppercase text-white tracking-tight">
          System <span className="text-gold">Configuration</span>
        </h1>
        <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em]">
          Manage global application variables
        </p>
      </header>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Business Details */}
        <section className="bg-neutral-900 border border-neutral-800">
          <div className="p-6 border-b border-neutral-800 flex items-center gap-2">
             <Settings className="h-4 w-4 text-gold" />
             <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em]">Business Identity</h2>
          </div>
          <div className="p-6 space-y-6">
             <div className="space-y-2">
                <label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                   <Building className="h-3 w-3" /> Company Name
                </label>
                <input 
                  type="text" 
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full bg-black border border-neutral-800 p-3 text-sm text-white focus:border-gold outline-none"
                />
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <Mail className="h-3 w-3" /> Contact Email
                   </label>
                   <input 
                     type="email" 
                     name="email"
                     value={formData.email}
                     onChange={handleChange}
                     className="w-full bg-black border border-neutral-800 p-3 text-sm text-white focus:border-gold outline-none"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <Phone className="h-3 w-3" /> Contact Phone
                   </label>
                   <input 
                     type="text" 
                     name="phone"
                     value={formData.phone}
                     onChange={handleChange}
                     className="w-full bg-black border border-neutral-800 p-3 text-sm text-white focus:border-gold outline-none"
                   />
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                   <Building className="h-3 w-3" /> Business Address
                </label>
                <input 
                  type="text" 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full bg-black border border-neutral-800 p-3 text-sm text-white focus:border-gold outline-none"
                />
             </div>
          </div>
        </section>

         {/* Pricing Rules */}
         <section className="bg-neutral-900 border border-neutral-800">
           <div className="p-6 border-b border-neutral-800 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gold" />
              <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em]">Rates &amp; Rules</h2>
           </div>
           <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <DollarSign className="h-3 w-3" /> Minimum Fare ($)
                 </label>
                 <input 
                   type="number" 
                   step="0.01"
                   min="0"
                   name="minimumFare"
                   value={formData.minimumFare}
                   onChange={handleChange}
                   className="w-full bg-black border border-neutral-800 p-3 text-sm text-white focus:border-gold outline-none"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Clock className="h-3 w-3" /> Surge Multiplier
                 </label>
                 <input 
                   type="number" 
                   step="0.1"
                   min="1"
                   name="surgeMultiplier"
                   value={formData.surgeMultiplier}
                   onChange={handleChange}
                   className="w-full bg-black border border-neutral-800 p-3 text-sm text-white focus:border-gold outline-none"
                 />
              </div>
           </div>
         </section>

         {/* Notifications */}
         <section className="bg-neutral-900 border border-neutral-800">
           <div className="p-6 border-b border-neutral-800 flex items-center gap-2">
              <Bell className="h-4 w-4 text-gold" />
              <h2 className="text-gold text-[10px] font-black uppercase tracking-[0.3em]">Notifications</h2>
           </div>
           <div className="p-6">
             <label className="flex items-center gap-4 cursor-pointer group">
               <div className="relative">
                 <input 
                   type="checkbox" 
                   name="notificationsEmail"
                   checked={formData.notificationsEmail}
                   onChange={handleChange}
                   className="sr-only peer"
                 />
                 <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
               </div>
               <div>
                 <p className="text-white text-sm font-bold uppercase tracking-widest">Email Notifications</p>
                 <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-wider">Receive email alerts for new bookings and status changes</p>
               </div>
             </label>
           </div>
         </section>

        <div className="flex items-center gap-4">
           <Button 
             type="button"
             variant="outline"
             onClick={() => setFormData({
               ...formData,
               companyName: "Luna Limo",
               email: "concierge@lunalimo.com",
               phone: "(206) 327-4411",
               address: "1902 E Yesler way, Seattle, WA 98122",
             })}
             className="border-neutral-800 hover:border-gold text-neutral-500 hover:text-gold rounded-none font-black uppercase tracking-widest text-xs px-6 py-6"
           >
             Reset to Website Defaults
           </Button>

           <Button 
             type="submit" 
             disabled={isSaving}
             className="bg-gold hover:bg-gold-dark text-black rounded-none font-black uppercase tracking-widest text-xs px-8 py-6 flex items-center gap-2"
           >
             <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Save Configuration"}
           </Button>
           
           {saveSuccess && (
             <span className="text-emerald-500 text-xs font-bold uppercase tracking-widest animate-pulse">
               Settings Applied Successfully
             </span>
           )}
        </div>
      </form>
    </div>
  );
}
