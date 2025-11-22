"use client";

import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-sky-900">
      <div className="w-full max-w-md rounded-2xl bg-slate-950/70 border border-slate-800 shadow-2xl shadow-sky-900/40 p-8 backdrop-blur">
        <h1 className="text-2xl font-semibold text-slate-50 mb-2">
          Welcome back 
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          Sign in to continue the conversation.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
