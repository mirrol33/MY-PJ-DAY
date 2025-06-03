"use client";

import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { auth, db } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export default function GoogleAuthButton() {
  const { user, setUser, setLoginType } = useAuth();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          role: "user",
        });
        console.log("✅ 새로운 사용자 Firestore에 저장 완료");
      } else {
        console.log("✅ 기존 사용자 로그인 완료");
      }

      setUser(user); // ✅ 전역 상태에 사용자 정보 저장
      setLoginType("google");
      alert(`환영합니다, ${user.displayName ?? "사용자"}님!`);
    } catch (error) {
      console.error("❌ 로그인 또는 회원가입 오류:", error);
      alert("로그인에 실패했습니다.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null); // ✅ 전역 상태 초기화
      setLoginType("none");
      alert("로그아웃 되었습니다.");
      localStorage.removeItem("kakaoUser");
      localStorage.removeItem("loginType");
    } catch (error) {
      console.error("❌ 로그아웃 오류:", error);
    }
  };

  if (!user) {
    return (
      <button
        onClick={handleGoogleLogin}
        className="px-4 py-2 bg-green-600 text-white rounded text-sm cursor-pointer hover:bg-green-700 flex items-center justify-center"
      >
        Google 계정으로 로그인
      </button>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Image
        src={user.photoURL ?? "/default-avatar.png"}
        alt="프로필 이미지"
        width={40}
        height={40}
        className="rounded-full"
        unoptimized
      />
      <span className="text-xs text-white text-left leading-tight">
        <p>{"displayName" in user ? user.displayName : "카카오 사용자"}</p>
        <p>({user.email})</p>
      </span>
      <button
        onClick={handleLogout}
        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-2 py-1 rounded text-xs ml-2 cursor-pointer"
      >
        로그아웃
      </button>
    </div>
  );
}
