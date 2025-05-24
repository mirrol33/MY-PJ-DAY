import Link from "next/link";
import GoogleAuthButton from "./GoogleAuthButton";

export default function Header() {
  return (
    <header className="bg-gray-600">
      <div className="max-w-4xl mx-auto sm:flex md:flex justify-between items-center">
      <h1 className="text-white text-sm md:text-lg px-4 py-6">
        <Link href="/">Next.js + Firebase로 만든 CRUD 게시판</Link>
      </h1>
      <div className="px-4 py-2">
        <GoogleAuthButton />
      </div>
      </div>
    </header>
  );
}
