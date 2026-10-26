import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const release = JSON.parse(readFileSync("src/akuru/release.json", "utf8")) as {
  version: string;
  files: Record<"setup" | "portable", { name: string; sha256: string }>;
};
const installerUrl = (name: string) =>
  new RegExp(`^https://[^/]+/.*${name.replace(/[.]/g, "\\.")}$`);

test("home exposes its primary content and metadata", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");

  await expect(page).toHaveTitle("Glaux | Risk-First Intelligence Systems");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("GLAUX");
  await expect(page.getByRole("link", { name: "Open Glaux Ledger" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Glaux Ledger" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Glaux Markets" })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://useglaux.com/",
  );

  const socialImage = await page.request.get("/og-image.png");
  const brandIcon = await page.request.get("/brand-icon-512.png");
  expect(socialImage.ok()).toBeTruthy();
  expect(brandIcon.ok()).toBeTruthy();
  expect(errors).toEqual([]);
});

test("skip link moves focus to main content", async ({ page }) => {
  await page.goto("/");
  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toBeAttached();
  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("the linked product row has a matching hit area", async ({ page }) => {
  await page.goto("/");
  const heading = page.getByRole("heading", { name: "Glaux Ledger" });
  await heading.scrollIntoViewIfNeeded();
  const box = await heading.boundingBox();
  expect(box).not.toBeNull();

  const targetHref = await page.evaluate(
    ({ x, y }) => document.elementFromPoint(x, y)?.closest("a")?.getAttribute("href"),
    { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 },
  );
  expect(targetHref).toBe("https://ledger.useglaux.com");
});

test("the Glaux Akuru row leads to its download page", async ({ page }) => {
  await page.goto("/");
  const akuru = page.locator(".product", { hasText: "Glaux Akuru" });
  await expect(akuru.getByRole("link", { name: "Download Glaux Akuru" })).toHaveAttribute(
    "href",
    "/akuru/",
  );
  await expect(page.locator(".footer").getByRole("link", { name: "Glaux Akuru" })).toHaveAttribute(
    "href",
    "/akuru/",
  );
});

test("the Glaux Akuru page offers the current installers", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/akuru/");
  await expect(page).toHaveTitle(/^Glaux Akuru \|/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sinhala, typed right.");
  await expect(page.locator(".btn")).toHaveCount(1);
  await expect(page.getByRole("link", { name: "Download for Windows" })).toHaveAttribute(
    "href",
    installerUrl(release.files.setup.name),
  );
  await expect(page.getByRole("link", { name: /^Download portable/ })).toHaveAttribute(
    "href",
    installerUrl(release.files.portable.name),
  );
  await expect(page.getByText(`Version ${release.version}`, { exact: true })).toBeVisible();
  await expect(page.getByText("This download is for Windows PCs")).toHaveCount(0);

  const pricing = page.getByRole("region", { name: /^Free for typing/ });
  for (const price of ["LKR 0", "LKR 490", "LKR 4,900", "LKR 1,490", "LKR 14,900"]) {
    await expect(pricing).toContainText(price);
  }

  await page.getByText("Check the files (SHA-256)").click();
  await expect(page.getByText(release.files.setup.sha256.toUpperCase())).toBeVisible();

  for (const asset of ["/akuru/editor.webp", "/akuru/icon.svg", "/og-akuru.png"]) {
    expect((await page.request.get(asset)).ok(), asset).toBeTruthy();
  }
  expect(errors).toEqual([]);
});

test.describe("on a phone", () => {
  test.use({
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; SM-A155F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
  });

  test("the Glaux Akuru page says the download is for Windows PCs", async ({ page }) => {
    await page.goto("/akuru/");
    await expect(page.getByText("This download is for Windows PCs")).toBeVisible();
    await expect(page.getByRole("link", { name: "Download for Windows" })).toBeVisible();
  });
});

test("products still in development are stated as such and never linked", async ({ page }) => {
  await page.goto("/");
  const markets = page.locator(".product", { hasText: "Glaux Markets" });
  await expect(markets).toContainText("In development");
  await expect(markets.locator("a")).toHaveCount(0);
});

test("reduced motion keeps the static poster and skips WebGL", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.waitForTimeout(1600);
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator(".poster")).toBeVisible();
});

test("WebGL context loss restores the poster", async ({ page }) => {
  await page.goto("/");
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible({ timeout: 10_000 });
  const posterLayer = page.locator(".hero__stage > .hero__layer").first();
  await expect(posterLayer).toHaveClass(/hero__layer--hidden/, { timeout: 10_000 });

  await canvas.dispatchEvent("webglcontextlost", { cancelable: true });
  await expect(posterLayer).not.toHaveClass(/hero__layer--hidden/);
});

test("unsupported WebGL remains on the poster", async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = (() =>
      null) as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto("/");
  await page.waitForTimeout(1600);
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator(".poster")).toBeVisible();
});

for (const legalPage of [
  { path: "/terms/", heading: "Terms of Use" },
  { path: "/privacy/", heading: "Privacy Policy" },
]) {
  test(`${legalPage.heading} is directly addressable`, async ({ page }) => {
    await page.goto(legalPage.path);
    await expect(page.getByRole("heading", { level: 1, name: legalPage.heading })).toBeVisible();
    await expect(page.getByText("Effective 1 August 2026")).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to company" })).toHaveAttribute("href", "/");
  });
}

for (const path of ["/", "/akuru/"]) {
  test(`${path} has no automatically detectable accessibility violations`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}
