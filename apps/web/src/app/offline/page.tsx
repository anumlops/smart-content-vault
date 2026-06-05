import Link from "next/link";
import { Bookmark, WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-background">
      <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center mb-6">
        <WifiOff className="h-7 w-7 text-muted-foreground" />
      </div>
      <h1 className="text-lg font-semibold mb-2">You&apos;re offline</h1>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-8 leading-relaxed">
        Your saved content is safe. Connect to the internet to browse, search, and add new links.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 active:scale-95 transition-all shadow-sm touch-manipulation"
      >
        <Bookmark className="h-4 w-4" />
        Try again
      </Link>
    </div>
  );
}
