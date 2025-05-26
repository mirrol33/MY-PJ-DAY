// app/components/KakaoInit.tsx
'use client';

import { useEffect } from "react";

declare global {
  interface Window {
    Kakao: any;
  }
}

export default function KakaoInit() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://developers.kakao.com/sdk/js/kakao.js";
    script.async = true;
    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY); // 여기에 JavaScript 키 삽입
        console.log("✅ Kakao SDK initialized");
      }
    };
    document.head.appendChild(script);
  }, []);

  return null; // UI를 렌더링하지 않음
}
