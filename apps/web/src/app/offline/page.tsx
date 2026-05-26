import Link from "next/link";
import { Bookmark, WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-background">
      <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
        <WifiOff className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-xl font-bold mb-2">You&apos;re offline</h1>
      <p className="text-sm text-muted-foreground max-w-sm mb-8">
        Your saved content is safe. Connect to the internet to browse, search, and add new links.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-medium"
      >
        <Bookmark className="h-4 w-4" />
        Try again
      </Link>
    </div>
  );
}
