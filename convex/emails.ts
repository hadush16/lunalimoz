import { internalAction, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";
import { internal } from "./_generated/api";

const resend = new Resend(process.env.RESEND_API_KEY!);

// Default settings if none exist
const DEFAULT_SETTINGS = {
  companyName: "Luna Limo",
  email: "concierge@lunalimo.com",
  phone: "(206) 327-4411",
  address: "1902 E Yesler way, Seattle, WA 98122",
  surgeMultiplier: 1.0,
  minimumFare: 50.0,
  notificationsEmail: true,
};

// Internal query to securely fetch data for the email action
export const getEmailData = internalQuery({
  args: { rideId: v.id("rides") },
  handler: async (ctx, args) => {
    const ride = await ctx.db.get(args.rideId);
    const settings = (await ctx.db.query("settings").first()) || DEFAULT_SETTINGS;
    return { ride, settings };
  },
});

export const sendBookingEmail = internalAction({
  args: {
    rideId: v.id("rides"),
    type: v.union(v.literal("new_booking"), v.literal("status_update")),
    newStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const emailData = await ctx.runQuery(internal.emails.getEmailData, { rideId: args.rideId });
    if (!emailData.ride || !emailData.settings) throw new Error("Data not found for email");

    const { ride, settings } = emailData;
    
    if (!settings.notificationsEmail) {
      console.log("Email notifications disabled, skipping booking email");
      return;
    }
    
    const fromAddress = `Luna Limo <${process.env.RESEND_FROM_EMAIL || "noreply@lunalimoz.com"}>`;
    const rawToAddresses = [ride.customerEmail, settings.email].filter(Boolean) as string[];
    const toAddresses = Array.from(new Set(rawToAddresses));

    const isNew = args.type === "new_booking";
    const statusText = isNew ? "RECEIVED" : (args.newStatus || ride.status).toUpperCase();
    const subject = isNew 
      ? `Reservation Received: Luna Limo Executive Service`
      : `Reservation Update [${statusText}]: Luna Limo`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-w-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 40px; border: 1px solid #333;">
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 1px solid #333; padding-bottom: 20px;">
          <h1 style="color: #C6A87C; font-size: 24px; margin: 0; text-transform: uppercase; letter-spacing: 4px; font-style: italic;">Luna Limo</h1>
          <p style="color: #888; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">Executive Transportation</p>
        </div>

        <h2 style="color: #fff; font-size: 18px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px;">
          ${isNew ? "Booking Confirmation" : "Booking Update"}
        </h2>
        
        <p style="color: #ccc; line-height: 1.6; font-size: 14px;">
          Dear ${ride.customerName},<br><br>
          ${isNew 
            ? "Your reservation has been received and is currently Pending review by our dispatch team. You will receive an update once it is confirmed." 
            : `The status of your reservation has been updated to: <strong style="color: #C6A87C;">${statusText}</strong>`
          }
        </p>

        <div style="background-color: #111; border-left: 3px solid #C6A87C; padding: 20px; margin: 30px 0;">
          <h3 style="color: #C6A87C; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 0; margin-bottom: 15px;">Journey Details</h3>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="color: #888; padding: 8px 0; width: 35%; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Date & Time</td>
              <td style="color: #fff; padding: 8px 0;"><strong>${ride.pickupDate} @ ${ride.pickupTime || "TBD"}</strong></td>
            </tr>
            <tr>
              <td style="color: #888; padding: 8px 0; border-top: 1px solid #222; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Pickup</td>
              <td style="color: #fff; padding: 8px 0; border-top: 1px solid #222;">${ride.pickupAddress}</td>
            </tr>
            <tr>
              <td style="color: #888; padding: 8px 0; border-top: 1px solid #222; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Destination</td>
              <td style="color: #fff; padding: 8px 0; border-top: 1px solid #222;">${ride.destinationAddress}</td>
            </tr>
            <tr>
              <td style="color: #888; padding: 8px 0; border-top: 1px solid #222; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Vehicle Class</td>
              <td style="color: #fff; padding: 8px 0; border-top: 1px solid #222;">${ride.carTypeName}</td>
            </tr>
            <tr>
              <td style="color: #888; padding: 8px 0; border-top: 1px solid #222; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Total Fare</td>
              <td style="color: #C6A87C; padding: 8px 0; border-top: 1px solid #222; font-size: 16px; font-weight: bold; font-style: italic;">$${ride.price.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <p style="color: #888; font-size: 12px; margin-top: 40px; text-align: center;">
          For any changes or inquiries, please reply to this email or contact our dispatch team.<br>
          <strong style="color: #ccc;">${settings.phone}</strong> | ${settings.email}
        </p>
      </div>
    `;

    const emailResult = await resend.emails.send({
      from: fromAddress,
      to: toAddresses,
      subject,
      html: htmlContent,
      tags: [
        { name: "type", value: args.type },
        { name: "ride_id", value: args.rideId },
      ],
    });

    if (emailResult.error) {
      console.error("Failed to send booking email via Resend:", emailResult.error);
      throw new Error(`Failed to send booking email: ${emailResult.error.message}`);
    }

    console.log("Booking email sent successfully:", emailResult.data);
  },
});

export const sendInvoiceEmail = internalAction({
  args: {
    rideId: v.id("rides"),
    pdfBase64: v.string(),
  },
  handler: async (ctx, args) => {
    const data = await ctx.runQuery(internal.emails.getEmailData, { rideId: args.rideId });
    if (!data.ride || !data.settings) throw new Error("Data not found for invoice email");

    const { ride, settings } = data;
    
    const fromAddress = `Luna Limo <${process.env.RESEND_FROM_EMAIL || "noreply@lunalimoz.com"}>`;
    const toAddress = ride.customerEmail as string;
    
    const dateStr = new Date(ride.createdAt).toLocaleDateString().replace(/\//g, "-");
    const attachmentName = `Invoice-LunaLimo-${dateStr}.pdf`;

    try {
      const resp = await resend.emails.send({
        from: fromAddress,
        to: toAddress,
        subject: `Invoice for your Luna Limo Journey - ${ride.pickupDate}`,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #000; color: #fff; padding: 60px 40px; border: 1px solid #333; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 50px;">
              <h1 style="color: #C6A87C; font-size: 28px; font-style: italic; text-transform: uppercase; letter-spacing: 5px; margin: 0;">Luna Limo</h1>
              <p style="color: #888; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; margin-top: 10px;">Executive Chauffeur Service</p>
            </div>
            
            <div style="border-left: 2px solid #C6A87C; padding-left: 25px; margin-bottom: 40px;">
              <h2 style="color: #fff; font-size: 18px; font-weight: normal; margin-bottom: 15px;">Official Invoice Attached</h2>
              <p style="color: #ccc; line-height: 1.8; font-size: 15px;">
                Dear ${ride.customerName || "Valued Client"},
              </p>
              <p style="color: #ccc; line-height: 1.8; font-size: 15px;">
                Please find the official invoice for your recent journey with Luna Limo attached to this email. We hope you enjoyed the executive experience and the service met your highest expectations.
              </p>
            </div>

            <div style="background-color: #111; padding: 25px; margin-bottom: 40px; border: 1px solid #222;">
              <h3 style="color: #C6A87C; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 0; margin-bottom: 15px;">Service Summary</h3>
              <table style="width: 100%; font-size: 14px; color: #ccc;">
                <tr>
                  <td style="padding: 5px 0; color: #888;">Date:</td>
                  <td style="padding: 5px 0; text-align: right; color: #fff;">${ride.pickupDate}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #888;">Vehicle:</td>
                  <td style="padding: 5px 0; text-align: right; color: #fff;">${ride.carTypeName}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #888;">Amount:</td>
                  <td style="padding: 5px 0; text-align: right; color: #C6A87C; font-weight: bold;">$${ride.price.toFixed(2)}</td>
                </tr>
              </table>
            </div>

            <p style="color: #888; line-height: 1.8; font-size: 14px; text-align: center;">
              Thank you for choosing Luna Limo. We look forward to your next reservation.
            </p>
            
            <div style="margin-top: 50px; text-align: center; border-top: 1px solid #222; paddingTop: 30px;">
              <p style="color: #C6A87C; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px;">
                Luna Limo Worldwide
              </p>
              <p style="color: #555; font-size: 11px;">
                ${settings.address}<br>
                ${settings.phone} | ${settings.email}
              </p>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: attachmentName,
            content: args.pdfBase64,
          },
        ],
      });
      console.log("Invoice email dispatched successfully:", resp);
      return { success: true };
    } catch (error) {
      console.error("Failed to send invoice email:", error);
      return { success: false, error: String(error) };
    }
  },
});

export const getContactInquiryData = internalQuery({
  args: { inquiryId: v.id("contactInquiries") },
  handler: async (ctx, args) => {
    const inquiry = await ctx.db.get(args.inquiryId);
    const settings = (await ctx.db.query("settings").first()) || {
      companyName: "Luna Limo",
      email: "concierge@lunalimo.com",
    };
    return { inquiry, settings };
  },
});

export const sendContactInquiryEmail = internalAction({
  args: {
    inquiryId: v.id("contactInquiries"),
    adminEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const data = await ctx.runQuery(internal.emails.getContactInquiryData, { inquiryId: args.inquiryId });
    if (!data.inquiry || !data.settings) throw new Error("Data not found for contact inquiry email");

    const { inquiry, settings } = data;
    
    const fromAddress = `Luna Limo <${process.env.RESEND_FROM_EMAIL || "noreply@lunalimoz.com"}>`;

    try {
      const resp = await resend.emails.send({
        from: fromAddress,
        to: [args.adminEmail],
        subject: `New Contact Inquiry: ${inquiry.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 40px; border: 1px solid #333;">
            <div style="text-align: center; margin-bottom: 40px; border-bottom: 1px solid #333; padding-bottom: 20px;">
              <h1 style="color: #C6A87C; font-size: 24px; margin: 0; text-transform: uppercase; letter-spacing: 4px; font-style: italic;">Luna Limo</h1>
              <p style="color: #888; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">New Contact Inquiry</p>
            </div>

            <div style="background-color: #111; border-left: 3px solid #C6A87C; padding: 20px; margin: 30px 0;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="color: #888; padding: 8px 0; width: 30%; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Name</td>
                  <td style="color: #fff; padding: 8px 0;">${inquiry.name}</td>
                </tr>
                <tr>
                  <td style="color: #888; padding: 8px 0; border-top: 1px solid #222; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Email</td>
                  <td style="color: #fff; padding: 8px 0; border-top: 1px solid #222;">${inquiry.email}</td>
                </tr>
                <tr>
                  <td style="color: #888; padding: 8px 0; border-top: 1px solid #222; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Subject</td>
                  <td style="color: #fff; padding: 8px 0; border-top: 1px solid #222;">${inquiry.subject}</td>
                </tr>
                <tr>
                  <td style="color: #888; padding: 8px 0; border-top: 1px solid #222; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Message</td>
                  <td style="color: #fff; padding: 8px 0; border-top: 1px solid #222;">${inquiry.message}</td>
                </tr>
              </table>
            </div>

            <p style="color: #888; font-size: 12px; margin-top: 40px; text-align: center;">
              This inquiry was submitted via the Luna Limo website.<br>
              Log in to the admin panel to manage inquiries.
            </p>
          </div>
        `,
      });
      console.log("Contact inquiry email dispatched:", resp);
    } catch (error) {
      console.error("Failed to send contact inquiry email:", error);
    }
  },
});
