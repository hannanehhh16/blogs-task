import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Posts",
};

export default function PostsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="max-w-2xl">
        <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
          Posts
        </h1>
        <p className="mt-3 text-lg text-muted">
          Every article from the JSONPlaceholder API, with search and author
          filters.
        </p>
      </header>

      <section aria-labelledby="results-heading" className="mt-10">
        <h2 id="results-heading" className="sr-only">
          Results
        </h2>
      </section>
    </div>
  );
}
