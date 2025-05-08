// pages/read/[id].tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '@/firebase/config';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { Post } from '@/type/post';

export default function ReadPost() {
  const [post, setPost] = useState<Post | null>(null); // 게시글 상태
  const [loading, setLoading] = useState<boolean>(true); // 로딩 상태
  const [error, setError] = useState<string>(''); // 에러 상태

  const router = useRouter(); // useRouter로 URL 파라미터 접근
  const { id } = router.query; // URL에서 id 파라미터 추출

  useEffect(() => {
    // id가 존재할 때만 Firestore에서 데이터를 불러옴
    if (id) {
      const fetchPost = async () => {
        try {
          setLoading(true); // 데이터 로딩 시작

          // Firestore에서 해당 게시글 가져오기
          const postRef = doc(db, 'posts', id as string);
          const docSnap = await getDoc(postRef);

          if (docSnap.exists()) {
            const postData = docSnap.data() as Post;
            setPost({
              ...postData,
              id: docSnap.id,
              createdAt: postData.createdAt
            });
          } else {
            setError('게시글을 찾을 수 없습니다.');
          }
        } catch (error) {
          setError('게시글을 불러오는 데 실패했습니다.');
        } finally {
          setLoading(false); // 데이터 로딩 종료
        }
      };

      fetchPost();
    }
  }, [id]); // id가 변경될 때마다 실행

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>{error}</p>;

  if (!post) return <p>게시글을 찾을 수 없습니다.</p>;

  return (
    <main>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <small>
        {post.createdAt
          ? // createdAt이 존재하면, 해당 값을 표시
          `작성일: ${(post.createdAt).toDate().toLocaleDateString()}`
          : // createdAt이 없으면, 작성일을 불러올 수 없다는 메시지 표시
            '작성일 정보를 불러올 수 없습니다.'}
      </small>
    </main>
  );
}
