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
        window.Kakao.init("e8c81aeb54fd681020b00a6d1ac6921f"); // 여기에 JavaScript 키 삽입
        console.log("✅ Kakao SDK initialized");
      }
    };
    document.head.appendChild(script);
  }, []);

  return null; // UI를 렌더링하지 않음
}
