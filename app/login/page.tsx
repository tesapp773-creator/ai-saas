import Link from "next/link";
import { signIn } from "@/lib/actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 block font-display text-lg font-medium text-ink">
          MKJ Business AI
        </Link>
        <h1 className="mb-1 text-2xl">Log in</h1>
        <p className="mb-8 text-sm text-ink-muted">Welcome back to your dashboard.</p>

        {searchParams.error && (
          <p className="mb-4 rounded-sm border border-gold/40 bg-gold-dim px-3.5 py-2.5 text-sm text-ink">
            {searchParams.error}
          </p>
        )}

        <form action={signIn} className="space-y-4">
          <div>
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input className="field-input" id="email" name="email" type="email" required />
          </div>
          <div>
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <input className="field-input" id="password" name="password" type="password" required />
          </div>
          <button type="submit" className="btn-primary w-full">
            Log in
          </button>
        </form>

        <p className="mt-6 text-sm text-ink-muted">
          New here?{" "}
          <Link href="/signup" className="text-ink underline underline-offset-2">
            Create a business account
          </Link>
        </p>
      </div>
    </main>
  );
}
