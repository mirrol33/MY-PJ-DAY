// app/layout.tsx
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";
import KakaoInit from "@/components/KakaoInit";
import Head from "next/head";

export const metadata = {
  title: 'Next.js + Firebase로 만든 미니 블로그',
  description: 'Next.js + Firebase로 만든 미니 블로그 : 개인프로젝트4차',
}

export default function RootLayout({children}: {children: React.ReactNode;}) {

  return (
    <html lang="ko">
      <Head>
        {/* favicon */}
        <link rel="icon" href="/favicon.ico" />

        {/* Meta Tags for SEO */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="author" content="LMK" />
        <meta name="keywords" content="Next.js, TypeScript, Firebase, React, SEO, Blog, Portfolio" />
        <meta name="robots" content="index, follow" />

        {/* Open Graph / Facebook */}
        <meta property="og:title" content="Next.js + Firebase로 만든 미니 블로그" />
        <meta property="og:description" content="Next.js + Firebase로 만든 미니 블로그 : 개인프로젝트4차" />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:url" content="https://my-blog-app-49cac.vercel.app/" />
        <meta property="og:type" content="website" />
      </Head>
      <body>
        <AuthProvider>
          <KakaoInit />
          <Header />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
