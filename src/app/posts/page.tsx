import type { Metadata } from "next";
import { Suspense } from "react";
import { PostsHeader } from "@/components/posts-header";
import {
  PostsExplorer,
  PostsExplorerFallback,
} from "@/components/posts-explorer";
import { getPosts } from "@/lib/api";

export const metadata: Metadata = {
  title: "Posts",
};

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <PostsHeader />

      <div className="mt-10">
        {/* useSearchParams opts the explorer out of static prerendering; the
            fallback keeps every post in the initial HTML. */}
        <Suspense fallback={<PostsExplorerFallback posts={posts} />}>
          <PostsExplorer posts={posts} />
        </Suspense>
      </div>
    </div>
  );
}
