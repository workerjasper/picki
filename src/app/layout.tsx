import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import Navbar from '@/components/navbar';

export const metadata: Metadata = {
  title: 'Picki - 링크로 통하는 트렌드 SNS',
  description: '링크 + 한줄 코멘트로 오늘의 트렌드를 공유하세요',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 min-h-screen">
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2823246129545432"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <AuthProvider>
          <Navbar />
          <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
