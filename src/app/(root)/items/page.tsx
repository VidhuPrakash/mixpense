import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ItemsContent } from "@/components/item-content";

function ItemsLoading() {
  return (
    <div className="p-6 space-y-6 min-h-[60vh]">
      <div className="flex justify-end">
        <Skeleton className="h-10 w-20" />
      </div>
      <div className="max-w-3xl mx-auto">
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
      <div className="max-w-3xl mx-auto grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-32 w-full sm:col-span-2" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function ItemsPage() {
  return (
    <Suspense fallback={<ItemsLoading />}>
      <ItemsContent />
    </Suspense>
  );
}
