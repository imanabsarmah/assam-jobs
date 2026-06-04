#!/usr/bin/env python3
"""
Assam Jobs Scraper
Auto-searches multiple job sites for openings in Guwahati & Assam
Saves results to data/jobs.json
"""

import json
import os
import re
import time
import hashlib
from datetime import datetime, timezone
from typing import Optional
import requests
from bs4 import BeautifulSoup
import feedparser

# ─── Config ────────────────────────────────────────────────────────────────
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}
TIMEOUT = 15
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "jobs.json")

KEYWORDS = ["Guwahati", "Assam", "Northeast India", "North East India"]

# ─── Helpers ────────────────────────────────────────────────────────────────

def make_id(title: str, company: str, source: str) -> str:
    raw = f"{title}|{company}|{source}".lower()
    return hashlib.md5(raw.encode()).hexdigest()[:10]


def is_relevant(text: str) -> bool:
    text_lower = text.lower()
    return any(k.lower() in text_lower for k in KEYWORDS)


def load_existing() -> dict:
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE) as f:
            return json.load(f)
    return {"jobs": [], "last_updated": None, "total": 0}


def save_jobs(all_jobs: list):
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    data = {
        "jobs": all_jobs,
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "total": len(all_jobs),
        "sources": list({j["source"] for j in all_jobs}),
    }
    with open(OUTPUT_FILE, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"✅ Saved {len(all_jobs)} jobs to {OUTPUT_FILE}")


# ─── Scrapers ────────────────────────────────────────────────────────────────

def scrape_indeed() -> list:
    """Scrape Indeed via RSS feed (no API key needed)"""
    jobs = []
    queries = ["jobs+in+Guwahati", "jobs+in+Assam"]
    for q in queries:
        url = f"https://www.indeed.com/rss?q={q}&l=Guwahati%2C+Assam"
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:30]:
                title = entry.get("title", "")
                link = entry.get("link", "")
                summary = BeautifulSoup(entry.get("summary", ""), "html.parser").get_text()
                pub = entry.get("published", datetime.now(timezone.utc).isoformat())
                # Extract company from title (Indeed format: "Job Title - Company")
                parts = title.rsplit(" - ", 1)
                company = parts[1].strip() if len(parts) == 2 else "Unknown"
                job_title = parts[0].strip()
                jobs.append({
                    "id": make_id(job_title, company, "Indeed"),
                    "title": job_title,
                    "company": company,
                    "location": "Guwahati, Assam",
                    "source": "Indeed",
                    "url": link,
                    "description": summary[:500],
                    "posted": pub,
                    "scraped_at": datetime.now(timezone.utc).isoformat(),
                    "tags": extract_tags(summary),
                })
            print(f"  Indeed ({q}): {len(feed.entries)} entries")
        except Exception as e:
            print(f"  Indeed error: {e}")
    return jobs


def scrape_naukri_rss() -> list:
    """Scrape Naukri via their search results page"""
    jobs = []
    urls = [
        "https://www.naukri.com/jobs-in-guwahati",
        "https://www.naukri.com/jobs-in-assam",
    ]
    for url in urls:
        try:
            resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
            soup = BeautifulSoup(resp.text, "html.parser")
            cards = soup.select("article.jobTuple") or soup.select("[class*='jobTuple']")
            for card in cards[:20]:
                title_el = card.select_one("[class*='title']")
                company_el = card.select_one("[class*='companyName'], [class*='company']")
                location_el = card.select_one("[class*='location']")
                link_el = card.select_one("a[href*='naukri.com']") or card.select_one("a")
                if not title_el:
                    continue
                title = title_el.get_text(strip=True)
                company = company_el.get_text(strip=True) if company_el else "Unknown"
                location = location_el.get_text(strip=True) if location_el else "Assam"
                link = link_el.get("href", url) if link_el else url
                jobs.append({
                    "id": make_id(title, company, "Naukri"),
                    "title": title,
                    "company": company,
                    "location": location,
                    "source": "Naukri",
                    "url": link if link.startswith("http") else f"https://www.naukri.com{link}",
                    "description": "",
                    "posted": datetime.now(timezone.utc).isoformat(),
                    "scraped_at": datetime.now(timezone.utc).isoformat(),
                    "tags": [],
                })
            print(f"  Naukri ({url.split('/')[-1]}): {len(cards)} cards")
        except Exception as e:
            print(f"  Naukri error: {e}")
        time.sleep(1)
    return jobs


