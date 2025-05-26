'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'

type LoginType = 'none' | 'google' | 'kakao'

interface AuthContextProps {
  user: User | null
  loginType: LoginType
  setLoginType: (type: LoginType) => void
  loading: boolean
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loginType: 'none',
  setLoginType: () => {},
  loading: true,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loginType, setLoginTypeState] = useState<LoginType>('none')
  const [loading, setLoading] = useState(true)

  // 🔹 localStorage와 연동된 setter
  const setLoginType = (type: LoginType) => {
    setLoginTypeState(type)
    if (typeof window !== 'undefined') {
      localStorage.setItem('loginType', type)
    }
  }

  useEffect(() => {
    const savedType = localStorage.getItem('loginType') as LoginType | null
    if (savedType) {
      setLoginTypeState(savedType)
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)

      if (!firebaseUser) {
        setLoginType('none') // 🔸 로그아웃 시에도 상태 초기화
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, loginType, setLoginType, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}
