import { expect, test } from "@playwright/test";
import {
  authorSelect,
  postHeadings,
  resultSummary,
  searchBox,
  stubAuthors,
  waitForExplorer,
} from "./helpers";

test.describe("URL filters", () => {
  test.beforeEach(async ({ page }) => {
    await stubAuthors(page);
  });

  test("opens a filtered link and keeps it after refresh", async ({ page }) => {
    await page.goto("/posts?author=1&q=quiet");
    await waitForExplorer(page);

    await expect(resultSummary(page)).toHaveText("2 of 4 posts");
    await expect(postHeadings(page)).toHaveCount(2);
    await expect(searchBox(page)).toHaveValue("quiet");
    await expect(authorSelect(page)).toHaveValue("1");

    await page.reload();
    await waitForExplorer(page);
    await expect(page).toHaveURL(/author=1/);
    await expect(page).toHaveURL(/q=quiet/);
    await expect(resultSummary(page)).toHaveText("2 of 4 posts");
    await expect(searchBox(page)).toHaveValue("quiet");
    await expect(authorSelect(page)).toHaveValue("1");
  });

  test("uses the first duplicate author param", async ({ page }) => {
    await page.goto("/posts?author=1&author=2");
    await waitForExplorer(page);
    await expect(authorSelect(page)).toHaveValue("1");
    await expect(resultSummary(page)).toHaveText("2 of 4 posts");
    await expect(page.getByRole("heading", { name: /Gamma Piece/i })).toHaveCount(
      0,
    );
  });

  test("shows an empty state for an unknown author", async ({ page }) => {
    await page.goto("/posts?author=99");
    await waitForExplorer(page);
    await expect(
      page.getByRole("heading", { name: "No author with ID 99" }),
    ).toBeVisible();
    await expect(authorSelect(page)).toHaveValue("99");
    await expect(page.getByRole("article")).toHaveCount(0);
  });

  test("ignores a malformed author and still applies q", async ({ page }) => {
    await page.goto("/posts?author=abc&q=quiet");
    await waitForExplorer(page);
    await expect(page.locator("#invalid-author-note")).toContainText("abc");
    await expect(authorSelect(page)).toHaveValue("");
    await expect(resultSummary(page)).toHaveText("3 of 4 posts");
    await expect(postHeadings(page)).toHaveCount(3);
  });

  test("treats empty, whitespace, and special-character queries as specified", async ({
    page,
  }) => {
    await page.goto("/posts?q=");
    await waitForExplorer(page);
    await expect(resultSummary(page)).toHaveText("4 posts");

    await page.goto("/posts?q=%20%20");
    await waitForExplorer(page);
    await expect(resultSummary(page)).toHaveText("4 posts");

    await page.goto("/posts?q=river%20in%20the");
    await waitForExplorer(page);
    await expect(postHeadings(page)).toHaveCount(1);
    await expect(postHeadings(page)).toContainText("Second Ada note");
  });

  test("keeps unrelated params and the hash while updating filters", async ({
    page,
  }) => {
    await page.goto("/posts?utm=eval#main-content");
    await waitForExplorer(page);
    await authorSelect(page).selectOption("2");
    await expect(page).toHaveURL(/utm=eval/);
    await expect(page).toHaveURL(/author=2/);
    await expect(page).toHaveURL(/#main-content/);
  });

  test("syncs fields with Back and Forward", async ({ page }) => {
    await page.goto("/posts?q=quiet");
    await waitForExplorer(page);
    await expect(searchBox(page)).toHaveValue("quiet");

    await authorSelect(page).selectOption("1");
    await expect(page).toHaveURL(/author=1/);
    await expect(page).toHaveURL(/q=quiet/);

    await page.goBack();
    await expect(authorSelect(page)).toHaveValue("");
    await expect(searchBox(page)).toHaveValue("quiet");
    await expect(page).not.toHaveURL(/author=/);

    await page.goForward();
    await expect(authorSelect(page)).toHaveValue("1");
    await expect(searchBox(page)).toHaveValue("quiet");
    await expect(resultSummary(page)).toHaveText("2 of 4 posts");
  });

  test("preserves the cursor during rapid typing and a mid-text edit", async ({
    page,
  }) => {
    await page.goto("/posts");
    await waitForExplorer(page);
    const search = searchBox(page);
    await search.click();
    await search.pressSequentially("quiet", { delay: 20 });
    await expect(page).toHaveURL(/q=quiet/);

    await search.press("ArrowLeft");
    await search.press("ArrowLeft");
    const before = await search.evaluate((el: HTMLInputElement) => ({
      start: el.selectionStart,
      value: el.value,
    }));
    expect(before).toEqual({ start: 3, value: "quiet" });

    await search.press("x");
    const after = await search.evaluate((el: HTMLInputElement) => ({
      start: el.selectionStart,
      value: el.value,
    }));
    expect(after).toEqual({ start: 4, value: "quixet" });
    await expect(page).toHaveURL(/q=quixet/);
  });

  test("Escape clears search without moving focus", async ({ page }) => {
    await page.goto("/posts?q=quiet");
    await waitForExplorer(page);
    await searchBox(page).focus();
    await page.keyboard.press("Escape");
    await expect(searchBox(page)).toHaveValue("");
    await expect(page).not.toHaveURL(/q=/);
    await expect(searchBox(page)).toBeFocused();
  });

  test("Clear filters restores every post and keeps search focused", async ({
    page,
  }) => {
    await page.goto("/posts?author=1&q=quiet");
    await waitForExplorer(page);
    await page.getByRole("search").getByRole("button", { name: "Clear filters" }).click();
    await expect(page).toHaveURL(/\/posts$/);
    await expect(searchBox(page)).toBeFocused();
    await expect(searchBox(page)).toHaveValue("");
    await expect(authorSelect(page)).toHaveValue("");
    await expect(resultSummary(page)).toHaveText("4 posts");
  });

  test("SSR HTML still contains every post on a filtered URL", async ({
    page,
  }) => {
    const response = await page.goto("/posts?q=zzzzempty");
    const html = await response!.text();
    expect(html).toContain("Ben on Gamma Piece");
    expect(html).toContain("Ada writes about Quiet gardens");
    await waitForExplorer(page);
    await expect(
      page.getByRole("heading", { name: "No posts match these filters" }),
    ).toBeVisible();
  });
});
