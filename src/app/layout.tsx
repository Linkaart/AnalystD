import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AnalystD — Dashboard Data Analyst",
  description: "Explorez, visualisez et analysez vos données CSV/Excel directement dans le navigateur.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
