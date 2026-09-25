"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/products" className="text-xl font-bold">Product Admin</Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-slate-600 sm:block">Hi, {user?.firstName || user?.username}</span>
          <button onClick={logout} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Logout</button>
        </div>
      </div>
    </header>
  );
}