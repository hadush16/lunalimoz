import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { Doc } from "@/convex/_generated/dataModel";
import { formatTime } from "@/lib/utils";

const styles = StyleSheet.create({
  page: {
    padding: 0,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    color: "#1a1a1a",
    fontSize: 9,
  },
  // Header band with gold accent
  headerBand: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 40,
    paddingVertical: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  brandSection: {
    flexDirection: "column",
  },
  brandName: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#C6A87C",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  brandTagline: {
    fontSize: 7,
    color: "#888",
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginTop: 4,
  },
  invoiceTitleBlock: {
    textAlign: "right",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  invoiceTitle: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  invoiceNumber: {
    fontSize: 9,
    color: "#C6A87C",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    marginTop: 4,
  },
  // Gold accent line
  goldLine: {
    height: 3,
    backgroundColor: "#C6A87C",
  },
  // Meta info bar
  metaBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 40,
    paddingVertical: 14,
    backgroundColor: "#faf9f7",
    borderBottom: "0.5px solid #e8e0d5",
  },
  metaItem: {
    flexDirection: "column",
  },
  metaLabel: {
    fontSize: 6,
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
  },
  // Main content
  content: {
    paddingHorizontal: 40,
    paddingTop: 24,
  },
  // Two column layout
  twoCol: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  colLeft: {
    width: "55%",
  },
  colRight: {
    width: "40%",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  // Section titles
  sectionTitle: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#C6A87C",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: "1px solid #e8e0d5",
  },
  // Company info
  companyName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  companyDetail: {
    fontSize: 8,
    color: "#666",
    lineHeight: 1.5,
    marginBottom: 2,
  },
  // Client info box
  clientBox: {
    backgroundColor: "#faf9f7",
    padding: 12,
    borderLeft: "2px solid #C6A87C",
  },
  clientName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  clientDetail: {
    fontSize: 8,
    color: "#666",
    lineHeight: 1.5,
    marginBottom: 2,
  },
  // Service details box
  serviceBox: {
    backgroundColor: "#faf9f7",
    border: "0.5px solid #e8e0d5",
    padding: 14,
    marginBottom: 24,
  },
  serviceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  serviceCell: {
    width: "33.33%",
    marginBottom: 12,
  },
  serviceCellWide: {
    width: "50%",
    marginBottom: 12,
  },
  serviceLabel: {
    fontSize: 6,
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  serviceValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
  },
  serviceValueSmall: {
    fontSize: 8,
    color: "#444",
  },
  // Route section
  routeSection: {
    marginTop: 10,
    paddingTop: 12,
    borderTop: "1px dashed #d5c9b5",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  routeBlock: {
    width: "48%",
  },
  routeLabel: {
    fontSize: 6,
    color: "#C6A87C",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  routeValue: {
    fontSize: 8,
    color: "#333",
    lineHeight: 1.3,
  },
  // Table
  table: {
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottom: "0.5px solid #eee",
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottom: "0.5px solid #eee",
    backgroundColor: "#fafafa",
  },
  tableCell: {
    fontSize: 9,
    color: "#333",
  },
  tableCellBold: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
  },
  tableCellRight: {
    textAlign: "right",
  },
  tableCellCenter: {
    textAlign: "center",
  },
  tableCellSmall: {
    fontSize: 7.5,
    color: "#888",
    marginTop: 2,
  },
  // Summary
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 28,
  },
  summaryBox: {
    width: "40%",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottom: "0.5px solid #eee",
  },
  summaryLabel: {
    fontSize: 8.5,
    color: "#777",
  },
  summaryValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    marginTop: 6,
    borderTop: "2px solid #C6A87C",
  },
  totalLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  totalValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#C6A87C",
  },
  // Status badge
  statusBadge: {
    position: "absolute",
    top: 95,
    right: 45,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 3,
    opacity: 0.9,
  },
  statusText: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  // Terms section
  termsSection: {
    marginTop: 10,
    paddingHorizontal: 40,
  },
  termsBox: {
    backgroundColor: "#faf9f7",
    padding: 12,
    border: "0.5px solid #e8e0d5",
  },
  termsTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#999",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  termsText: {
    fontSize: 6.5,
    color: "#888",
    lineHeight: 1.4,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerBand: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 40,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 7,
    color: "#888",
  },
  footerBrand: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#C6A87C",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  footerNote: {
    fontSize: 6,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 40,
    paddingVertical: 6,
    backgroundColor: "#faf9f7",
  },
});

