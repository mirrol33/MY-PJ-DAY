// GoogleAuthButton.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { auth, db } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export default function GoogleAuthButton() {
  const { user } = useAuth();

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

      alert(`환영합니다, ${user.displayName}님!`);
    } catch (error) {
      console.error("❌ 로그인 또는 회원가입 오류:", error);
      alert("로그인에 실패했습니다.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("로그아웃 되었습니다.");
    } catch (error) {
      console.error("❌ 로그아웃 오류:", error);
    }
  };

  if (!user) {
    return (
      <button
        onClick={handleGoogleLogin}
        className="px-4 py-2 bg-green-600 text-white rounded text-sm cursor-pointer hover:bg-green-800"
      >
        Google 계정으로 로그인
      </button>
    );
  }

  return (
    <div className="flex items-center justify-center gap-4">
      <img
        src={user.photoURL || "/default-avatar.png"}
        alt="프로필"
        className="w-10 h-10 rounded-full border border-gray-300"
      />

      <span className="text-white max-w-3xs overflow-hidden">{user.displayName}</span>
      <button
        onClick={handleLogout}
        className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 cursor-pointer text-xs"
      >
        로그아웃
      </button>
    </div>
  );
}
