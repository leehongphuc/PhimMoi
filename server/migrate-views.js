/**
 * Migration script to import views.json data into PostgreSQL
 * Run once to migrate existing view data
 */
const fs = require("fs");
const path = require("path");
const { pool, initDatabase } = require("./db");

async function migrateViews() {
    console.log("🔄 Starting view data migration...");

    const VIEWS_FILE = path.join(__dirname, "views.json");

    if (!fs.existsSync(VIEWS_FILE)) {
        console.log("ℹ️  No views.json file found, nothing to migrate");
        return;
    }

    try {
        // Read JSON file
        const viewsData = JSON.parse(fs.readFileSync(VIEWS_FILE, "utf-8"));
        const slugs = Object.keys(viewsData);

        if (slugs.length === 0) {
            console.log("ℹ️  views.json is empty, nothing to migrate");
            return;
        }

        console.log(`📊 Found ${slugs.length} movies to migrate`);

        // Initialize database
        await initDatabase();

        let migrated = 0;
        let errors = 0;

        // Insert each movie view record
        for (const slug of slugs) {
            const entry = viewsData[slug];
            try {
                await pool.query(
                    `INSERT INTO movie_views (slug, name, thumb, total_views, daily_views, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
           ON CONFLICT (slug) DO UPDATE SET
             total_views = GREATEST(movie_views.total_views, $4),
             name = COALESCE($2, movie_views.name),
             thumb = COALESCE($3, movie_views.thumb),
             daily_views = movie_views.daily_views || $5::jsonb`,
                    [
                        slug,
                        entry.name || null,
                        entry.thumb || null,
                        entry.total || 0,
                        JSON.stringify(entry.daily || {}),
                    ]
                );
                migrated++;
            } catch (err) {
                console.error(`❌ Error migrating ${slug}:`, err.message);
                errors++;
            }
        }

        console.log(`✅ Migration complete: ${migrated} movies migrated, ${errors} errors`);

        // Backup the JSON file
        const backupFile = path.join(__dirname, `views.json.backup-${Date.now()}`);
        fs.copyFileSync(VIEWS_FILE, backupFile);
        console.log(`💾 Backed up views.json to ${path.basename(backupFile)}`);

    } catch (err) {
        console.error("❌ Migration failed:", err.message);
        throw err;
    } finally {
        await pool.end();
    }
}

// Run migration
if (require.main === module) {
    migrateViews()
        .then(() => {
            console.log("🎉 Migration script finished");
            process.exit(0);
        })
        .catch((err) => {
            console.error("Fatal error:", err);
            process.exit(1);
        });
}

module.exports = { migrateViews };
