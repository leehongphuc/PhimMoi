const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { initDatabase, getViewCount, incrementView, getTopViews } = require("./db");

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

// --- PostgreSQL View Count System ---
// All view operations now use database instead of JSON file

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

app.get("/api/views/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;
    const views = await getViewCount(slug);
    res.json({ slug, views });
  } catch (err) {
    console.error("Error getting view count:", err.message);
    res.json({ slug: req.params.slug, views: 0 });
  }
});

app.post("/api/views/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;
    const { name, thumb } = req.body || {};
    const views = await incrementView(slug, name, thumb);
    res.json({ slug, views });
  } catch (err) {
    console.error("Error incrementing view:", err.message);
    res.status(500).json({ error: "Failed to increment view" });
  }
});

app.get("/api/views", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const period = req.query.period || "all";
    const topViews = await getTopViews(limit, period);
    res.json({ period, topViews });
  } catch (err) {
    console.error("Error getting top views:", err.message);
    res.json({ period: req.query.period || "all", topViews: [] });
  }
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

// Initialize database and start server
(async () => {
  try {
    if (process.env.DATABASE_URL) {
      await initDatabase();
      console.log("📊 Using PostgreSQL for view tracking");
    } else {
      console.warn("⚠️  DATABASE_URL not set - view tracking disabled");
    }
  } catch (err) {
    console.error("Failed to initialize database:", err.message);
  }

  app.listen(PORT, () => {
    console.log(`🎬 MotPhim API Proxy running at http://localhost:${PORT}`);
  });
})();
