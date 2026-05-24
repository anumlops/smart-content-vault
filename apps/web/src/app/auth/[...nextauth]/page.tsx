import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Mail } from "lucide-react";

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-sm glass">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Archive</CardTitle>
          <CardDescription>
            Sign in to start saving and organizing your content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
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
        </CardContent>
      </Card>
    </div>
  );
}
