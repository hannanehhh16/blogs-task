"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchUser } from "@/lib/api";
import type { AuthorsById } from "@/types/api";

export type AuthorStatus = "loading" | "loaded" | "error";

// Fetches each user id once, keeps successes when others fail, and lets callers
// retry a single failed id. Every request has its own AbortController: aborted
// requests (unmount, Strict Mode re-run, superseded retry) never touch state.
export function useAuthors(userIds: readonly number[]) {
  const [usersById, setUsersById] = useState<AuthorsById>({});
  const [failedIds, setFailedIds] = useState<ReadonlySet<number>>(
    () => new Set(),
  );
  const controllers = useRef(new Map<number, AbortController>());
  const loadedIds = useRef(new Set<number>());

  const load = useCallback((id: number) => {
    controllers.current.get(id)?.abort();
    const controller = new AbortController();
    controllers.current.set(id, controller);

    setFailedIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    fetchUser(id, controller.signal)
      .then((user) => {
        if (controller.signal.aborted) return;
        loadedIds.current.add(id);
        setUsersById((prev) => ({ ...prev, [id]: user }));
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setFailedIds((prev) => new Set(prev).add(id));
      })
      .finally(() => {
        if (controllers.current.get(id) === controller) {
          controllers.current.delete(id);
        }
      });
  }, []);

  useEffect(() => {
    const active = controllers.current;
    for (const id of userIds) {
      if (!loadedIds.current.has(id)) load(id);
    }
    return () => {
      for (const controller of active.values()) controller.abort();
      active.clear();
    };
  }, [userIds, load]);

  const getStatus = (id: number): AuthorStatus =>
    usersById[id] ? "loaded" : failedIds.has(id) ? "error" : "loading";

  return { usersById, getStatus, retry: load };
}
