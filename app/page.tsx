import Link from "next/link";

const FEATURES = [
  {
    title: "Trained on your business only",
    body: "Your products, prices, FAQs, and policies \u2014 nothing invented, nothing borrowed from anyone else.",
  },
  {
    title: "Always accurate on price",
    body: "Update a price once in your dashboard and your AI knows it instantly, everywhere it talks to customers.",
  },
  {
    title: "Live conversation inbox",
    body: "See every conversation as it happens, and step in yourself whenever the AI hands one off to you.",
  },
  {
    title: "Pay for what you use",
    body: "A small monthly base, then only pay more as your AI actually handles more conversations.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Tell it about your business",
    body: "Add your products, prices, and answers to the questions customers always ask.",
  },
  {
    n: "02",
    title: "Share your AI's link",
    body: "Send it to customers directly, or embed it on your own website.",
  },
  {
    n: "03",
    title: "Watch it work",
    body: "Every conversation lands in your dashboard, live, with usage tracked automatically.",
  },
];

export default function LandingPage() {
  return (
    <main>
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="font-display text-lg font-medium text-ink">MKJ Business AI</span>
        <nav className="flex items-center gap-3">
          <Link href="/login" className="px-3 py-2 text-sm text-ink-muted hover:text-ink">
            Log in
          </Link>
          <Link href="/signup" className="btn-primary">
            Get started
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-20 pt-16 text-center">
        <span className="mb-5 inline-block rounded-full border border-line bg-white px-3 py-1 font-mono text-xs text-ink-muted">
          Built for businesses, not developers
        </span>
        <h1 className="mb-5 text-5xl leading-[1.1]">
          Give your business its own AI assistant.
        </h1>
        <p className="mx-auto mb-9 max-w-xl text-lg text-ink-muted">
          Add your products, prices, and FAQs. Your customers get instant, accurate answers.
          You get every conversation in one place, and only pay for what's used.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/signup" className="btn-primary px-6 py-3 text-base">
            Create your AI assistant
          </Link>
          <Link href="/login" className="btn-secondary px-6 py-3 text-base">
            Log in
          </Link>
        </div>
      </section>

      <section className="border-y border-line bg-white py-16">
        <div className="mx-auto max-w-5xl px-6">
          <span className="mb-2 block text-center text-xs uppercase tracking-widest text-gold">
            How it works
          </span>
          <h2 className="mb-12 text-center text-3xl">Live in three steps</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.n}>
                <span className="mb-3 block font-mono text-sm text-gold">{step.n}</span>
                <h3 className="mb-2 text-lg">{step.title}</h3>
                <p className="text-sm text-ink-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid gap-8 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6">
              <h3 className="mb-2 text-lg">{f.title}</h3>
              <p className="text-sm text-ink-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-ink py-16 text-center">
        <div className="mx-auto max-w-xl px-6">
          <h2 className="mb-4 text-3xl text-paper">Ready to give your business its AI assistant?</h2>
          <p className="mb-8 text-sm text-paper/70">No card required to start.</p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-md bg-gold px-6 py-3 text-base font-medium text-ink hover:bg-gold/90"
          >
            Create your AI assistant
          </Link>
        </div>
      </section>

      <footer className="mx-auto max-w-5xl px-6 py-8 text-center text-xs text-ink-muted">
        MKJ Business AI
      </footer>
    </main>
  );
}
