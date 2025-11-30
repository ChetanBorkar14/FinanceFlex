import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FinanceFlex",
  description: "Your Flexible Financial Partner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
      (function() {
        const setTheme = () => {
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        };
        setTheme();
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setTheme);
      })();
    `,
          }}
        />
      </head>
      <body
        className={`${manrope.variable} antialiased bg-background text-foreground font-sans`}
      >
        <main className="min-h-screen bg-background">{children}</main>
        <Analytics />
        <footer className="w-full border-t border-border py-6 flex flex-col items-center bg-background">
          <span className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} FinanceFlex. All rights reserved.
          </span>
        </footer>
      </body>
    </html>
  );
}
