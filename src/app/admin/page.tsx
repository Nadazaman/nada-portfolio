
"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      window.location.href = "/admin/dashboard";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-page">
      <div className="admin-card">
        <h1>Admin Login</h1>
        <p>Sign in to manage your portfolio projects.</p>

        <form onSubmit={handleLogin}>
          <label htmlFor="admin-email">Email address</label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            autoComplete="username"
            required
          />

          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <a href="/">← Back to Portfolio</a>
      </div>

      <style jsx>{`
        .admin-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: #100b1d;
          color: #ffffff;
          font-family: Arial, sans-serif;
        }

        .admin-card {
          width: 100%;
          max-width: 420px;
          padding: 32px;
          border: 1px solid #39284f;
          border-radius: 16px;
          background: #1b1429;
        }

        h1 {
          margin: 0 0 10px;
          font-size: 28px;
        }

        p {
          margin-bottom: 28px;
          color: #c2b8d1;
          line-height: 1.5;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        label {
          font-size: 14px;
        }

        input {
          width: 100%;
          box-sizing: border-box;
          padding: 12px;
          border: 1px solid #514065;
          border-radius: 8px;
          background: #100b1d;
          color: white;
          font-size: 16px;
        }

        button {
          margin-top: 12px;
          padding: 13px;
          border: none;
          border-radius: 8px;
          background: #a78bfa;
          color: #160d27;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
        }

        button:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .error {
          margin: 4px 0;
          color: #fca5a5;
          font-size: 14px;
          overflow-wrap: anywhere;
        }

        a {
          display: inline-block;
          margin-top: 24px;
          color: #c4b5fd;
          text-decoration: none;
        }
      `}</style>
    </main>
  );
}
