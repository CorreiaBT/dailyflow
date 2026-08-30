import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/context/AppContext";
import { BottomNav } from "@/components/BottomNav";
import { WelcomeTutorial } from "@/components/WelcomeTutorial";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DailyFlow",
  description: "Controle de gastos diários, metas e projeções de investimento.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DailyFlow",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0b07",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-white">
        <div className="bg-flow-line" aria-hidden>
          <svg viewBox="0 0 1600 100" preserveAspectRatio="none" fill="none">
            <path
              d="M0,60 Q50,20 100,60 Q150,100 200,60 Q250,20 300,60 Q350,100 400,60 Q450,20 500,60 Q550,100 600,60 Q650,20 700,60 Q750,100 800,60
                 Q850,20 900,60 Q950,100 1000,60 Q1050,20 1100,60 Q1150,100 1200,60 Q1250,20 1300,60 Q1350,100 1400,60 Q1450,20 1500,60 Q1550,100 1600,60"
              stroke="#d9b95c"
              strokeWidth="2"
            />
          </svg>
        </div>
        <AppProvider>
          <main className="flex-1 pb-24">{children}</main>
          <BottomNav />
          <WelcomeTutorial />
        </AppProvider>
      </body>
    </html>
  );
}
