import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SocialesVIP - Gestión Premium de Eventos",
  description: "Plataforma de gestión e invitaciones exclusiva para Salones de Eventos Sociales",
  manifest: "/manifest.json"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-obsidian text-foreground font-sans relative overflow-x-hidden flex flex-col justify-between">
        {/* Subtle decorative glowing background accents for premium design */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-zafiro/10 blur-[150px] pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gold/5 blur-[130px] pointer-events-none z-0" />
        
        <AuthProvider>
          <main className="flex-grow z-10 relative">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
