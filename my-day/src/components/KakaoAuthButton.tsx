'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

declare global {
  interface Window {
    Kakao: any;
  }
}

interface KakaoProfile {
  uid: string;
  nickname: string;
  email: string;
  profile_image_url: string;
}

export default function KakaoAuthButton() {
  const [user, setUser] = useState<KakaoProfile | null>(null);
  const { setLoginType } = useAuth();

  useEffect(() => {
    if (!window.Kakao && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
      script.async = true;
      script.onload = () => {
        if (window.Kakao && !window.Kakao.isInitialized()) {
          window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
          console.log('✅ Kakao SDK initialized');
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
    if (!window.Kakao) {
      alert('Kakao SDK 로드 실패');
      return;
    }

    window.Kakao.Auth.login({
      scope: 'profile_nickname, account_email, profile_image',
      success: function (authObj: any) {
        console.log('✅ 로그인 성공:', authObj);

        window.Kakao.API.request({
          url: '/v2/user/me',
          success: function (res: any) {
            const kakaoUid = res.id.toString();
            const profile: KakaoProfile = {
              uid: kakaoUid,
              nickname: res.kakao_account.profile.nickname,
              email: res.kakao_account.email,
              profile_image_url:
                res.kakao_account.profile.profile_image_url,
            };

            setUser(profile);
            setLoginType('kakao'); // ✅ 전역 상태로 로그인 유형 설정
            alert(`환영합니다, ${profile.nickname}님!`);
          },
          fail: function (error: any) {
            console.error('❌ 사용자 정보 요청 실패', error);
          },
        });
      },
      fail: function (err: any) {
        console.error('❌ 로그인 실패:', err);
        alert('카카오 로그인 실패');
      },
    });
  };

  const logoutFromKakao = () => {
    if (!window.Kakao || !window.Kakao.Auth.getAccessToken()) return;

    window.Kakao.Auth.logout(() => {
      console.log('👋 로그아웃 완료');
      setUser(null);
      setLoginType('none'); // ✅ 전역 상태 초기화
      alert('카카오 로그아웃 되었습니다.');
    });
  };

  if (user) {
    return (
      <div className="flex items-center gap-3 text-white">
        <img
          src={user.profile_image_url}
          alt="프로필 이미지"
          className="w-8 h-8 rounded-full"
        />
        <div className="text-sm text-white">
          <p>{user.nickname}</p>
          <p className="text-xs opacity-80">{user.email}</p>
        </div>
        <button
          onClick={logoutFromKakao}
          className="bg-gray-300 hover:bg-gray-400 text-black px-2 py-1 rounded text-xs ml-2"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleKakaoLogin}
      className="bg-yellow-300 hover:bg-yellow-400 text-black px-4 py-2 rounded text-sm cursor-pointer"
    >
      Kakao 로그인
    </button>
  );
}
