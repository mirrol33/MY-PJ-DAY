// pages/index.tsx

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Post } from '@/type/post';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface PostWithFormattedDate extends Omit<Post, 'createdAt'> {
  createdAt: string; // 'createdAt'을 문자열로 변환하여 다룸
}

export default function Home() {
  // 게시글 상태 관리
  const [posts, setPosts] = useState<PostWithFormattedDate[]>([]);

  useEffect(() => {
    // 게시글을 가져오는 비동기 함수
    const fetchPosts = async () => {
      try {
        console.log('📦 게시글을 불러오는 중...');

        // Firestore에서 게시글을 최신순으로 가져오는 쿼리
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        // 성공적으로 데이터를 가져온 경우, 가져온 문서 수를 로그로 출력
        console.log(`✅ ${snapshot.docs.length}개의 문서를 가져왔습니다.`);

        // 가져온 데이터를 형식에 맞게 변환
        const allPosts = snapshot.docs.map((doc) => {
          const data = doc.data() as Post;

          // Firestore의 Timestamp 객체를 문자열로 변환
          const formattedDate = (data.createdAt as Timestamp).toDate().toISOString();

          // 각 게시글의 제목과 작성일을 콘솔로 출력 (디버깅 용도)
          console.log(`📄 게시글: ${data.title} | 작성일: ${formattedDate}`);

          return {
            ...data,
            id: doc.id,
            createdAt: formattedDate, // 변환된 날짜를 'createdAt'에 할당
          };
        });

        // 상태 업데이트: 게시글 목록을 화면에 표시
        setPosts(allPosts);
        console.log('🚀 게시글 상태 업데이트 완료');
      } catch (error) {
        // 오류가 발생한 경우 오류 메시지 출력
        console.error('🔥 Firestore에서 게시글을 가져오는 데 실패했습니다:', error);
      }
    };

    // 컴포넌트가 마운트될 때 게시글을 불러오는 함수 실행
    fetchPosts();
  }, []); // 빈 배열을 전달하여 컴포넌트가 처음 렌더링될 때만 실행되도록 설정

  return (
    <main>
      <h1>블로그 게시글 목록</h1>

      {/* 게시글이 없으면 안내 메시지 출력 */}
      {posts.length === 0 ? (
        <p>게시글이 없습니다.</p>
      ) : (
        <ul>
          {/* 게시글 목록을 출력 */}
          {posts.map((post) => (
            <li key={post.id}>
              {/* 게시글 제목을 클릭하면 해당 게시글의 상세 페이지로 이동 */}
              <Link href={`/read/${post.id}`}>
                <h2>{post.title}</h2>
              </Link>
              {/* 게시글 내용의 일부를 표시 (100자 이하) */}
              <p>{post.content.slice(0, 20)}...</p>
              {/* 작성일을 날짜 형식으로 표시 */}
              <small>작성일: {new Date(post.createdAt).toLocaleDateString()}</small>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
