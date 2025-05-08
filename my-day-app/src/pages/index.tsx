// pages/index.tsx
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Post } from '@/type/post';
import { Timestamp } from 'firebase/firestore';

interface PostWithFormattedDate extends Omit<Post, 'createdAt'> {
  createdAt: string; // 문자열로 변환된 날짜
}

export default function Home() {
  const [posts, setPosts] = useState<PostWithFormattedDate[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/posts');  // 경로 수정

        const allPosts: Post[] = await res.json();

        // Timestamp → 문자열 변환
        const transformed = allPosts.map((post) => ({
          ...post,
          createdAt: (post.createdAt as Timestamp).toDate().toISOString(),
        }));

        // 최신순 정렬
        const sorted = transformed.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setPosts(sorted);
      } catch (error) {
        console.error('게시글을 불러오지 못했습니다.', error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <main>
      <h1>블로그 게시글 목록</h1>

      {posts.length === 0 ? (
        <p>게시글이 없습니다.</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <Link href={`/posts/${post.id}`}>
                <h2>{post.title}</h2>
              </Link>
              <p>{post.content.slice(0, 100)}...</p>
              <small>작성일: {new Date(post.createdAt).toLocaleDateString()}</small>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
