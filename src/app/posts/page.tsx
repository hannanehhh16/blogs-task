import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShell } from "@/components/page-shell";
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
    <PageShell>
      <PostsHeader />

      <div className="mt-10">
        {/* useSearchParams opts the explorer out of static prerendering; the
            fallback keeps every post in the initial HTML. */}
        <Suspense fallback={<PostsExplorerFallback posts={posts} />}>
          <PostsExplorer posts={posts} />
        </Suspense>
      </div>
    </PageShell>
  );
}
