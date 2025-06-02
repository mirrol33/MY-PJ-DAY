"use client";

import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

interface KakaoUser {
  uid: string;
  email: string;
  name?: string;
  photoURL?: string;
  displayName?: string;
}

export default function WritePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [user] = useAuthState(auth);
  const [kakaoUser, setKakaoUser] = useState<KakaoUser | null>(null);
  const [displayName, setDisplayName] = useState("이름 없음");
  const router = useRouter();

  // 1. 로컬스토리지에서 kakaoUser 불러오기
  useEffect(() => {
    const storedUser = localStorage.getItem("kakaoUser");
    if (storedUser) {
      setKakaoUser(JSON.parse(storedUser));
    }
  }, []);

  // 2. 현재 로그인된 사용자 정보 통합
  const currentUser = user
    ? {
        uid: user.uid,
        email: user.email ?? "",
        photoURL: user.photoURL ?? "",
        name: user.displayName ?? "",
      }
    : kakaoUser;

  // 3. Firestore에서 사용자 이름 가져오기
  useEffect(() => {
    const fetchUserName = async () => {
      if (!currentUser?.uid) return;

      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setDisplayName(userData.name || currentUser.name || "이름 없음");
        } else {
          setDisplayName(currentUser.name || "이름 없음");
        }
      } catch (error) {
        console.error("이름 불러오기 실패:", error);
        setDisplayName(currentUser?.name || "이름 없음");
      }
    };

    fetchUserName();
  }, [currentUser?.uid]);

  // 4. 관리자 이메일 리스트
  const ADMIN_EMAIL = ["mirrol33@gmail.com", "mirrol@kakao.com"];

  // 5. 글 작성 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || !ADMIN_EMAIL.includes(currentUser.email)) {
      alert("관리자만 글을 작성할 수 있습니다.");
      return;
    }

    try {
      await addDoc(collection(db, "posts"), {
        title,
        content,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        author: {
          uid: currentUser.uid,
          email: currentUser.email,
          photoURL: currentUser.photoURL ?? "",
          name: displayName,
        },
      });

      alert("게시글이 등록되었습니다.");
      router.push("/");
    } catch (error) {
      console.error("❌ 글쓰기 오류:", error);
      alert("글쓰기 실패");
    }
  };

  // 6. UI
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">새 글 작성</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <textarea
          placeholder="내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={10}
          className="w-full p-2 border rounded"
        />
        <div className="flex justify-between">
          <button
            onClick={() => router.push("/")}
            type="button"
            className="mt-6 bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-800 text-sm cursor-pointer"
          >
            목록으로
          </button>
          <button
            type="submit"
            className="mt-6 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-800 text-sm cursor-pointer"
          >
            작성하기(관리자 권한)
          </button>
        </div>
      </form>
    </div>
  );
}
