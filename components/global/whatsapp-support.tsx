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
    <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-[45] flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      <div 
        className={cn(
          "mb-3 w-[300px] sm:w-[360px] bg-card border border-border shadow-2xl overflow-hidden transition-all duration-300 ease-in-out origin-bottom-right pointer-events-auto",
          isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="bg-gold p-4 flex items-center justify-between text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-background/20 rounded-full flex items-center justify-center border border-primary-foreground/30">
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h4 className="font-serif font-black italic text-sm uppercase leading-none">Luna Concierge</h4>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-black opacity-90 uppercase tracking-widest">Active Dispatch</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="opacity-75 hover:opacity-100 transition-opacity"
            aria-label="Close chat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 bg-secondary/50">
          <div className="bg-card border border-border p-4 shadow-sm relative group">
            <div className="absolute -top-1 -left-1 bg-gold h-4 w-4 rounded-full border-2 border-card flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
               <User className="h-2 w-2 text-primary-foreground" />
            </div>
            <p className="text-xs text-foreground leading-relaxed font-medium">
              Welcome to Luna Limo. How can our concierge assist with your luxury transportation needs today?
            </p>
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
              <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{currentTime || "Just now"}</span>
              <span className="text-[9px] text-gold font-black italic uppercase tracking-[0.2em]">Luna Standard</span>
            </div>
          </div>
          
          <div className="flex justify-end">
            <div className="bg-gold/10 border border-gold/30 p-2.5 rounded-none max-w-[85%]">
              <p className="text-[9px] text-gold font-bold uppercase tracking-widest">
                Typical reply time: Under 5 mins
              </p>
            </div>
          </div>
        </div>

        {/* Footer / Action */}
        <div className="p-4 bg-card border-t border-border">
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            <Button 
              className="w-full bg-gold hover:bg-gold-dark text-primary-foreground rounded-none h-11 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2"
            >
              Chat on WhatsApp
              <Send className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </a>
          <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-[0.25em] text-center mt-2.5">
            256-Bit Encrypted Concierge Channel
          </p>
        </div>
      </div>

      {/* Toggle Button */}
      <div className="relative pointer-events-auto">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-13 w-13 sm:h-14 sm:w-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 active:scale-95 border-2 cursor-pointer focus:outline-none",
            isOpen 
              ? "bg-secondary border-border text-foreground rotate-90" 
              : "bg-gold border-background text-primary-foreground hover:bg-gold-dark shadow-gold/30"
          )}
          aria-label={isOpen ? "Close WhatsApp support chat" : "Open WhatsApp support chat"}
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        </button>

        {/* Permanent Close */}
        {!isOpen && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
            className="absolute -top-1 -left-1 bg-secondary text-muted-foreground hover:text-foreground rounded-full p-1 border border-border transition-colors z-10"
            aria-label="Dismiss chat widget"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        )}
      </div>
    </div>
  );
}
