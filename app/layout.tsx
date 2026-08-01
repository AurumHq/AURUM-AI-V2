import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AURUM AI V2",
  description: "Private AI-assisted gold trading workspace"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
