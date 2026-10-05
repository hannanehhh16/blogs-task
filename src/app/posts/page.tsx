import type { Metadata } from "next";
import { PostList } from "@/components/post-list";
import { PostsHeader } from "@/components/posts-header";
import { getPosts } from "@/lib/api";

export const metadata: Metadata = {
  title: "Posts",
};

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <PostsHeader />

      <section aria-labelledby="results-heading" className="mt-10">
        <h2 id="results-heading" className="sr-only">
          Results
        </h2>

        <PostList posts={posts} />
      </section>
    </div>
  );
}
