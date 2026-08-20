"use client";

import * as React from "react";
import { MessageSquare, X, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function WhatsAppSupport() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(true);
  const [currentTime, setCurrentTime] = React.useState("");

  React.useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }));
    };

    updateTime();
    // Update every minute (60000ms)
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);
  
  // Professional pre-filled message
  const message = encodeURIComponent(
    "Hello Luna Limo, I am interested in booking a luxury chauffeur service. Could you please provide more information?"
  );
  const whatsappUrl = `https://wa.me/12063274411?text=${message}`;

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      <div 
        className={cn(
          "mb-4 w-[320px] sm:w-[380px] bg-neutral-950 border border-neutral-800 shadow-3xl overflow-hidden transition-all duration-500 ease-in-out origin-bottom-right pointer-events-auto",
          isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="bg-gold p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-black rounded-full flex items-center justify-center border border-gold/50">
              <User className="h-6 w-6 text-gold" />
            </div>
            <div>
              <h4 className="text-black font-serif font-black italic text-sm uppercase leading-none">Luna Concierge</h4>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="h-2 w-2 bg-black rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-black/70 uppercase tracking-widest">Online Now</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-black/50 hover:text-black transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-repeat">
          <div className="bg-neutral-900 border border-neutral-800 p-4 shadow-xl relative group">
            <div className="absolute -top-1 -left-1 bg-gold h-4 w-4 rounded-full border-2 border-black flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
               <User className="h-2 w-2 text-black" />
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed font-medium">
              Welcome to Luna Limo. How can I assist you with your luxury transportation needs today?
            </p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">{currentTime || "Just now"}</span>
              <span className="text-[9px] text-gold/40 font-black italic uppercase tracking-[0.2em] group-hover:text-gold transition-colors">Luna Standard</span>
            </div>
          </div>
          
          <div className="flex justify-end">
            <div className="bg-gold/10 border border-gold/30 p-3 rounded-none max-w-[80%]">
              <p className="text-[10px] text-gold font-bold uppercase tracking-widest">
                Typical reply time: 5 mins
              </p>
            </div>
          </div>
        </div>

        {/* Footer / Action */}
        <div className="p-4 bg-black border-t border-neutral-900">
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <Button 
              className="w-full bg-gold hover:bg-gold-dark text-white rounded-none h-12 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3"
            >
              Start Chat on WhatsApp
              <Send className="h-3 w-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Button>
          </a>
          <p className="text-[8px] text-neutral-700 font-bold uppercase tracking-[0.3em] text-center mt-3">
            Secure 256-bit Encrypted Connection
          </p>
        </div>
      </div>

      {/* Toggle Button */}
      <div className="relative pointer-events-auto">
        <a 
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-16 w-16 rounded-full shadow-3xl flex items-center justify-center transition-all active:scale-95 border-2 cursor-pointer",
            isOpen 
              ? "bg-neutral-900 border-neutral-800 text-white rotate-90" 
              : "bg-gold border-black text-white hover:bg-gold-dark"
          )}
        >
          {isOpen ? <X className="h-8 w-8" /> : <MessageSquare className="h-8 w-8" />}
        </a>

        {/* Permanent Close */}
        {!isOpen && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
            className="absolute -top-1 -left-1 bg-black text-neutral-600 hover:text-white rounded-full p-1 border border-neutral-800 transition-colors z-10"
          >
            <X className="h-2 w-2" />
          </button>
        )}
      </div>
    </div>
  );
}
