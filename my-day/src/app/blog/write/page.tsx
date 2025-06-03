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
import Image from "next/image";

interface KakaoUser {
  uid: string;
  email: string;
  name?: string;
  photoURL?: string;
}

export default function WritePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [user] = useAuthState(auth);
  const [kakaoUser, setKakaoUser] = useState<KakaoUser | null>(null);
  const [userData, setUserData] = useState<{ name: string; photoURL: string }>({
    name: "이름 없음",
    photoURL: "",
  });
  const router = useRouter();

  // ✅ 로컬스토리지에서 kakaoUser 불러오기
  useEffect(() => {
    const storedUser = localStorage.getItem("kakaoUser");
    if (storedUser) {
      setKakaoUser(JSON.parse(storedUser));
    }
  }, []);

  // ✅ 현재 로그인된 사용자 통합
  const currentUser = user
    ? {
        uid: user.uid,
        email: user.email ?? "",
      }
    : kakaoUser;

  // ✅ Firestore에서 사용자 정보(name, photoURL) 가져오기
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser?.uid) return;

      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            name: data.name || "이름 없음",
            photoURL: data.photoURL || "",
          });
        } else {
          setUserData({
            name: "이름 없음",
            photoURL: "",
          });
        }
      } catch (error) {
        console.error("❌ 사용자 정보 불러오기 실패:", error);
        setUserData({
          name: "이름 없음",
          photoURL: "",
        });
      }
    };

    fetchUserData();
  }, [currentUser?.uid]);

  const ADMIN_EMAIL = ["mirrol33@gmail.com", "mirrol@kakao.com"];

  // ✅ 글 작성 핸들러
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
          name: userData.name,
          photoURL: userData.photoURL,
        },
      });

      alert("게시글이 등록되었습니다.");
      router.push("/");
    } catch (error) {
      console.error("❌ 글쓰기 오류:", error);
      alert("글쓰기 실패");
    }
  };

  // ✅ UI
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
        <div className="flex items-center gap-2">
          <Image
            src={userData.photoURL || "/default-profile.png"}
            alt="작성자 프로필 이미지"
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
          <span className="text-sm">{userData.name}</span>
        </div>
        <div className="flex justify-between">
          <button
            onClick={() => router.push("/")}
            type="button"
            className="mt-6 bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-800 text-sm cursor-pointer">
            목록으로
          </button>
          <button
            type="submit"
            className="mt-6 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-800 text-sm cursor-pointer">
            작성하기(관리자 권한)
          </button>
        </div>
      </form>
    </div>
  );
}
