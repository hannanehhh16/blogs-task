"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useRef, type ReactNode } from "react";
import { PostFilters } from "@/components/post-filters";
import { PostList } from "@/components/post-list";
import { useAuthors } from "@/hooks/use-authors";
import {
  applyFilterChanges,
  filterPosts,
  hasActiveFilters,
  parseFilters,
  type FilterChanges,
} from "@/lib/filters";
import type { Post } from "@/types/api";

function updateUrl(changes: FilterChanges, mode: "push" | "replace") {
  const next = applyFilterChanges(window.location.href, changes);
  if (next === null) return;
  if (mode === "push") window.history.pushState(null, "", next);
  else window.history.replaceState(null, "", next);
}

function countLabel(count: number) {
  return `${count} ${count === 1 ? "post" : "posts"}`;
}

export function PostsExplorer({ posts }: { posts: Post[] }) {
  const filters = parseFilters(useSearchParams());
  const isFiltered = hasActiveFilters(filters);
  const visiblePosts = filterPosts(posts, filters);
  const searchRef = useRef<HTMLInputElement>(null);

  // Derived from every post, not the filtered ones, so filtering never refetches authors.
  const authorIds = useMemo(
    () => [...new Set(posts.map((post) => post.userId))].sort((a, b) => a - b),
    [posts],
  );
  const authors = useAuthors(authorIds);

  function clearFilters() {
    updateUrl({ author: null, q: "" }, "push");
    // The clear buttons unmount once filters are gone, so move focus to search.
    if (searchRef.current) {
      searchRef.current.value = "";
      searchRef.current.focus();
    }
  }

  return (
    <>
      <PostFilters
        searchRef={searchRef}
        query={filters.query}
        authorId={filters.authorId}
        authorIds={authorIds}
        usersById={authors.usersById}
        showClear={isFiltered}
        onQueryChange={(q) => updateUrl({ q }, "replace")}
        onAuthorChange={(author) => updateUrl({ author }, "push")}
        onClear={clearFilters}
      />

      <ResultsSection
        summary={
          isFiltered
            ? `${visiblePosts.length} of ${countLabel(posts.length)}`
            : countLabel(posts.length)
        }
      >
        {filters.invalidAuthor !== null && (
          <p className="mt-2 text-sm text-muted">
            “{filters.invalidAuthor}” isn’t a valid author ID, so posts from all
            authors are shown.
          </p>
        )}

        {visiblePosts.length > 0 ? (
          <PostList posts={visiblePosts} authors={authors} />
        ) : (
          <div className="mt-6 border-t border-rule py-12">
            <h3 className="font-serif text-xl font-semibold">
              No posts match these filters
            </h3>
            <p className="mt-2 text-muted">
              Try a different search term or author.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 rounded-md bg-ink px-4 py-2 font-medium text-paper transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Clear filters
            </button>
          </div>
        )}
      </ResultsSection>
    </>
  );
}

// Server-rendered stand-in while the URL-dependent explorer renders on the client:
// the page is statically prerendered, so the query string is unknown on the server.
export function PostsExplorerFallback({ posts }: { posts: Post[] }) {
  return (
    <>
      <div
        aria-hidden="true"
        className="flex flex-col gap-4 sm:flex-row sm:items-end"
      >
        <div className="h-[70px] flex-1" />
        <div className="h-[70px] sm:w-56" />
      </div>
      <ResultsSection summary={countLabel(posts.length)}>
        <PostList posts={posts} />
      </ResultsSection>
    </>
  );
}

function ResultsSection({
  summary,
  children,
}: {
  summary: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby="results-heading" className="mt-8">
      <h2 id="results-heading" className="sr-only">
        Results
      </h2>
      <p role="status" className="text-sm text-muted">
        {summary}
      </p>
      {children}
    </section>
  );
}
