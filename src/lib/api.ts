import type { Post, User } from "@/types/api";

const PUBLIC_API_URL = "https://jsonplaceholder.typicode.com";

// Server-only override so local checks and tests can point the server at a fixture
// or unreachable host. Not NEXT_PUBLIC_, so browser requests always use PUBLIC_API_URL.
const SERVER_API_URL = process.env.API_BASE_URL ?? PUBLIC_API_URL;

// JSONPlaceholder is a read-only demo API whose posts effectively never change,
// so a five-minute ISR window serves cached HTML instantly, keeps request volume
// to a shared public service low, and still picks up any change within minutes.
// A failed background revalidation keeps serving the last good page.
const POSTS_REVALIDATE_SECONDS = 300;

export async function getPosts(): Promise<Post[]> {
  const response = await fetch(`${SERVER_API_URL}/posts`, {
    next: { revalidate: POSTS_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch posts: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

export async function fetchUser(
  id: number,
  signal?: AbortSignal,
): Promise<User> {
  const response = await fetch(`${PUBLIC_API_URL}/users/${id}`, { signal });

  if (!response.ok) {
    throw new Error(`Failed to fetch user ${id}: ${response.status}`);
  }

  return response.json();
}
