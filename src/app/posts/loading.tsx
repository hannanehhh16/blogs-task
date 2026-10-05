import { PostsHeader } from "@/components/posts-header";

const SKELETON_COUNT = 6;

export default function PostsLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <PostsHeader />

      <div role="status" className="mt-10">
        <span className="sr-only">Loading posts…</span>

        <ul aria-hidden="true" className="grid gap-x-10 md:grid-cols-2">
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <li
              key={i}
              className="space-y-3 border-t border-rule py-6 motion-safe:animate-pulse"
            >
              <div className="h-6 w-4/5 rounded bg-rule" />
              <div className="space-y-2 pt-1">
                <div className="h-4 rounded bg-rule" />
                <div className="h-4 rounded bg-rule" />
                <div className="h-4 w-2/3 rounded bg-rule" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
