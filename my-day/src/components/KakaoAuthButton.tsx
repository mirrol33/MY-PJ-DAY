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

interface KakaoAPIResponse {
  id?: number | string;
  kakao_account: {
    email: string;
    profile: {
      nickname: string;
      profile_image_url: string;
    };
  };
}

export default function KakaoAuthButton() {
  const [user, setUser] = useState<KakaoProfile | null>(null);
  const {
    setLoginType,
    setUser: setUserState,
    logout,
  } = useAuth();

  useEffect(() => {
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

    if (typeof window !== "undefined") {
      if (!window.Kakao) {
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
          success: async function (res: KakaoAPIResponse) {
            if (!res.id) {
              alert("사용자 ID를 가져오는데 실패했습니다.");
              console.error("❌ Kakao API 응답에 id가 없음:", res);
              return;
            }

            const kakaoUid = res.id.toString();
            const profile: KakaoProfile = {
              uid: kakaoUid,
              name: res.kakao_account.profile.nickname,
              email: res.kakao_account.email,
              photoURL: res.kakao_account.profile.profile_image_url,
            };

            try {
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
            } catch (error) {
              console.error("❌ Firestore 사용자 저장 오류:", error);
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
            alert("사용자 정보 요청에 실패했습니다.");
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
        src={user.photoURL ?? "/default-avatar.png"}
        alt="프로필 이미지"
        width={40}
        height={40}
        className="rounded-full"
        unoptimized
      />
      <div className="text-sm text-white">
        <p>{user.name}</p>
        <p className="text-xs opacity-80">({user.email})</p>
      </div>
      <button
        onClick={() => {
          logout();
          setUser(null);
          alert("카카오 로그아웃 되었습니다.");
        }}
        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-2 py-1 rounded text-xs ml-2 cursor-pointer"
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
