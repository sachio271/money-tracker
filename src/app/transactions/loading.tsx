function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-gray-200 animate-pulse rounded-xl ${className}`} />;
}

export default function TransactionsLoading() {
  return (
    <main className="max-w-lg mx-auto px-4 pt-6 space-y-4">
      <Skeleton className="h-10 rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-2xl" />
        ))}
      </div>
    </main>
  );
}
