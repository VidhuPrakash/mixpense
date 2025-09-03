"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient } from "../../../../lib/auth-client";
import { Eye, EyeOff, Mail, Lock, User2 } from "lucide-react";

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
      className="min-h-screen flex items-center justify-center p-6 bg-black text-white"
      style={{
        background:
          "radial-gradient(1200px 600px at 20% -10%, rgba(34,211,238,0.12), transparent 60%), radial-gradient(1000px 500px at 120% 10%, rgba(168,85,247,0.12), transparent 60%)",
      }}
    >
      <Card className="w-full max-w-sm bg-black/40 border-cyan-400/20 backdrop-blur-xl">
        <CardHeader>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">
              Create account
            </h1>
            <p className="text-sm text-white/60">
              Dark neon mode for a crisp, focused experience
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">
                Full name
              </label>
              <div className="relative">
                <Input
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-cyan-400/50"
                />
                <User2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/50" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Email</label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-cyan-400/50"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/50" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPwd ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  className="pl-9 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-cyan-400/50"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/50" />
                <button
                  type="button"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-md p-1 text-white/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
                >
                  {showPwd ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {!!pwd && (
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-white/60">{strength}</span>
                  <span
                    className={
                      pwdScore >= 80
                        ? "text-emerald-400"
                        : pwdScore >= 55
                        ? "text-amber-400"
                        : "text-rose-400"
                    }
                  >
                    {pwdScore}%
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">
                Confirm password
              </label>
              <div className="relative">
                <Input
                  type={showCpwd ? "text" : "password"}
                  placeholder="Re-type password"
                  value={cpwd}
                  onChange={(e) => setCpwd(e.target.value)}
                  className={`pl-9 pr-10 bg-white/5 text-white placeholder:text-white/40 focus:border-cyan-400/50 ${
                    mismatch ? "border-rose-500/60" : "border-white/10"
                  }`}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/50" />
                <button
                  type="button"
                  aria-label={showCpwd ? "Hide password" : "Show password"}
                  onClick={() => setShowCpwd((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-md p-1 text-white/60 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
                >
                  {showCpwd ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {mismatch && (
                <p className="text-xs text-rose-400">Passwords do not match</p>
              )}
            </div>

            {err && <div className="text-sm text-rose-400">{err}</div>}

            <Button
              type="submit"
              className="w-full bg-cyan-500/90 hover:bg-cyan-400 text-black font-medium shadow-[0_0_25px_rgba(34,211,238,0.35)]"
              disabled={loading || !name || !email || !pwd || !cpwd || mismatch}
            >
              {loading ? "Creating..." : "Create account"}
            </Button>

            <p className="text-xs text-white/50 text-center">
              By continuing, you agree to the Terms and Privacy Policy
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
