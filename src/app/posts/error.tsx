"use client";

import { useRouter } from "next/navigation";
import { startTransition, useEffect } from "react";
import { PageShell } from "@/components/page-shell";
import { PostsHeader } from "@/components/posts-header";

export default function PostsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  // reset() alone re-renders the boundary with the same failed server payload;
  // refreshing first re-runs the Server Component fetch.
  function handleRetry() {
    startTransition(() => {
      router.refresh();
      reset();
    });
  }

  return (
    <PageShell>
      <PostsHeader />

      <section
        role="alert"
        aria-labelledby="posts-error-heading"
        className="mt-10 max-w-xl border-t border-rule pt-8"
      >
        <h2
          id="posts-error-heading"
          className="font-serif text-2xl font-semibold text-balance"
        >
          We couldn’t load the posts
        </h2>
        <p className="mt-2 leading-relaxed text-muted">
          The article service didn’t respond as expected. Check your connection
          and try again.
        </p>
        <button type="button" onClick={handleRetry} className="action-primary mt-6">
          Try again
        </button>
      </section>
    </PageShell>
  );
}
