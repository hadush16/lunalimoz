"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Send, Clock, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactUsPage() {
  const submitContact = useMutation(api.contact.submit);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "General Reservation Support",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      await submitContact({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      });
      setIsSubmitted(true);
      reset();
    } catch (error) {
      console.error("Failed to submit contact form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden w-full transition-colors duration-200">
      <main>
        <section className="relative py-16 sm:py-24 px-4 sm:px-6 overflow-hidden bg-secondary/40 border-b border-border transition-colors">
          <div className="max-w-7xl mx-auto text-center relative z-20 space-y-4">
            <span className="text-gold text-[10px] font-black uppercase tracking-[0.4em]">Private Concierge</span>
            <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl font-black italic uppercase text-foreground leading-tight tracking-tight">
              Connect With <span className="text-gold">Luna</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
              Our dedicated Seattle concierge dispatch team is available 24/7 to assist with your most complex travel requirements, corporate billing, or multi-vehicle event logistics.
            </p>
          </div>
        </section>

        <section className="py-16 sm:py-24 bg-background transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              <div>
                <div className="bg-card border border-border p-6 sm:p-10 relative shadow-sm">
                  <div className="mb-6 space-y-1">
                    <span className="text-gold text-[10px] font-black uppercase tracking-[0.25em]">Direct Inquiry</span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-black italic uppercase text-foreground">
                      {isSubmitted ? "Message Sent" : "Send A Message"}
                    </h2>
                  </div>
                  
                  {isSubmitted ? (
                    <div className="text-center py-10 space-y-4">
                      <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="h-7 w-7" />
                      </div>
                      <p className="text-muted-foreground text-xs sm:text-sm font-medium">
                        Your inquiry has been received. Our concierge team will reply within 30 minutes.
                      </p>
                      <Button
                        onClick={() => setIsSubmitted(false)}
                        className="bg-gold hover:bg-gold-dark text-primary-foreground rounded-none py-5 text-xs font-black uppercase tracking-[0.2em]"
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="contact-name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Name *</label>
                          <input
                            id="contact-name"
                            type="text"
                            placeholder="Alexander Wright"
                            {...register("name")}
                            className={`w-full bg-secondary border px-4 py-3.5 text-xs font-bold text-foreground focus:border-gold outline-none transition-colors ${errors.name ? "border-destructive" : "border-border"}`}
                          />
                          {errors.name && <p className="text-destructive text-[10px] font-bold">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="contact-email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address *</label>
                          <input
                            id="contact-email"
                            type="email"
                            placeholder="client@executive.com"
                            {...register("email")}
                            className={`w-full bg-secondary border px-4 py-3.5 text-xs font-bold text-foreground focus:border-gold outline-none transition-colors ${errors.email ? "border-destructive" : "border-border"}`}
                          />
                          {errors.email && <p className="text-destructive text-[10px] font-bold">{errors.email.message}</p>}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="contact-subject" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Subject Of Inquiry</label>
                        <select
                          id="contact-subject"
                          {...register("subject")}
                          className={`w-full bg-secondary border px-4 py-3.5 text-xs font-bold text-foreground focus:border-gold outline-none transition-colors cursor-pointer ${errors.subject ? "border-destructive" : "border-border"}`}
                        >
                          <option>Corporate Account Request</option>
                          <option>Event Logistics Quote</option>
                          <option>General Reservation Support</option>
                          <option>Fleet Inquiry</option>
                        </select>
                        {errors.subject && <p className="text-destructive text-[10px] font-bold">{errors.subject.message}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="contact-message" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Detailed Message *</label>
                        <textarea
                          id="contact-message"
                          rows={5}
                          placeholder="How can our concierge desk assist you?"
                          {...register("message")}
                          className={`w-full bg-secondary border px-4 py-3.5 text-xs font-bold text-foreground focus:border-gold outline-none transition-colors resize-none ${errors.message ? "border-destructive" : "border-border"}`}
                        />
                        {errors.message && <p className="text-destructive text-[10px] font-bold">{errors.message.message}</p>}
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gold hover:bg-gold-dark text-primary-foreground rounded-none py-6 text-xs font-black uppercase tracking-[0.2em] shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          "Transmitting..."
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </div>
              </div>

              <div className="space-y-10">
                <div className="space-y-6">
                  <div className="flex gap-4 items-start p-4 bg-card border border-border shadow-sm">
                    <Phone className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-foreground font-serif text-base font-black italic uppercase">Direct Dispatch</h3>
                      <p className="text-foreground font-bold text-sm mt-0.5">(206) 327-4411</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Available 24/7 for immediate route adjustments.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start p-4 bg-card border border-border shadow-sm">
                    <Mail className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-foreground font-serif text-base font-black italic uppercase">Concierge Email</h3>
                      <p className="text-foreground font-bold text-sm mt-0.5">info@lunalimoz.com</p>
                      <p className="text-[10px] text-muted-foreground mt-1">For quotes, corporate billing, and partnership inquiries.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start p-4 bg-card border border-border shadow-sm">
                    <MapPin className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-foreground font-serif text-base font-black italic uppercase">Seattle Operations</h3>
                      <p className="text-foreground font-bold text-sm mt-0.5">1902 E Yesler Way</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Seattle, WA 98122</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-gold text-xs font-bold uppercase">
                      <ShieldCheck className="h-4 w-4" /> Discretion Guaranteed
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">Confidential and NDA-compliant communication.</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-gold text-xs font-bold uppercase">
                      <Clock className="h-4 w-4" /> Rapid Response
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">Inquiries answered in under 30 minutes.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="h-[350px] w-full bg-secondary relative overflow-hidden border-t border-border">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d172139.4161662447!2d-122.48214739592477!3d47.61294318304958!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5490102c93e83355%3A0x10256546044d5916!2sSeattle%2C%20WA!5e0!3m2!1sen!2sus!4v1711200000000!5m2!1sen!2sus" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy" 
            title="Luna Limo Seattle Operations Map"
          />
        </section>
      </main>
    </div>
  );
}
