// app/blog/mypage/page.tsx

'use client';

import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState, ChangeEvent } from 'react';
import Image from 'next/image';

export default function MyPage() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user?.uid) return;
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name || '');
        setPhotoURL(data.photoURL || '');
        setPreviewImage(data.photoURL || '');
      }
    };
    fetchUserInfo();
  }, [user]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('10MB 이하의 이미지만 업로드할 수 있습니다.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result && typeof reader.result === 'string') {
        setPreviewImage(reader.result);
        setPhotoURL(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name,
        photoURL,
      });
      alert('회원 정보가 저장되었습니다.');
    } catch (err) {
      console.error('❌ 사용자 정보 저장 오류:', err);
      alert('저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto m-20 p-4 border-1 border-gray-300 rounded shadow">
      <h1 className="text-xl font-bold mb-4 text-center">회원정보 수정</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">이메일</label>
        <input
          type="text"
          value={user?.email || ''}
          disabled
          className="w-full border p-2 rounded bg-gray-100 text-gray-400"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">이름</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">프로필 이미지</label>
        <div className="mb-2">
          {previewImage && (
            <Image
              src={previewImage}
              alt="미리보기 이미지"
              width={100}
              height={100}
              className="rounded-full border"
              unoptimized
            />
          )}
        </div>
        <input type="file" accept="image/*" onChange={handleImageChange} className='text-sm cursor-pointer' />
      </div>
      <button
        onClick={handleSave}
        disabled={loading}
        className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-red-400 hover:text-white text-sm cursor-pointer"
      >
        {loading ? '저장 중...' : '저장하기'}
      </button>
    </div>
  );
}
