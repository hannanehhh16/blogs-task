import { expect, type Page } from "@playwright/test";
import users from "../fixtures/users.json";

export const PUBLIC_USER_URL = /https:\/\/jsonplaceholder\.typicode\.com\/users\/(\d+)/;

export async function stubAuthors(
  page: Page,
  options: { fail?: number[] } = {},
) {
  const requested: number[] = [];

  await page.route(PUBLIC_USER_URL, async (route) => {
    const id = Number(new URL(route.request().url()).pathname.split("/").pop());
    requested.push(id);

    if (options.fail?.includes(id)) {
      await route.fulfill({
        status: 500,
        contentType: "text/plain",
        body: "author failed",
      });
      return;
    }

    const user = users[String(id) as keyof typeof users];
    if (!user) {
      await route.fulfill({ status: 404, body: "missing" });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(user),
    });
  });

  return requested;
}

export async function waitForExplorer(page: Page) {
  await expect(page.getByRole("search", { name: "Filter posts" })).toBeVisible();
}

export async function waitForAuthors(page: Page) {
  await expect(page.locator("article").getByText("Ada Fixture").first()).toBeVisible();
}

export function searchBox(page: Page) {
  return page.locator("#post-search");
}

export function authorSelect(page: Page) {
  return page.locator("#author-filter");
}

export function resultSummary(page: Page) {
  return page.locator("#post-results > p").first();
}

export function postHeadings(page: Page) {
  return page.locator("article h3");
}
