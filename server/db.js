const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
function initDatabase() {
    const firebaseConfig = process.env.FIREBASE_CONFIG;

    if (firebaseConfig) {
        const serviceAccount = JSON.parse(firebaseConfig);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`,
        });
    } else {
        throw new Error("FIREBASE_CONFIG environment variable not set.");
    }

    console.log("✅ Firebase Realtime Database initialized");
}

// Get database reference
function getDb() {
    return admin.database();
}

// Get view count for a specific movie
async function getViewCount(slug) {
    try {
        const snapshot = await getDb().ref(`movie_views/${slug}/total_views`).once("value");
        return snapshot.val() || 0;
    } catch (err) {
        console.error(`Error getting view count for ${slug}:`, err.message);
        return 0;
    }
}

// Increment view count for a movie
async function incrementView(slug, name, thumb) {
    const dateKey = getDateKey();
    const ref = getDb().ref(`movie_views/${slug}`);

    try {
        const result = await ref.transaction((current) => {
            if (!current) {
                return {
                    slug,
                    name: name || slug,
                    thumb: thumb || "",
                    total_views: 1,
                    daily_views: { [dateKey]: 1 },
                };
            }

            current.total_views = (current.total_views || 0) + 1;
            if (!current.daily_views) current.daily_views = {};
            current.daily_views[dateKey] = (current.daily_views[dateKey] || 0) + 1;
            if (name) current.name = name;
            if (thumb) current.thumb = thumb;

            return current;
        });

        return result.snapshot.val().total_views;
    } catch (err) {
        console.error(`Error incrementing view for ${slug}:`, err.message);
        throw err;
    }
}

// Get top viewed movies
async function getTopViews(limit = 10, period = "all") {
    try {
        const db = getDb();

        if (period === "all" || !period) {
            // All-time: query ordered by total_views
            const snapshot = await db
                .ref("movie_views")
                .orderByChild("total_views")
                .limitToLast(limit)
                .once("value");

            const results = [];
            snapshot.forEach((child) => {
                const data = child.val();
                results.push({
                    slug: child.key,
                    name: data.name || child.key,
                    thumb: data.thumb || "",
                    views: data.total_views || 0,
                });
            });

            // orderByChild is ascending, reverse for descending
            return results.reverse();
        } else {
            // Period-based: calculate from daily_views
            const daysMap = { day: 1, week: 7, month: 30 };
            const days = daysMap[period] || 1;

            const dateKeys = [];
            for (let i = 0; i < days; i++) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                dateKeys.push(getDateKey(d));
            }

            const snapshot = await db.ref("movie_views").once("value");
            const results = [];

            snapshot.forEach((child) => {
                const data = child.val();
                const dailyViews = data.daily_views || {};
                let periodViews = 0;
                dateKeys.forEach((key) => {
                    periodViews += dailyViews[key] || 0;
                });

                if (periodViews > 0) {
                    results.push({
                        slug: child.key,
                        name: data.name || child.key,
                        thumb: data.thumb || "",
                        views: periodViews,
                    });
                }
            });

            results.sort((a, b) => b.views - a.views);
            return results.slice(0, limit);
        }
    } catch (err) {
        console.error("Error getting top views:", err.message);
        return [];
    }
}

// Helper: Get date key
function getDateKey(date) {
    const d = date || new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

module.exports = {
    initDatabase,
    getViewCount,
    incrementView,
    getTopViews,
};
