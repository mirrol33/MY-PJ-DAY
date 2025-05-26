// app/components/Header.tsx
'use client'

import Link from 'next/link'
import GoogleAuthButton from './GoogleAuthButton'
import KakaoAuthButton from './KakaoAuthButton'
import { useAuth } from '@/context/AuthContext'

export default function Header() {
  const { loginType, setLoginType } = useAuth()

  return (
    <header className="bg-gray-600">
      <div className="max-w-4xl mx-auto sm:flex md:flex justify-between items-center">
        <h1 className="text-white text-lg text-center p-0 md:p-6 pt-4 md:pt-6">
          <Link href="/">Next.js + Firebase로 만든 미니 블로그</Link>
        </h1>
        <div className="p-4 md:p-0 flex items-center justify-center gap-2">
          {loginType !== 'kakao' && (
            <GoogleAuthButton />
          )}
          {loginType !== 'google' && (
            <KakaoAuthButton />
          )}
        </div>
      </div>
    </header>
  )
}
