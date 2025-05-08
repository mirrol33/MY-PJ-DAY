// types/post.ts

import { Timestamp } from "firebase/firestore";

// 게시글(Post) 타입 정의
export interface Post {
  id?: string;               // 문서 ID (선택)
  title: string;             // 게시글 제목
  content: string;           // 게시글 내용
  createdAt: Timestamp;      // 생성 시각 (Firestore Timestamp)
  updatedAt?: Timestamp;     // 수정 시각 (선택, Firestore Timestamp)
}
