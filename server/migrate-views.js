/**
 * Migration script: Import views.json into Firebase Realtime Database
 */
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

async function main() {
    const configJson = process.env.FIREBASE_CONFIG;
    if (!configJson) {
        console.error("❌ FIREBASE_CONFIG not set!");
        process.exit(1);
    }

    const serviceAccount = JSON.parse(configJson);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`,
    });

    const db = admin.database();
    console.log("✅ Firebase connected");

    // Read views.json
    const viewsFile = path.join(__dirname, "views.json");
    const viewsData = JSON.parse(fs.readFileSync(viewsFile, "utf-8"));
    const slugs = Object.keys(viewsData);
    console.log(`📊 Found ${slugs.length} movies to migrate\n`);

    // Build data object for Realtime Database
    const dbData = {};

    for (const slug of slugs) {
        const entry = viewsData[slug];

        if (typeof entry === "number") {
            dbData[slug] = {
                slug,
                name: slug,
                thumb: "",
                total_views: entry,
                daily_views: {},
            };
        } else {
            dbData[slug] = {
                slug,
                name: entry.name || slug,
                thumb: entry.thumb || "",
                total_views: entry.total || 0,
                daily_views: entry.daily || {},
            };
        }

        console.log(`  ✅ ${dbData[slug].name} (${dbData[slug].total_views} views)`);
    }

    // Write all data at once
    await db.ref("movie_views").set(dbData);
    console.log(`\n🎉 Done! ${slugs.length} movies migrated to Realtime Database`);

    process.exit(0);
}

main().catch((err) => {
    console.error("Fatal:", err.message);
    process.exit(1);
});
