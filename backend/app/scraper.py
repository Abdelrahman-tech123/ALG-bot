import asyncio
import re
import traceback
from typing import List, Dict, Any
from playwright.async_api import async_playwright , Page , BrowserContext
from app.config import debug_print

def extract_emails(text: str) -> List[str]:
    if not text:
        return []
    return re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)

def extract_phones(text: str) -> List[str]:
    if not text:
        return []
    return re.findall(r"[\+\d?][\d\s\-]{8,\d}", text)

# get emails from websites of places
async def scrape_emails_from_websites(context: BrowserContext, url: str):
    if not url or not url.startswith("http"):
        return None
    
    new_page = await context.new_page()
    try:
        debug_print(f"🌐 Deep scraping website: {url}")
        await new_page.goto(url, timeout=15000, wait_until="domcontentloaded")
        await asyncio.sleep(2)

        html_content = await new_page.content()
        emails = extract_emails(html_content)

        if emails:
            debug_print(f"🎯 Found email: {emails[0]}")
            await new_page.close()
            return emails[0]
        
        await new_page.close()
        return None
    except Exception as e:
        debug_print(f"⚠️ Could not scrape website {url}: {str(e)}")
        await new_page.close()
        return None

async def scrape_google_maps(keyword : str , location : str , max_results : int = 10) -> List[Dict[str, Any]]:
    scraped_data = []
    search_query = f"{keyword} in {location}"

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()

        debug_print(f"searching for : {search_query}")
        
        # الرابط الخفيف المستقر
        await page.goto(f"https://www.google.com/maps/search/{search_query}", timeout=60000)
        
        try:
            await page.wait_for_selector('div[role="feed"]' , timeout=10000)
        except Exception:
            debug_print("feed container not found or slow loading ...")
            await browser.close()
            return scraped_data
        
        feed_selector = 'div[role="feed"]'
        for _ in range(10):
            await page.evaluate(f"document.querySelector('{feed_selector}').scrollBy(0, 1000)")
            await asyncio.sleep(1)

        cards = await page.query_selector_all('a[href*="/maps/place/"]')
        debug_print(f"found {len(cards)} potential links")

        count = 0
        for card in cards:
            if count >= max_results:
                break
                
            try:
                title_element = await card.query_selector('.qBF1Pd')
                if not title_element:
                    title_element = await card.query_selector('div.fontHeadlineSmall')
                
                if title_element:
                    place_name = await title_element.inner_text()
                    place_name = place_name.strip()
                else:
                    place_name = await card.get_attribute('aria-label')

                if not place_name or place_name in ["النتائج", "نتائج البحث", "Unknown Place", ""]:
                    continue
                
                await card.click()
                await asyncio.sleep(1.5)

                full_content = await page.content()

                # emails = extract_emails(full_content)
                # email = emails[0] if emails else None

                phone_element = await page.query_selector('button[data-item-id^="phone:tel:"]')
                phone = None
                if phone_element:
                    raw_phone = await phone_element.get_attribute('data-item-id')
                    phone = raw_phone.replace("phone:tel:", "").strip() if raw_phone else None

                web_element = await page.query_selector('a[data-item-id="authority"]')
                website = await web_element.get_attribute('href') if web_element else None

                location_element = await page.query_selector('button[data-item-id="address"]')
                location_text = None
                if location_element:
                    raw_location = await location_element.inner_text()
                    location_text = raw_location.replace("", "").replace("\n", "").strip()

                place_info = {
                    "company_name": place_name,
                    "phone": phone,
                    "email": None,
                    "website": website,
                    "location": location_text, 
                    "source": "Google Maps",
                }

                scraped_data.append(place_info)
                debug_print(f"successfully scraped: {place_name}")
                count += 1

            except Exception as e:
                debug_print(f"❌ Error inside loop: {str(e)}")
                traceback.print_exc()
                continue

            # scraping emails from websites
        debug_print("🚀 Starting Deep Scraping for emails...")
        for company in scraped_data:
            if company["website"]:
                company_email = await scrape_emails_from_websites(context, company["website"])
                company["email"] = company_email

        await browser.close()

    debug_print(f"Finished . total scraped {len(scraped_data)}")
    return scraped_data