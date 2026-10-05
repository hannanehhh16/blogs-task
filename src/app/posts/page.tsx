import type { Metadata } from "next";
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

        <ul className="grid gap-x-10 md:grid-cols-2">
          {posts.map((post) => (
            <li key={post.id} className="border-t border-rule py-6">
              <article>
                <h3 className="font-serif text-xl leading-snug font-semibold first-letter:uppercase">
                  {post.title}
                </h3>
                <p className="mt-2 leading-relaxed text-muted first-letter:uppercase">
                  {post.body}
                </p>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
