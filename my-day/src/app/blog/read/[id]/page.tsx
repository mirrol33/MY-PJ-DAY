// app/blog/read/[id]/page.tsx

"use client";

import { use } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

type PostProps = {
  params: Promise<{ id: string }>;
};

export default function ReadPostPage({ params }: PostProps) {
  const { id } = use(params);
  const [post, setPost] = useState<any>(null);
  const [user] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    const fetchPost = async () => {
      const docRef = doc(db, "posts", id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        notFound();
      } else {
        setPost(docSnap.data());
      }
    };
    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    const confirmDelete = confirm("정말 이 게시글을 삭제하시겠습니까?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "posts", id));
      alert("게시글이 삭제되었습니다.");
      router.push("/");
    } catch (error) {
      console.error("❌ 삭제 오류:", error);
      alert("게시글 삭제 실패");
    }
  };

  if (!post) return <p>로딩 중...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold">{post.title}</h1>
      <div className="text-gray-700 whitespace-pre-line py-4">
        <p>{post.content}</p>
      </div>
      <div className="flex items-center gap-3">
        <img
          src={post.author?.photoURL || "/default-avatar.png"}
          alt="프로필"
          className="w-10 h-10 rounded-full"
        />
        <span className="text-sm text-gray-700">
          {post.author?.name || "익명"} ({post.author?.email})
        </span>
      </div>

      <div className="text-sm text-gray-500 mt-8">
        {post.createdAt && (
          <p>
            작성일:{" "}
            {new Date(post.createdAt.seconds * 1000).toLocaleString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
        {post.updatedAt && (
          <p>
            수정일:{" "}
            {new Date(post.updatedAt.seconds * 1000).toLocaleString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => router.push("/")}
          className="mt-6 bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-800 cursor-pointer text-sm"
        >
          목록으로
        </button>
        {user?.uid === post.author?.uid && (
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/blog/edit/${id}`)}
              className="mt-6 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-800 cursor-pointer text-sm"
            >
              수정하기
            </button>
            <button
              onClick={handleDelete}
              className="mt-6 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-800 cursor-pointer text-sm"
            >
              삭제하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
