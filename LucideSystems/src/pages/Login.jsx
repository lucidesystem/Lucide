import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Login({ onSuccess }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === "signin" ? "/api/auth/login" : "/api/auth/signup";
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      localStorage.setItem("ls_token", data.token);
      onSuccess?.();
    } catch (err) {
      setError("Couldn't reach the server. Try again in a bit.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <span className="logo">
        <span className="logo-badge">
          <img src="/assets/lucidelogo.png" alt="Logo" />
        </span>
        <span className="logo-text">
          Lucide<span className="logo-accent">Systems</span>
        </span>
      </span>

      <h1>{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
      <p className="section-sub">
        {mode === "signin"
          ? "Sign in to monitor your sites and manage your account."
          : "Set up an account to start tracking your sites."}
      </p>

      <form className="start-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>

        {mode === "signup" && (
          <label>
            Confirm password
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </label>
        )}

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <div className="auth-switch">
        {mode === "signin" ? (
          <>
            Don't have an account?{" "}
            <button type="button" onClick={() => setMode("signup")}>
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button type="button" onClick={() => setMode("signin")}>
              Sign in
            </button>
          </>
        )}
      </div>
    </>
  );
}
