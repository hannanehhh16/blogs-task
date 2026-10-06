import { PageShell } from "@/components/page-shell";
import { PostsHeader } from "@/components/posts-header";
import { FilterSkeleton, PostListSkeleton } from "@/components/skeletons";

export default function PostsLoading() {
  return (
    <PageShell>
      <PostsHeader />

      <div role="status" aria-live="polite" className="mt-10">
        <span className="sr-only">Loading posts…</span>
        <FilterSkeleton />
        <div className="mt-8">
          <div aria-hidden="true" className="mb-2 h-4 w-24 rounded-sm bg-rule" />
          <PostListSkeleton count={6} />
        </div>
      </div>
    </PageShell>
  );
}
