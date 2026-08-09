import { useMemo } from "react";

// Pulls the email out of the JWT payload for display purposes only.
// This is NOT verification — the server already verified the token
// when it issued it; here we're just reading the claims to say hi.
function useTokenEmail() {
  return useMemo(() => {
    const token = localStorage.getItem("ls_token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.email || null;
    } catch {
      return null;
    }
  }, []);
}

export default function Greeting({ onLogout }) {
  const email = useTokenEmail();

  function handleLogout() {
    localStorage.removeItem("ls_token");
    onLogout?.();
  }

  return (
    <div className="auth-screen">
      <div className="hero-glow" aria-hidden="true" />
      <div className="auth-card">
        <span className="logo">
          <span className="logo-badge">L</span>
          <span className="logo-text">
            Lucide<span className="logo-accent">Systems</span>
          </span>
        </span>

        <p className="eyebrow">Signed in</p>
        <h1>Welcome{email ? `, ${email}` : ""}.</h1>
        <p className="section-sub">
          You're logged in. This is a placeholder page — build out your
          dashboard here.
        </p>

        <button className="btn btn-primary btn-block" onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </div>
  );
}
