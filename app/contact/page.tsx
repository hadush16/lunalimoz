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
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden w-full">
      <main>
        <section className="relative py-16 sm:py-32 px-4 sm:px-6 overflow-hidden bg-black text-white border-b border-neutral-900">
          <div className="max-w-7xl mx-auto text-center relative z-20">
            <h3 className="text-gold text-[10px] font-black uppercase tracking-[0.5em] mb-4 sm:mb-6 animate-fade-in">Private Concierge</h3>
            <h2 className="font-serif text-2xl sm:text-4xl md:text-7xl font-black italic uppercase text-white leading-tight tracking-tight">
              Connect With <span className="text-gold">Luna</span>
              <br className="hidden md:block" />
              <span className="block sm:inline sm:ml-2">Elite Support</span>
            </h2>
            <p className="text-xs sm:text-sm md:text-lg text-neutral-400 mt-6 sm:mt-8 max-w-2xl mx-auto font-medium leading-relaxed px-2 sm:px-0">
              Our dedicated concierge team is available 24/7 to assist with your most complex travel requirements. Experience absolute discretion and precision.
            </p>
          </div>
          
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0 opacity-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/5 rounded-full blur-[120px]" />
          </div>
        </section>

        <section className="py-16 sm:py-24 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
              <div className="space-y-12">
                <div className="bg-neutral-900/50 border border-neutral-800 p-8 sm:p-12 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gold" />
                  <div className="mb-8 sm:mb-10">
                    <h3 className="text-gold text-[10px] font-black uppercase tracking-[0.3em] mb-3 sm:mb-4">Inquiry Form</h3>
                    <h4 className="font-serif text-2xl sm:text-3xl font-black italic uppercase text-white">
                      {isSubmitted ? "Message Sent" : "Send A Message"}
                    </h4>
                  </div>
                  
                  {isSubmitted ? (
                    <div className="text-center py-12 space-y-6">
                      <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto border border-gold/20">
                        <svg className="h-8 w-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-neutral-400 text-sm font-medium">
                        Your inquiry has been received. Our concierge team will respond within 30 minutes.
                      </p>
                      <Button
                        onClick={() => setIsSubmitted(false)}
                        className="bg-gold hover:bg-gold-dark text-white rounded-none py-6 text-[11px] font-black uppercase tracking-[0.3em]"
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label htmlFor="contact-name" className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Full Name</label>
                          <input
                            id="contact-name"
                            type="text"
                            placeholder="John Doe"
                            {...register("name")}
                            className={`w-full bg-black border px-6 py-5 rounded-none text-xs font-bold text-white focus:border-gold outline-none transition-all placeholder:text-neutral-700 ${errors.name ? "border-red-500" : "border-neutral-800"}`}
                          />
                          {errors.name && <p className="text-red-400 text-[10px] font-bold">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-3">
                          <label htmlFor="contact-email" className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Email Address</label>
                          <input
                            id="contact-email"
                            type="email"
                            placeholder="john@example.com"
                            {...register("email")}
                            className={`w-full bg-black border px-6 py-5 rounded-none text-xs font-bold text-white focus:border-gold outline-none transition-all placeholder:text-neutral-700 ${errors.email ? "border-red-500" : "border-neutral-800"}`}
                          />
                          {errors.email && <p className="text-red-400 text-[10px] font-bold">{errors.email.message}</p>}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label htmlFor="contact-subject" className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Subject Of Inquiry</label>
                        <select
                          id="contact-subject"
                          {...register("subject")}
                          className={`w-full bg-black border px-6 py-5 rounded-none text-xs font-bold text-white focus:border-gold outline-none transition-all appearance-none cursor-pointer ${errors.subject ? "border-red-500" : "border-neutral-800"}`}
                        >
                          <option>Corporate Account Request</option>
                          <option>Event Logistics Quote</option>
                          <option>General Reservation Support</option>
                          <option>Fleet Inquiry</option>
                        </select>
                        {errors.subject && <p className="text-red-400 text-[10px] font-bold">{errors.subject.message}</p>}
                      </div>
                      <div className="space-y-3">
                        <label htmlFor="contact-message" className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Detailed Message</label>
                        <textarea
                          id="contact-message"
                          rows={6}
                          placeholder="How can we assist you?"
                          {...register("message")}
                          className={`w-full bg-black border px-6 py-5 rounded-none text-xs font-bold text-white focus:border-gold outline-none transition-all resize-none placeholder:text-neutral-700 ${errors.message ? "border-red-500" : "border-neutral-800"}`}
                        />
                        {errors.message && <p className="text-red-400 text-[10px] font-bold">{errors.message.message}</p>}
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gold hover:bg-gold-dark text-white rounded-none py-6 sm:py-8 text-[11px] sm:text-[12px] font-black uppercase tracking-[0.3em] border-b-4 border-gold-dark shadow-gold/20 shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Transmitting...
                          </>
                        ) : (
                          <>
                            <Send className="h-5 w-5" />
                            Transmit Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </div>
              </div>

              <div className="space-y-16 py-12">
                <div className="space-y-12">
                  <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start group">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-900 border border-neutral-800 rotate-45 flex items-center justify-center flex-shrink-0 group-hover:bg-gold transition-all duration-500">
                      <Phone className="h-6 sm:h-8 w-6 sm:w-8 text-gold -rotate-45 group-hover:text-black transition-colors" />
                    </div>
                    <div className="space-y-3">
                      <h5 className="text-gold text-[10px] font-black uppercase tracking-[0.3em]">Direct Line</h5>
                      <p className="font-serif font-black italic uppercase text-lg sm:text-2xl text-white">(206) 327-4411</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 max-w-xs">Available 24 hours a day, 7 days a week for immediate assistance.</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start group">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-900 border border-neutral-800 rotate-45 flex items-center justify-center flex-shrink-0 group-hover:bg-gold transition-all duration-500">
                      <Mail className="h-6 sm:h-8 w-6 sm:w-8 text-gold -rotate-45 group-hover:text-black transition-colors" />
                    </div>
                    <div className="space-y-3">
                      <h5 className="text-gold text-[10px] font-black uppercase tracking-[0.3em]">Concierge Email</h5>
                      <p className="font-serif font-black italic uppercase text-lg sm:text-2xl text-white">concierge@lunalimo.com</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 max-w-xs">For quotes, corporate accounts, and partnership inquiries.</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start group">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-900 border border-neutral-800 rotate-45 flex items-center justify-center flex-shrink-0 group-hover:bg-gold transition-all duration-500">
                      <MapPin className="h-6 sm:h-8 w-6 sm:w-8 text-gold -rotate-45 group-hover:text-black transition-colors" />
                    </div>
                    <div className="space-y-3">
                      <h5 className="text-gold text-[10px] font-black uppercase tracking-[0.3em]">Seattle Headquarters</h5>
                      <p className="font-serif font-black italic uppercase text-lg sm:text-2xl text-white">1902 E Yesler way</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Seattle, WA 98122</p>
                    </div>
                  </div>
                </div>

                <div className="pt-16 border-t border-neutral-900 grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <ShieldCheck className="h-6 w-6 text-gold" />
                    <h6 className="font-serif text-lg font-black italic uppercase text-white">Absolute Privacy</h6>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Your communication is fully encrypted and discreet.</p>
                  </div>
                  <div className="space-y-4">
                    <Clock className="h-6 w-6 text-gold" />
                    <h6 className="font-serif text-lg font-black italic uppercase text-white">Rapid Response</h6>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Initial response guaranteed within 30 minutes of inquiry.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="h-[500px] w-full bg-neutral-900 relative overflow-hidden border-t-2 border-neutral-800">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d172139.4161662447!2d-122.48214739592477!3d47.61294318304958!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5490102c93e83355%3A0x10256546044d5916!2sSeattle%2C%20WA!5e0!3m2!1sen!2sus!4v1711200000000!5m2!1sen!2sus" 
            width="100%" 
            height="100%" 
            style={{ border: 0, filter: 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)' }} 
            allowFullScreen 
            loading="lazy" 
          />
        </section>
      </main>
    </div>
  );
}
