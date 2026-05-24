import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AXIOM — Trustless Agent Settlement",
  description: "The trustless settlement protocol for AI agent work on ARC Chain. Payment releases only when cryptographic proof confirms the output is correct.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}