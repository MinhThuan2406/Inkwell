import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Inkwell | Thư viết tay gửi bằng một đường link',
  description:
    'Viết một lá thư 3D với phong bì, sáp niêm phong và nét chữ viết tay. Gửi người thương bằng một đường link.',
  icons: {
    icon: [
      { url: '/icon.svg?v=inkwell-2', type: 'image/svg+xml' },
      { url: '/favicon.ico?v=inkwell-2', sizes: 'any' },
    ],
    shortcut: '/icon.svg?v=inkwell-2',
    apple: '/apple-icon.png?v=inkwell-2',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f4f4f2',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="UkrUtq_variable">
      <body>{children}</body>
    </html>
  );
}
