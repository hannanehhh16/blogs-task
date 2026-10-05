"use client";

import { useRouter } from "next/navigation";
import { startTransition, useEffect } from "react";
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
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <PostsHeader />

      <section
        role="alert"
        aria-labelledby="posts-error-heading"
        className="mt-10 max-w-xl border-t border-rule pt-8"
      >
        <h2
          id="posts-error-heading"
          className="font-serif text-2xl font-semibold"
        >
          We couldn’t load the posts
        </h2>
        <p className="mt-2 text-muted">
          The article service didn’t respond as expected. Check your connection
          and try again.
        </p>
        <button
          type="button"
          onClick={handleRetry}
          className="mt-6 rounded-md bg-ink px-4 py-2 font-medium text-paper transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          Try again
        </button>
      </section>
    </div>
  );
}
