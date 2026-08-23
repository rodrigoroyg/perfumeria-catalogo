export const metadata = {
  title: 'Catálogo de Perfumes',
  description: 'Catálogo de productos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
