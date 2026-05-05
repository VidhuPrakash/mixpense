"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "../../../lib/auth-client";

const mono: React.CSSProperties = {
  fontFamily: "var(--font-dm-mono), 'Courier New', monospace",
};
const display: React.CSSProperties = {
  fontFamily: "var(--font-fraunces), Georgia, serif",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/items",
    });
    setLoading(false);
    if (error) {
      setErr(error.message || "Login failed");
      return;
    }
    router.replace("/items");
  }

  return (
    <div
      className="ledger-page"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "48px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {/* ── BRAND ── */}
        <div
          className="ledger-slide-down"
          style={{ textAlign: "center", paddingBottom: 16 }}
        >
          <p className="ledger-label" style={{ marginBottom: 14 }}>
            Mixpense
          </p>
          <h1
            style={{
              ...display,
              fontSize: 44,
              fontWeight: 500,
              color: "#e8e6df",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              margin: "0 0 14px",
            }}
          >
            Track what
            <br />
            you spend.
          </h1>
          <p style={{ ...mono, fontSize: 11, color: "#5e5c57" }}>
            Personal expense ledger
          </p>
        </div>

        {/* ── FORM CARD ── */}
        <div
          className="ledger-fade-up ledger-card"
          style={{ padding: "28px 28px", animationDelay: "0.08s" }}
        >
          <p className="ledger-label" style={{ marginBottom: 22 }}>
            Sign In
          </p>
          <form
            onSubmit={onSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <div>
              <p className="ledger-label" style={{ marginBottom: 6 }}>
                Email
              </p>
              <input
                type="email"
                className="ledger-input"
                style={{ width: "100%", padding: "10px 12px" }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 6,
                }}
              >
                <p className="ledger-label">Password</p>
                <Link
                  href="/forgot-password"
                  style={{
                    ...mono,
                    fontSize: 10,
                    color: "#c9953a",
                    textDecoration: "none",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Forgot?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPwd ? "text" : "password"}
                  className="ledger-input"
                  style={{ width: "100%", padding: "10px 52px 10px 12px" }}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    color: "#5e5c57",
                  }}
                >
                  <span
                    style={{ ...mono, fontSize: 9, letterSpacing: "0.1em" }}
                  >
                    {showPwd ? "HIDE" : "SHOW"}
                  </span>
                </button>
              </div>
            </div>

            {err && (
              <p style={{ ...mono, fontSize: 11, color: "#c0473a" }}>{err}</p>
            )}

            <button
              type="submit"
              className="ledger-btn-primary"
              style={{ width: "100%", padding: "12px", marginTop: 2 }}
              disabled={loading || !email || !password}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        {/* ── REGISTER LINK ── */}
        <div
          className="ledger-fade-up"
          style={{ textAlign: "center", animationDelay: "0.16s" }}
        >
          <p style={{ ...mono, fontSize: 11, color: "#5e5c57" }}>
            No account?{" "}
            <Link
              href="/register"
              style={{ color: "#c9953a", textDecoration: "none" }}
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
