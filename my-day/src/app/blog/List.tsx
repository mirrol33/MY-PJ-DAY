"use client";

import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type Post = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    uid: string;
    email: string;
    photoURL: string;
    name: string;
  };
};

export default function List() {
  const { user } = useAuth();
  const userId = user?.uid;

  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const PageSize = 5;
  const pageGroupSize = 3;

  // ✅ 게시글 불러오기
  useEffect(() => {
    const fetchPosts = async () => {
      const postQuery = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(postQuery);
      const postData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...(data as Post),
          id: doc.id,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        };
      });
      setPosts(postData);
    };
    fetchPosts();
  }, []);

  // ✅ 찜한 글 불러오기
  useEffect(() => {
    if (!userId) return;
    const fetchLikes = async () => {
      const snapshot = await getDocs(collection(db, "likes"));
      const likes = snapshot.docs
        .filter((doc) => doc.data().userId === userId)
        .map((doc) => doc.data().postId);
      setLikedPosts(new Set(likes));
    };
    fetchLikes();
  }, [userId]);

  // ✅ 찜 토글
  const toggleLike = async (postId: string) => {
    if (!userId) return alert("로그인이 필요합니다.");
    const likeId = `${userId}_${postId}`;
    const likeRef = doc(db, "likes", likeId);
    const updatedLikes = new Set(likedPosts);

    if (likedPosts.has(postId)) {
      await deleteDoc(likeRef);
      updatedLikes.delete(postId);
    } else {
      await setDoc(likeRef, { userId, postId, createdAt: new Date() });
      updatedLikes.add(postId);
    }
    setLikedPosts(updatedLikes);
  };

  // ✅ 페이지 계산
  const pageCount = useMemo(() => Math.ceil(posts.length / PageSize), [posts]);
  const currentPosts = useMemo(
    () => posts.slice((currentPage - 1) * PageSize, currentPage * PageSize),
    [posts, currentPage]
  );

  const startPage =
    Math.floor((currentPage - 1) / pageGroupSize) * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, pageCount);

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-6 text-center">전체 게시글 목록</h1>

      {/* 상단 버튼 */}
      <div className="flex justify-end gap-2 mb-6">
        <Link
          href="/blog/likes"
          className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300 text-gray-800">
          찜 목록
        </Link>
        <Link
          href="/blog/write"
          className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300 text-gray-800">
          글쓰기
        </Link>
      </div>

      {/* 게시글 목록 */}
      <ul className="space-y-6">
        {currentPosts.map((post) => (
          <li
            key={post.id}
            className="border-1 border-gray-300 p-4 rounded shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Image
                src={post.author?.photoURL || "/default-avatar.png"}
                alt="프로필"
                width={40}
                height={40}
                className="rounded-full"
                unoptimized
              />
              <span className="text-sm text-gray-700">
                {post.author?.name || "익명"} ({post.author?.email})
              </span>
            </div>

            <Link href={`/blog/read/${post.id}`}>
              <h2 className="text-lg font-medium">
                {post.title.length > 40
                  ? `${post.title.slice(0, 40)}...`
                  : post.title}
              </h2>
              <p className="text-sm text-gray-600">
                {post.content.length > 80
                  ? `${post.content.slice(0, 60)}...`
                  : post.content}
              </p>
            </Link>

            <div className="text-xs text-gray-400 mt-1">
              <p>작성일: {post.createdAt.toLocaleString("ko-KR")}</p>
              <p>수정일: {post.updatedAt.toLocaleString("ko-KR")}</p>
            </div>

            <div className="mt-3 flex gap-2">
              <Link
                href={`/blog/read/${post.id}`}
                className="bg-gray-100 hover:bg-gray-300 px-2 py-1 rounded text-xs text-gray-800">
                상세보기
              </Link>
              {user && (
                <button
                  onClick={() => toggleLike(post.id)}
                  className={`px-2 py-1 text-xs rounded cursor-pointer ${
                    likedPosts.has(post.id)
                      ? "bg-yellow-300 text-gray-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                  {likedPosts.has(post.id) ? "★ 찜삭제" : "☆ 찜하기"}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* 페이지네이션 */}
      {pageCount > 1 && (
        <nav className="flex justify-center mt-8 space-x-2 text-xs">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-200 cursor-pointer">
            ≪
          </button>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-200 cursor-pointer">
            ＜
          </button>
          {startPage > 1 && (
            <button
              onClick={() => setCurrentPage(startPage - 1)}
              className="cursor-pointer">
              ...
            </button>
          )}
          {Array.from(
            { length: endPage - startPage + 1 },
            (_, i) => startPage + i
          ).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-2 py-1 rounded border cursor-pointer ${
                currentPage === page
                  ? "bg-gray-400 text-white border-gray-400"
                  : "border-gray-300 hover:bg-gray-200"
              }`}>
              {page}
            </button>
          ))}
          {endPage < pageCount && (
            <button
              onClick={() => setCurrentPage(endPage + 1)}
              className="cursor-pointer">
              ...
            </button>
          )}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === pageCount}
            className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-200 cursor-pointer">
            ＞
          </button>
          <button
            onClick={() => setCurrentPage(pageCount)}
            disabled={currentPage === pageCount}
            className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-200 cursor-pointer">
            ≫
          </button>
        </nav>
      )}
    </div>
  );
}
