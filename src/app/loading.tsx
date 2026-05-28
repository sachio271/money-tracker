function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-gray-200 animate-pulse rounded-xl ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <main className="max-w-lg mx-auto px-4 pt-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-9 w-20 rounded-full" />
      </div>

      <Skeleton className="h-36 rounded-3xl" />

      <div className="space-y-2">
        <Skeleton className="h-5 w-24" />
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>

      <div className="space-y-2">
        <Skeleton className="h-5 w-20" />
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-2xl" />
        ))}
      </div>
    </main>
  );
}
