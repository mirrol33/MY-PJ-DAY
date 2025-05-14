import Link from "next/link";
import GoogleAuthButton from "./GoogleAuthButton";

export default function Header() {
  return (
    <header className="bg-gray-600">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
      <h1 className="text-white text-center p-6">
        <Link href="/">Next.js + Firebase로 만든 개인 블로그 사이트 프로젝트</Link>
      </h1>
      <div className="px-4 py-4">
        <GoogleAuthButton />
      </div>
      </div>
    </header>
  );
}
