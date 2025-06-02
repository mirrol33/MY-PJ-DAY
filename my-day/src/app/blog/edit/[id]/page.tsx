"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

export default function EditPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [user] = useAuthState(auth);
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;

      try {
        const docRef = doc(db, "posts", postId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title || "");
          setContent(data.content || "");

          const postAuthorUid = data.author.uid;
          const kakaoUser = JSON.parse(localStorage.getItem("kakaoUser") || "{}");
          const kakaoUid = kakaoUser?.uid;

          // 권한 확인: 구글 로그인 또는 카카오 로그인 사용자
          if (user?.uid === postAuthorUid || kakaoUid === postAuthorUid) {
            setCanEdit(true);
          } else {
            setCanEdit(false);
          }
        } else {
          alert("게시글을 찾을 수 없습니다.");
          router.push("/");
        }
      } catch (error) {
        console.error("❌ 게시글 불러오기 실패:", error);
        alert("게시글 로딩 오류");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, user, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canEdit) {
      alert("수정 권한이 없습니다.");
      return;
    }

    try {
      const docRef = doc(db, "posts", postId);
      await updateDoc(docRef, {
        title,
        content,
        updatedAt: serverTimestamp(),
      });

      alert("게시글이 수정되었습니다.");
      router.push(`/blog/read/${postId}`);
    } catch (error) {
      console.error("❌ 수정 오류:", error);
      alert("게시글 수정 실패");
    }
  };

  if (loading) return <p className="p-6">로딩 중...</p>;
  if (!canEdit) return <p className="p-6 text-red-600">수정 권한이 없습니다.</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">게시글 수정</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
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
            type="button"
            onClick={() => router.push(`/blog/read/${postId}`)}
            className="mt-6 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-800 cursor-pointer text-sm"
          >
            취소
          </button>
          <button
            type="submit"
            className="mt-6 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-800 cursor-pointer text-sm"
          >
            수정하기
          </button>
        </div>
      </form>
    </div>
  );
}
