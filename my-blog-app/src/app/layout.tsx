// MY-PJ-DAY/my-blog-app/src/app/layout.tsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <base href="/MY-PJ-DAY/" />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
