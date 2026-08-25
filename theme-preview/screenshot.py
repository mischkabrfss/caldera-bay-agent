#!/usr/bin/env python3
"""Render theme-preview/preview.html at 3 widths and save PNGs."""
import asyncio, os, pathlib, sys
from playwright.async_api import async_playwright

HERE = pathlib.Path(__file__).parent
URL = "file://" + str(HERE / "preview.html")
CHROMIUM = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"

WIDTHS = [(390, 844, "wh-preview-390.png"), (768, 1024, "wh-preview-768.png"), (1440, 900, "wh-preview-1440.png")]

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=CHROMIUM, args=["--no-sandbox"])
        for w, h, name in WIDTHS:
            ctx = await browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
            page = await ctx.new_page()
            await page.goto(URL, wait_until="networkidle", timeout=15000)
            await page.wait_for_timeout(800)
            out = HERE / name
            await page.screenshot(path=str(out), full_page=True, type="png")
            print(f"OK  {name}  ({w}x{h}) -> {out.stat().st_size // 1024} KB")
            await ctx.close()
        await browser.close()

asyncio.run(main())
