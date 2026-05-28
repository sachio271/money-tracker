function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-gray-200 animate-pulse rounded-xl ${className}`} />;
}

export default function AccountsLoading() {
  return (
    <main className="max-w-lg mx-auto px-4 pt-6 space-y-4">
      <Skeleton className="h-7 w-32" />
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
        <Skeleton className="h-14 rounded-2xl border-2 border-dashed bg-gray-100" />
      </div>
    </main>
  );
}
