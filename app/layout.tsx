import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marta’s English · Catch-up course",
  description: "Интерактивный курс Elementary: Units 4C–5C.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
