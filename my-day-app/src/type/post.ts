// types/post.ts

import { Timestamp } from "firebase/firestore";

// 게시글(Post) 타입 정의
export interface Post {
  id?: string;               // 문서 ID (선택)
  title: string;             // 게시글 제목
  content: string;           // 게시글 내용
  createdAt: string;      
  updatedAt?: string;     
}
