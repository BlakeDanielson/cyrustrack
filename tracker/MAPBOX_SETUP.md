# Mapbox Setup Instructions

To enable location autocomplete and mapping features, you'll need to set up a Mapbox access token.

## 1. Create a Mapbox Account

1. Go to [https://account.mapbox.com/](https://account.mapbox.com/)
2. Sign up for a free account (includes generous free tier)

## 2. Get Your Access Token

1. In your Mapbox account dashboard, go to "Access tokens"
2. Copy your "Default public token" or create a new one
3. The token should start with `pk.`

## 3. Add Token to Your Project

Create a `.env.local` file in your project root (`tracker/.env.local`) and add:

```bash
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
```

**Important:** Replace `your_mapbox_access_token_here` with your actual token from Mapbox.

## 4. Restart Your Development Server

After adding the token, restart your Next.js development server:

```bash
npm run dev
```

## Security Notes

- The `NEXT_PUBLIC_` prefix makes this token available in the browser
- This is safe because Mapbox public tokens are designed for client-side use
- You can restrict token usage by domain in your Mapbox account settings
- Free tier includes:
  - 50,000 map loads per month
  - 100,000 geocoding requests per month
  - 50,000 directions requests per month

## Features Enabled

With the Mapbox token configured, you'll get:
- ✅ Address autocomplete in location fields
- ✅ Automatic coordinate population
- ✅ Interactive session maps
- ✅ Location analytics and insights
