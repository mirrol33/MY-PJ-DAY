// app/blog/List.tsx
"use client";

import { db, auth } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

type Post = {
  id: string;
  title: string;
  content: string;
  author: {
    email: string;
    photoURL: string;
    name: string;
  };
};

export default function List() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [user] = useAuthState(auth);

  useEffect(() => {
    const fetchPosts = async () => {
      const querySnapshot = await getDocs(collection(db, "posts"));
      const postData = querySnapshot.docs.map((doc) => ({
        ...(doc.data() as Post),
        id: doc.id,
      }));
      setPosts(postData);
    };
    fetchPosts();
  }, []);

  /* 페이지네이션을 위한 상태변수 추가 */
  const [currentPage, setCurrentPage] = useState(1); // 페이지수
  const [pageCount, setPageCount] = useState(0); // 현재 페이지번호
  const PageSize = 2; // 한 페이지에 출력하는 게시글 수

  const lastPost = currentPage * PageSize;
  const firstPost = lastPost - PageSize;
  const currentPosts = posts.slice(firstPost, lastPost);

  useEffect(() => {
    setPageCount(Math.ceil(posts.length / PageSize));
  }, [posts]);

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-6 text-center">전체 게시글 목록</h1>

      <div className="flex justify-end mb-6">
        {user ? (
          <Link
            href="/blog/write"
            className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800"
          >
            글쓰기
          </Link>
        ) : (
          <button
            disabled
            className="inline-block bg-gray-400 text-white px-4 py-2 rounded"
            title="로그인 후 글쓰기가 가능합니다"
          >
            글쓰기 (로그인 필요)
          </button>
        )}
      </div>

      <ul className="space-y-6">
        {currentPosts.map((post) => (
          <li key={post.id} className="border-1 border-gray-300 p-4 rounded">
            <div className="flex items-center mb-3 gap-3">
              <img
                src={post.author?.photoURL || "/default-avatar.png"}
                alt="프로필"
                className="w-10 h-10 rounded-full"
              />
              <span className="text-sm text-gray-700">
                {post.author?.name || "익명"} ({post.author?.email})
              </span>
            </div>

            <h2 className="font-semibold text-lg">
              {post.title.length > 40
                ? `${post.title.slice(0, 40)}...`
                : post.title}
            </h2>
            <p className="text-gray-600 mt-2">
              {post.content.length > 80
                ? `${post.content.slice(0, 80)}...`
                : post.content}
            </p>
            <div className="mt-4">
              <Link
                href={`/blog/read/${post.id}`}
                className="inline-block bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600 text-sm"
              >
                상세보기
              </Link>
            </div>
          </li>
        ))}
      </ul>
      {/* 페이지네이션 출력 */}
      <div className="flex justify-center gap-2 mt-6">
        {/* 이전 버튼 */}
        {currentPage > 1 && (
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-3 py-2 rounded bg-gray-200 text-gray-700 text-xs">
            Previous
          </button>
        )}
        {/* 페이지 번호 */}
        {Array.from({ length: pageCount }, (_, i) => (
          <button
          key={i}
          onClick={() => setCurrentPage(i + 1)}
          className={`px-3 py-2 rounded text-xs ${
            currentPage === i + 1
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}>
            {i + 1}
          </button>
        ))}
        {/* 다음 버튼 */}
        {currentPage < pageCount && (
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-3 py-2 rounded bg-gray-200 text-gray-700 text-xs">
            Next
          </button>
        )}
      </div>
    </div>
  );
}
