import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Bookmark } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="dark min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm mx-auto space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bookmark className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Smart Content Vault</h1>
        </div>
        <Card>
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg">Create an account</CardTitle>
            <CardDescription>Start saving and organizing your content</CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
        </Card>
        <p className="text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
