import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Catálogo de Perfumes',
  description: 'Catálogo de productos y perfumería',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
