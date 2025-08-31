# Deploying to Vercel

This guide will walk you through deploying your Cannabis Tracker application to Vercel.

## 1. Prerequisites

- You have a [Vercel](https://vercel.com/) account.
- You have pushed your project to a GitHub, GitLab, or Bitbucket repository.

## 2. Vercel Project Setup

1.  **New Project**: Go to your Vercel dashboard and click "Add New... > Project".
2.  **Import Repository**: Select your Git repository.
3.  **Configure Project**: Vercel will automatically detect that you're using Next.js.

## 3. Environment Variables

You need to add your `DATABASE_URL` to Vercel.

1.  In the "Configure Project" screen, go to the **Environment Variables** section.
2.  Add a new variable:
    - **Name**: `DATABASE_URL`
    - **Value**: Paste your Neon database connection string here.

## 4. Build and Deploy

1.  **Build Command**: Vercel's default build settings for Next.js are correct. You don't need to change anything.
2.  **Deploy**: Click the "Deploy" button. Vercel will build and deploy your application.

## 5. Initial Database Migration

After your first deployment, you need to sync your Prisma schema with your Neon database.

1.  **Install Vercel CLI**: If you don't have it, install the Vercel CLI:
    ```bash
    npm i -g vercel
    ```
2.  **Link Project**: Link your local project to your Vercel project:
    ```bash
    vercel link
    ```
3.  **Run `db:push`**: Use the Vercel CLI to run the `db:push` command in the remote environment:
    ```bash
    vercel run "npm run db:push"
    ```

    This will execute `prisma db push` on Vercel and set up your database schema.

## 6. Future Migrations

For future schema changes, `prisma db push` is not always safe as it can cause data loss. For production, you should use `prisma migrate deploy`.

I have updated the `package.json` with a `db:push` script that you can use for this. I recommend reading the Prisma documentation on production migrations to understand the process fully.
