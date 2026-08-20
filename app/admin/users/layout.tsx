import { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Management | Admin - Luna Limo",
  description: "Manage user accounts, admin access, and customer profiles.",
  alternates: {
    canonical: "https://lunalimoz.com/admin/users"
  }
};

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
