"use client";

import React, { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { FileText, Mail, Download, Check, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDownloadLink, pdf, Document, Page, Text, View } from "@react-pdf/renderer";
import { InvoicePDF } from "./InvoicePDF";

interface Props {
  ride: Doc<"rides">;
}

export function GenerateInvoiceButton({ ride }: Props) {
  const settings = useQuery(api.settings.get);
  const sendInvoiceAction = useAction(api.actions.sendInvoice);
  
  const [isEmailing, setIsEmailing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "success" | "error">("idle");
  const [showOptions, setShowOptions] = useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Convert Blob to Base64 for the Convex Action
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Strip the data:application/pdf;base64, prefix
        const base64Content = base64String.split(",")[1];
        resolve(base64Content);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleEmailInvoice = async () => {
    if (isEmailing) return;
    
    setIsEmailing(true);
    setEmailStatus("idle");
    
    try {
      // 1. Generate the PDF instance
      const doc = <InvoicePDF ride={ride} settings={settings as any} />;
      const blob = await pdf(doc).toBlob();
      
      // 2. Convert to base64
      const base64 = await blobToBase64(blob);
      
      // 3. Send via Convex Action
      const result = await sendInvoiceAction({
        rideId: ride._id,
        pdfBase64: base64
      });
      
      if (result.success) {
        setEmailStatus("success");
        setTimeout(() => {
          setEmailStatus("idle");
          setShowOptions(false);
        }, 2000);
      } else {
        setEmailStatus("error");
      }
    } catch (error) {
      console.error("Action Invoicing Error:", error);
      setEmailStatus("error");
    } finally {
      setIsEmailing(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const doc = <InvoicePDF ride={ride} settings={settings as any} />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `LunaLimo-Invoice-${invoiceNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      
      setTimeout(() => setShowOptions(false), 1000);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Executive Error: Failed to generate document.");
    } finally {
      setIsDownloading(false);
    }
  };

  const invoiceNumber = ride._id.slice(-8).toUpperCase();

  return (
    <div className="relative inline-block w-full">
      {!showOptions ? (
        <Button
          onClick={() => setShowOptions(true)}
          variant="outline"
          size="sm"
          className="w-full bg-gold/5 text-gold border-gold/20 hover:bg-gold hover:text-white rounded-none text-[10px] font-bold uppercase tracking-[0.2em] h-9 transition-all duration-300"
        >
          <FileText className="h-3.5 w-3.5 mr-2" />
          Manage Invoice
        </Button>
      ) : (
        <div className="flex flex-col gap-1.5 p-2 bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-[7px] text-neutral-500 uppercase tracking-widest mb-1 px-1">Invoice Options</div>
          
          <Button
            onClick={handleDownloadInvoice}
            variant="ghost"
            size="sm"
            disabled={isDownloading}
            className="w-full text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-none text-[8px] font-bold uppercase tracking-widest h-8 justify-start gap-3 px-2 border-l-2 border-transparent hover:border-gold transition-all"
          >
            {isDownloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5 text-gold" />}
            {isDownloading ? "Generating..." : "Download PDF"}
          </Button>

          <Button
            onClick={handleEmailInvoice}
            disabled={isEmailing}
            variant="ghost"
            size="sm"
            className={`w-full rounded-none text-[8px] font-bold uppercase tracking-widest h-8 justify-start gap-3 px-2 border-l-2 transition-all ${
              emailStatus === "success" ? "text-emerald-400 border-emerald-500 bg-emerald-500/5" :
              emailStatus === "error" ? "text-red-400 border-red-500 bg-red-500/5" :
              "text-neutral-300 hover:text-white hover:bg-neutral-800 border-transparent hover:border-gold"
            }`}
          >
            {isEmailing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 
             emailStatus === "success" ? <Check className="h-3.5 w-3.5" /> :
             emailStatus === "error" ? <AlertCircle className="h-3.5 w-3.5" /> :
             <Mail className="h-3.5 w-3.5 text-gold" />}
            {isEmailing ? "Sending..." : emailStatus === "success" ? "Transmission Successful" : emailStatus === "error" ? "Dispatch Failed" : "Send to Client"}
          </Button>

          <button 
            onClick={() => setShowOptions(false)}
            className="w-full py-1.5 text-neutral-500 hover:text-white text-[8px] font-bold uppercase tracking-[0.1em] mt-1 transition-colors border-t border-neutral-800"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
