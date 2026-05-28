function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-gray-200 animate-pulse rounded-xl ${className}`} />;
}

export default function ReportsLoading() {
  return (
    <main className="max-w-lg mx-auto px-4 pt-6 space-y-4">
      <Skeleton className="h-10 rounded-2xl" />
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-48 w-48 rounded-full mx-auto" />
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Skeleton className="h-2.5 w-2.5 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
