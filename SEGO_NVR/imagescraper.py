import asyncio
import os
from playwright.async_api import async_playwright

# ── CONFIGURATION ──────────────────────────────────────────────
USERNAME = "123"
PASSWORD = "123"
SAVE_FOLDER = "monty_RSL" 
LOGIN_URL = "https://www.unsplash.com"
PATRON_URL = "https://www.imdb.com/search/name/"

# ───────────────────────────────────────────────────────────────

async def main():

    os.makedirs(SAVE_FOLDER, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
    # ───────────────────────────────────────────────────────────────
    # Login
        # print("Opening login page...")
        # await page.goto(LOGIN_URL)
        # await page.wait_for_load_state("networkidle")

        # print("Logging in...")
        # await page.fill('input[placeholder="Username"]', USERNAME)
        # await page.fill('input[placeholder="Password"]', PASSWORD)
        # await page.click('button:has-text("Sign in")')
        # await page.wait_for_load_state("networkidle")
        # print("Logged in successfully!")

        print("Navigating to Patrons...")
        await page.goto(PATRON_URL)
        await page.wait_for_load_state("networkidle")
        await page.wait_for_timeout(3000)
    # ───────────────────────────────────────────────────────────────
    #Load the whole webpage
        # print("Scrolling to load all patrons...")
        # previous_height = 0
        # while True:
        #     current_height = await page.evaluate("document.body.scrollHeight")
        #     if current_height == previous_height:
        #         break  
        #     await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        #     await page.wait_for_timeout(2000)  
        #     previous_height = current_height


    #Find all images on the page
        print("Finding patron images...")
        images = await page.query_selector_all("img")
        print(f"Found {len(images)} images total")

    #Download each image
        downloaded = 0
        for i, img in enumerate(images):
            src = await img.get_attribute("src")

            # Skip blank, missing, or tiny icon images
            if not src or "logo" in src.lower() or "icon" in src.lower():
                continue

            # Handle relative URLs (convert to full URL if needed)
            if src.startswith("/"):
                src = "https://venues-sego.ahavic.com.au" + src

            # Download the image
            try:
                response = await page.request.get(src)
                if response.ok:
                    filename = f"patron_{i:04d}.jpg"
                    filepath = os.path.join(SAVE_FOLDER, filename)
                    with open(filepath, "wb") as f:
                        f.write(await response.body())
                    downloaded += 1
                    print(f"Downloaded: {filename}")
            except Exception as e:
                print(f"Failed to download image {i}: {e}")

        print(f"\n Downloaded {downloaded} images to '{SAVE_FOLDER}' folder")
        await browser.close()

# Run the script
asyncio.run(main())