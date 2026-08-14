export default function KnowledgeLoading() {
  return (
    <div className="max-w-3xl animate-pulse">
      <div className="mb-2 h-7 w-40 rounded bg-line" />
      <div className="mb-8 h-4 w-72 rounded bg-line" />
      <div className="card mb-8 h-64 p-6" />
      <div className="space-y-3">
        <div className="card h-20 p-4" />
        <div className="card h-20 p-4" />
        <div className="card h-20 p-4" />
      </div>
    </div>
  );
}
