"use client";

import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import Image from "next/image";

export default function WritePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [user] = useAuthState(auth);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE_MB = 10;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert("10MB 이하의 이미지만 업로드 가능합니다.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result as string);
      setImageFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    setImageBase64(null);
    setImageFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      await addDoc(collection(db, "posts"), {
        title,
        content,
        // 이미지 Storage 저장 안하므로 Firestore에는 저장하지 않음
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
      router.push("/blog");
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

        {/* 이미지 업로드 미리보기 */}
        <div className="space-y-2 bg-gray-100 p-4 rounded">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          {imageBase64 && (
            <div className="relative">
              <Image
                src={imageBase64}
                alt="미리보기 이미지"
                width={300}
                height={200}
                className="rounded border"
              />
              <button
                type="button"
                onClick={handleImageRemove}
                className="absolute top-0 right-0 bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-800"
              >
                삭제
              </button>
            </div>
          )}
        </div>

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
            작성하기
          </button>
        </div>
      </form>
    </div>
  );
}
