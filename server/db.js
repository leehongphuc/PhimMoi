const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
function initDatabase() {
    // Check for Firebase credentials
    const firebaseConfig = process.env.FIREBASE_CONFIG;

    if (firebaseConfig) {
        // Production: use JSON config from environment variable
        const serviceAccount = JSON.parse(firebaseConfig);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } else if (process.env.FIREBASE_PROJECT_ID) {
        // Alternative: use individual env vars
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
            }),
        });
    } else {
        throw new Error("No Firebase credentials found. Set FIREBASE_CONFIG or FIREBASE_PROJECT_ID env vars.");
    }

    console.log("✅ Firebase initialized successfully");
}

// Get Firestore instance
function getDb() {
    return admin.firestore();
}

// Get view count for a specific movie
async function getViewCount(slug) {
    try {
        const doc = await getDb().collection("movie_views").doc(slug).get();
        if (!doc.exists) return 0;
        return doc.data().total_views || 0;
    } catch (err) {
        console.error(`Error getting view count for ${slug}:`, err.message);
        return 0;
    }
}

// Increment view count for a movie
async function incrementView(slug, name, thumb) {
    const dateKey = getDateKey();
    const db = getDb();
    const docRef = db.collection("movie_views").doc(slug);

    try {
        const result = await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(docRef);

            if (!doc.exists) {
                // Create new record
                const newData = {
                    slug,
                    name: name || slug,
                    thumb: thumb || "",
                    total_views: 1,
                    daily_views: { [dateKey]: 1 },
                    created_at: admin.firestore.FieldValue.serverTimestamp(),
                    updated_at: admin.firestore.FieldValue.serverTimestamp(),
                };
                transaction.set(docRef, newData);
                return 1;
            } else {
                // Update existing
                const data = doc.data();
                const newTotal = (data.total_views || 0) + 1;
                const dailyViews = data.daily_views || {};
                dailyViews[dateKey] = (dailyViews[dateKey] || 0) + 1;

                const updateData = {
                    total_views: newTotal,
                    daily_views: dailyViews,
                    updated_at: admin.firestore.FieldValue.serverTimestamp(),
                };
                if (name) updateData.name = name;
                if (thumb) updateData.thumb = thumb;

                transaction.update(docRef, updateData);
                return newTotal;
            }
        });

        return result;
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
            // All-time top views - simple query
            const snapshot = await db
                .collection("movie_views")
                .orderBy("total_views", "desc")
                .limit(limit)
                .get();

            return snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    slug: doc.id,
                    name: data.name || doc.id,
                    thumb: data.thumb || "",
                    views: data.total_views || 0,
                };
            });
        } else {
            // Period-based: calculate from daily_views
            const daysMap = { day: 1, week: 7, month: 30 };
            const days = daysMap[period] || 1;

            // Get date keys for the period
            const dateKeys = [];
            for (let i = 0; i < days; i++) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                dateKeys.push(getDateKey(d));
            }

            // Fetch all documents (Firestore doesn't support computed field ordering)
            const snapshot = await db.collection("movie_views").get();

            const results = [];
            snapshot.docs.forEach((doc) => {
                const data = doc.data();
                const dailyViews = data.daily_views || {};
                let periodViews = 0;
                dateKeys.forEach((key) => {
                    periodViews += dailyViews[key] || 0;
                });

                if (periodViews > 0) {
                    results.push({
                        slug: doc.id,
                        name: data.name || doc.id,
                        thumb: data.thumb || "",
                        views: periodViews,
                    });
                }
            });

            // Sort by views descending and limit
            results.sort((a, b) => b.views - a.views);
            return results.slice(0, limit);
        }
    } catch (err) {
        console.error("Error getting top views:", err.message);
        return [];
    }
}

// Helper: Get date key (YYYY-MM-DD)
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
