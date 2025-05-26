// app/layout.tsx
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";
import KakaoInit from "@/components/KakaoInit";

export default function RootLayout({children}: {children: React.ReactNode;}) {

  return (
    <html lang="ko">
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
