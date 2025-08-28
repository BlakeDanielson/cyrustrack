# 🗺️ Add Your Mapbox Token

To enable the interactive session locations map, please add your Mapbox access token:

## Step 1: Create Environment File
Create a file named `.env.local` in the `tracker/` directory:

```bash
# In tracker/.env.local
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_actual_token_here
```

## Step 2: Replace with Your Token
Replace `pk.your_actual_token_here` with your actual Mapbox public token that you mentioned you already have.

## Step 3: Restart Dev Server
After adding the token, restart the development server:

```bash
cd tracker
npm run dev
```

## ✅ What Will Work Once Token is Added
- 🗺️ Interactive Mapbox Streets map 
- 📍 Clustered session markers
- 🖱️ Click markers to see session details
- 📏 Automatic zoom to fit all sessions
- 📱 Mobile-optimized touch interface

---

**Note**: The map components are already updated and ready - they just need your Mapbox token to display the beautiful interactive map!
