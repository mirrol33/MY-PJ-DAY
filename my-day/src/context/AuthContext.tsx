// context/AuthContext.tsx
'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { onAuthStateChanged, User, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'

// 로그인 타입 정의
type LoginType = 'none' | 'google' | 'kakao'

// Kakao 사용자 타입
interface KakaoUser {
  uid?: string
  email: string
  name: string
  photoURL: string
}

// Context에서 사용할 타입
interface AuthContextProps {
  user: User | KakaoUser | null
  loginType: LoginType
  setLoginType: (type: LoginType) => void
  setUser: (user: User | KakaoUser | null) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loginType: 'none',
  setLoginType: () => {},
  setUser: () => {},
  logout: () => {},
  loading: true,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | KakaoUser | null>(null)
  const [loginType, setLoginTypeState] = useState<LoginType>('none')
  const [loading, setLoading] = useState(true)

  const setLoginType = (type: LoginType) => {
    setLoginTypeState(type)
    if (typeof window !== 'undefined') {
      localStorage.setItem('loginType', type)
    }
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      const storedLoginType = localStorage.getItem('loginType') as LoginType
      if (storedLoginType === 'google') {
        signOut(auth)
      } else if (storedLoginType === 'kakao' && window.Kakao?.Auth) {
        window.Kakao.Auth.logout(() => {
          console.log('✅ 카카오 로그아웃 성공')
        })
      }
      localStorage.removeItem('loginType')
      localStorage.removeItem('kakaoUser')
    }

    setUser(null)
    setLoginTypeState('none')
  }

  useEffect(() => {
    const savedType = localStorage.getItem('loginType') as LoginType | null

    if (savedType) {
      setLoginTypeState(savedType)
    }

    const checkKakaoLogin = () => {
      if (typeof window === 'undefined') return

      const storedUser = localStorage.getItem('kakaoUser')
      if (storedUser) {
        const parsedUser: KakaoUser = JSON.parse(storedUser)
        setUser(parsedUser)
        setLoginType('kakao')
        setLoading(false)
        return
      }

      if (!window.Kakao || !window.Kakao.Auth.getAccessToken()) {
        setUser(null)
        setLoginType('none')
        setLoading(false)
        return
      }

      window.Kakao.API.request({
        url: '/v2/user/me',
        success: (res: any) => {
          const kakaoUser: KakaoUser = {
            email: res.kakao_account.email,
            name: res.kakao_account.profile.nickname,
            photoURL: res.kakao_account.profile.profile_image_url,
          }
          localStorage.setItem('kakaoUser', JSON.stringify(kakaoUser))
          setUser(kakaoUser)
          setLoginType('kakao')
          setLoading(false)
        },
        fail: (error: any) => {
          console.error('❌ 카카오 사용자 정보 요청 실패:', error)
          setUser(null)
          setLoginType('none')
          localStorage.removeItem('kakaoUser')
          setLoading(false)
        },
      })
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        setLoginType('google')
        setLoading(false)
      } else {
        if (savedType === 'kakao') {
          checkKakaoLogin()
        } else {
          setUser(null)
          setLoginType('none')
          setLoading(false)
        }
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <>
      <script
        src="https://developers.kakao.com/sdk/js/kakao.js"
        onLoad={() => {
          if (
            typeof window !== 'undefined' &&
            window.Kakao &&
            !window.Kakao.isInitialized()
          ) {
            window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY!)
            console.log('✅ Kakao SDK initialized in AuthProvider')
          }
        }}
      ></script>

      <AuthContext.Provider
        value={{ user, loginType, setLoginType, setUser, logout, loading }}
      >
        {children}
      </AuthContext.Provider>
    </>
  )
}
