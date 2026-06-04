import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import AppLayout from "@/components/AppLayout";
import { PlatformProvider } from "@/lib/PlatformContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Inba Essential Operations OS",
  description: "Web-based Inventory, Sales, Purchase & Operations Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-gray-50 text-secondary min-h-screen flex flex-col print:block print:bg-white`}>
        <PlatformProvider>
          <ToastProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </ToastProvider>
        </PlatformProvider>
      </body>
    </html>
  );
}

