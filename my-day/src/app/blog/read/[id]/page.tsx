// app/blog/read/[id]/page.tsx

"use client";

import { use } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { notFound, useRouter } from "next/navigation";
import Image from "next/image";
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
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold">{post.title}</h1>
      {post.imageUrl && (
        <Image
          src={post.imageUrl}
          alt="Post Image"
          width={800}
          height={400}
          className="rounded"
        />
      )}
      <p className="text-gray-700 whitespace-pre-line">{post.content}</p>

      <div className="text-sm text-gray-500 mt-8">
        <p>작성자: {post.author?.name} ({post.author?.email})</p>
        {post.createdAt && (
          <p>
            작성일: {new Date(post.createdAt.seconds * 1000).toLocaleDateString()}
          </p>
        )}
        {post.updatedAt && (
          <p>
            수정일: {new Date(post.updatedAt.seconds * 1000).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => router.push("/")}
          className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          목록으로
        </button>
        {user?.uid === post.author?.uid && (
          <button
            onClick={handleDelete}
            className="mt-6 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            삭제하기
          </button>
        )}

      </div>
    </div>
  );
}
