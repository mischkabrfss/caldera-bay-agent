#!/usr/bin/env python3
"""Render preview.html at 5 widths, revealing all scroll-triggered content first."""
import asyncio, pathlib
from playwright.async_api import async_playwright

HERE = pathlib.Path(__file__).parent
URL = "file://" + str(HERE / "preview.html")
CHROMIUM = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"

WIDTHS = [
    (390, 844, "wh-preview-390.png"),
    (320, 780, "wh-preview-320.png"),
    (430, 932, "wh-preview-430.png"),
    (768, 1024, "wh-preview-768.png"),
    (1440, 900, "wh-preview-1440.png"),
]

REVEAL_JS = """
() => {
  document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('in'));
  return true;
}
"""

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=CHROMIUM, args=["--no-sandbox"])
        for w, h, name in WIDTHS:
            ctx = await browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
            page = await ctx.new_page()
            await page.goto(URL, wait_until="networkidle", timeout=25000)
            # Scroll bottom → top to trigger IntersectionObserver, then force-reveal any remaining
            await page.evaluate("() => window.scrollTo(0, document.body.scrollHeight)")
            await page.wait_for_timeout(700)
            await page.evaluate("() => window.scrollTo(0, 0)")
            await page.wait_for_timeout(400)
            await page.evaluate(REVEAL_JS)
            await page.wait_for_timeout(500)
            out = HERE / name
            await page.screenshot(path=str(out), full_page=True, type="png")
            print(f"OK  {name}  ({w}x{h}) -> {out.stat().st_size // 1024} KB")
            await ctx.close()
        await browser.close()

asyncio.run(main())
