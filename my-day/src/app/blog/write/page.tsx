"use client";

import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

export default function WritePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [user] = useAuthState(auth);
  const router = useRouter();

  const ADMIN_EMAIL = "mirrol33@gmail.com";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (user.email !== ADMIN_EMAIL) {
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
          uid: user.uid,
          email: user.email,
          photoURL: user.photoURL,
          name: user.displayName,
        },
      });

      alert("게시글이 등록되었습니다.");
      router.push("/"); // 메인 페이지로 이동
    } catch (error) {
      console.error("❌ 글쓰기 오류:", error);
      alert("글쓰기 실패");
    }
  };

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
            className="mt-6 bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-800 text-sm"
          >
            목록으로
          </button>
          <button
            type="submit"
            className="mt-6 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-800 text-sm"
          >
            작성하기(관리자 권한)
          </button>
        </div>
      </form>
    </div>
  );
}
