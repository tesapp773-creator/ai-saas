import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6">
      <span className="mb-4 text-xs uppercase tracking-widest text-gold">MKJ Business AI</span>
      <h1 className="mb-4 text-4xl leading-tight">
        Give your business its own AI assistant.
      </h1>
      <p className="mb-8 max-w-lg text-ink-muted">
        Add your products, prices, and FAQs. Your customers get instant, accurate answers.
        You get every conversation in one place, and only pay for what's used.
      </p>
      <div className="flex gap-3">
        <Link href="/signup" className="btn-primary">
          Create your AI assistant
        </Link>
        <Link href="/login" className="btn-secondary">
          Log in
        </Link>
      </div>
    </main>
  );
}
