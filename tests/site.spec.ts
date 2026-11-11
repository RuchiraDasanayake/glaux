import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { type Page, expect, test } from "@playwright/test";

const release = JSON.parse(readFileSync("src/akuru/release.json", "utf8")) as {
  version: string;
  files: Record<"setup" | "portable", { name: string; sha256: string }>;
};
const installerUrl = (name: string) =>
  new RegExp(`^https://[^/]+/.*${name.replace(/[.]/g, "\\.")}$`);

// The Akuru page asks the download host for the newest release. Answer with the bundled one, so a run
// neither depends on that host nor on its CORS rules (which allow useglaux.com, not the preview server).
const serveRelease = (page: Page, body: object) =>
  page.route("**/akuru/release.json", (route) =>
    route.fulfill({ json: body, headers: { "access-control-allow-origin": "*" } }),
  );
test.beforeEach(({ page }) => serveRelease(page, release));

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

test("a newer release on the download host replaces the one the site was built with", async ({
  page,
}) => {
  const file = (name: string, digit: string) => ({
    name,
    bytes: 120_000_000,
    sha256: digit.repeat(64),
  });
  await serveRelease(page, {
    version: "9.8.7",
    date: "2030-01-02",
    files: {
      setup: file("Glaux-Akuru-Setup-9.8.7.exe", "a"),
      portable: file("Glaux-Akuru-Portable-9.8.7.exe", "b"),
    },
  });
  await page.goto("/akuru/");
  await expect(page.getByText("Version 9.8.7", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Download for Windows" })).toHaveAttribute(
    "href",
    installerUrl("Glaux-Akuru-Setup-9.8.7.exe"),
  );
  await expect(page.getByText("9.8.7, 2 January 2030")).toBeVisible();
});

test("a broken release list leaves the bundled release in place", async ({ page }) => {
  await serveRelease(page, { version: "latest", files: {} });
  const answered = page.waitForResponse("**/akuru/release.json");
  await page.goto("/akuru/");
  await answered;
  await expect(page.getByText(`Version ${release.version}`, { exact: true })).toBeVisible();
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
  await expect(markets).not.toContainText(/live/i);
  await expect(markets.locator("a")).toHaveCount(0);
  // Not in the catalogue, the header, the menu or the footer.
  await expect(page.getByRole("link", { name: /Markets/ })).toHaveCount(0);
});

test("the hero is the logo: the mark, the wordmark, its tagline and its mission line", async ({
  page,
}) => {
  await page.goto("/");
  const title = page.getByRole("heading", { level: 1 });
  await expect(title).toContainText("GLAUX");
  await expect(title).toContainText("Risk-first intelligence systems");
  await expect(title).toContainText("Instruments for reading risk before it matters.");
  await expect(page.locator(".mark-stage svg.mark-stage__mark")).toBeVisible();
  // The mark is vector artwork. Nothing on the page needs a canvas or WebGL.
  await expect(page.locator("canvas")).toHaveCount(0);
});

test("reduced motion shows everything at once and animates nothing", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".mark-stage svg.mark-stage__mark")).toBeVisible();
  await expect(page.locator("[data-reveal]")).toHaveCount(0);
  const running = await page.evaluate(
    () => document.getAnimations().filter((animation) => animation.playState === "running").length,
  );
  expect(running).toBe(0);
});

test("content below the fold arrives when it is scrolled to", async ({ page }) => {
  await page.goto("/");
  const row = page.locator(".product", { hasText: "Glaux Ledger" });
  await row.scrollIntoViewIfNeeded();
  await expect(row).toHaveCSS("opacity", "1");
});

for (const path of ["/", "/akuru/", "/terms/", "/privacy/"]) {
  test(`${path} carries the Glaux logo in its header, its footer and its tab`, async ({ page }) => {
    await page.goto(path);
    const brand = page.locator(".site-header").getByRole("link", { name: "Glaux home" });
    await expect(brand).toBeVisible();
    await expect(brand.locator("svg")).toBeVisible();
    await expect(brand).toContainText("GLAUX");
    const lockup = page.locator(".footer").getByRole("link", { name: "Glaux home" });
    await expect(lockup.locator("svg")).toBeAttached();
    await expect(lockup).toContainText("Risk-first intelligence systems");
    await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute(
      "href",
      "/favicon.svg",
    );
  });
}

test("the brand assets are served", async ({ page }) => {
  for (const asset of [
    "/favicon.svg",
    "/favicon-32.png",
    "/apple-touch-icon.png",
    "/brand-icon-512.png",
    "/og-image.png",
    "/og-akuru.png",
  ]) {
    expect((await page.request.get(asset)).ok(), asset).toBeTruthy();
  }
});

test.describe("on a narrow screen", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("the links fold into a menu that opens, closes and navigates", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Menu" });
    const menu = page.getByRole("navigation", { name: "Menu" });
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeHidden();
    await expect(menu).toBeHidden();

    await toggle.click();
    await expect(menu).toBeVisible();
    await expect(page.getByRole("button", { name: "Close" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    // The page behind an open menu takes neither focus nor taps.
    await expect(page.locator("main")).toHaveAttribute("inert", "");

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(toggle).toBeFocused();
    await expect(page.locator("main")).not.toHaveAttribute("inert", "");

    await toggle.click();
    await menu.getByRole("link", { name: "Products" }).click();
    await expect(menu).toBeHidden();
    await expect(page.locator("#products")).toBeInViewport();
  });

  test("nothing is wider than the screen", async ({ page }) => {
    for (const path of ["/", "/akuru/", "/terms/"]) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, path).toBe(0);
    }
  });
});

// vite preview does not apply public/_headers, so the policy Cloudflare Pages
// will send is attached here by hand. A directive that is too tight shows up
// as a refused request, which Chromium reports as a console error.
const productionCsp = /^\s*Content-Security-Policy:\s*(.+)$/m.exec(
  readFileSync("public/_headers", "utf8"),
)?.[1];

for (const path of ["/", "/akuru/", "/terms/"]) {
  test(`${path} runs under the production Content-Security-Policy`, async ({ page }) => {
    expect(productionCsp).toBeTruthy();
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(() => {
      document.addEventListener("securitypolicyviolation", (event) => {
        console.error(`CSP violation: ${event.violatedDirective} blocked ${event.blockedURI}`);
      });
    });
    await page.route("**/*", async (route) => {
      if (route.request().resourceType() !== "document") return route.fallback();
      const response = await route.fetch();
      await route.fulfill({
        response,
        headers: { ...response.headers(), "content-security-policy": productionCsp! },
      });
    });

    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator(".site-header .brand svg")).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    expect(errors).toEqual([]);
  });
}

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
