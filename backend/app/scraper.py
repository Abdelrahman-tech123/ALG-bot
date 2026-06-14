import asyncio
import re
import traceback
from typing import List, Dict, Any
from collections import Counter
from playwright.async_api import async_playwright, Page, BrowserContext
from app.config import debug_print

def extract_emails(text: str) -> List[str]:
    if not text:
        return []
    raw_emails = re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}", text)
    blacklist_domains = ["wixpress.com", "sentry", "example.com", "yourcompany.com", "png", "jpg", "jpeg", "gif", "bootstrap"]
    blacklist_keywords = ["someone", "user", "email", "name", "domain"]
    valid_emails = []
    for email in raw_emails:
        email_lower = email.lower()
        if any(domain in email_lower for domain in blacklist_domains): continue
        if any(keyword in email_lower.split('@')[0] for keyword in blacklist_keywords): continue
        if email_lower.endswith(('.png', '.jpg', '.jpeg', '.gif', '.css', '.js')): continue
        valid_emails.append(email)
    return list(set(valid_emails))

def parse_google_maps_time(time_str: str) -> str:
    time_str = time_str.lower().strip()
    arabic_digits = "٠١٢٣٤٥٦٧٨٩"
    english_digits = "0123456789"
    translation_table = str.maketrans(arabic_digits, english_digits)
    time_str = time_str.translate(translation_table)
    
    is_pm = False
    if "pm" in time_str or "م" in time_str:
        if "12" not in time_str: is_pm = True
    if "am" in time_str or "ص" in time_str:
        if "12" in time_str: is_pm = False
            
    digits = re.findall(r"\d+", time_str)
    if not digits: return "0000"
    hour = int(digits[0])
    minute = int(digits[1]) if len(digits) > 1 else 0
    if is_pm and hour < 12: hour += 12
    elif "12" in time_str and ("ص" in time_str or "am" in time_str): hour = 0
    return f"{hour:02d}{minute:02d}"

async def scrape_emails_from_websites(context: BrowserContext, url: str):
    if not url or not url.startswith("http"): return None
    new_page = await context.new_page()
    try:
        await new_page.goto(url, timeout=15000, wait_until="domcontentloaded")
        await asyncio.sleep(1)
        html_content = await new_page.content()
        emails = extract_emails(html_content)
        await new_page.close()
        return emails
    except Exception:
        await new_page.close()
        return None

