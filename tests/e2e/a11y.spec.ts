import { expect, test } from "@playwright/test";
import {
  authorSelect,
  searchBox,
  stubAuthors,
  waitForAuthors,
  waitForExplorer,
} from "./helpers";

test.describe("keyboard and display", () => {
  test.beforeEach(async ({ page }) => {
    await stubAuthors(page);
  });

  test("Tab order is skip link, search, author, footer; Shift+Tab reverses it", async ({
    page,
  }) => {
    await page.goto("/posts");
    await waitForExplorer(page);

    const order: string[] = [];
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
      order.push(
        await page.evaluate(() => {
          const el = document.activeElement;
          if (!(el instanceof HTMLElement)) return "";
          if (el.id) return el.id;
          return el.textContent?.trim().replace(/\s+/g, " ").slice(0, 40) ?? el.tagName;
        }),
      );
    }

    expect(order[0]).toMatch(/Skip to content/i);
    expect(order[1]).toBe("post-search");
    expect(order[2]).toBe("author-filter");
    expect(order[3]).toBe("JSONPlaceholder");

    await page.locator(".skip-link").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(searchBox(page)).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(authorSelect(page)).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await expect(searchBox(page)).toBeFocused();
  });

  test("shows a real focus outline on the search field after Tab", async ({
    page,
  }) => {
    await page.goto("/posts");
    await waitForExplorer(page);
    await searchBox(page).focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(searchBox(page)).toBeFocused();

    const outline = await searchBox(page).evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        style: style.outlineStyle,
        width: style.outlineWidth,
        offset: style.outlineOffset,
        focused: el.matches(":focus"),
      };
    });

    expect(outline.focused).toBe(true);
    expect(outline.style).toBe("solid");
    expect(Number.parseFloat(outline.width)).toBeGreaterThanOrEqual(2);
    expect(Number.parseFloat(outline.offset)).toBeGreaterThanOrEqual(2);
  });

  test("Space activates Clear filters", async ({ page }) => {
    await page.goto("/posts?author=1");
    await waitForExplorer(page);
    const clear = page
      .getByRole("search")
      .getByRole("button", { name: "Clear filters" });
    await clear.focus();
    await page.keyboard.press("Space");
    await expect(page).toHaveURL(/\/posts$/);
    await expect(searchBox(page)).toBeFocused();
    await expect(authorSelect(page)).toHaveValue("");
  });

  test("Arrow keys change the native author select", async ({ page }) => {
    await page.goto("/posts");
    await waitForExplorer(page);
    await waitForAuthors(page);
    await authorSelect(page).focus();
    await page.keyboard.press("ArrowDown");

    const value = await authorSelect(page).inputValue();
    const url = page.url();
    expect(
      value === "1" || url.includes("author=1"),
      `expected ArrowDown to select author 1, got value=${value} url=${url}`,
    ).toBe(true);
  });

  test("has no horizontal scroll on mobile or desktop", async ({ page }) => {
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 1280, height: 800 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("/posts");
      await waitForExplorer(page);
      const overflowed = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      expect(overflowed, `horizontal overflow at ${viewport.width}px`).toBe(
        false,
      );
    }
  });

  test("reduced motion collapses transitions", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/posts");
    await waitForExplorer(page);
    const duration = await page.locator("article").first().evaluate((el) => {
      return getComputedStyle(el).transitionDuration;
    });
    const seconds = duration
      .split(",")
      .map((part) => Number.parseFloat(part.trim()))
      .filter((n) => !Number.isNaN(n));
    expect(seconds.every((n) => n <= 0.05)).toBe(true);
  });
});
