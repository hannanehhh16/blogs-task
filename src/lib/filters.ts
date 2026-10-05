import type { Post } from "@/types/api";

export type Filters = {
  authorId: number | null;
  query: string;
  // A present `author` value that isn't a positive integer. It is ignored when
  // filtering, so a bad link degrades to "all authors" instead of zero results.
  invalidAuthor: string | null;
};

export function parseFilters(params: Pick<URLSearchParams, "get">): Filters {
  const query = params.get("q") ?? "";
  const rawAuthor = params.get("author")?.trim() ?? "";

  if (rawAuthor === "") return { authorId: null, query, invalidAuthor: null };

  const id = Number(rawAuthor);
  return /^\d+$/.test(rawAuthor) && Number.isSafeInteger(id) && id > 0
    ? { authorId: id, query, invalidAuthor: null }
    : { authorId: null, query, invalidAuthor: rawAuthor };
}

export function hasActiveFilters(filters: Filters): boolean {
  return (
    filters.authorId !== null ||
    filters.invalidAuthor !== null ||
    filters.query.trim() !== ""
  );
}

export function filterPosts(
  posts: Post[],
  { authorId, query }: Pick<Filters, "authorId" | "query">,
): Post[] {
  const needle = query.trim().toLowerCase();
  if (authorId === null && needle === "") return posts;

  return posts.filter(
    (post) =>
      (authorId === null || post.userId === authorId) &&
      (needle === "" ||
        post.title.toLowerCase().includes(needle) ||
        post.body.toLowerCase().includes(needle)),
  );
}

export type FilterChanges = { author?: number | null; q?: string };

// Returns the relative href with the changes applied, keeping unrelated params
// and the hash, or null when the query string would not change.
export function applyFilterChanges(
  href: string,
  changes: FilterChanges,
): string | null {
  const url = new URL(href);
  const params = url.searchParams;
  const before = params.toString();

  if (changes.author !== undefined) {
    if (changes.author === null) params.delete("author");
    else params.set("author", String(changes.author));
  }
  if (changes.q !== undefined) {
    if (changes.q.trim() === "") params.delete("q");
    else params.set("q", changes.q);
  }

  if (params.toString() === before) return null;
  return `${url.pathname}${url.search}${url.hash}`;
}