async def scrape_google_maps(keyword: str, location: str, max_results: int = 10, db_results: List[str] = []) -> List[Dict[str, Any]]:
    scraped_data = []
    search_query = f"{keyword} in {location}"
    db_clean_links = {link.strip() for link in db_results if link}

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        
        # تعديل الحظر: بنقفل الـ stylesheets والمديا الخارجية، لكن بنسمح بصور جوجل (lh3.googleusercontent.com) عشان الـ Hero Image
        async def block_except_google_images(route):
            req_url = route.request.url
            if route.request.resource_type in ["stylesheet", "font", "media"]:
                await route.abort()
            elif route.request.resource_type == "image" and "googleusercontent" not in req_url:
                await route.abort()
            else:
                await route.continue_()
                
        await page.route("**/*", block_except_google_images)

        debug_print(f"🔍 Searching Maps for: {search_query}")
        try:
            await page.goto(f"https://www.google.com/maps/search/{search_query}", timeout=60000, wait_until="domcontentloaded")
            await page.wait_for_selector('div[role="feed"]', timeout=20000)
        except Exception:
            await browser.close()
            return scraped_data
        
        feed_selector = 'div[role="feed"]'
        await page.focus(feed_selector)
        targets_to_scrape = []
        seen_links = set()
        no_change_count = 0
        last_count = 0
        
        while len(targets_to_scrape) < (max_results * 4):
            await page.keyboard.press("PageDown")
            await asyncio.sleep(0.5)
            cards = await page.query_selector_all('a[href*="/maps/place/"]')
            current_cards_count = len(cards)
            
            for card in cards:
                try:
                    card_href = await card.get_attribute('href')
                    if not card_href: continue
                    full_maps_link = f"https://www.google.com{card_href}" if card_href.startswith('/') else card_href
                    if full_maps_link in seen_links or full_maps_link in db_clean_links: continue
                        
                    title_element = await card.query_selector('.qBF1Pd')
                    place_name = (await title_element.inner_text()).strip() if title_element else await card.get_attribute('aria-label')
                    if not place_name or place_name in ["النتائج", "نتائج البحث", ""]: continue

                    seen_links.add(full_maps_link)
                    targets_to_scrape.append({"name": place_name, "link": full_maps_link})
                except Exception: continue

            if current_cards_count == last_count:
                no_change_count += 1
                await page.evaluate(f"document.querySelector('{feed_selector}').scrollBy(0, 2000)")
                await asyncio.sleep(1)
            else: no_change_count = 0
            last_count = current_cards_count
            if no_change_count >= 3 or len(targets_to_scrape) >= (max_results * 2): break

        count = 0
        for target in targets_to_scrape:
            if count >= max_results: break
            place_name = target["name"]
            full_maps_link = target["link"]

            try:
                # فتح الكارت مباشرة لـ Domcontentloaded والانتظار لثانية لثبات الـ DOM والـ Hero Image
                await page.goto(full_maps_link, timeout=45000, wait_until="domcontentloaded")
                await asyncio.sleep(2.5) 

                phone = None
                phone_element = await page.query_selector('button[data-item-id^="phone:tel:"]')
                if phone_element:
                    raw_phone = await phone_element.get_attribute('data-item-id')
                    phone = raw_phone.replace("phone:tel:", "").strip() if raw_phone else None
                web_element = await page.query_selector('a[data-item-id="authority"]')
                website = await web_element.get_attribute('href') if web_element else None

                location_element = await page.query_selector('button[data-item-id="address"]')
                location_text = (await location_element.inner_text()).replace("", "").replace("\n", "").strip() if location_element else location

                # --- ساعات العمل ---
                open_times = []
                detected_pairs = []
                try:
                    hours_btn = await page.query_selector('button[class*="t39EBF"], button[data-item-id="oh"], [jsaction*="pane.hours"]')
                    if hours_btn:
                        await hours_btn.click()
                        await asyncio.sleep(0.5)
                    hours_table = await page.query_selector('table.eK4R0e, table.e2fgwA, table[class*="hours"]')
                    if hours_table:
                        rows = await hours_table.query_selector_all('tr.y8skZc, tr[jsaction*="hours.row"]')
                        for row in rows:
                            row_text = await row.inner_text()
                            if row_text:
                                clean_text = row_text.replace("\n", " ").strip()
                                chunks = re.split(r'[–\-—~]|(?:إلى)', clean_text)
                                if len(chunks) >= 2:
                                    detected_pairs.append((parse_google_maps_time(chunks[0]), parse_google_maps_time(chunks[1])))
                                elif "24" in clean_text or "٢٤" in clean_text:
                                    detected_pairs.append(("0000", "0000"))
                    if not detected_pairs and hours_btn:
                        label_text = await hours_btn.get_attribute('aria-label')
                        if label_text:
                            all_times_in_label = re.findall(r'\d{1,2}:\d{2}\s*(?:ص|م|AM|PM|am|pm)', label_text)
                            if len(all_times_in_label) >= 2:
                                detected_pairs.append((parse_google_maps_time(all_times_in_label[0]), parse_google_maps_time(all_times_in_label[1])))
                    if detected_pairs:
                        most_common_pair = Counter(detected_pairs).most_common(1)[0][0]
                        open_times = [most_common_pair[0], most_common_pair[1]]
                except Exception: pass

                # --- استخراج الصورة بناءً على لقطة شاشتك الدقيقة (DevTools السليم) ---
                first_image = None
                try:
                    # السلكتورات المطابقة لـ DOM جوجل الفعلي من لقطات الشاشة المرفقة
                    img_selectors = [
                        'button[jsaction*="heroHeaderImage"] img',
                        'button[data-photo-index="0"] img',
                        'div.g27Yse img',
                        'img[src*="googleusercontent.com/p/"]'
                    ]
                    for selector in img_selectors:
                        img_element = await page.query_selector(selector)
                        if img_element:
                            src = await img_element.get_attribute('src')
                            if src and "staticmap" not in src:
                                first_image = src if src.startswith('http') else f"https:{src}"
                                break
                except Exception: pass

                place_info = {
                    "keyword": f"{keyword} in {location}",
                    "company_name": place_name,
                    "phone": phone,
                    "email": [],
                    "website": website,
                    "location": location_text, 
                    "maps_link": full_maps_link,
                    "source": "Google Maps",
                    "open_times": open_times,
                    "first_image": first_image
                }
                scraped_data.append(place_info)
                debug_print(f"✅ Scraped: {place_name} | Image Found: {first_image is not None}")
                count += 1
            except Exception as e:
                debug_print(f"❌ Error inside loop: {str(e)}")
                continue

        # سحب الـ Emails
        for company in scraped_data:
            if company["website"]:
                emails = await scrape_emails_from_websites(context, company["website"])
                company["email"] = emails if emails else []
        await browser.close()
    return scraped_data