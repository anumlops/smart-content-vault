"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, Loader2 } from "lucide-react";

export function SignInForm() {
  const [email, setEmail] = useState("demo@contentarchive.dev");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signIn("demo", {
        email,
        redirect: true,
        redirectTo: "/dashboard",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        name="email"
        type="email"
        placeholder="demo@contentarchive.dev"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="text-center"
        disabled={loading}
      />
      {error && (
        <p className="text-xs text-red-500 text-center">{error}</p>
      )}
      <Button type="submit" className="w-full gap-2" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            Continue with Demo
          </>
        )}
      </Button>
    </form>
  );
}
