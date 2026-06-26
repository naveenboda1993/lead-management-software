import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
          <span className="text-4xl font-bold text-muted-foreground">404</span>
        </div>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you are looking for does not exist or is under development.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
