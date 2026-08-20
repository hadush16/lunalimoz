import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Revenue Reports & Analytics | Admin - Luna Limo",
  description: "Comprehensive revenue analytics, date range reporting, and business insights for Luna Limo.",
  alternates: {
    canonical: "https://lunalimoz.com/admin/reports"
  }
};

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
