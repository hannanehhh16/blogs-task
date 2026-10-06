"use client";

import { useRef } from "react";
import { AuthorSkeleton, POST_GRID } from "@/components/skeletons";
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
    <ul className={POST_GRID}>
      {posts.map((post) => (
        <li key={post.id} className="border-t border-rule">
          <article className="-mx-2 rounded-md px-2 py-6 motion-safe:transition-colors motion-safe:duration-150 sm:py-7 hover:bg-rule/35">
            <h3 className="font-serif text-xl leading-snug font-semibold text-balance first-letter:uppercase">
              {post.title}
            </h3>
            <AuthorByline
              author={authors?.usersById[post.userId]}
              status={authors?.getStatus(post.userId) ?? "loading"}
              onRetry={() => authors?.retry(post.userId)}
            />
            <p className="mt-2 max-w-prose leading-relaxed text-pretty text-muted first-letter:uppercase">
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
            aria-label="Retry loading this author"
            className="action-quiet h-auto min-h-11 px-1 py-1"
          >
            Retry
          </button>
        </>
      ) : (
        <AuthorSkeleton />
      )}
    </p>
  );
}
