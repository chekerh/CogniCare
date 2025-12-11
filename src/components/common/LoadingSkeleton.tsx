export function PostSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-2xl shadow-md p-6 animate-pulse">
      <div className="flex items-start space-x-4 space-x-reverse mb-4">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 pooh:bg-pooh-burlywood rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 pooh:bg-pooh-burlywood rounded w-1/4 mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 pooh:bg-pooh-burlywood rounded w-1/6" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 pooh:bg-pooh-burlywood rounded" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 pooh:bg-pooh-burlywood rounded w-5/6" />
      </div>
      <div className="flex space-x-4 space-x-reverse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 pooh:bg-pooh-burlywood rounded w-20" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 pooh:bg-pooh-burlywood rounded w-20" />
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-2xl shadow-md p-6 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 pooh:bg-pooh-burlywood rounded w-3/4 mb-4" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 pooh:bg-pooh-burlywood rounded" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 pooh:bg-pooh-burlywood rounded w-5/6" />
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 pooh:bg-pooh-surface rounded-2xl shadow-md p-4 animate-pulse">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 pooh:bg-pooh-burlywood rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 pooh:bg-pooh-burlywood rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 pooh:bg-pooh-burlywood rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function LoadingSkeleton() {
  return <CardSkeleton />;
}

