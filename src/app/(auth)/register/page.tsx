"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "../../../../lib/auth-client";

const mono: React.CSSProperties = {
  fontFamily: "var(--font-dm-mono), 'Courier New', monospace",
};
const display: React.CSSProperties = {
  fontFamily: "var(--font-fraunces), Georgia, serif",
};

function PasswordStrengthBar({ score }: { score: number }) {
  const color = score >= 80 ? "#6b9e6b" : score >= 55 ? "#c9953a" : "#c0473a";
  return (
    <div
      style={{
        height: 3,
        background: "#1e1e1b",
        borderRadius: 2,
        overflow: "hidden",
        marginTop: 8,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${score}%`,
          background: color,
          borderRadius: 2,
          transition: "width 0.2s ease, background 0.2s ease",
        }}
      />
    </div>
  );
}

function ShowHideBtn({
  show,
  onToggle,
}: {
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={show ? "Hide password" : "Show password"}
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
      <span style={{ ...mono, fontSize: 9, letterSpacing: "0.1em" }}>
        {show ? "HIDE" : "SHOW"}
      </span>
    </button>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [cpwd, setCpwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showCpwd, setShowCpwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const pwdScore = useMemo(() => {
    const s =
      (pwd.length >= 8 ? 25 : 0) +
      (/[a-z]/.test(pwd) ? 15 : 0) +
      (/[A-Z]/.test(pwd) ? 20 : 0) +
      (/\d/.test(pwd) ? 20 : 0) +
      (/[^A-Za-z0-9]/.test(pwd) ? 20 : 0);
    return Math.min(100, s);
  }, [pwd]);

  const strength =
    pwdScore >= 80
      ? "Strong"
      : pwdScore >= 55
        ? "Good"
        : pwdScore >= 35
          ? "Fair"
          : pwd
            ? "Weak"
            : "";

  const strengthColor =
    pwdScore >= 80 ? "#6b9e6b" : pwdScore >= 55 ? "#c9953a" : "#c0473a";

  const mismatch = cpwd.length > 0 && pwd !== cpwd;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (mismatch) {
      setErr("Passwords do not match");
      return;
    }
    setLoading(true);
    const { error } = await authClient.signUp.email({
      name,
      email,
      password: pwd,
    });
    setLoading(false);
    if (error) {
      setErr(error.message || "Sign up failed");
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
            Create your
            <br />
            account.
          </h1>
        </div>

        {/* ── FORM CARD ── */}
        <div
          className="ledger-fade-up ledger-card"
          style={{ padding: "28px 28px", animationDelay: "0.08s" }}
        >
          <p className="ledger-label" style={{ marginBottom: 22 }}>
            Register
          </p>
          <form
            onSubmit={onSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            {/* Name */}
            <div>
              <p className="ledger-label" style={{ marginBottom: 6 }}>
                Full Name
              </p>
              <input
                className="ledger-input"
                style={{ width: "100%", padding: "10px 12px" }}
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            {/* Email */}
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

            {/* Password */}
            <div>
              <p className="ledger-label" style={{ marginBottom: 6 }}>
                Password
              </p>
              <div style={{ position: "relative" }}>
                <input
                  type={showPwd ? "text" : "password"}
                  className="ledger-input"
                  style={{ width: "100%", padding: "10px 52px 10px 12px" }}
                  placeholder="Create a strong password"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <ShowHideBtn
                  show={showPwd}
                  onToggle={() => setShowPwd((s) => !s)}
                />
              </div>
              {pwd && (
                <>
                  <PasswordStrengthBar score={pwdScore} />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 5,
                    }}
                  >
                    <p
                      className="ledger-label"
                      style={{ color: strengthColor }}
                    >
                      {strength}
                    </p>
                    <p
                      className="ledger-label"
                      style={{ color: strengthColor }}
                    >
                      {pwdScore}%
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <p className="ledger-label" style={{ marginBottom: 6 }}>
                Confirm Password
              </p>
              <div style={{ position: "relative" }}>
                <input
                  type={showCpwd ? "text" : "password"}
                  className="ledger-input"
                  style={{
                    width: "100%",
                    padding: "10px 52px 10px 12px",
                    borderColor: mismatch ? "rgba(192,71,58,0.5)" : undefined,
                  }}
                  placeholder="Re-type password"
                  value={cpwd}
                  onChange={(e) => setCpwd(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <ShowHideBtn
                  show={showCpwd}
                  onToggle={() => setShowCpwd((s) => !s)}
                />
              </div>
              {mismatch && (
                <p
                  style={{
                    ...mono,
                    fontSize: 10,
                    color: "#c0473a",
                    marginTop: 5,
                  }}
                >
                  Passwords do not match
                </p>
              )}
            </div>

            {err && (
              <p style={{ ...mono, fontSize: 11, color: "#c0473a" }}>{err}</p>
            )}

            <button
              type="submit"
              className="ledger-btn-primary"
              style={{ width: "100%", padding: "12px", marginTop: 2 }}
              disabled={loading || !name || !email || !pwd || !cpwd || mismatch}
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
        </div>

        {/* ── LOGIN LINK ── */}
        <div
          className="ledger-fade-up"
          style={{ textAlign: "center", animationDelay: "0.16s" }}
        >
          <p style={{ ...mono, fontSize: 11, color: "#5e5c57" }}>
            Already have an account?{" "}
            <Link href="/" style={{ color: "#c9953a", textDecoration: "none" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
