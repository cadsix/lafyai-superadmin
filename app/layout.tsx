import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "GetVaxxed — Super Admin Console",
  description: "National immunization oversight across all implementors.",
  icons: {
    icon: "/images/logos/getvaxxed-icon.png",
    shortcut: "/images/logos/getvaxxed-icon.png",
    apple: "/images/logos/getvaxxed-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
