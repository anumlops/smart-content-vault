import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Mail } from "lucide-react";
import { SignInForm } from "./SignInForm";

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  const hasGitHub = !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
  const hasGoogle = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-sm glass">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Archive</CardTitle>
          <CardDescription>
            Sign in to start saving and organizing your content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasGitHub && (
            <form
              action={async () => {
                "use server";
                await signIn("github", { redirectTo: "/dashboard" });
              }}
            >
              <Button type="submit" variant="outline" className="w-full gap-2">
                <Github className="h-4 w-4" />
                Continue with GitHub
              </Button>
            </form>
          )}
          {hasGoogle && (
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/dashboard" });
              }}
            >
              <Button type="submit" variant="outline" className="w-full gap-2">
                <Mail className="h-4 w-4" />
                Continue with Google
              </Button>
            </form>
          )}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Demo access</span>
            </div>
          </div>
          <SignInForm />
        </CardContent>
      </Card>
    </div>
  );
}
