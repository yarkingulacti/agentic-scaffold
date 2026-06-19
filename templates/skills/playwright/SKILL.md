---
name: playwright
description: General-purpose browser automation and end-to-end testing with Playwright. Write and run custom automation on the fly — page tests, multi-step flows, form submission, responsive/visual checks, link/asset validation. Use when the user wants to test a web page or flow in a real browser, automate UI interactions, capture screenshots, or validate frontend behavior.
---

# Playwright Browser Automation

Write and execute custom Playwright automation for whatever browser task is
requested — not a fixed set of canned scripts. Load only what the specific task
needs, run it, and report results with console output and screenshots.

## When to use

- "Test the homepage / contact form / signup flow."
- "Take screenshots in mobile and desktop", "test responsive design".
- "Fill out and submit this form", "click through the nav", "test search".
- "Check for broken links", "verify all images load", "test form validation."

## How it works

1. Translate the request into a concrete Playwright script (navigate, locate by
   role/text, interact, assert).
2. Run it through a single executor entry point so module resolution is consistent
   (avoids "module not found" errors from ad-hoc script files).
3. Browser launches **visible by default** (`headless: false`) with slight slow-motion
   so the user can watch; switch to headless only when asked or in CI.
4. Capture screenshots (default to a temp dir) and console/network output, then report.

## Defaults

- Headless: `false` (visible) unless headless/CI is requested.
- Slow motion: ~100ms for visibility.
- Timeout: ~30s per action.
- Screenshots: saved to the OS temp dir.

## Authoring guidance

- Prefer role/text/label selectors (`getByRole`, `getByText`, `getByLabel`) over
  brittle CSS/XPath.
- Wait on conditions (`expect(...).toBeVisible()`, `waitForResponse`) rather than
  fixed sleeps.
- One flow per script; assert observable behavior (visible text, URL, DOM, network),
  not implementation details.
- For visual/responsive checks, set explicit viewports and screenshot each.
- Clean up temp files without racing concurrent runs.

## Setup

Requires Node.js, Playwright, and Chromium (`npm run setup` / `npx playwright install`
in the consuming project). Install additional browsers only when a task needs them.

## Credit

Adapted from the **playwright-skill** by Jordan Lackey
([lackeyjb/playwright-skill](https://github.com/lackeyjb/playwright-skill), MIT). The
upstream ships a universal executor (`run.js`), helper library, and a full
`API_REFERENCE.md` (selectors, network interception, auth, visual regression, mobile
emulation, performance, debugging) — install it for the complete tooling.
