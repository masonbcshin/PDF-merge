import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PDF Merger Pro - 무료 온라인 PDF 병합 도구',
  description:
    '무료로 PDF 파일을 병합하세요. 파일이 서버에 업로드되지 않아 100% 안전합니다. 브라우저에서 직접 처리되며, 드래그 앤 드롭으로 쉽게 순서를 변경할 수 있습니다.',
  keywords: [
    'PDF 병합',
    'PDF 합치기',
    'PDF merger',
    'PDF combiner',
    '무료 PDF',
    '온라인 PDF',
    'PDF 도구',
    '문서 병합',
  ],
  authors: [{ name: 'PDF Merger Pro Team' }],
  creator: 'PDF Merger Pro',
  publisher: 'PDF Merger Pro',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://pdf-merger-pro.vercel.app',
    siteName: 'PDF Merger Pro',
    title: 'PDF Merger Pro - 무료 온라인 PDF 병합 도구',
    description:
      '무료로 PDF 파일을 병합하세요. 100% 브라우저 처리로 파일이 서버에 업로드되지 않습니다.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PDF Merger Pro',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PDF Merger Pro - 무료 온라인 PDF 병합 도구',
    description:
      '무료로 PDF 파일을 병합하세요. 100% 브라우저 처리로 완벽한 프라이버시.',
    images: ['/og-image.png'],
    creator: '@pdfmergerpro',
  },
  alternates: {
    canonical: 'https://pdf-merger-pro.vercel.app',
  },
  category: 'technology',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const kakaoAppKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="ko">
      <head>
        {/* Kakao SDK - 환경변수가 있을 때만 로드 */}
        {kakaoAppKey && (
          <Script
            src="https://developers.kakao.com/sdk/js/kakao.min.js"
            strategy="lazyOnload"
          />
        )}

        {/* Google Analytics - 환경변수가 있을 때만 로드 */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          {/* 메인 콘텐츠 */}
          <main className="flex-1">{children}</main>

          {/* 푸터 */}
          <footer className="border-t border-gray-200 bg-white">
            <div className="max-w-4xl mx-auto px-4 py-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-500">
                  &copy; {new Date().getFullYear()} PDF Merger Pro. All rights
                  reserved.
                </div>
                <div className="flex items-center gap-4">
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    GitHub
                  </a>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm text-gray-500">
                    Made with Next.js
                  </span>
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-400 text-center">
                이 서비스는 모든 파일을 브라우저에서만 처리합니다. 파일이 서버로
                전송되지 않습니다.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