def scrape_linkedin_rss() -> list:
    """Scrape LinkedIn Jobs via public RSS/search"""
    jobs = []
    queries = [
        "guwahati",
        "assam%20india",
    ]
    for q in queries:
        url = (
            f"https://www.linkedin.com/jobs/search/?keywords={q}"
            f"&location=Assam%2C+India&f_TPR=r604800"
        )
        try:
            resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
            soup = BeautifulSoup(resp.text, "html.parser")
            cards = soup.select("div.base-card") or soup.select("[class*='job-search-card']")
            for card in cards[:20]:
                title_el = card.select_one("h3.base-search-card__title, [class*='title']")
                company_el = card.select_one("h4.base-search-card__subtitle, [class*='subtitle']")
                location_el = card.select_one("[class*='location']")
                link_el = card.select_one("a[href*='linkedin.com/jobs']")
                if not title_el:
                    continue
                title = title_el.get_text(strip=True)
                company = company_el.get_text(strip=True) if company_el else "Unknown"
                location = location_el.get_text(strip=True) if location_el else "Assam"
                link = link_el.get("href", url) if link_el else url
                if not is_relevant(f"{title} {company} {location}"):
                    location = "Guwahati, Assam"
                jobs.append({
                    "id": make_id(title, company, "LinkedIn"),
                    "title": title,
                    "company": company,
                    "location": location,
                    "source": "LinkedIn",
                    "url": link.split("?")[0],
                    "description": "",
                    "posted": datetime.now(timezone.utc).isoformat(),
                    "scraped_at": datetime.now(timezone.utc).isoformat(),
                    "tags": [],
                })
            print(f"  LinkedIn ({q}): {len(cards)} cards")
        except Exception as e:
            print(f"  LinkedIn error: {e}")
        time.sleep(2)
    return jobs


def scrape_shine() -> list:
    """Scrape Shine.com for Assam/Guwahati jobs"""
    jobs = []
    url = "https://www.shine.com/job-search/jobs-in-guwahati"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        soup = BeautifulSoup(resp.text, "html.parser")
        cards = soup.select("[class*='jobCard'], [class*='job-card'], article")
        for card in cards[:20]:
            title_el = card.select_one("h2, h3, [class*='title']")
            company_el = card.select_one("[class*='company'], [class*='employer']")
            link_el = card.select_one("a[href]")
            if not title_el:
                continue
            title = title_el.get_text(strip=True)
            company = company_el.get_text(strip=True) if company_el else "Unknown"
            link = link_el.get("href", url) if link_el else url
            jobs.append({
                "id": make_id(title, company, "Shine"),
                "title": title,
                "company": company,
                "location": "Guwahati, Assam",
                "source": "Shine",
                "url": link if link.startswith("http") else f"https://www.shine.com{link}",
                "description": "",
                "posted": datetime.now(timezone.utc).isoformat(),
                "scraped_at": datetime.now(timezone.utc).isoformat(),
                "tags": [],
            })
        print(f"  Shine: {len(cards)} cards")
    except Exception as e:
        print(f"  Shine error: {e}")
    return jobs


def scrape_apsc_asc() -> list:
    """Scrape Assam PSC / government job portals"""
    jobs = []
    sources = [
        {
            "name": "APSC",
            "url": "https://apsc.nic.in/Advertisement.html",
            "base": "https://apsc.nic.in",
        },
        {
            "name": "Assam Govt Jobs",
            "url": "https://sebaonline.org/",
            "base": "https://sebaonline.org",
        },
    ]
    for src in sources:
        try:
            resp = requests.get(src["url"], headers=HEADERS, timeout=TIMEOUT)
            soup = BeautifulSoup(resp.text, "html.parser")
            links = soup.select("a[href]")
            for a in links[:30]:
                text = a.get_text(strip=True)
                href = a.get("href", "")
                if len(text) < 10 or len(text) > 200:
                    continue
                if any(w in text.lower() for w in ["advertisement", "recruitment", "vacancy", "notification", "post"]):
                    full_url = href if href.startswith("http") else src["base"] + "/" + href.lstrip("/")
                    jobs.append({
                        "id": make_id(text, src["name"], src["name"]),
                        "title": text[:120],
                        "company": src["name"],
                        "location": "Assam",
                        "source": src["name"],
                        "url": full_url,
                        "description": "Government / PSC Notification",
                        "posted": datetime.now(timezone.utc).isoformat(),
                        "scraped_at": datetime.now(timezone.utc).isoformat(),
                        "tags": ["Government", "PSC"],
                    })
            print(f"  {src['name']}: found {len(jobs)} notices so far")
        except Exception as e:
            print(f"  {src['name']} error: {e}")
        time.sleep(1)
    return jobs


