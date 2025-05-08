// pages/api/posts.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/firebase/config';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { Post } from '@/type/post';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const posts: Post[] = snapshot.docs.map((doc) => {
      const data = doc.data() as Post;

      return {
        id: doc.id,
        title: data.title,
        content: data.content,
        createdAt: data.createdAt, // Timestamp 그대로 반환
        updatedAt: data.updatedAt, // 선택 필드
      };
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error('🔥 게시글 가져오기 오류:', error);
    res.status(500).json({ message: '게시글을 불러오는 데 실패했습니다.' });
  }
}