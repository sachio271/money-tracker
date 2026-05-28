function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-gray-200 animate-pulse rounded-xl ${className}`} />;
}

export default function BudgetsLoading() {
  return (
    <main className="max-w-lg mx-auto px-4 pt-6 space-y-4">
      <Skeleton className="h-7 w-28" />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    </main>
  );
}
