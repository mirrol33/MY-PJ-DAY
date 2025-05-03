// app/layout.tsx
import Header from '../components/Header';
import Footer from '../components/Footer';

import '../scss/layout.scss';
import { Metadata } from 'next';

export const metadata : Metadata = {
 title: 'My Bolg App',
 description: 'Next.js Blog App Example',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return(
    <html lang="ko">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}