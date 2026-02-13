const { Pool } = require("pg");

// PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Initialize database table
async function initDatabase() {
    const client = await pool.connect();
    try {
        await client.query(`
      CREATE TABLE IF NOT EXISTS movie_views (
        slug VARCHAR(255) PRIMARY KEY,
        name VARCHAR(500),
        thumb VARCHAR(500),
        total_views INTEGER DEFAULT 0,
        daily_views JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_total_views ON movie_views(total_views DESC);
    `);
        console.log("✅ Database initialized successfully");
    } catch (err) {
        console.error("❌ Database initialization error:", err.message);
        throw err;
    } finally {
        client.release();
    }
}

// Get view count for a specific movie
async function getViewCount(slug) {
    try {
        const result = await pool.query(
            "SELECT total_views FROM movie_views WHERE slug = $1",
            [slug]
        );
        return result.rows[0]?.total_views || 0;
    } catch (err) {
        console.error(`Error getting view count for ${slug}:`, err.message);
        return 0;
    }
}

// Increment view count for a movie
async function incrementView(slug, name, thumb) {
    const dateKey = getDateKey();
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Upsert movie view record
        const result = await client.query(
            `INSERT INTO movie_views (slug, name, thumb, total_views, daily_views, updated_at)
       VALUES ($1, $2, $3, 1, jsonb_build_object($4, 1), NOW())
       ON CONFLICT (slug)
       DO UPDATE SET
         total_views = movie_views.total_views + 1,
         daily_views = jsonb_set(
           movie_views.daily_views,
           ARRAY[$4],
           (COALESCE(movie_views.daily_views->>$4, '0')::int + 1)::text::jsonb
         ),
         name = COALESCE($2, movie_views.name),
         thumb = COALESCE($3, movie_views.thumb),
         updated_at = NOW()
       RETURNING total_views`,
            [slug, name, thumb, dateKey]
        );

        await client.query("COMMIT");
        return result.rows[0].total_views;
    } catch (err) {
        await client.query("ROLLBACK");
        console.error(`Error incrementing view for ${slug}:`, err.message);
        throw err;
    } finally {
        client.release();
    }
}

// Get top viewed movies
async function getTopViews(limit = 10, period = "all") {
    try {
        const daysMap = { day: 1, week: 7, month: 30, all: 0 };
        const days = daysMap[period] || 0;

        if (days === 0) {
            // All-time top views
            const result = await pool.query(
                `SELECT slug, name, thumb, total_views as views
         FROM movie_views
         ORDER BY total_views DESC
         LIMIT $1`,
                [limit]
            );
            return result.rows;
        } else {
            // Period-based views (calculate from daily_views JSONB)
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            const result = await pool.query(
                `SELECT slug, name, thumb, total_views,
         (
           SELECT COALESCE(SUM((value)::int), 0)
           FROM jsonb_each_text(daily_views)
           WHERE key >= $2
         ) as views
         FROM movie_views
         WHERE (
           SELECT COALESCE(SUM((value)::int), 0)
           FROM jsonb_each_text(daily_views)
           WHERE key >= $2
         ) > 0
         ORDER BY views DESC
         LIMIT $1`,
                [limit, cutoffDate.toISOString().split("T")[0]]
            );
            return result.rows;
        }
    } catch (err) {
        console.error("Error getting top views:", err.message);
        return [];
    }
}

// Helper: Get current date key (YYYY-MM-DD)
function getDateKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

module.exports = {
    pool,
    initDatabase,
    getViewCount,
    incrementView,
    getTopViews,
};
