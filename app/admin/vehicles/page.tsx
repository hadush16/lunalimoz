"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Car, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { Doc } from "@/convex/_generated/dataModel";

export default function AdminVehiclesPage() {
  const cars = useQuery(api.carTypes.list);
  const updateVehicle = useMutation(api.carTypes.update);
  const createVehicle = useMutation(api.carTypes.create);
  const deleteVehicle = useMutation(api.carTypes.remove);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingVehicle, setEditingVehicle] = React.useState<Doc<"carTypes"> | null>(null);
  
  // Form State
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    baseFare: 0,
    perKmRate: 0,
    perMinuteRate: 0,
    hourlyRate: 0,
    multiplier: 1.0,
    capacity: 1,
    isActive: true,
    image: "/fleet_black_bg.png"
  });

  const handleEdit = (vehicle: Doc<"carTypes">) => {
    setEditingVehicle(vehicle);
    setFormData({
      name: vehicle.name,
      description: vehicle.description,
      baseFare: vehicle.baseFare,
      perKmRate: vehicle.perKmRate,
      perMinuteRate: vehicle.perMinuteRate,
      hourlyRate: vehicle.hourlyRate || 0,
      multiplier: vehicle.multiplier,
      capacity: vehicle.capacity,
      isActive: vehicle.isActive,
      image: vehicle.image
    });
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingVehicle(null);
    setFormData({
      name: "",
      description: "",
      baseFare: 0,
      perKmRate: 0,
      perMinuteRate: 0,
      hourlyRate: 0,
      multiplier: 1.0,
      capacity: 1,
      isActive: true,
      image: "/fleet_black_bg.png"
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await updateVehicle({
          id: editingVehicle._id,
          ...formData
        });
      } else {
        await createVehicle(formData);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save vehicle", err);
    }
  };

  const handleDelete = async (vehicle: Doc<"carTypes">) => {
    if (!confirm(`Are you sure you want to delete "${vehicle.name}"? This cannot be undone.`)) return;
    try {
      await deleteVehicle({ id: vehicle._id });
    } catch (err) {
      console.error("Failed to delete vehicle", err);
    }
  };

  if (cars === undefined) {
    return <div className="p-12 text-center text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em]">Loading fleet configuration...</div>;
  }

  return (
    <div className="p-4 sm:p-8 md:p-12 space-y-8 sm:space-y-12 pb-24 relative">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 sm:space-y-4 text-center md:text-left">
          <h1 className="font-serif text-3xl sm:text-5xl font-black italic uppercase text-white tracking-tight">
            Fleet <span className="text-gold">Config</span>
          </h1>
          <p className="text-neutral-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">
            Manage vehicle classes and pricing structures
          </p>
        </div>
        <Button 
          onClick={handleAddNew}
          className="bg-gold hover:bg-gold-dark text-white rounded-none py-5 sm:py-6 px-8 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 w-full md:w-auto"
        >
            <Plus className="h-4 w-4" />
            Add Vehicle Class
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {cars.map((car) => (
           <div key={car._id} className="bg-neutral-900/50 border border-neutral-800 p-6 flex flex-col h-full group hover:border-gold/30 transition-all duration-300">
              <div className="flex justify-between items-start mb-6">
                 <div className="min-w-0">
                    <h3 className="font-serif text-xl font-black italic uppercase text-white truncate">{car.name}</h3>
                    <p className="text-gold text-[10px] font-black uppercase tracking-widest mt-1">Multiplier: {car.multiplier}x</p>
                 </div>
                 <Car className="h-6 w-6 text-gold opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
              
              <div className="space-y-4 flex-1">
                  <div className="grid grid-cols-2 gap-3">
                     <div className="bg-black/40 border border-neutral-800 p-3">
                        <p className="text-neutral-500 text-[8px] font-black uppercase tracking-[0.2em] mb-1">Base Fare</p>
                        <p className="text-white font-serif font-black italic text-lg tracking-tight">${car.baseFare}</p>
                     </div>
                     <div className="bg-black/40 border border-neutral-800 p-3">
                        <p className="text-neutral-500 text-[8px] font-black uppercase tracking-[0.2em] mb-1">Per KM</p>
                        <p className="text-white font-serif font-black italic text-lg tracking-tight">${car.perKmRate}</p>
                     </div>
                     <div className="bg-black/40 border border-neutral-800 p-3">
                        <p className="text-neutral-500 text-[8px] font-black uppercase tracking-[0.2em] mb-1">Per Min</p>
                        <p className="text-white font-serif font-black italic text-lg tracking-tight">${car.perMinuteRate}</p>
                     </div>
                      <div className="bg-black/40 border border-neutral-800 p-3">
                        <p className="text-neutral-500 text-[8px] font-black uppercase tracking-[0.2em] mb-1">Hourly</p>
                        <p className="text-gold font-serif font-black italic text-lg tracking-tight">${car.hourlyRate || "—"}</p>
                      </div>
                  </div>
                 <div className="bg-black/40 border border-neutral-800 p-3 flex justify-between items-center group/item hover:border-gold/20 transition-colors">
                    <span className="text-neutral-500 text-[9px] font-black uppercase tracking-widest">Passenger Capacity</span>
                    <span className="text-white font-bold text-xs uppercase tracking-widest">{car.capacity} Seats</span>
                 </div>
                 <p className="text-neutral-500 text-[10px] line-clamp-2 italic font-medium">
                   {car.description}
                 </p>
              </div>

               <div className="mt-6 pt-6 border-t border-neutral-800 flex flex-wrap gap-4 justify-between items-center">
                  <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest border ${
                    car.isActive ? "bg-emerald-950/30 text-emerald-500 border-emerald-900/50" : "bg-neutral-800/30 text-neutral-500 border-neutral-700"
                  }`}>
                     {car.isActive ? "Online" : "Offline"}
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleEdit(car)}
                      variant="outline" 
                      size="sm" 
                      className="bg-transparent text-gold border-gold/30 hover:bg-gold hover:text-white rounded-none text-[9px] font-black uppercase tracking-widest"
                    >
                       Edit Settings
                    </Button>
                    <Button 
                      onClick={() => handleDelete(car)}
                      variant="outline" 
                      size="sm" 
                      className="bg-transparent text-red-500 border-red-900/50 hover:bg-red-900 hover:text-white rounded-none text-[9px] font-black uppercase tracking-widest"
                    >
                       Delete
                    </Button>
                  </div>
               </div>
           </div>
        ))}
      </div>

      {/* Modern Centered Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-neutral-900 border border-neutral-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-300">
              <div className="p-6 sm:p-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-black italic uppercase text-white">
                      {editingVehicle ? "Update" : "Define"} <span className="text-gold">Vehicle</span>
                    </h2>
                    <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mt-2">{editingVehicle ? "Refine fleet parameters" : "Expand the Luna collection"}</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="text-neutral-500 hover:text-gold transition-colors">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Display Name</label>
                      <input 
                        required
                        className="w-full bg-black border border-neutral-800 text-white p-4 text-xs font-bold focus:border-gold outline-none transition-colors"
                        placeholder="e.g. Executive Sedan"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Multiplier (0.5 - 5.0)</label>
                      <input 
                        type="number"
                        step="0.1"
                        required
                        className="w-full bg-black border border-neutral-800 text-white p-4 text-xs font-bold focus:border-gold outline-none transition-colors"
                        value={formData.multiplier}
                        onChange={(e) => setFormData({...formData, multiplier: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Base Fare ($)</label>
                      <input 
                        type="number"
                        required
                        className="w-full bg-black border border-neutral-800 text-white p-4 text-xs font-bold focus:border-gold outline-none transition-colors"
                        value={formData.baseFare}
                        onChange={(e) => setFormData({...formData, baseFare: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Rate Per KM ($)</label>
                      <input 
                        type="number"
                        step="0.1"
                        required
                        className="w-full bg-black border border-neutral-800 text-white p-4 text-xs font-bold focus:border-gold outline-none transition-colors"
                        value={formData.perKmRate}
                        onChange={(e) => setFormData({...formData, perKmRate: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Rate Per Minute ($)</label>
                      <input 
                        type="number"
                        step="0.1"
                        required
                        className="w-full bg-black border border-neutral-800 text-white p-4 text-xs font-bold focus:border-gold outline-none transition-colors"
                        value={formData.perMinuteRate}
                        onChange={(e) => setFormData({...formData, perMinuteRate: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Hourly Rate ($)</label>
                      <input 
                        type="number"
                        step="1"
                        required
                        className="w-full bg-black border border-neutral-800 text-white p-4 text-xs font-bold focus:border-gold outline-none transition-colors"
                        value={formData.hourlyRate}
                        onChange={(e) => setFormData({...formData, hourlyRate: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Public Description</label>
                    <textarea 
                      required
                      className="w-full bg-black border border-neutral-800 text-white p-4 text-xs font-medium focus:border-gold outline-none transition-colors h-24 resize-none"
                      placeholder="Enter premium description for customers..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Max Passengers</label>
                       <input 
                        type="number"
                        required
                        className="w-full bg-black border border-neutral-800 text-white p-4 text-xs font-bold focus:border-gold outline-none transition-colors"
                        value={formData.capacity}
                        onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Status</label>
                       <select 
                        className="w-full bg-black border border-neutral-800 text-white p-4 text-xs font-bold focus:border-gold outline-none transition-colors"
                        value={formData.isActive ? "active" : "inactive"}
                        onChange={(e) => setFormData({...formData, isActive: e.target.value === "active"})}
                       >
                         <option value="active">ACTIVE / ONLINE</option>
                         <option value="inactive">INACTIVE / MAINT</option>
                       </select>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-4">
                    <Button 
                      type="submit"
                      className="bg-gold hover:bg-gold-dark text-white rounded-none py-6 text-xs font-black uppercase tracking-[0.2em] flex-1 active:scale-95 transition-transform"
                    >
                      {editingVehicle ? "Save Configuration" : "Commence Fleet Addition"}
                    </Button>
                    <Button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      variant="outline"
                      className="bg-transparent border-neutral-800 text-neutral-500 hover:text-white rounded-none py-6 text-[10px] font-black uppercase tracking-widest px-8"
                    >
                      Discard
                    </Button>
                  </div>
                </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
