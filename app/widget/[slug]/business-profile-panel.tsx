"use client";

type Link = { id: string; label: string; url: string; description: string | null };

export default function BusinessProfilePanel({
  businessName,
  avatarUrl,
  themeColor,
  description,
  location,
  workingHours,
  links,
  onClose,
}: {
  businessName: string;
  avatarUrl?: string | null;
  themeColor: string;
  description?: string | null;
  location?: string | null;
  workingHours?: string | null;
  links: Link[];
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col overflow-y-auto bg-white">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <button onClick={onClose} className="text-ink-muted hover:text-ink" aria-label="Back">
          ←
        </button>
        <span className="text-sm font-medium text-ink">Profile</span>
      </div>

      <div className="flex flex-col items-center px-6 py-8">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="mb-4 h-24 w-24 rounded-full object-cover" />
        ) : (
          <div
            className="mb-4 flex h-24 w-24 items-center justify-center rounded-full text-3xl font-medium text-white"
            style={{ backgroundColor: themeColor }}
          >
            {businessName.charAt(0).toUpperCase()}
          </div>
        )}
        <h2 className="mb-1 text-xl text-ink">{businessName}</h2>
        {location && <p className="text-sm text-ink-muted">{location}</p>}
      </div>

      <div className="space-y-5 px-6 pb-8">
        {description && (
          <div>
            <span className="mb-1 block text-xs uppercase tracking-widest text-ink-muted">About</span>
            <p className="text-sm text-ink">{description}</p>
          </div>
        )}

        {workingHours && (
          <div>
            <span className="mb-1 block text-xs uppercase tracking-widest text-ink-muted">Active hours</span>
            <p className="text-sm text-ink">{workingHours}</p>
          </div>
        )}

        {links.length > 0 && (
          <div>
            <span className="mb-2 block text-xs uppercase tracking-widest text-ink-muted">Links</span>
            <ul className="space-y-2">
              {links.map((l) => (
                <li key={l.id}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-sm border border-line px-3.5 py-2.5 text-sm text-ink hover:border-ink/30"
                  >
                    <span className="font-medium">{l.label}</span>
                    {l.description && <span className="block text-xs text-ink-muted">{l.description}</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
