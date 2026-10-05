"use client";

import { useRef } from "react";
import type { AuthorStatus, Authors } from "@/hooks/use-authors";
import type { Post, User } from "@/types/api";

// Without `authors` (the server-rendered fallback) every byline shows its placeholder.
export function PostList({
  posts,
  authors,
}: {
  posts: Post[];
  authors?: Authors;
}) {
  return (
    <ul className="mt-4 grid gap-x-10 md:grid-cols-2">
      {posts.map((post) => (
        <li key={post.id} className="border-t border-rule py-6">
          <article>
            <h3 className="font-serif text-xl leading-snug font-semibold first-letter:uppercase">
              {post.title}
            </h3>
            <AuthorByline
              author={authors?.usersById[post.userId]}
              status={authors?.getStatus(post.userId) ?? "loading"}
              onRetry={() => authors?.retry(post.userId)}
            />
            <p className="mt-2 leading-relaxed text-muted first-letter:uppercase">
              {post.body}
            </p>
          </article>
        </li>
      ))}
    </ul>
  );
}

function AuthorByline({
  author,
  status,
  onRetry,
}: {
  author: User | undefined;
  status: AuthorStatus;
  onRetry: () => void;
}) {
  const bylineRef = useRef<HTMLParagraphElement>(null);

  // The retry button unmounts once loading starts, so park focus on the byline
  // instead of letting it fall back to <body>.
  function handleRetry() {
    bylineRef.current?.focus();
    onRetry();
  }

  return (
    <p
      ref={bylineRef}
      tabIndex={-1}
      className="mt-1.5 flex min-h-6 items-center gap-2 text-sm outline-none"
    >
      {status === "loaded" && author ? (
        <span>
          By <span className="font-medium">{author.name}</span>
        </span>
      ) : status === "error" ? (
        <>
          <span className="text-muted">Author unavailable.</span>
          <button
            type="button"
            onClick={handleRetry}
            className="rounded px-1 font-medium underline underline-offset-4 transition-colors hover:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Retry
          </button>
        </>
      ) : (
        <>
          <span className="sr-only">Loading author…</span>
          <span
            aria-hidden="true"
            className="h-3.5 w-28 rounded bg-rule motion-safe:animate-pulse"
          />
        </>
      )}
    </p>
  );
}
