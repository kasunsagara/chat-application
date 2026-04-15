import Link from "next/link";

export default function Navbar() {
  return (
    <div className="p-4 bg-blue-600 text-white flex justify-between">
      
      <h1>💬 Chat App</h1>

      <div className="flex gap-4">
        <Link href="/">Home</Link>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
      </div>

    </div>
  );
}