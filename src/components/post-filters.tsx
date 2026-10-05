"use client";

import { useEffect, useRef, type RefObject } from "react";
import type { AuthorsById } from "@/types/api";

// Both controls are uncontrolled: Next applies history updates in a transition,
// so binding `value` to the URL would make typing lag or drop characters. The
// DOM holds only the in-progress draft; the URL stays the applied filter state.
export function PostFilters({
  searchRef,
  query,
  authorId,
  authorIds,
  isUnknownAuthor,
  usersById,
  showClear,
  onQueryChange,
  onAuthorChange,
  onClear,
}: {
  searchRef: RefObject<HTMLInputElement | null>;
  query: string;
  authorId: number | null;
  authorIds: number[];
  isUnknownAuthor: boolean;
  usersById: AuthorsById;
  showClear: boolean;
  onQueryChange: (query: string) => void;
  onAuthorChange: (authorId: number | null) => void;
  onClear: () => void;
}) {
  const selectRef = useRef<HTMLSelectElement>(null);
  const selectValue = authorId === null ? "" : String(authorId);

  // Runs after commit, so an "Unknown author" option already exists when needed.
  useEffect(() => {
    if (selectRef.current) selectRef.current.value = selectValue;
  }, [selectValue]);

  // Back/Forward is the only external change to `q`; typing must never be overwritten.
  useEffect(() => {
    function syncSearchFromUrl() {
      if (searchRef.current) {
        searchRef.current.value =
          new URLSearchParams(window.location.search).get("q") ?? "";
      }
    }
    window.addEventListener("popstate", syncSearchFromUrl);
    return () => window.removeEventListener("popstate", syncSearchFromUrl);
  }, [searchRef]);

  return (
    <form
      role="search"
      aria-label="Filter posts"
      onSubmit={(event) => event.preventDefault()}
      className="flex flex-col gap-4 sm:flex-row sm:items-end"
    >
      <div className="flex flex-1 flex-col gap-1.5">
        <label htmlFor="post-search" className="text-sm font-medium">
          Search posts
        </label>
        <input
          ref={searchRef}
          id="post-search"
          type="search"
          defaultValue={query}
          onChange={(event) => onQueryChange(event.target.value)}
          // Chrome clears type="search" on Escape natively, Firefox doesn't.
          onKeyDown={(event) => {
            if (event.key === "Escape" && event.currentTarget.value !== "") {
              event.preventDefault();
              event.currentTarget.value = "";
              onQueryChange("");
            }
          }}
          placeholder="Search titles and text"
          autoComplete="off"
          className="h-11 rounded-md border border-rule bg-transparent px-3 placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        />
      </div>

      <div className="flex flex-col gap-1.5 sm:w-56">
        <label htmlFor="author-filter" className="text-sm font-medium">
          Author
        </label>
        <select
          ref={selectRef}
          id="author-filter"
          defaultValue={selectValue}
          onChange={(event) =>
            onAuthorChange(
              event.target.value === "" ? null : Number(event.target.value),
            )
          }
          className="h-11 rounded-md border border-rule bg-paper px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          <option value="">All authors</option>
          {isUnknownAuthor && (
            <option value={selectValue}>Unknown author (#{authorId})</option>
          )}
          {authorIds.map((id) => (
            <option key={id} value={id}>
              {usersById[id]?.name ?? `Author #${id}`}
            </option>
          ))}
        </select>
      </div>

      {showClear && (
        <button
          type="button"
          onClick={onClear}
          className="h-11 rounded-md px-3 font-medium underline underline-offset-4 transition-colors hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          Clear filters
        </button>
      )}
    </form>
  );
}
