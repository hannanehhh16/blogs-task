import { describe, expect, test } from "vitest";
import {
  applyFilterChanges,
  filterPosts,
  hasActiveFilters,
  parseFilters,
} from "@/lib/filters";
import posts from "../fixtures/posts.json";

describe("parseFilters", () => {
  test("reads a positive integer author and the query as-is", () => {
    expect(parseFilters(new URLSearchParams("author=2&q=Quiet"))).toEqual({
      authorId: 2,
      query: "Quiet",
      invalidAuthor: null,
    });
  });

  test("uses the first author when the param is duplicated", () => {
    expect(
      parseFilters(new URLSearchParams("author=1&author=2&q=river")),
    ).toEqual({
      authorId: 1,
      query: "river",
      invalidAuthor: null,
    });
  });

  test("treats a non-integer author as invalid and ignores it for filtering", () => {
    expect(parseFilters(new URLSearchParams("author=abc&q=quiet"))).toEqual({
      authorId: null,
      query: "quiet",
      invalidAuthor: "abc",
    });
  });

  test("treats zero, negatives, and decimals as invalid", () => {
    for (const author of ["0", "-1", "1.5", "1e2"]) {
      expect(parseFilters(new URLSearchParams(`author=${author}`))).toEqual({
        authorId: null,
        query: "",
        invalidAuthor: author,
      });
    }
  });

  test("keeps an unknown but well-formed author id so the empty state can use it", () => {
    expect(parseFilters(new URLSearchParams("author=99"))).toEqual({
      authorId: 99,
      query: "",
      invalidAuthor: null,
    });
  });
});

describe("filterPosts", () => {
  test("matches title and body case-insensitively", () => {
    const ids = filterPosts(posts, { authorId: null, query: "quiet" }).map(
      (post) => post.id,
    );
    expect(ids).toEqual([1, 2, 4]);
  });

  test("ANDs search with author", () => {
    const ids = filterPosts(posts, { authorId: 1, query: "quiet" }).map(
      (post) => post.id,
    );
    expect(ids).toEqual([1, 2]);
  });

  test("ignores an invalid author and still applies q", () => {
    const parsed = parseFilters(new URLSearchParams("author=abc&q=quiet"));
    const ids = filterPosts(posts, parsed).map((post) => post.id);
    expect(parsed.authorId).toBeNull();
    expect(ids).toEqual([1, 2, 4]);
  });

  test("returns no posts for an unknown author id", () => {
    expect(filterPosts(posts, { authorId: 99, query: "" })).toEqual([]);
  });

  test("trims whitespace-only queries to mean no search", () => {
    expect(filterPosts(posts, { authorId: null, query: "   " })).toEqual(posts);
    expect(hasActiveFilters(parseFilters(new URLSearchParams("q=   ")))).toBe(
      false,
    );
  });

  test("matches special characters and spaces in q", () => {
    const ids = filterPosts(posts, {
      authorId: null,
      query: "river in the",
    }).map((post) => post.id);
    expect(ids).toEqual([2]);
  });
});

describe("applyFilterChanges", () => {
  const origin = "https://journal.test";

  test("uses replace-style q updates and drops empty/whitespace q", () => {
    expect(applyFilterChanges(`${origin}/posts?q=old`, { q: "new" })).toBe(
      "/posts?q=new",
    );
    expect(applyFilterChanges(`${origin}/posts?q=old`, { q: "" })).toBe(
      "/posts",
    );
    expect(applyFilterChanges(`${origin}/posts?q=old`, { q: "  " })).toBe(
      "/posts",
    );
  });

  test("preserves unrelated params and the hash", () => {
    expect(
      applyFilterChanges(`${origin}/posts?utm=eval&author=1#main-content`, {
        q: "quiet",
      }),
    ).toBe("/posts?utm=eval&author=1&q=quiet#main-content");
  });

  test("returns null when nothing would change", () => {
    expect(
      applyFilterChanges(`${origin}/posts?author=1`, { author: 1 }),
    ).toBeNull();
  });
});
