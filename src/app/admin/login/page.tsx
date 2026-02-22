"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "700"] });

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        document.cookie = `token=${data.token}; path=/; max-age=86400`;
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/admin/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "Login failed");
        setLoading(false);
      }
    } catch (err) {
      setError("An error occurred");
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-background text-foreground relative overflow-hidden ${display.className} selection:bg-foreground selection:text-background p-6`}
    >
      {/* Structural Lines Background */}
      <div className="fixed inset-0 pointer-events-none z-0 flex justify-between px-6 md:px-12 max-w-[1600px] mx-auto opacity-[0.03] dark:opacity-[0.05]">
        <div className="w-px h-full bg-foreground"></div>
        <div className="w-px h-full bg-foreground"></div>
        <div className="w-px h-full bg-foreground hidden md:block"></div>
        <div className="w-px h-full bg-foreground hidden lg:block"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-3 mb-8 group hover:-translate-y-1 transition-transform"
        >
          <div className="w-12 h-12 border-2 border-foreground bg-foreground text-background flex items-center justify-center shadow-[4px_4px_0_0_currentColor] group-hover:shadow-[6px_6px_0_0_currentColor] transition-shadow">
            <MessageSquare className="w-6 h-6 fill-current" />
          </div>
          <span className="font-extrabold text-3xl tracking-tighter uppercase">
            HelpDesk_
          </span>
        </Link>

        <div className="border-2 border-foreground bg-background shadow-[12px_12px_0_0_currentColor] overflow-hidden">
          <div className="border-b-2 border-foreground bg-foreground text-background p-4 flex justify-between items-center">
            <h1
              className={`text-sm font-bold tracking-widest uppercase ${mono.className}`}
            >
              System.Auth
            </h1>
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-background rounded-full" />
              <div className="w-3 h-3 bg-background/50 rounded-full" />
              <div className="w-3 h-3 border border-background rounded-full" />
            </div>
          </div>

          <div className="p-8 md:p-10">
            <div className="mb-10">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter uppercase mb-4">
                Initialize
                <br />
                Session
              </h2>
              <p className={`text-lg opacity-80 ${mono.className}`}>
                Enter administrator credentials.
              </p>
            </div>

            {error && (
              <div
                className={`mb-8 p-4 border-2 border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 ${mono.className} text-sm font-bold uppercase`}
              >
                [ERROR] {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label
                  className={`text-sm font-bold tracking-widest uppercase ${mono.className}`}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-5 py-4 bg-background border-2 border-foreground focus:outline-none focus:shadow-[6px_6px_0_0_currentColor] transition-all text-foreground placeholder-foreground/30 ${mono.className} text-lg`}
                  placeholder="admin@system.local"
                  required
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <label
                    className={`text-sm font-bold tracking-widest uppercase ${mono.className}`}
                  >
                    Password
                  </label>
                  <a
                    href="#"
                    className={`text-xs font-bold underline underline-offset-4 hover:opacity-70 transition-opacity ${mono.className} uppercase`}
                  >
                    Forgot Password?
                  </a>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-5 py-4 bg-background border-2 border-foreground focus:outline-none focus:shadow-[6px_6px_0_0_currentColor] transition-all text-foreground placeholder-foreground/30 ${mono.className} text-lg`}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full border-2 border-foreground bg-foreground text-background font-bold py-4 hover:bg-background hover:text-foreground transition-all duration-300 flex items-center justify-center gap-3 mt-8 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest group text-lg shadow-[4px_4px_0_0_transparent] hover:shadow-[4px_4px_0_0_currentColor]"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    Authenticate{" "}
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
          <div className="bg-foreground/5 p-6 border-t-2 border-foreground text-center">
            <p
              className={`text-sm font-bold uppercase tracking-widest ${mono.className}`}
            >
              No Access?{" "}
              <Link
                href="/admin/signup"
                className="underline underline-offset-4 hover:opacity-70"
              >
                Request Key
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
