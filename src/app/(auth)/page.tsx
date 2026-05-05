"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient } from "../../../lib/auth-client";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

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
      className="min-h-screen flex items-center justify-center p-6 bg-black text-white"
      style={{
        background:
          "radial-gradient(1200px 600px at 20% -10%, rgba(34,211,238,0.12), transparent 60%), radial-gradient(1000px 500px at 120% 10%, rgba(168,85,247,0.12), transparent 60%)",
      }}
    >
      <Card className="w-full max-w-sm bg-black/40 border-cyan-400/20 backdrop-blur-xl">
        <CardHeader>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
            <p className="text-sm text-white/60">Welcome back to Mixpense</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-white/80"
              >
                Email
              </label>
              <div className="relative">
                <Input
                  id="email"
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
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-white/80"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPwd ? "text" : "password"}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>

            {err && <p className="text-sm text-rose-400">{err}</p>}

            <Button
              type="submit"
              className="w-full bg-cyan-500/90 hover:bg-cyan-400 text-black font-medium shadow-[0_0_25px_rgba(34,211,238,0.35)]"
              disabled={loading || !email || !password}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <p className="text-xs text-white/50 text-center">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Create account
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
