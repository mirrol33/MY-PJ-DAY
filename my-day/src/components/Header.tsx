// app/components/Header.tsx
import Link from "next/link";
import GoogleAuthButton from "./GoogleAuthButton";

export default function Header() {
  return (
    <header className="bg-gray-600">
      <div className="max-w-4xl mx-auto sm:flex md:flex justify-between items-center">
      <h1 className="text-white text-lg text-center p-0 md:p-6 pt-4 md:pt-6">
        <Link href="/">Next.js + Firebase로 만든 미니 블로그</Link>
      </h1>
      <div className="p-4 md:p-0 flex items-center justify-center">
        <GoogleAuthButton />
      </div>
      </div>
    </header>
  );
}
