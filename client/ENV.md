# Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

## Development
For local development, use default value:
```
VITE_API_BASE_URL=/api
```

The Vite dev server will proxy `/api` to `http://localhost:5000` automatically.

## Production (Vercel)
Set in Vercel dashboard:
```
VITE_API_BASE_URL=https://your-backend.railway.app/api
```

Replace with your actual Railway backend URL.
