export default function ConversationsLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] max-w-5xl animate-pulse gap-6">
      <div className="w-72 shrink-0">
        <div className="mb-4 h-7 w-40 rounded bg-line" />
        <div className="space-y-2">
          <div className="h-16 rounded-md bg-line" />
          <div className="h-16 rounded-md bg-line" />
          <div className="h-16 rounded-md bg-line" />
        </div>
      </div>
      <div className="flex-1 rounded-lg bg-line" />
    </div>
  );
}
