import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Inkwell | Gói ghém thư tay vào một đường link',
  description:
    'Góc thư tín trên không gian số. Nơi có giấy mộc ép cạnh, nét mực sumi lắng đọng và con dấu sáp khắc chìm — dành cho những lời nhắn riêng tư cần được nâng niu.',
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
    <html lang="vi" className="UkrUtq_variable" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
