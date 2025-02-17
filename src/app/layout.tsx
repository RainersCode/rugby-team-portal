import type { Metadata } from "next";
import { Jockey_One, Roboto } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/context/LanguageContext";

const jockeyOne = Jockey_One({ 
  weight: '400',
  subsets: ["latin"],
  variable: '--font-jockey-one',
});

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ["latin"],
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: "Rugby Team Portal",
  description: "Professional Rugby Team Website Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jockeyOne.variable} ${roboto.variable} font-roboto bg-bg-light dark:bg-bg-dark text-content-light dark:text-content-dark`}
      >
        <ThemeProvider>
          <LanguageProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </LanguageProvider>
        </ThemeProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
