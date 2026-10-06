"use client";

import { useEffect, useRef, type RefObject } from "react";
import { FILTER_BAR } from "@/components/skeletons";
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
  authorsBusy,
  describedBy,
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
  authorsBusy: boolean;
  describedBy?: string;
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
      className={FILTER_BAR}
    >
      <div className="flex min-w-0 flex-col gap-1.5">
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
          enterKeyHint="search"
          aria-controls="post-results"
          className="field"
        />
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        <label htmlFor="author-filter" className="text-sm font-medium">
          Author
        </label>
        <select
          ref={selectRef}
          id="author-filter"
          defaultValue={selectValue}
          aria-busy={authorsBusy || undefined}
          aria-invalid={isUnknownAuthor || undefined}
          aria-describedby={describedBy}
          onChange={(event) =>
            onAuthorChange(
              event.target.value === "" ? null : Number(event.target.value),
            )
          }
          className="field"
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
          className="action-quiet w-full sm:w-auto sm:justify-self-start lg:mb-0 lg:self-end"
        >
          Clear filters
        </button>
      )}
    </form>
  );
}
