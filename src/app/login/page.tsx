"use client";

import { useState } from "react";
import Link from "next/link";
import { FiMessageSquare, FiMail, FiLock } from "react-icons/fi";
import { toast } from "react-hot-toast";



export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Login successful!");
        setTimeout(() => { window.location.href = "/"; }, 1000);
      } else {
        toast.error(data.error || "Invalid credentials.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center gap-2">
            <FiMessageSquare className="text-blue-400 w-8 h-8" /> ChatApp Pro
          </h1>
          <p className="text-neutral-400 text-sm mt-2">Welcome back! Sign in to continue.</p>
        </div>

        {/* Card */}
        <div className="bg-neutral-800/80 backdrop-blur-md border border-neutral-700 rounded-2xl shadow-2xl p-8">

          <h2 className="text-xl text-center font-bold text-white mb-6">Sign In</h2>



          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm text-neutral-400 mb-2">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
              <input
                type="email"
                className="w-full bg-neutral-900 border border-neutral-700 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition placeholder-neutral-600"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm text-neutral-400 mb-2">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
              <input
                type="password"
                className="w-full bg-neutral-900 border border-neutral-700 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition placeholder-neutral-600"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={login}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-60 disabled:active:scale-100 text-white font-semibold py-3 rounded-lg transition shadow-lg shadow-indigo-600/30"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Signing in...
              </span>
            ) : "Sign In"}
          </button>

          {/* Register link */}
          <p className="text-sm text-neutral-500 text-center mt-5">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}