import { createBusiness } from "@/lib/actions";

export default function OnboardingPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <span className="mb-2 block text-xs uppercase tracking-widest text-gold">Step 1 of 1</span>
        <h1 className="mb-1 text-2xl">Tell us about your business</h1>
        <p className="mb-8 text-sm text-ink-muted">
          This becomes the foundation your AI assistant is trained on. You can add products, prices,
          and FAQs right after.
        </p>

        {searchParams.error && (
          <p className="mb-4 rounded-sm border border-gold/40 bg-gold-dim px-3.5 py-2.5 text-sm text-ink">
            {searchParams.error}
          </p>
        )}

        <form action={createBusiness} className="space-y-4">
          <div>
            <label className="field-label" htmlFor="name">
              Business name
            </label>
            <input className="field-input" id="name" name="name" required />
          </div>
          <div>
            <label className="field-label" htmlFor="industry">
              What do you sell or offer?
            </label>
            <input
              className="field-input"
              id="industry"
              name="industry"
              placeholder="e.g. Women's fashion, event planning, skincare"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="description">
              A few lines about your business
            </label>
            <textarea className="field-input" id="description" name="description" rows={3} />
          </div>
          <button type="submit" className="btn-primary w-full">
            Create my AI assistant
          </button>
        </form>
      </div>
    </main>
  );
}