def scrape_internshala() -> list:
    """Scrape Internshala for Guwahati internships/jobs"""
    jobs = []
    url = "https://internshala.com/jobs/jobs-in-guwahati"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        soup = BeautifulSoup(resp.text, "html.parser")
        cards = soup.select(".internship_meta, [class*='individual_internship']")
        for card in cards[:20]:
            title_el = card.select_one(".job-title-href, h3, [class*='title']")
            company_el = card.select_one(".company-name, [class*='company']")
            link_el = card.select_one("a[href*='internshala.com']") or card.select_one("a[href]")
            if not title_el:
                continue
            title = title_el.get_text(strip=True)
            company = company_el.get_text(strip=True) if company_el else "Unknown"
            link = link_el.get("href", url) if link_el else url
            jobs.append({
                "id": make_id(title, company, "Internshala"),
                "title": title,
                "company": company,
                "location": "Guwahati, Assam",
                "source": "Internshala",
                "url": link if link.startswith("http") else f"https://internshala.com{link}",
                "description": "",
                "posted": datetime.now(timezone.utc).isoformat(),
                "scraped_at": datetime.now(timezone.utc).isoformat(),
                "tags": ["Internship"],
            })
        print(f"  Internshala: {len(cards)} cards")
    except Exception as e:
        print(f"  Internshala error: {e}")
    return jobs


# ─── Tag Extractor ────────────────────────────────────────────────────────────

TAG_KEYWORDS = {
    "Remote": ["remote", "work from home", "wfh"],
    "Full-time": ["full time", "full-time"],
    "Part-time": ["part time", "part-time"],
    "Internship": ["intern", "internship", "trainee"],
    "Fresher": ["fresher", "0-1 year", "entry level"],
    "IT/Tech": ["software", "developer", "engineer", "python", "java", "data"],
    "Finance": ["finance", "accountant", "ca ", "banking"],
    "Healthcare": ["doctor", "nurse", "hospital", "medical", "pharma"],
    "Sales": ["sales", "business development", "marketing"],
    "Government": ["government", "psc", "upsc", "ssc", "railway"],
}


def extract_tags(text: str) -> list:
    text_lower = text.lower()
    return [tag for tag, kws in TAG_KEYWORDS.items() if any(k in text_lower for k in kws)]


# ─── Dedup ────────────────────────────────────────────────────────────────────

def deduplicate(jobs: list) -> list:
    seen = set()
    unique = []
    for j in jobs:
        if j["id"] not in seen:
            seen.add(j["id"])
            unique.append(j)
    return unique


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    print("🔍 Assam Jobs Scraper Starting…")
    print(f"   Time: {datetime.now(timezone.utc).isoformat()}\n")

    all_jobs = []

    print("📌 Scraping Indeed…")
    all_jobs.extend(scrape_indeed())

    print("📌 Scraping LinkedIn…")
    all_jobs.extend(scrape_linkedin_rss())

    print("📌 Scraping Naukri…")
    all_jobs.extend(scrape_naukri_rss())

    print("📌 Scraping Shine…")
    all_jobs.extend(scrape_shine())

    print("📌 Scraping Internshala…")
    all_jobs.extend(scrape_internshala())

    print("📌 Scraping Government Portals (APSC)…")
    all_jobs.extend(scrape_apsc_asc())

    # Enrich tags
    for j in all_jobs:
        if not j["tags"]:
            j["tags"] = extract_tags(j["title"] + " " + j.get("description", ""))

    unique_jobs = deduplicate(all_jobs)
    unique_jobs.sort(key=lambda x: x.get("posted", ""), reverse=True)

    print(f"\n📊 Total: {len(all_jobs)} scraped → {len(unique_jobs)} unique jobs")
    save_jobs(unique_jobs)


if __name__ == "__main__":
    main()
