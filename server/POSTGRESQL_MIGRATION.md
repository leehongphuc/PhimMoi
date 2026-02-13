# PostgreSQL Migration Guide

## Prerequisites

Railway PostgreSQL service added to your project.

## Local Testing (Optional)

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Set DATABASE_URL** (from Railway dashboard):
   ```bash
   # Windows PowerShell
   $env:DATABASE_URL="postgresql://user:pass@host:port/database"
   
   # Mac/Linux
   export DATABASE_URL="postgresql://user:pass@host:port/database"
   ```

3. **Run migration** (if you have views.json):
   ```bash
   node migrate-views.js
   ```

4. **Test server:**
   ```bash
   npm run dev
   ```

## Production Deployment

### Step 1: Add PostgreSQL to Railway

1. Go to Railway Dashboard → Your Project
2. Click "New" → "Database" → "Add PostgreSQL"
3. Railway automatically injects `DATABASE_URL` environment variable

### Step 2: Deploy Code

```bash
git add .
git commit -m "Migrate view system to PostgreSQL"
git push origin main
```

Railway will:
- Auto-detect changes
- Install `pg` package
- Initialize database schema on startup
- Start using PostgreSQL for views

### Step 3: Migrate Existing Data (if needed)

If you have existing `views.json` with data:

**Option A: Run migration via Railway CLI**
```bash
railway run node migrate-views.js
```

**Option B: Manual SQL import**
Export views.json → import via Railway database console

### Step 4: Verify

Test these endpoints:
- `https://your-backend.railway.app/api/views`
- `https://your-backend.railway.app/api/views/some-movie-slug`

Check Railway logs for:
```
✅ Database initialized successfully
📊 Using PostgreSQL for view tracking
```

## Rollback (if needed)

If issues occur:
```bash
git revert HEAD
git push origin main
```

The `views.json` backup files are available for recovery.

## Notes

- Views persist across Railway redeploys
- No more data loss!
- Database queries are async and optimized
- Automatic schema creation on first run
