"use client";
import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient } from "../../../../lib/auth-client";
import { Mail } from "lucide-react";

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
              Forgot password
            </h1>
            <p className="text-sm text-white/60">
              Enter your email and we&apos;ll send a reset link
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-cyan-400/10 ring-1 ring-cyan-400/30">
                <Mail className="size-6 text-cyan-400" />
              </div>
              <p className="text-sm text-white/70">
                If an account exists for{" "}
                <span className="text-white font-medium">{email}</span>, a
                password reset link has been sent.
              </p>
              <Link
                href="/"
                className="block text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-white/80">
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

              {err && <p className="text-sm text-rose-400">{err}</p>}

              <Button
                type="submit"
                className="w-full bg-cyan-500/90 hover:bg-cyan-400 text-black font-medium shadow-[0_0_25px_rgba(34,211,238,0.35)]"
                disabled={loading || !email}
              >
                {loading ? "Sending..." : "Send reset link"}
              </Button>

              <p className="text-xs text-white/50 text-center">
                Remembered it?{" "}
                <Link
                  href="/"
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Back to sign in
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
