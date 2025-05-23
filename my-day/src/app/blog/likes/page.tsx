"use client";

import { db, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useState } from "react";
import Link from "next/link";

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
  const [user] = useAuthState(auth);
  const [likedPosts, setLikedPosts] = useState<LikedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedPosts = async () => {
      if (!user) {
        setLikedPosts([]);
        setLoading(false);
        return;
      }

      const q = query(collection(db, "likes"), where("userId", "==", user.uid));
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
        <p className="text-red-500 font-semibold">로그인 후 이용 가능합니다.</p>
        <Link href="/" className="text-blue-500 underline mt-4 inline-block">
          메인으로 이동
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-2xl font-bold mb-6 text-center">찜 게시글 목록</h1>

      {loading ? (
        <p className="text-center text-gray-500">로딩 중...</p>
      ) : likedPosts.length === 0 ? (
        <p className="text-center text-gray-400">찜한 게시글이 없습니다.</p>
      ) : (
        <ul className="space-y-6">
          {likedPosts.map((post) => (
            <li key={post.id} className="border p-4 rounded shadow-sm">
              <div className="flex items-center mb-3 gap-3">
                <img
                  src={post.author.photoURL}
                  alt="프로필"
                  className="w-10 h-10 rounded-full"
                />
                <span className="text-sm text-gray-700">
                  {post.author.name} ({post.author.email})
                </span>
              </div>
              <h2 className="font-semibold text-lg">{post.title}</h2>
              <p className="text-gray-600 mb-2">
                {post.content.length > 80
                  ? `${post.content.slice(0, 80)}...`
                  : post.content}
              </p>
              <p className="text-xs text-gray-400">
                작성일: {post.createdAt.toLocaleString("ko-KR")}
              </p>
              <p className="text-xs text-gray-400 mb-2">
                수정일: {post.updatedAt.toLocaleString("ko-KR")}
              </p>
              <div className="mt-2 flex gap-2">
                <Link
                  href={`/blog/read/${post.id}`}
                  className="inline-block bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
                >
                  상세보기
                </Link>
                <button
                  onClick={() => handleDeleteLike(post.likeDocId)}
                  className="px-2 py-1 text-xs rounded cursor-pointer bg-yellow-300 text-black"
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
          ← 전체 게시글 페이지로 돌아가기
        </Link>
      </div>
    </div>
  );
}
