"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Firebase 초기화 모듈

interface KakaoProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
}

export default function KakaoAuthButton() {
  const [user, setUser] = useState<KakaoProfile | null>(null);
  const {
    setLoginType,
    setUser: setUserState,
    logout, // ✅ AuthContext의 logout 함수 가져오기
  } = useAuth();

  useEffect(() => {
    // ✅ 로컬스토리지에서 사용자 정보 복원
    const savedUser = localStorage.getItem("kakaoUser");
    if (savedUser) {
      try {
        const parsedUser: KakaoProfile = JSON.parse(savedUser);
        setUser(parsedUser);
        setUserState(parsedUser);
        setLoginType("kakao");
      } catch (err) {
        console.error("❌ kakaoUser JSON 파싱 실패", err);
        localStorage.removeItem("kakaoUser");
      }
    }

    // ✅ Kakao SDK 로드 및 초기화
    if (!window.Kakao && typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = "https://developers.kakao.com/sdk/js/kakao.js";
      script.async = true;
      script.onload = () => {
        if (window.Kakao && !window.Kakao.isInitialized()) {
          window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
          console.log("✅ Kakao SDK initialized");
        }
      };
      document.head.appendChild(script);
    } else {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
      }
    }
  }, []);

  const handleKakaoLogin = () => {
    if (typeof window === "undefined" || !window.Kakao) {
      alert("Kakao SDK가 아직 로드되지 않았습니다.");
      return;
    }

    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
    }

    if (!window.Kakao.Auth) {
      alert("Kakao Auth 객체를 찾을 수 없습니다.");
      return;
    }

    window.Kakao.Auth.login({
      scope: "profile_nickname, account_email, profile_image",
      success: function (authObj: object) {
        console.log("✅ 로그인 성공:", authObj);

        window.Kakao.API.request({
          url: "/v2/user/me",
          success: async function (res) {
            const kakaoUid = res.id.toString();
            const profile: KakaoProfile = {
              uid: kakaoUid,
              name: res.kakao_account.profile.nickname,
              email: res.kakao_account.email,
              photoURL: res.kakao_account.profile.profile_image_url,
            };

            const userRef = doc(db, "users", kakaoUid);
            const docSnap = await getDoc(userRef);

            if (!docSnap.exists()) {
              await setDoc(userRef, {
                uid: profile.uid,
                name: profile.name,
                email: profile.email,
                photoURL: profile.photoURL,
                createdAt: serverTimestamp(),
                role: "user",
              });
              console.log("✅ 카카오 신규 사용자 Firestore에 저장 완료");
            } else {
              console.log("✅ 기존 카카오 사용자 로그인 완료");
            }

            setUser(profile);
            setUserState(profile);
            setLoginType("kakao");

            localStorage.setItem("kakaoUser", JSON.stringify(profile));
            localStorage.setItem("loginType", "kakao");

            alert(`환영합니다, ${profile.name}님!`);
          },
          fail: function (error: unknown) {
            console.error("❌ 사용자 정보 요청 실패", error);
          },
        });
      },
      fail: function (err: unknown) {
        console.error("❌ 로그인 실패:", err);
        alert("카카오 로그인 실패");
      },
    });
  };

  return user ? (
    <div className="flex items-center gap-2 text-white">
      <Image
        src={user.photoURL}
        alt="프로필 이미지"
        width={32}
        height={32}
        className="w-8 h-8 rounded-full"
        unoptimized
      />
      <div className="text-sm text-white">
        <p>{user.name}</p>
        <p className="text-xs opacity-80">({user.email})</p>
      </div>
      <button
        onClick={() => {
          logout(); // ✅ 중앙 관리된 logout 함수 사용
          setUser(null); // 로컬 상태 초기화
          alert("카카오 로그아웃 되었습니다.");
        }}
        className="bg-gray-300 hover:bg-gray-400 text-black px-2 py-1 rounded text-xs ml-2"
      >
        로그아웃
      </button>
    </div>
  ) : (
    <button
      onClick={handleKakaoLogin}
      className="bg-yellow-300 hover:bg-yellow-400 text-black px-4 py-2 rounded text-sm cursor-pointer"
    >
      Kakao 로그인
    </button>
  );
}
