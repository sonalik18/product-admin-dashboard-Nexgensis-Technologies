//  "use client";

// import { useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { login } from "@/lib/api/auth";
// import { useAuth } from "@/components/AuthProvider";

// export default function LoginPage() {
//   const { setSession, user, ready } = useAuth();
//   const router = useRouter();
//   const params = useSearchParams();
//   const [username, setUsername] = useState("emilys");
//   const [password, setPassword] = useState("emilyspass");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   if (ready && user) { router.replace("/products"); return null; }

//   async function submit(e) {
//     e.preventDefault();
//     if (loading) return;
//     setError("");
//     setLoading(true);
//     try {
//       const data = await login(username.trim(), password);
//       setSession(data);
//       router.replace(params.get("next") || "/products");
//     } catch (err) {
//       setError(err.userMessage || "Invalid username or password.");
//     } finally { setLoading(false); }
//   }

//   return (
//     <main className="min-h-screen bg-slate-100 px-4 py-10">
//       <div className="mx-auto max-w-md rounded-2xl border bg-white p-8 shadow-sm">
//         <h1 className="text-2xl font-bold">Product Admin Login</h1>
//         <p className="mt-1 text-sm text-slate-500">Use the DummyJSON test credentials.</p>
//         <form onSubmit={submit} className="mt-6 space-y-4">
//           <div><label className="mb-1 block text-sm font-medium">Username</label><input value={username} onChange={e=>setUsername(e.target.value)} className="w-full rounded-lg border px-3 py-2" /></div>
//           <div><label className="mb-1 block text-sm font-medium">Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full rounded-lg border px-3 py-2" /></div>
//           {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
//           <button disabled={loading} className="w-full rounded-lg bg-slate-900 px-4 py-2.5 font-semibold text-white">{loading ? "Logging in..." : "Login"}</button>
//         </form>
//         <p className="mt-5 text-xs text-slate-500">Username: emilys · Password: emilyspass</p>
//       </div>
//     </main>
//   );
// }




"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/lib/api/auth";
import { useAuth } from "@/components/AuthProvider";

function LoginForm() {
  const { setSession, user, ready } = useAuth();
  const router = useRouter();
  const params = useSearchParams();

  const [username, setUsername] = useState("emilys");
  const [password, setPassword] = useState("emilyspass");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (ready && user) {
    router.replace("/products");
    return null;
  }

  async function submit(e) {
    e.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const data = await login(username.trim(), password);
      setSession(data);

      router.replace(params.get("next") || "/products");
    } catch (err) {
      setError(err.userMessage || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">
          Product Admin Login
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Use the DummyJSON test credentials.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Username
            </label>

            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-5 text-xs text-slate-500">
          Username: emilys · Password: emilyspass
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-100">
          <p className="text-slate-500">Loading login...</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}