"use client";
import { useState } from "react";
import Link from "next/link";
import { authClient } from "../../../../lib/auth-client";

const mono: React.CSSProperties = {
  fontFamily: "var(--font-dm-mono), 'Courier New', monospace",
};
const display: React.CSSProperties = {
  fontFamily: "var(--font-fraunces), Georgia, serif",
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });
    setLoading(false);
    if (error) {
      setErr(error.message || "Something went wrong");
      return;
    }
    setSent(true);
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
        {/* ── HEADER ── */}
        <div
          className="ledger-slide-down"
          style={{ textAlign: "center", paddingBottom: 12 }}
        >
          <p className="ledger-label" style={{ marginBottom: 10 }}>
            Mixpense
          </p>
          <h1
            style={{
              ...display,
              fontSize: 36,
              fontWeight: 500,
              color: "#e8e6df",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              margin: "0 0 10px",
            }}
          >
            Reset your
            <br />
            password.
          </h1>
        </div>

        {/* ── CARD ── */}
        <div
          className="ledger-fade-up ledger-card"
          style={{ padding: "28px 28px", animationDelay: "0.08s" }}
        >
          {sent ? (
            <div style={{ textAlign: "center" }}>
              <p className="ledger-label" style={{ marginBottom: 20 }}>
                Link Sent
              </p>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "0.5px solid rgba(201,149,58,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <span style={{ ...mono, fontSize: 18, color: "#c9953a" }}>
                  ✓
                </span>
              </div>
              <p
                style={{
                  ...mono,
                  fontSize: 12,
                  color: "#9a9890",
                  lineHeight: 1.6,
                  marginBottom: 22,
                }}
              >
                If an account exists for{" "}
                <span style={{ color: "#e8e6df" }}>{email}</span>, a reset link
                has been sent.
              </p>
              <Link
                href="/"
                style={{
                  ...mono,
                  fontSize: 10,
                  color: "#c9953a",
                  textDecoration: "none",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <p className="ledger-label" style={{ marginBottom: 8 }}>
                Forgot Password
              </p>
              <p
                style={{
                  ...mono,
                  fontSize: 11,
                  color: "#5e5c57",
                  marginBottom: 22,
                  lineHeight: 1.6,
                }}
              >
                Enter your email and we&apos;ll send a reset link.
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

                {err && (
                  <p style={{ ...mono, fontSize: 11, color: "#c0473a" }}>
                    {err}
                  </p>
                )}

                <button
                  type="submit"
                  className="ledger-btn-primary"
                  style={{ width: "100%", padding: "12px", marginTop: 2 }}
                  disabled={loading || !email}
                >
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>
            </>
          )}
        </div>

        {/* ── BACK LINK ── */}
        {!sent && (
          <div
            className="ledger-fade-up"
            style={{ textAlign: "center", animationDelay: "0.16s" }}
          >
            <p style={{ ...mono, fontSize: 11, color: "#5e5c57" }}>
              Remembered it?{" "}
              <Link
                href="/"
                style={{ color: "#c9953a", textDecoration: "none" }}
              >
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
