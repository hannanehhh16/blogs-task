import type { Post } from "@/types/api";

// Overridable so local checks and tests can point the server at a fixture or unreachable host.
const API_BASE_URL =
  process.env.API_BASE_URL ?? "https://jsonplaceholder.typicode.com";

// JSONPlaceholder is a read-only demo API whose posts effectively never change,
// so a five-minute ISR window serves cached HTML instantly, keeps request volume
// to a shared public service low, and still picks up any change within minutes.
// A failed background revalidation keeps serving the last good page.
const POSTS_REVALIDATE_SECONDS = 300;

export async function getPosts(): Promise<Post[]> {
  const response = await fetch(`${API_BASE_URL}/posts`, {
    next: { revalidate: POSTS_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch posts: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}
