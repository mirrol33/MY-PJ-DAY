"use client";

import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { auth, db } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function GoogleAuthButton() {
  const { user, setUser, setLoginType } = useAuth();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const baseUser = result.user;

      const userRef = doc(db, "users", baseUser.uid);
      const docSnap = await getDoc(userRef);

      let finalUserData = {
        uid: baseUser.uid,
        email: baseUser.email ?? "",
        name: baseUser.displayName ?? "이름 없음",
        photoURL: baseUser.photoURL ?? "/default-profile.png",
      };

      if (!docSnap.exists()) {
        // 새 사용자: Firestore에 저장
        await setDoc(userRef, {
          ...finalUserData,
          createdAt: serverTimestamp(),
          role: "user",
        });
        console.log("✅ 새로운 사용자 Firestore에 저장 완료");
      } else {
        // 기존 사용자: Firestore에서 정보 가져오기
        const userData = docSnap.data();
        finalUserData = {
          uid: userData.uid,
          email: userData.email,
          name: userData.name,
          photoURL: userData.photoURL || "/default-profile.png",
        };
        console.log("✅ 기존 사용자 Firestore 데이터 불러오기 완료");
      }

      setUser(finalUserData); // 전역 상태에 사용자 정보 저장 (Firestore 기준)
      setLoginType("google");

      alert(`환영합니다, ${finalUserData.name}님!`);
    } catch (error) {
      console.error("❌ 로그인 또는 회원가입 오류:", error);
      alert("로그인에 실패했습니다.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setLoginType("none");
      alert("로그아웃 되었습니다.");

      router.push("/");
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
        src={user.photoURL || "/default-profile.png"}
        alt="프로필 이미지"
        width={40}
        height={40}
        className="rounded-full"
        unoptimized
      />
      <span className="text-xs text-white text-left leading-tight">
        <p>{('name' in user) ? user.name : "이름 없음"}</p>
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