interface InvoicePDFProps {
  ride: Doc<"rides">;
  settings?: {
    companyName: string;
    email: string;
    phone: string;
    address: string;
    [key: string]: any;
  };
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ ride, settings }) => {
  const issueDate = new Date(ride.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const invoiceNumber = `INV-${ride._id.slice(-8).toUpperCase()}`;

  const isHourly = ride.serviceType === "hourly";
  const hourlyDuration = ride.hourlyDuration || 0;

  const statusColor =
    ride.status === "confirmed"
      ? "#059669"
      : ride.status === "cancelled"
        ? "#dc2626"
        : "#d97706";

  const statusBg =
    ride.status === "confirmed"
      ? "#ecfdf5"
      : ride.status === "cancelled"
        ? "#fef2f2"
        : "#fffbeb";

  return (
    <Document title={`Invoice ${invoiceNumber} - Luna Limo`}>
      <Page size="A4" style={styles.page}>
        {/* Dark header band */}
        <View style={styles.headerBand}>
          <View style={styles.brandSection}>
            <Text style={styles.brandName}>Luna Limo</Text>
            <Text style={styles.brandTagline}>Executive Chauffeur Service</Text>
          </View>
          <View style={styles.invoiceTitleBlock}>
            <Text style={styles.invoiceTitle}>Invoice</Text>
            <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
          </View>
        </View>

        {/* Gold accent line */}
        <View style={styles.goldLine} />

        {/* Meta info bar */}
        <View style={styles.metaBar}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Issue Date</Text>
            <Text style={styles.metaValue}>{issueDate}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Service Date</Text>
            <Text style={styles.metaValue}>{ride.pickupDate}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Status</Text>
            <Text style={[styles.metaValue, { color: statusColor }]}>
              {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Status badge */}
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: statusBg,
              border: `1px solid ${statusColor}`,
            },
          ]}
        >
          <Text style={[styles.statusText, { color: statusColor }]}>
            {ride.status === "confirmed"
              ? "PAID"
              : ride.status === "cancelled"
                ? "CANCELLED"
                : "PENDING"}
          </Text>
        </View>

        {/* Main content */}
        <View style={styles.content}>
          {/* Two column: Company info + Client info */}
          <View style={styles.twoCol}>
            <View style={styles.colLeft}>
              <Text style={styles.sectionTitle}>Issued By</Text>
              <Text style={styles.companyName}>
                {settings?.companyName || "Luna Limo"}
              </Text>
              <Text style={styles.companyDetail}>
                {settings?.address || "1902 E Yesler way, Seattle, WA 98122"}
              </Text>
              <Text style={styles.companyDetail}>
                {settings?.phone || "(206) 327-4411"}
              </Text>
              <Text style={styles.companyDetail}>
                {settings?.email || "concierge@lunalimo.com"}
              </Text>
            </View>
            <View style={styles.colRight}>
              <View style={{ width: "100%" }}>
                <Text style={styles.sectionTitle}>Bill To</Text>
                <View style={styles.clientBox}>
                  <Text style={styles.clientName}>
                    {ride.customerName || "Valued Guest"}
                  </Text>
                  <Text style={styles.clientDetail}>{ride.customerEmail}</Text>
                  {ride.customerPhone && (
                    <Text style={styles.clientDetail}>{ride.customerPhone}</Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Service details box */}
          <View style={styles.serviceBox}>
            <Text style={styles.sectionTitle}>Service Details</Text>
            <View style={styles.serviceGrid}>
              <View style={styles.serviceCell}>
                <Text style={styles.serviceLabel}>Service Type</Text>
                <Text style={styles.serviceValue}>
                  {isHourly ? "Hourly Charter" : "Point-to-Point"}
                </Text>
              </View>
              <View style={styles.serviceCell}>
                <Text style={styles.serviceLabel}>Vehicle Class</Text>
                <Text style={styles.serviceValue}>{ride.carTypeName}</Text>
              </View>
              <View style={styles.serviceCell}>
                <Text style={styles.serviceLabel}>Scheduled Time</Text>
                <Text style={styles.serviceValue}>
                  {ride.pickupTime ? formatTime(ride.pickupTime) : "TBD"}
                </Text>
              </View>
              <View style={styles.serviceCell}>
                <Text style={styles.serviceLabel}>Passengers</Text>
                <Text style={styles.serviceValue}>{ride.passengers}</Text>
              </View>
              <View style={styles.serviceCell}>
                <Text style={styles.serviceLabel}>Luggage</Text>
                <Text style={styles.serviceValue}>{ride.luggage}</Text>
              </View>
              {isHourly && hourlyDuration > 0 && (
                <View style={styles.serviceCell}>
                  <Text style={styles.serviceLabel}>Duration</Text>
                  <Text style={styles.serviceValue}>
                    {hourlyDuration} Hour{hourlyDuration > 1 ? "s" : ""}
                  </Text>
                </View>
              )}
            </View>

            {/* Route info for point-to-point */}
            {!isHourly && (
              <View style={styles.routeSection}>
                <View style={styles.routeBlock}>
                  <Text style={styles.routeLabel}>Pickup</Text>
                  <Text style={styles.routeValue}>{ride.pickupAddress}</Text>
                </View>
                <View style={styles.routeBlock}>
                  <Text style={styles.routeLabel}>Destination</Text>
                  <Text style={styles.routeValue}>
                    {ride.destinationAddress}
                  </Text>
                </View>
              </View>
            )}
            {isHourly && (
              <View style={styles.routeSection}>
                <View style={styles.routeBlock}>
                  <Text style={styles.routeLabel}>Service Notes</Text>
                  <Text style={styles.routeValue}>
                    Hourly charter — route to be determined by client during
                    service period.
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Line items table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 3 }]}>
                Description
              </Text>
              <Text style={[styles.tableHeaderCell, { flex: 0.6, textAlign: "center" }]}>
                Qty
              </Text>
              <Text style={[styles.tableHeaderCell, { flex: 0.8, textAlign: "center" }]}>
                Rate
              </Text>
              <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: "right" }]}>
                Amount
              </Text>
            </View>

            {isHourly ? (
              <View style={styles.tableRow}>
                <View style={{ flex: 3 }}>
                  <Text style={styles.tableCellBold}>
                    {ride.carTypeName} — Hourly Charter
                  </Text>
                  <Text style={styles.tableCellSmall}>
                    Professional chauffeur service with executive vehicle
                  </Text>
                </View>
                <Text style={[styles.tableCell, styles.tableCellCenter, { flex: 0.6 }]}>
                  {hourlyDuration}
                </Text>
                <Text style={[styles.tableCell, styles.tableCellCenter, { flex: 0.8 }]}>
                  ${(ride.price / hourlyDuration).toFixed(2)}/hr
                </Text>
                <Text style={[styles.tableCellBold, styles.tableCellRight, { flex: 1 }]}>
                  ${ride.price.toFixed(2)}
                </Text>
              </View>
            ) : (
              <View style={styles.tableRow}>
                <View style={{ flex: 3 }}>
                  <Text style={styles.tableCellBold}>
                    {ride.carTypeName} — Point-to-Point Transfer
                  </Text>
                  <Text style={styles.tableCellSmall}>
                    {ride.distance.toFixed(1)} km • {ride.duration.toFixed(0)}{" "}
                    min estimated
                  </Text>
                </View>
                <Text style={[styles.tableCell, styles.tableCellCenter, { flex: 0.6 }]}>
                  1
                </Text>
                <Text style={[styles.tableCell, styles.tableCellCenter, { flex: 0.8 }]}>
                  —
                </Text>
                <Text style={[styles.tableCellBold, styles.tableCellRight, { flex: 1 }]}>
                  ${ride.price.toFixed(2)}
                </Text>
              </View>
            )}

            {ride.notes && (
              <View style={styles.tableRowAlt}>
                <View style={{ flex: 3 }}>
                  <Text style={[styles.tableCellBold, { color: "#666" }]}>
                    Special Instructions
                  </Text>
                  <Text style={styles.tableCellSmall}>{ride.notes}</Text>
                </View>
                <Text style={[styles.tableCell, styles.tableCellCenter, { flex: 0.6 }]}>
                  —
                </Text>
                <Text style={[styles.tableCell, styles.tableCellCenter, { flex: 0.8 }]}>
                  —
                </Text>
                <Text style={[styles.tableCellBold, styles.tableCellRight, { flex: 1 }]}>
                  $0.00
                </Text>
              </View>
            )}
          </View>

          {/* Financial summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>${ride.price.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Taxes & Fees</Text>
                <Text style={styles.summaryValue}>$0.00</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Gratuity</Text>
                <Text style={styles.summaryValue}>Discretionary</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Due</Text>
                <Text style={styles.totalValue}>${ride.price.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Terms section */}
        <View style={styles.termsSection}>
          <View style={styles.termsBox}>
            <Text style={styles.termsTitle}>Terms & Conditions</Text>
            <Text style={styles.termsText}>
              Payment is due upon booking confirmation. All reservations are
              subject to Luna Limo's standard terms of service. Cancellations
              made within 24 hours of scheduled pickup may incur a fee. This
              invoice serves as an official receipt upon payment. For inquiries,
              contact concierge@lunalimo.com or (206) 327-4411.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerNote}>
            <Text>
              Thank you for choosing Luna Limo. We look forward to serving you
              again.
            </Text>
          </View>
          <View style={styles.footerBand}>
            <Text style={styles.footerText}>
              {settings?.address || "1902 E Yesler way, Seattle, WA 98122"}
            </Text>
            <Text style={styles.footerBrand}>Luna Limo</Text>
            <Text style={styles.footerText}>
              {settings?.phone || "(206) 327-4411"}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
