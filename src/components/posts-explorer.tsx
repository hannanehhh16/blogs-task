"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useRef, type ReactNode } from "react";
import { PostFilters } from "@/components/post-filters";
import { PostList } from "@/components/post-list";
import { FilterSkeleton } from "@/components/skeletons";
import { useAuthors } from "@/hooks/use-authors";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
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
  const unknownAuthorId =
    filters.authorId !== null && !authorIds.includes(filters.authorId)
      ? filters.authorId
      : null;

  const loadingAuthorCount = authorIds.filter(
    (id) => authors.getStatus(id) === "loading",
  ).length;
  const failedAuthorCount = authorIds.filter(
    (id) => authors.getStatus(id) === "error",
  ).length;

  const summary = isFiltered
    ? `${visiblePosts.length} of ${countLabel(posts.length)}`
    : countLabel(posts.length);

  function clearFilters() {
    updateUrl({ author: null, q: "" }, "push");
    // The clear buttons unmount once filters are gone, so move focus to search.
    if (searchRef.current) {
      searchRef.current.value = "";
      searchRef.current.focus();
    }
  }

  const authorDescribedBy = [
    filters.invalidAuthor !== null ? "invalid-author-note" : null,
    unknownAuthorId !== null ? "unknown-author-note" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <PostFilters
        searchRef={searchRef}
        query={filters.query}
        authorId={filters.authorId}
        authorIds={authorIds}
        isUnknownAuthor={unknownAuthorId !== null}
        usersById={authors.usersById}
        authorsBusy={loadingAuthorCount > 0}
        describedBy={authorDescribedBy || undefined}
        showClear={isFiltered}
        onQueryChange={(q) => updateUrl({ q }, "replace")}
        onAuthorChange={(author) => updateUrl({ author }, "push")}
        onClear={clearFilters}
      />

      <ResultsSection
        summary={summary}
        authorAnnouncement={
          loadingAuthorCount > 0
            ? "Loading authors"
            : failedAuthorCount > 0
              ? `${failedAuthorCount} ${failedAuthorCount === 1 ? "author" : "authors"} could not be loaded. Retry is available on those posts.`
              : ""
        }
      >
        {filters.invalidAuthor !== null && (
          <aside
            id="invalid-author-note"
            className="mt-3 border-l-2 border-ink/30 pl-3 text-sm leading-relaxed text-muted"
          >
            “{filters.invalidAuthor}” isn’t a valid author ID, so posts from all
            authors are shown.
          </aside>
        )}

        {visiblePosts.length > 0 ? (
          <PostList posts={visiblePosts} authors={authors} />
        ) : (
          <EmptyResults
            unknownAuthorId={unknownAuthorId}
            query={filters.query}
            onClear={clearFilters}
          />
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
      <FilterSkeleton />
      <ResultsSection summary={countLabel(posts.length)}>
        <PostList posts={posts} />
      </ResultsSection>
    </>
  );
}

function EmptyResults({
  unknownAuthorId,
  query,
  onClear,
}: {
  unknownAuthorId: number | null;
  query: string;
  onClear: () => void;
}) {
  const heading =
    unknownAuthorId !== null
      ? `No author with ID ${unknownAuthorId}`
      : "No posts match these filters";
  const body =
    unknownAuthorId !== null
      ? "None of the posts belong to this author. Choose another author or clear the filters."
      : query.trim()
        ? "Try a different search term or author."
        : "Try a different author, or clear the filters to see every post.";

  return (
    <div className="mt-6 border-t border-rule py-12">
      <h3
        id={unknownAuthorId !== null ? "unknown-author-note" : undefined}
        className="font-serif text-xl font-semibold text-balance"
      >
        {heading}
      </h3>
      <p className="mt-2 max-w-md leading-relaxed text-muted">{body}</p>
      <button type="button" onClick={onClear} className="action-primary mt-6">
        Clear filters
      </button>
    </div>
  );
}

function ResultsSection({
  summary,
  authorAnnouncement = "",
  children,
}: {
  summary: string;
  authorAnnouncement?: string;
  children: ReactNode;
}) {
  const announcedSummary = useDebouncedValue(summary, 400);
  const announcedAuthors = useDebouncedValue(authorAnnouncement, 400);

  return (
    <section
      id="post-results"
      aria-labelledby="results-heading"
      className="mt-8"
    >
      <h2 id="results-heading" className="sr-only">
        Results
      </h2>
      <p className="text-sm text-muted">{summary}</p>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcedSummary}
        {announcedAuthors ? `. ${announcedAuthors}` : ""}
      </p>
      {children}
    </section>
  );
}
