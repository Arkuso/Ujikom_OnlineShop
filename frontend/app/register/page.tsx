"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5055/api/Auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setMessage(`Register berhasil! User ID: ${data.data}`);
        setName("");
        setEmail("");
        setPassword("");
      } else {
        setSuccess(false);
        setMessage(`Register gagal: ${data.message}`);
      }
    } catch (error) {
      setSuccess(false);
      setMessage("Tidak bisa terhubung ke server. Pastikan backend sudah jalan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black">Create Account</h1>
          <p className="text-gray-500 mt-2 text-sm">Join us and start shopping today</p>
        </div>

        {/* Form Card */}
        <div className="bg-white p-8 shadow-sm border border-gray-200">
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 tracking-wide mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition"
                placeholder="Enter your full name"
              />
            </div>

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
                minLength={6}
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition"
                placeholder="Minimum 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 text-sm font-semibold uppercase tracking-wide hover:bg-gray-800 disabled:bg-gray-400 transition"
            >
              {loading ? "Creating account..." : "Register"}
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

          {/* Divider */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <a href="/login" className="text-black font-semibold hover:underline">
                Sign In
              </a>
            </p>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-4 text-xs text-gray-400 text-center">
          <p>API: POST http://localhost:5055/api/Auth/register</p>
        </div>
      </div>
    </div>
  );
}
