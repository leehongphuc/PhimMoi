const express = require("express");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000; // Railway provides PORT via env
const OPHIM_BASE = "https://ophim1.com";
const DEFAULT_LIMIT = 25; // Items shown per page to user

// Enable CORS for all origins (production + dev)
app.use(cors());
app.use(express.json());

// Create reusable axios instance for OPhim API
const ophimApi = axios.create({
  baseURL: OPHIM_BASE,
  timeout: 15000,
  headers: { "User-Agent": "MotPhim/1.0" },
});

// --- View Count System ---
const VIEWS_FILE = path.join(__dirname, "views.json");

function loadViews() {
  try {
    if (fs.existsSync(VIEWS_FILE)) {
      return JSON.parse(fs.readFileSync(VIEWS_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("Error loading views:", err.message);
  }
  return {};
}

function saveViews(views) {
  try {
    fs.writeFileSync(VIEWS_FILE, JSON.stringify(views, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving views:", err.message);
  }
}

let viewsCache = loadViews();

setInterval(() => saveViews(viewsCache), 30000);
process.on("SIGINT", () => { saveViews(viewsCache); process.exit(); });

function getDateKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getViewsInRange(entry, days) {
  if (!entry || !entry.daily) return 0;
  const now = new Date();
  let total = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    total += entry.daily[key] || 0;
  }
  return total;
}

// Helper to format consistent response with custom totalPages logic
function formatResponse(res, data, page) {
  const items = data.data?.items || [];
  const pagination = data.data?.params?.pagination || {};
  const totalItems = pagination.totalItems || 0;
  const totalPages = Math.ceil(totalItems / DEFAULT_LIMIT);

  pagination.totalPages = totalPages > 0 ? totalPages : 1;
  pagination.pageRanges = pagination.totalPages;
  pagination.totalItemsPerPage = DEFAULT_LIMIT;
  pagination.currentPage = parseInt(page);

  res.json({
    status: true,
    data: {
      items,
      params: { pagination }
    }
  });
}

// --- API Routes ---

// Get newly updated movies
app.get("/api/movies", async (req, res) => {
  try {
    const page = req.query.page || 1;
    const { data } = await ophimApi.get(
      `/v1/api/danh-sach/phim-moi-cap-nhat?page=${page}&limit=${DEFAULT_LIMIT}`
    );
    formatResponse(res, data, page);
  } catch (err) {
    console.error("Error fetching movies:", err.message);
    res.status(500).json({ error: "Failed to fetch movies" });
  }
});

// --- View Count API ---

app.get("/api/views/:slug", (req, res) => {
  const slug = req.params.slug;
  const entry = viewsCache[slug];
  res.json({ slug, views: entry?.total || 0 });
});

app.post("/api/views/:slug", (req, res) => {
  const slug = req.params.slug;
  const dateKey = getDateKey();
  const { name, thumb } = req.body || {};

  if (!viewsCache[slug]) {
    viewsCache[slug] = { total: 0, daily: {} };
  }
  viewsCache[slug].total = (viewsCache[slug].total || 0) + 1;
  if (!viewsCache[slug].daily) viewsCache[slug].daily = {};
  viewsCache[slug].daily[dateKey] = (viewsCache[slug].daily[dateKey] || 0) + 1;

  if (name) viewsCache[slug].name = name;
  if (thumb) viewsCache[slug].thumb = thumb;

  res.json({ slug, views: viewsCache[slug].total });
});

app.get("/api/views", (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const period = req.query.period || "all";

  let daysMap = { day: 1, week: 7, month: 30, all: 0 };
  let days = daysMap[period] || 0;

  let sorted;
  if (days === 0) {
    sorted = Object.entries(viewsCache)
      .map(([slug, entry]) => ({
        slug, views: entry.total || 0, name: entry.name || slug, thumb: entry.thumb || "",
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  } else {
    sorted = Object.entries(viewsCache)
      .map(([slug, entry]) => ({
        slug, views: getViewsInRange(entry, days), name: entry.name || slug, thumb: entry.thumb || "",
      }))
      .filter((e) => e.views > 0)
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  }

  res.json({ period, topViews: sorted });
});

// Get movie detail + episodes
app.get("/api/movies/:slug", async (req, res) => {
  try {
    const { data } = await ophimApi.get(`/phim/${req.params.slug}`);
    res.json(data);
  } catch (err) {
    console.error("Error fetching movie detail:", err.message);
    res.status(500).json({ error: "Failed to fetch movie detail" });
  }
});

// Search movies
app.get("/api/search", async (req, res) => {
  try {
    const { keyword, page = 1 } = req.query;
    if (!keyword) return res.status(400).json({ error: "Keyword is required" });
    const { data } = await ophimApi.get(
      `/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}&limit=${DEFAULT_LIMIT}`
    );
    formatResponse(res, data, page);
  } catch (err) {
    console.error("Error searching movies:", err.message);
    res.status(500).json({ error: "Failed to search movies" });
  }
});

// Get categories
app.get("/api/categories", async (req, res) => {
  try {
    const { data } = await ophimApi.get("/v1/api/the-loai");
    res.json(data);
  } catch (err) {
    console.error("Error fetching categories:", err.message);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Get countries
app.get("/api/countries", async (req, res) => {
  try {
    const { data } = await ophimApi.get("/v1/api/quoc-gia");
    res.json(data);
  } catch (err) {
    console.error("Error fetching countries:", err.message);
    res.status(500).json({ error: "Failed to fetch countries" });
  }
});

// Get movies by category
app.get("/api/the-loai/:slug", async (req, res) => {
  try {
    const page = req.query.page || 1;
    const { data } = await ophimApi.get(
      `/v1/api/the-loai/${req.params.slug}?page=${page}&limit=${DEFAULT_LIMIT}`
    );
    formatResponse(res, data, page);
  } catch (err) {
    console.error("Error fetching by category:", err.message);
    res.status(500).json({ error: "Failed to fetch category movies" });
  }
});

// Get movies by country
app.get("/api/quoc-gia/:slug", async (req, res) => {
  try {
    const page = req.query.page || 1;
    const { data } = await ophimApi.get(
      `/v1/api/quoc-gia/${req.params.slug}?page=${page}&limit=${DEFAULT_LIMIT}`
    );
    formatResponse(res, data, page);
  } catch (err) {
    console.error("Error fetching by country:", err.message);
    res.status(500).json({ error: "Failed to fetch country movies" });
  }
});

// Get movies by year
app.get("/api/nam-phat-hanh/:year", async (req, res) => {
  try {
    const page = req.query.page || 1;
    const { data } = await ophimApi.get(
      `/v1/api/danh-sach/phim-moi-cap-nhat?year=${req.params.year}&page=${page}&limit=${DEFAULT_LIMIT}`
    );
    formatResponse(res, data, page);
  } catch (err) {
    console.error("Error fetching by year:", err.message);
    res.status(500).json({ error: "Failed to fetch year movies" });
  }
});

// ============================================================
// DISCOVER FILTER - with server-side cache for multi-filter
// ============================================================
// When multi-filtering, OPhim only supports 1 filter dimension.
// Strategy: Fetch many source pages, filter ALL items, cache results,
// then paginate from the cached filtered list.
// This guarantees: exact 25 items/page, accurate totalPages, 
// accurate totalItems count, and fast subsequent page loads.
// ============================================================

const discoverCache = new Map(); // key -> { items: [], timestamp: number }
const DISCOVER_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getDiscoverCacheKey(category, country, year) {
  return `${category || ""}|${country || ""}|${year || ""}`;
}

app.get("/api/discover", async (req, res) => {
  try {
    const { category, country, year, page = 1 } = req.query;
    const userPage = parseInt(page);
    let apiUrl = "/v1/api/danh-sach/phim-moi-cap-nhat";

    // Priority: Category > Year > Country
    if (category) {
      apiUrl = `/v1/api/the-loai/${category}`;
    } else if (year) {
      apiUrl = `/v1/api/nam-phat-hanh/${year}`;
    } else if (country) {
      apiUrl = `/v1/api/quoc-gia/${country}`;
    }

    // Check if we need client-side filtering
    const needsFiltering =
      (year && !apiUrl.includes("nam-phat-hanh")) ||
      (country && !apiUrl.includes("quoc-gia")) ||
      (category && !apiUrl.includes("the-loai"));

    if (!needsFiltering) {
      // --- SINGLE FILTER MODE: direct pass-through ---
      const { data } = await ophimApi.get(`${apiUrl}?page=${userPage}&limit=${DEFAULT_LIMIT}`);
      formatResponse(res, data, userPage);
      return;
    }

    // --- MULTI-FILTER MODE: cache-based approach ---
    const cacheKey = getDiscoverCacheKey(category, country, year);
    const cached = discoverCache.get(cacheKey);

    let filteredItems;

    if (cached && (Date.now() - cached.timestamp < DISCOVER_CACHE_TTL)) {
      // Use cached filtered results (instant!)
      filteredItems = cached.items;
    } else {
      // Fetch 10 source pages in parallel (1000 items)
      const SOURCE_LIMIT = 100;
      const MAX_SOURCE_PAGES = 10;

      const fetchPromises = [];
      for (let i = 1; i <= MAX_SOURCE_PAGES; i++) {
        fetchPromises.push(
          ophimApi.get(`${apiUrl}?page=${i}&limit=${SOURCE_LIMIT}`)
            .then(r => r.data?.data?.items || [])
            .catch(() => [])
        );
      }

      const allPages = await Promise.all(fetchPromises);
      let allItems = allPages.flat();

      // Apply all client-side filters
      if (year && !apiUrl.includes("nam-phat-hanh")) {
        allItems = allItems.filter(item => String(item.year) === String(year));
      }
      if (country && !apiUrl.includes("quoc-gia")) {
        allItems = allItems.filter(item => item.country?.some(c => c.slug === country));
      }
      if (category && !apiUrl.includes("the-loai")) {
        allItems = allItems.filter(item => item.category?.some(c => c.slug === category));
      }

      // Remove duplicates by slug
      const seen = new Set();
      allItems = allItems.filter(item => {
        if (!item.slug || seen.has(item.slug)) return false;
        seen.add(item.slug);
        return true;
      });

      // Cache the filtered results
      filteredItems = allItems;
      discoverCache.set(cacheKey, { items: filteredItems, timestamp: Date.now() });
      console.log(`🔍 Discover cache set: "${cacheKey}" → ${filteredItems.length} items`);
    }

    // Paginate from filtered list
    const startIndex = (userPage - 1) * DEFAULT_LIMIT;
    const pageItems = filteredItems.slice(startIndex, startIndex + DEFAULT_LIMIT);
    const totalPages = Math.ceil(filteredItems.length / DEFAULT_LIMIT);

    res.json({
      status: true,
      data: {
        items: pageItems,
        params: {
          pagination: {
            totalItems: filteredItems.length,
            totalPages: totalPages > 0 ? totalPages : 1,
            pageRanges: totalPages > 0 ? totalPages : 1,
            currentPage: userPage,
            totalItemsPerPage: DEFAULT_LIMIT,
          }
        }
      }
    });

  } catch (err) {
    console.error("Discover error:", err.message);
    res.json({ status: true, data: { items: [], params: { pagination: {} } } });
  }
});

app.listen(PORT, () => {
  console.log(`🎬 MotPhim API Proxy running at http://localhost:${PORT}`);
  console.log(`📊 View counter: ${Object.keys(viewsCache).length} movies tracked`);
});
