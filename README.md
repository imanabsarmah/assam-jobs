# 🗺️ Assam Jobs — Guwahati & Northeast India

> **Auto-updating job board** for Guwahati and Assam — scrapes Indeed, LinkedIn, Naukri, Shine, Internshala, APSC & more every 6 hours. Deployed free on GitHub Pages.

![Auto-Scrape](https://github.com/imanabsarmah/assam-jobs/actions/workflows/auto-scrape.yml/badge.svg)
![GitHub Pages](https://imanabsarmah.github.io/assam-jobs/)

---

## ✨ Features

- 🔍 **Auto-scrapes 6+ job sites** every 6 hours via GitHub Actions
- 🏛️ **Government jobs** from APSC, SEBA, and other Assam portals
- 🔎 **Search & filter** by source, tags (Remote, Fresher, IT, Govt…)
- 📱 **Mobile-friendly** dark UI
- 🆓 **100% free** — runs entirely on GitHub Actions + GitHub Pages
- 📦 **No backend needed** — all data stored as `data/jobs.json`

---

## 🚀 Quick Setup (5 minutes)

### 1. Fork / Clone this repo

```bash
git clone https://github.com/YOUR_USERNAME/assam-jobs.git
cd assam-jobs
```

### 2. Enable GitHub Pages

1. Go to your repo → **Settings** → **Pages**
2. Set **Source** to `gh-pages` branch
3. Save

### 3. Enable GitHub Actions

1. Go to **Actions** tab in your repo
2. Click **"I understand my workflows, go ahead and enable them"**

### 4. Run the first scrape manually

1. Go to **Actions** → **🔍 Auto-Scrape Assam Jobs**
2. Click **"Run workflow"** → **Run workflow**

That's it! Your site will be live at:
```
https://YOUR_USERNAME.github.io/assam-jobs
```

---

## 🔄 Auto-Update Schedule

The scraper runs automatically:

| Trigger | Schedule |
|---------|----------|
| ⏰ Scheduled | Every 6 hours (00:00, 06:00, 12:00, 18:00 UTC) |
| 🖱️ Manual | Any time via Actions tab |
| 📝 Code push | When `scraper/` files change |

---

## 🕷️ Sources Scraped

| Source | Type | Notes |
|--------|------|-------|
| **Indeed** | RSS Feed | No API key needed |
| **LinkedIn** | Web scrape | Public job listings |
| **Naukri** | Web scrape | Guwahati + Assam |
| **Shine** | Web scrape | Guwahati jobs |
| **Internshala** | Web scrape | Internships + fresher jobs |
| **APSC** | Web scrape | Assam Public Service Commission |
| **SEBA** | Web scrape | Assam government portal |

---

## 📁 Project Structure

```
assam-jobs/
├── .github/
│   └── workflows/
│       └── auto-scrape.yml     # GitHub Actions (runs every 6h)
├── scraper/
│   ├── scraper.py              # Main scraper (all sources)
│   └── requirements.txt        # Python deps
├── data/
│   └── jobs.json               # Auto-updated job data
├── web/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.js
│       └── App.js              # React job board UI
└── README.md
```

---

## 🛠️ Local Development

### Run the scraper locally

```bash
cd scraper
pip install -r requirements.txt
python scraper.py
# → updates data/jobs.json
```

### Run the web app locally

```bash
cd web
npm install
npm start
# → opens http://localhost:3000
```

### Build for production

```bash
cd web
npm run build
```

---

## ➕ Adding More Job Sources

Edit `scraper/scraper.py` and add a new function:

```python
def scrape_my_source() -> list:
    jobs = []
    url = "https://example.com/jobs?location=guwahati"
    resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
    soup = BeautifulSoup(resp.text, "html.parser")
    # ... parse and append to jobs ...
    return jobs

# Then call it in main():
all_jobs.extend(scrape_my_source())
```

---

## 📄 Data Format (`data/jobs.json`)

```json
{
  "jobs": [
    {
      "id": "abc123",
      "title": "Software Engineer",
      "company": "Assam Tech Pvt Ltd",
      "location": "Guwahati, Assam",
      "source": "LinkedIn",
      "url": "https://linkedin.com/jobs/...",
      "description": "Job description...",
      "posted": "2025-06-01T10:00:00+00:00",
      "scraped_at": "2025-06-01T12:00:00+00:00",
      "tags": ["Full-time", "IT/Tech"]
    }
  ],
  "last_updated": "2025-06-01T12:00:00+00:00",
  "total": 42,
  "sources": ["LinkedIn", "Indeed", "Naukri"]
}
```

---

## 🤝 Contributing

Pull requests welcome! Ideas:
- Add more Assam job portals
- Add email/Telegram notifications for new jobs
- Add salary filter
- Add job category icons

---

## ⚠️ Disclaimer

This project scrapes publicly available job listings for personal/educational use.
Always verify job listings on the original site before applying.
Job data may be incomplete or outdated — check the `last_updated` timestamp.

---

## 📜 License

MIT — free to use, modify, and deploy.
