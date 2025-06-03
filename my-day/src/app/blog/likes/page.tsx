// app/blog/likes/page.tsx
"use client";

import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext"; // ✅ useAuth 사용

type Post = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    email: string;
    photoURL: string;
    name: string;
  };
};

type LikedPost = Post & {
  likeDocId: string;
};

export default function LikesPage() {
  const { user } = useAuth(); // ✅ 컨텍스트 기반 인증 사용
  const [likedPosts, setLikedPosts] = useState<LikedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedPosts = async () => {
      if (!user) {
        setLikedPosts([]);
        setLoading(false);
        return;
      }

      const userId = user.uid || user.email; // ✅ 고유 식별자 대체

      const q = query(collection(db, "likes"), where("userId", "==", userId));
      const likeSnapshot = await getDocs(q);

      const posts: LikedPost[] = [];

      for (const likeDoc of likeSnapshot.docs) {
        const postId = likeDoc.data().postId;
        const likeDocId = likeDoc.id;
        const postDoc = await getDoc(doc(db, "posts", postId));

        if (postDoc.exists()) {
          const data = postDoc.data();
          posts.push({
            id: postDoc.id,
            title: data.title,
            content: data.content,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date(),
            author: {
              email: data.author?.email || "unknown",
              photoURL: data.author?.photoURL || "/default-avatar.png",
              name: data.author?.name || "익명",
            },
            likeDocId,
          });
        }
      }

      setLikedPosts(posts);
      setLoading(false);
    };

    fetchLikedPosts();
  }, [user]);

  const handleDeleteLike = async (likeDocId: string) => {
    try {
      await deleteDoc(doc(db, "likes", likeDocId));
      setLikedPosts((prev) => prev.filter((p) => p.likeDocId !== likeDocId));
    } catch (err) {
      alert("찜 해제 중 오류가 발생했습니다.");
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p className="text-red-400 font-semibold mb-6">로그인 후 이용 가능합니다.</p>
        <Link
          href="/"
          className="inline-block bg-gray-200 hover:bg-gray-300 text-sm px-4 py-2 rounded"
        >
          ← 메인 페이지로 이동
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-2xl font-bold mb-6 text-center">찜 목록</h1>

      {loading ? (
        <p className="text-center text-gray-500">로딩 중...</p>
      ) : likedPosts.length === 0 ? (
        <p className="text-center text-gray-400">찜한 게시글이 없습니다.</p>
      ) : (
        <ul className="space-y-6">
          {likedPosts.map((post) => (
            <li key={post.id} className="border-1 border-gray-300 p-4 rounded shadow-sm">
              <div className="flex items-center mb-3 gap-3">
                <Image
                  src={post.author.photoURL || "/default-avatar.png"}
                  alt="프로필"
                  width={40}
                  height={40}
                  className="rounded-full"
                  unoptimized
                />
                <span className="text-sm text-gray-700">
                  {post.author.name} ({post.author.email})
                </span>
              </div>
              <h2 className="text-lg font-medium">{post.title}</h2>
              <p className="text-sm text-gray-600">
                {post.content.length > 80
                  ? `${post.content.slice(0, 80)}...`
                  : post.content}
              </p>
              <div className="text-xs text-gray-400 mt-1">
              <p>
                작성일: {post.createdAt.toLocaleString("ko-KR")}
              </p>
              <p>
                수정일: {post.updatedAt.toLocaleString("ko-KR")}
              </p>
              </div>
              <div className="mt-2 flex gap-2">
                <Link
                  href={`/blog/read/${post.id}`}
                  className="inline-block bg-gray-200 text-gray-800 hover:bg-gray-300 px-3 py-1 rounded text-xs"
                >
                  상세보기
                </Link>
                <button
                  onClick={() => handleDeleteLike(post.likeDocId)}
                  className="px-2 py-1 text-xs rounded cursor-pointer bg-yellow-300 text-gray-800"
                >
                  ★ 찜삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-block bg-gray-200 hover:bg-gray-300 text-sm px-4 py-2 rounded"
        >
          ← 메인 페이지로 이동
        </Link>
      </div>
    </div>
  );
}
