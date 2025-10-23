import { cn } from "./utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-[#E8E8E8] animate-pulse rounded-xl", className)}
      {...props}
    />
  );
}

/**
 * Skeleton variants for specific mobile components
 * Following Apple HIG for loading states
 */

function SkeletonTaskCard() {
  return (
    <div className="bg-white rounded-2xl p-4 mb-3">
      {/* Header - matches MobileTaskCard title + description */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 space-y-1.5">
          <Skeleton className="h-[15px] w-3/4" />
          <Skeleton className="h-[13px] w-full" />
          <Skeleton className="h-[13px] w-5/6" />
        </div>
        {/* Status dot - exact size match */}
        <Skeleton className="w-2 h-2 rounded-full ml-3 mt-1.5 flex-shrink-0" />
      </div>

      {/* Footer - matches assignee, date, and priority badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* User icon placeholder */}
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-[12px] w-16" />
          </div>
          {/* Calendar icon placeholder */}
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-3.5 h-3.5 rounded" />
            <Skeleton className="h-[12px] w-12" />
          </div>
        </div>
        {/* Priority badge placeholder */}
        <Skeleton className="h-[22px] w-16 rounded-full" />
      </div>
    </div>
  );
}

function SkeletonExpenseCard() {
  return (
    <div className="bg-white rounded-2xl p-4 mb-3">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex items-center gap-2 mt-3">
        <Skeleton className="w-5 h-5 rounded-lg" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

function SkeletonActivityItem() {
  return (
    <div className="flex items-start gap-3 mb-4">
      <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

function SkeletonList({ count = 3, children }: { count?: number; children: React.ReactNode }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{children}</div>
      ))}
    </>
  );
}

export { 
  Skeleton,
  SkeletonTaskCard,
  SkeletonExpenseCard,
  SkeletonStatCard,
  SkeletonActivityItem,
  SkeletonList,
};
