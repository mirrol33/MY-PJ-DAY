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
          success?: (res: any) => void;
          fail?: (error: unknown) => void;
        }) => void;
      };
    };
  }
}
