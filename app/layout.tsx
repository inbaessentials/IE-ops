import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import Sidebar from "@/components/Sidebar";
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
      <body className={`${inter.variable} font-sans antialiased bg-gray-50 text-secondary min-h-screen flex print:block print:bg-white`}>
        <PlatformProvider>
          <ToastProvider>
            <div className="print:hidden shrink-0">
              <Sidebar />
            </div>
            <div className="flex-1 flex flex-col min-h-screen print:block print:min-h-0">
              <main className="flex-1 p-8 ml-64 overflow-auto print:p-0 print:m-0 print:overflow-visible print:block">
                <div className="max-w-7xl mx-auto print:max-w-none">
                  {children}
                </div>
              </main>
            </div>
          </ToastProvider>
        </PlatformProvider>
      </body>
    </html>
  );
}

