import { expect, test } from "@playwright/test";
import {
  authorSelect,
  stubAuthors,
  waitForAuthors,
  waitForExplorer,
} from "./helpers";

test.describe("client authors", () => {
  test("fetches each unique author once and does not refetch on filter changes", async ({
    page,
  }) => {
    const requested = await stubAuthors(page);
    await page.goto("/posts");
    await waitForExplorer(page);
    await waitForAuthors(page);
    await expect(page.locator("article").getByText("Ben Fixture").first()).toBeVisible();

    expect([...new Set(requested)].sort()).toEqual([1, 2]);
    expect(requested.filter((id) => id === 1)).toHaveLength(1);
    expect(requested.filter((id) => id === 2)).toHaveLength(1);

    const afterLoad = requested.length;
    await authorSelect(page).selectOption("1");
    await expect(page).toHaveURL(/author=1/);
    await expect(page.locator("article").getByText("Ada Fixture").first()).toBeVisible();
    expect(requested).toHaveLength(afterLoad);
  });

  test("keeps posts readable when one author fails, and retries only that id", async ({
    page,
  }) => {
    const requested = await stubAuthors(page, { fail: [2] });
    await page.goto("/posts");
    await waitForExplorer(page);
    await waitForAuthors(page);

    await expect(page.locator("article").getByText("Ada Fixture").first()).toBeVisible();
    await expect(page.getByText("Author unavailable.")).toHaveCount(2);
    await expect(
      page.getByRole("heading", { name: /Gamma Piece/i }),
    ).toBeVisible();
    await expect(
      page.getByText("Something else entirely about stone"),
    ).toBeVisible();

    const failedCount = requested.filter((id) => id === 2).length;
    expect(failedCount).toBe(1);

    await page.unrouteAll({ behavior: "ignoreErrors" });
    const retried = await stubAuthors(page);
    const retry = page.getByRole("button", { name: "Retry loading this author" }).first();
    await retry.focus();
    await expect(retry).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(page.locator("article").getByText("Ben Fixture").first()).toBeVisible();
    await expect(page.getByText("Author unavailable.")).toHaveCount(0);
    expect(retried.filter((id) => id === 2)).toHaveLength(1);
    expect(retried.filter((id) => id === 1)).toHaveLength(0);

    const active = await page.evaluate(() => ({
      tag: document.activeElement?.tagName,
      text: document.activeElement?.textContent?.slice(0, 40),
    }));
    expect(active.tag).toBe("P");
    expect(active.text).toMatch(/Ben Fixture/);
  });

  test("shows an author loading placeholder without hiding post copy", async ({
    page,
  }) => {
    await page.route(/https:\/\/jsonplaceholder\.typicode\.com\/users\/\d+/, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const id = Number(new URL(route.request().url()).pathname.split("/").pop());
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id,
          name: id === 1 ? "Ada Fixture" : "Ben Fixture",
          username: "x",
          email: "x@example.test",
          website: "example.test",
          company: { name: "Fixture Labs" },
        }),
      });
    });

    await page.goto("/posts");
    await waitForExplorer(page);
    await expect(
      page.getByRole("heading", { name: /Quiet gardens/i }),
    ).toBeVisible();
    await expect(
      page.getByText("A calm morning walk through the hedges"),
    ).toBeVisible();
    await waitForAuthors(page);
  });
});
