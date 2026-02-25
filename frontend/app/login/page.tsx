"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setToken("");

    try {
      const res = await fetch("http://localhost:5055/api/Auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setToken(data.data);
        setMessage("Login berhasil!");
        localStorage.setItem("token", data.data);
      } else {
        setSuccess(false);
        setMessage(`Login gagal: ${data.message}`);
      }
    } catch (error) {
      setSuccess(false);
      setMessage("Tidak bisa terhubung ke server. Pastikan backend sudah jalan.");
    } finally {
      setLoading(false);
    }
  };

  const decodeToken = (jwt: string) => {
    try {
      const payload = JSON.parse(atob(jwt.split(".")[1]));
      return JSON.stringify(payload, null, 2);
    } catch {
      return "Gagal decode token";
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black">Sign In</h1>
          <p className="text-gray-500 mt-2 text-sm">Welcome back! Please enter your details</p>
        </div>

        {/* Form Card */}
        <div className="bg-white p-8 shadow-sm border border-gray-200">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 tracking-wide mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 tracking-wide mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 text-sm font-semibold uppercase tracking-wide hover:bg-gray-800 disabled:bg-gray-400 transition"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Message */}
          {message && (
            <div
              className={`mt-5 p-4 text-sm ${
                success
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          {/* JWT Token Debug */}
          {token && (
            <div className="mt-5 space-y-3">
              <div className="p-4 bg-gray-50 border border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">JWT Token</p>
                <p className="text-xs text-gray-600 break-all font-mono leading-relaxed">{token}</p>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Decoded Payload</p>
                <pre className="text-xs text-gray-600 font-mono whitespace-pre-wrap leading-relaxed">
                  {decodeToken(token)}
                </pre>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <a href="/register" className="text-black font-semibold hover:underline">
                Create Account
              </a>
            </p>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-4 text-xs text-gray-400 text-center">
          <p>API: POST http://localhost:5055/api/Auth/login</p>
        </div>
      </div>
    </div>
  );
}
