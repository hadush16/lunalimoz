"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Mail, Lock, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  
  const [step, setStep] = useState<"signIn" | "signUp">("signIn");
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Sign-up is disabled completely to prevent unauthorized admin creation.
  // Admins must be promoted via the backend or created by an existing super-admin.

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    
    const formData = new FormData(event.currentTarget);
    const password = formData.get("password") as string;
    const email = formData.get("email") as string;
    
    try {
      await signIn("password", { email, password, flow: "signIn" });
      // Use window.location.href to guarantee a full page reload so Next.js proxy.ts sees the newly set cookie.
      window.location.href = "/admin";
    } catch (err: any) {
      console.error("Auth error:", err);
      // Display the actual error message to easily debug signup validation errors
      setError(err instanceof Error ? err.message : "Authentication failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-8 sm:p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gold" />
        
        <div className="mb-10 text-center">
          <ShieldCheck className="h-12 w-12 text-gold mx-auto mb-6" />
          <h3 className="text-gold text-[10px] font-black uppercase tracking-[0.3em] mb-4">Luna Limo</h3>
          <h4 className="font-serif text-3xl font-black italic uppercase text-white">Admin</h4>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
           {error && (
             <div className="bg-red-950/50 border border-red-900 text-red-500 text-xs font-bold p-4 text-center">
               {error}
             </div>
           )}

          <div className="space-y-2 relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input 
              name="email" 
              type="email"
              placeholder="Admin Email" 
              required
              className="w-full bg-black border border-neutral-800 pl-12 pr-6 py-4 rounded-none text-xs font-bold text-white focus:border-gold outline-none transition-all placeholder:text-neutral-600" 
            />
          </div>

          <div className="space-y-2 relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input 
              name="password" 
              type="password"
              placeholder="Passcode" 
              required
              className="w-full bg-black border border-neutral-800 pl-12 pr-6 py-4 rounded-none text-xs font-bold text-white focus:border-gold outline-none transition-all placeholder:text-neutral-600" 
            />
          </div>

          <div className="space-y-3 pt-4">
            <Button 
              type="submit" 
              name="signIn"
              disabled={isLoading}
              className="w-full bg-gold hover:bg-gold-dark text-white rounded-none py-6 text-[11px] font-black uppercase tracking-[0.3em] border-b-4 border-gold-dark transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? "Authenticating..." : "Authorize Access"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
