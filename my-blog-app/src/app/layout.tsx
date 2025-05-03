// my-blog-app/src/app/page.tsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '@/scss/layout.scss';  // SCSS 스타일 추가

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
