// types/kakao.d.ts
export {};

declare global {
  interface Window {
    Kakao: {
      isInitialized: () => boolean;
      init: (key?: string) => void;
      Auth: {
        login: (options: {
          scope?: string;
          success?: (authObj: object) => void;
          fail?: (error: unknown) => void;
        }) => void;
        logout: (callback?: () => void) => void;
        getAccessToken: () => string | null;
      };
      API: {
        request: (options: {
          url: string;
          success?: (res: KakaoUserResponse) => void;
          fail?: (error: unknown) => void;
        }) => void;
      };
    };
  }
}

// Kakao 사용자 정보 API 응답 타입 정의
interface KakaoUserResponse {
  kakao_account: {
    email: string;
    profile: {
      nickname: string;
      profile_image_url: string;
    };
  };
}
