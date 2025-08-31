# Vercel Blob Setup Guide

## Overview
This guide will help you set up Vercel Blob storage for the image upload functionality in your Cannabis Consumption Tracker.

## What is Vercel Blob?
Vercel Blob is a serverless storage solution that allows you to store files (like images) in the cloud. It's perfect for your use case because:
- **Global CDN**: Images load fast from anywhere in the world
- **Serverless**: No server management required
- **Cost-effective**: Pay only for what you use
- **Vercel Integration**: Seamless integration with your Vercel deployment

## Step 1: Get Your Vercel Blob Token

### Option A: Through Vercel Dashboard (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (cannabistracker)
3. Go to **Storage** tab
4. Click **Create Blob Store**
5. Give it a name (e.g., "cannabis-images")
6. Copy the **Read/Write Token**

### Option B: Through Vercel CLI
```bash
# Install Vercel CLI if you haven't already
npm i -g vercel

# Login to Vercel
vercel login

# Create a new Blob store
vercel blob create cannabis-images

# This will output your token
```

## Step 2: Update Environment Variables

### Local Development (.env file)
```bash
# Add this to your .env file
BLOB_READ_WRITE_TOKEN=your_actual_token_here
```

### Production (Vercel Dashboard)
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add:
   - **Name**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: Your token from Step 1
   - **Environment**: Production (and Preview if desired)

## Step 3: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to the consumption form
3. Try uploading an image
4. Check the browser console for any errors

## Step 4: Deploy to Production

1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Add image upload functionality"
   git push
   ```

2. Vercel will automatically deploy with your new environment variables

## Troubleshooting

### Common Issues

**"BLOB_READ_WRITE_TOKEN is not defined"**
- Make sure you've added the token to your .env file
- Restart your development server after adding the token

**"Upload failed" errors**
- Check that your token is correct
- Verify the token has read/write permissions
- Check the browser console for detailed error messages

**Images not displaying**
- Ensure the BLOB_READ_WRITE_TOKEN is set in production
- Check that images are being uploaded successfully
- Verify the blob URLs are accessible

### Getting Help

- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Vercel Support](https://vercel.com/support)
- Check the browser console for detailed error messages

## Cost Information

Vercel Blob pricing (as of 2024):
- **Storage**: $0.15/GB/month
- **Bandwidth**: $0.40/GB
- **Free Tier**: 1GB storage, 100GB bandwidth/month

For personal use, you'll likely stay within the free tier or pay less than $1/month.

## Security Notes

- Your BLOB_READ_WRITE_TOKEN should be kept secret
- Never commit it to version control
- The token allows full access to your blob store
- Consider using environment-specific tokens for different deployments

---

**Next Steps**: Once you have your token set up, test the image upload functionality and deploy to production!
