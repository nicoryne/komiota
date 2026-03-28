import { Quicksand, Inter } from 'next/font/google';
import "./globals.css";
import { cn } from "@/lib/utils";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "sonner";
import { metadata as siteMetadata } from "@/lib/metadata";

// Heading font - Quicksand
const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-quicksand',
  display: 'swap',
});

// Body font - Inter
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = siteMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", quicksand.variable, inter.variable)}
    >
      <body className="min-h-full flex flex-col font-inter bg-vanilla-milk">
        <QueryProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#FFFFFF',
                color: '#402859',
                border: '1px solid #CAB6CE',
              },
              className: 'font-inter',
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
