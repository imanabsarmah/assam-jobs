import React, { useState, useEffect, useMemo } from 'react';

// ── Styles ─────────────────────────────────────────────────────────────────
const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #07111f;
    --surface:   #0d1e30;
    --card:      #111f33;
    --card-hover:#162843;
    --border:    #1e3552;
    --accent:    #f97316;
    --accent2:   #38bdf8;
    --gold:      #fbbf24;
    --text:      #e2eaf4;
    --muted:     #7a9ab8;
    --green:     #34d399;
    --red:       #f87171;
    --purple:    #a78bfa;
    --radius:    12px;
    --radius-sm: 7px;
    --shadow:    0 4px 24px rgba(0,0,0,0.4);
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', sans-serif;
    min-height: 100vh;
    line-height: 1.6;
  }

  /* ── HEADER ── */
  .header {
    background: linear-gradient(135deg, #07111f 0%, #0f2340 50%, #07111f 100%);
    border-bottom: 1px solid var(--border);
    padding: 0 24px;
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(12px);
  }
  .header-inner {
    max-width: 1280px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 68px;
    gap: 16px;
  }
  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    flex-shrink: 0;
  }
  .logo-icon {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, var(--accent), var(--gold));
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }
  .logo-text {
    font-family: 'DM Serif Display', serif;
    font-size: 1.25rem;
    color: var(--text);
    line-height: 1;
  }
  .logo-sub {
    font-size: 0.65rem;
    color: var(--muted);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-family: 'Space Mono', monospace;
  }
  .header-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(52,211,153,0.1);
    border: 1px solid rgba(52,211,153,0.25);
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.72rem;
    color: var(--green);
    font-family: 'Space Mono', monospace;
    white-space: nowrap;
  }
  .dot-live {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--green);
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%,100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }

  /* ── HERO ── */
  .hero {
    background: linear-gradient(180deg, #0f2340 0%, var(--bg) 100%);
    padding: 56px 24px 48px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 60% 40% at 50% 0%, rgba(249,115,22,0.08) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-eyebrow {
    font-family: 'Space Mono', monospace;
    font-size: 0.72rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 14px;
  }
  .hero h1 {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(2rem, 5vw, 3.5rem);
    line-height: 1.1;
    margin-bottom: 16px;
    background: linear-gradient(135deg, #e2eaf4 30%, #f97316 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hero-sub {
    color: var(--muted);
    font-size: 1rem;
    max-width: 520px;
    margin: 0 auto 32px;
  }

  /* ── SEARCH BAR ── */
  .search-wrap {
    max-width: 640px;
    margin: 0 auto;
    position: relative;
  }
  .search-input {
    width: 100%;
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 40px;
    padding: 14px 56px 14px 20px;
    font-size: 0.95rem;
    color: var(--text);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    font-family: 'Inter', sans-serif;
  }
  .search-input::placeholder { color: var(--muted); }
  .search-input:focus {
    border-color: var(--accent2);
    box-shadow: 0 0 0 3px rgba(56,189,248,0.12);
  }
  .search-icon {
    position: absolute;
    right: 18px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--muted);
    font-size: 1.1rem;
    pointer-events: none;
  }

  /* ── STATS BAR ── */
  .stats-bar {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 14px 24px;
  }
  .stats-inner {
    max-width: 1280px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 24px;
    flex-wrap: wrap;
    justify-content: space-between;
  }
  .stat-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.83rem;
    color: var(--muted);
  }
  .stat-num {
    font-family: 'Space Mono', monospace;
    font-weight: 700;
    color: var(--accent);
    font-size: 1rem;
  }
  .last-update {
    font-family: 'Space Mono', monospace;
    font-size: 0.72rem;
    color: var(--muted);
  }

  /* ── MAIN LAYOUT ── */
  .main {
    max-width: 1280px;
    margin: 0 auto;
    padding: 28px 24px 60px;
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 28px;
  }
  @media (max-width: 768px) {
    .main { grid-template-columns: 1fr; }
    .sidebar { display: none; }
  }

  /* ── SIDEBAR / FILTERS ── */
  .sidebar {
    display: flex;
    flex-direction: column;
    gap: 16px;
    position: sticky;
    top: 88px;
    align-self: start;
  }
  .filter-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
  }
  .filter-title {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--muted);
    font-family: 'Space Mono', monospace;
    margin-bottom: 12px;
  }
  .filter-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    background: none;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    padding: 7px 10px;
    cursor: pointer;
    color: var(--text);
    font-size: 0.85rem;
    font-family: 'Inter', sans-serif;
    transition: all 0.15s;
    text-align: left;
    margin-bottom: 3px;
  }
  .filter-btn:hover {
    background: rgba(255,255,255,0.05);
    border-color: var(--border);
  }
  .filter-btn.active {
    background: rgba(249,115,22,0.12);
    border-color: rgba(249,115,22,0.35);
    color: var(--accent);
  }
  .filter-count {
    background: var(--surface);
    padding: 1px 7px;
    border-radius: 20px;
    font-size: 0.72rem;
    font-family: 'Space Mono', monospace;
    color: var(--muted);
  }
  .filter-btn.active .filter-count {
    background: rgba(249,115,22,0.2);
    color: var(--accent);
  }
  .clear-btn {
    width: 100%;
    background: none;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 8px;
    color: var(--muted);
    font-size: 0.8rem;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: all 0.15s;
    margin-top: 4px;
  }
  .clear-btn:hover { border-color: var(--accent); color: var(--accent); }

  /* ── JOB CARDS ── */
  .jobs-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 12px;
  }
  .jobs-count {
    font-family: 'Space Mono', monospace;
    font-size: 0.85rem;
    color: var(--muted);
  }
  .jobs-count span { color: var(--text); font-weight: 700; }
  .sort-select {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 6px 10px;
    color: var(--text);
    font-size: 0.83rem;
    outline: none;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
  }

  .job-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .job-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 18px 20px;
    cursor: pointer;
    transition: all 0.18s;
    position: relative;
    overflow: hidden;
    text-decoration: none;
    display: block;
    color: inherit;
  }
  .job-card:hover {
    background: var(--card-hover);
    border-color: rgba(56,189,248,0.3);
    transform: translateY(-2px);
    box-shadow: var(--shadow);
  }
  .job-card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: var(--accent);
    opacity: 0;
    transition: opacity 0.18s;
    border-radius: 3px 0 0 3px;
  }
  .job-card:hover::before { opacity: 1; }

  .job-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 6px;
  }
  .job-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text);
    line-height: 1.3;
  }
  .job-card:hover .job-title { color: var(--accent2); }
  .source-badge {
    flex-shrink: 0;
    font-family: 'Space Mono', monospace;
    font-size: 0.68rem;
    padding: 3px 8px;
    border-radius: 4px;
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--muted);
    white-space: nowrap;
  }
  .source-badge.linkedin { border-color: #0a66c2; color: #5ba4f5; background: rgba(10,102,194,0.1); }
  .source-badge.indeed { border-color: #2557a7; color: #7eb3f5; background: rgba(37,87,167,0.1); }
  .source-badge.naukri { border-color: #9b59b6; color: var(--purple); background: rgba(155,89,182,0.1); }
  .source-badge.apsc,
  .source-badge.government,
  .source-badge["assam-govt-jobs"] { border-color: var(--gold); color: var(--gold); background: rgba(251,191,36,0.1); }
  .source-badge.internshala { border-color: var(--green); color: var(--green); background: rgba(52,211,153,0.1); }
  .source-badge.shine { border-color: var(--accent); color: var(--accent); background: rgba(249,115,22,0.1); }

  .job-company {
    font-size: 0.88rem;
    color: var(--accent2);
    margin-bottom: 8px;
    font-weight: 500;
  }
  .job-meta {
    display: flex;
    gap: 16px;
    font-size: 0.8rem;
    color: var(--muted);
    flex-wrap: wrap;
    margin-bottom: 10px;
  }
  .job-meta-item { display: flex; align-items: center; gap: 4px; }
  .job-desc {
    font-size: 0.83rem;
    color: var(--muted);
    line-height: 1.5;
    margin-bottom: 10px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .tag-row { display: flex; gap: 6px; flex-wrap: wrap; }
  .tag {
    font-size: 0.7rem;
    padding: 2px 8px;
    border-radius: 20px;
    background: rgba(56,189,248,0.08);
    border: 1px solid rgba(56,189,248,0.2);
    color: var(--accent2);
    font-family: 'Space Mono', monospace;
  }
  .tag.government { background: rgba(251,191,36,0.08); border-color: rgba(251,191,36,0.2); color: var(--gold); }
  .tag.internship { background: rgba(52,211,153,0.08); border-color: rgba(52,211,153,0.2); color: var(--green); }

  /* ── EMPTY ── */
  .empty {
    text-align: center;
    padding: 60px 20px;
    color: var(--muted);
  }
  .empty-icon { font-size: 3rem; margin-bottom: 12px; }
  .empty h3 { font-family: 'DM Serif Display', serif; color: var(--text); margin-bottom: 8px; }

  /* ── LOADING ── */
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px;
    color: var(--muted);
    gap: 16px;
  }
  .spinner {
    width: 40px; height: 40px;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── FOOTER ── */
  .footer {
    border-top: 1px solid var(--border);
    padding: 24px;
    text-align: center;
    color: var(--muted);
    font-size: 0.8rem;
    font-family: 'Space Mono', monospace;
  }
  .footer a { color: var(--accent); text-decoration: none; }
  .footer a:hover { text-decoration: underline; }

  /* ── MOBILE FILTER ── */
  .mobile-filter-row {
    display: none;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }
  @media (max-width: 768px) {
    .mobile-filter-row { display: flex; }
    .hero { padding: 40px 16px 32px; }
    .main { padding: 20px 16px 40px; }
  }
  .chip {
    padding: 5px 12px;
    border-radius: 20px;
    border: 1px solid var(--border);
    background: var(--card);
    color: var(--muted);
    font-size: 0.78rem;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: all 0.15s;
    white-space: nowrap;
  }
  .chip.active {
    background: rgba(249,115,22,0.15);
    border-color: var(--accent);
    color: var(--accent);
  }

  /* ── PAGINATION ── */
  .pagination {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-top: 28px;
    flex-wrap: wrap;
  }
  .page-btn {
    width: 36px; height: 36px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--muted);
    font-size: 0.85rem;
    cursor: pointer;
    font-family: 'Space Mono', monospace;
    transition: all 0.15s;
    display: flex; align-items: center; justify-content: center;
  }
  .page-btn:hover { border-color: var(--accent); color: var(--accent); }
  .page-btn.active {
    background: var(--accent);
    border-color: var(--accent);
    color: white;
    font-weight: 700;
  }
  .page-btn:disabled { opacity: 0.35; cursor: default; }
`;

// ── Constants ────────────────────────────────────────────────────────────────
const SOURCE_COLORS = {
  LinkedIn: 'linkedin', Indeed: 'indeed', Naukri: 'naukri',
  APSC: 'apsc', 'Assam Govt Jobs': 'apsc', Internshala: 'internshala', Shine: 'shine',
};

const ALL_SOURCES = ['Indeed', 'LinkedIn', 'Naukri', 'Shine', 'Internshala', 'APSC'];
const ALL_TAGS = ['Remote', 'Full-time', 'Part-time', 'Internship', 'Fresher', 'IT/Tech', 'Finance', 'Healthcare', 'Sales', 'Government'];
const PAGE_SIZE = 15;

// ── Utils ────────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return 'Unknown';
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeSource, setActiveSource] = useState('All');
  const [activeTags, setActiveTags] = useState([]);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  useEffect(() => {
    // In GitHub Pages deployment, load from data/jobs.json
    // During local dev, use seed data
    const base = process.env.PUBLIC_URL || '';
    fetch(`${base}/data/jobs.json`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => {
        // Fallback seed
        setData({ jobs: [], last_updated: new Date().toISOString(), total: 0, sources: [] });
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    let jobs = [...data.jobs];

    if (search.trim()) {
      const q = search.toLowerCase();
      jobs = jobs.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        (j.description || '').toLowerCase().includes(q)
      );
    }
    if (activeSource !== 'All') {
      jobs = jobs.filter(j => j.source === activeSource);
    }
    if (activeTags.length > 0) {
      jobs = jobs.filter(j => activeTags.some(t => (j.tags || []).includes(t)));
    }
    if (sort === 'newest') jobs.sort((a, b) => new Date(b.posted) - new Date(a.posted));
    else if (sort === 'oldest') jobs.sort((a, b) => new Date(a.posted) - new Date(b.posted));
    else if (sort === 'az') jobs.sort((a, b) => a.title.localeCompare(b.title));

    return jobs;
  }, [data, search, activeSource, activeTags, sort]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const sourceCounts = useMemo(() => {
    if (!data) return {};
    const counts = { All: data.jobs.length };
    for (const j of data.jobs) {
      counts[j.source] = (counts[j.source] || 0) + 1;
    }
    return counts;
  }, [data]);

  const toggleTag = (tag) => {
    setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    setPage(1);
  };

  if (loading) {
    return (
      <>
        <style>{css}</style>
        <div className="loading">
          <div className="spinner" />
          <span>Loading Assam Jobs…</span>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>

      {/* ── HEADER ── */}
      <header className="header">
        <div className="header-inner">
          <a className="logo" href="/">
            <div className="logo-icon">🗺️</div>
            <div>
              <div className="logo-text">Assam Jobs</div>
              <div className="logo-sub">Guwahati · Northeast India</div>
            </div>
          </a>
          <div className="header-badge">
            <div className="dot-live" />
            Auto-updated every 6h
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-eyebrow">🔍 Live Job Listings</div>
        <h1>Jobs in Guwahati<br />& Assam</h1>
        <p className="hero-sub">
          Auto-scraped from Indeed, LinkedIn, Naukri, APSC & more — refreshed every 6 hours
        </p>
        <div className="search-wrap">
          <input
            className="search-input"
            type="text"
            placeholder="Search jobs, companies, skills…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          <span className="search-icon">🔎</span>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="stats-bar">
        <div className="stats-inner">
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div className="stat-item">
              <span className="stat-num">{data?.total || 0}</span> total listings
            </div>
            <div className="stat-item">
              <span className="stat-num">{(data?.sources || []).length}</span> sources
            </div>
            <div className="stat-item">
              <span className="stat-num">{filtered.length}</span> matching filters
            </div>
          </div>
          <div className="last-update">
            ⏱ Last updated: {data?.last_updated ? formatDate(data.last_updated) : 'Unknown'} IST
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <main className="main">

        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="filter-card">
            <div className="filter-title">📍 Source</div>
            {['All', ...ALL_SOURCES].map(src => (
              <button
                key={src}
                className={`filter-btn ${activeSource === src ? 'active' : ''}`}
                onClick={() => { setActiveSource(src); setPage(1); }}
              >
                {src}
                <span className="filter-count">{sourceCounts[src] || 0}</span>
              </button>
            ))}
          </div>

          <div className="filter-card">
            <div className="filter-title">🏷️ Tags</div>
            {ALL_TAGS.map(tag => (
              <button
                key={tag}
                className={`filter-btn ${activeTags.includes(tag) ? 'active' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
            {activeTags.length > 0 && (
              <button className="clear-btn" onClick={() => setActiveTags([])}>
                ✕ Clear tags
              </button>
            )}
          </div>
        </aside>

        {/* ── JOB LIST ── */}
        <div>
          {/* Mobile filter chips */}
          <div className="mobile-filter-row">
            {['All', ...ALL_SOURCES].map(src => (
              <button
                key={src}
                className={`chip ${activeSource === src ? 'active' : ''}`}
                onClick={() => { setActiveSource(src); setPage(1); }}
              >
                {src}
              </button>
            ))}
          </div>

          <div className="jobs-header">
            <div className="jobs-count">
              Showing <span>{paginated.length}</span> of <span>{filtered.length}</span> jobs
            </div>
            <select
              className="sort-select"
              value={sort}
              onChange={e => { setSort(e.target.value); setPage(1); }}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="az">A → Z</option>
            </select>
          </div>

          {paginated.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🔍</div>
              <h3>No jobs found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="job-grid">
              {paginated.map(job => (
                <a
                  key={job.id}
                  className="job-card"
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="job-top">
                    <div className="job-title">{job.title}</div>
                    <span className={`source-badge ${SOURCE_COLORS[job.source] || ''}`}>
                      {job.source}
                    </span>
                  </div>
                  <div className="job-company">{job.company}</div>
                  <div className="job-meta">
                    <span className="job-meta-item">📍 {job.location || 'Assam'}</span>
                    <span className="job-meta-item">🕐 {timeAgo(job.posted)}</span>
                  </div>
                  {job.description && (
                    <div className="job-desc">{job.description}</div>
                  )}
                  {job.tags && job.tags.length > 0 && (
                    <div className="tag-row">
                      {job.tags.map(tag => (
                        <span
                          key={tag}
                          className={`tag ${tag.toLowerCase()}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </a>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >‹</button>
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                let p;
                if (totalPages <= 7) p = i + 1;
                else if (page <= 4) p = i + 1;
                else if (page >= totalPages - 3) p = totalPages - 6 + i;
                else p = page - 3 + i;
                return (
                  <button
                    key={p}
                    className={`page-btn ${page === p ? 'active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                className="page-btn"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >›</button>
            </div>
          )}
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <p>
          🗺️ Assam Jobs — Auto-scraped every 6 hours from public job boards &nbsp;·&nbsp;{' '}
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">View on GitHub</a>
        </p>
        <p style={{ marginTop: 6, fontSize: '0.72rem' }}>
          Data sourced from Indeed, LinkedIn, Naukri, Shine, Internshala, APSC &amp; more.
          Always verify listings on the original site.
        </p>
      </footer>
    </>
  );
}
