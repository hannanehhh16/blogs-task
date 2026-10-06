const FILTER_BAR =
  "grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_14rem] lg:grid-cols-[minmax(0,1fr)_16rem_auto]";
const POST_GRID =
  "mt-4 grid gap-x-8 md:grid-cols-2 lg:gap-x-12";

export function FilterSkeleton() {
  return (
    <div aria-hidden="true" className={FILTER_BAR}>
      <SkeletonField />
      <SkeletonField />
    </div>
  );
}

export function PostListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul aria-hidden="true" className={POST_GRID}>
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="border-t border-rule py-6 sm:py-7">
          <div className="space-y-3 motion-safe:animate-pulse">
            <div className="h-6 w-4/5 rounded-sm bg-rule" />
            <AuthorSkeleton />
            <div className="space-y-2 pt-1">
              <div className="h-4 rounded-sm bg-rule" />
              <div className="h-4 rounded-sm bg-rule" />
              <div className="h-4 w-2/3 rounded-sm bg-rule" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AuthorSkeleton() {
  return (
    <span
      aria-hidden="true"
      className="flex min-h-6 items-center gap-2 text-sm text-muted"
    >
      By
      <span className="inline-block h-3.5 w-28 rounded-sm bg-rule motion-safe:animate-pulse" />
    </span>
  );
}

function SkeletonField() {
  return (
    <div className="flex flex-col gap-1.5 motion-safe:animate-pulse">
      <div className="h-4 w-24 rounded-sm bg-rule" />
      <div className="h-11 rounded-md bg-rule" />
    </div>
  );
}

export { FILTER_BAR, POST_GRID };
