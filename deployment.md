# Deployment Guide

This project is built with Next.js 14, TypeScript, Tailwind CSS, and pnpm. It uses the App Router and server-side features, so it must be deployed to a platform that supports Next.js applications.

## Prerequisites

- Node.js 18+ or Node.js 20+ (recommended)
- pnpm installed globally or via your package manager
- `pnpm install` run before building
- Environment variables configured in `.env.local` or the hosting platform settings

## Common Scripts

```bash
pnpm install
pnpm build
pnpm start
```

For development:

```bash
pnpm dev
```

## Environment Variables

If your app requires API keys or service credentials, store them in `.env.local` during development and in the host’s environment configuration for production.

Example:

```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
# Add any other required keys here
```

> The project does not include a committed `.env.local` file. Do not commit secret values.

---

## Vercel Deployment

Vercel is the recommended platform for Next.js apps and works seamlessly with this repository.

### 1. Connect the repository

- Sign in to Vercel.
- Import the repository from GitHub, GitLab, or Bitbucket.
- Select the `main` branch or the branch you want to deploy.

### 2. Configure settings

Vercel usually detects Next.js automatically, but verify the following:

- Framework Preset: `Next.js`
- Build Command: `pnpm build`
- Install Command: `pnpm install`
- Output Directory: leave blank (Vercel uses the default Next.js build output)

> Note: Vercel detects the package manager from lockfiles. If you use `pnpm`, keep `pnpm-lock.yaml` in the repo and remove `package-lock.json` to ensure Vercel installs with pnpm.

### 3. Set environment variables

In the Vercel dashboard, add any required environment variables under "Environment Variables".

- `NEXT_PUBLIC_...` variables are exposed to the browser.
- Server-only variables can be named normally.

### 4. Deploy

- Click `Deploy`.
- Vercel will run `pnpm install` and `pnpm build` automatically.
- The site will be available at a Vercel-generated domain or your custom domain.

### 5. Custom domain

- Add a custom domain in Vercel.
- Update DNS records as directed by Vercel.
- Enable HTTPS automatically.

---

## Deploying with Docker

If you want a container-based deployment, use Docker.

### Dockerfile example

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=base /app .

ENV NODE_ENV=production
EXPOSE 3000
CMD ["pnpm", "start"]
```

### Build and run locally

```bash
docker build -t qaudquan-app .
docker run -p 3000:3000 qaudquan-app
```

### Notes

- Use `pnpm start` in production mode.
- Ensure env variables are provided to the container at runtime.

---

## Deploying to Node.js Hosts

This repository can be deployed to any host that supports Node.js and Next.js server builds.

### Recommended hosts

- Vercel
- Render
- Railway
- Fly.io
- DigitalOcean App Platform
- AWS Elastic Beanstalk
- Google Cloud Run

### General steps

1. Push the repository to your Git remote.
2. Configure the host to run `pnpm install` and `pnpm build`.
3. Make sure the host uses Node.js 18+ or 20+.
4. Set environment variables in the host settings.
5. Start the app with `pnpm start`.

### Example: Render

- Connect the repo.
- Set the build command to `pnpm build`.
- Set the start command to `pnpm start`.
- Add environment variables in Render’s dashboard.

---

## Deploying with Cloudflare Pages / Static Export

This app is not a purely static site because it uses Next.js server-side features and API routes, so a static export is not recommended.

If you only need static pages and opt to use `next export`, be aware that App Router features and server components may not work correctly.

---

## Verifying Deployment

After deployment:

- Visit the deployed URL.
- Confirm the app loads without build errors.
- Verify key pages like the dashboard and API-powered routes load correctly.
- Check the browser console for missing env or runtime errors.

---

## Troubleshooting

- `pnpm build` fails: ensure `pnpm install` succeeded and Node version is compatible.
- Missing environment variables: add them to the host settings and redeploy.
- API or WebSocket errors: verify backend endpoints and any external service credentials.

## Additional Tips

- Keep the `packageManager` field in `package.json` as `pnpm@8.0.0`.
- Use `pnpm install --frozen-lockfile` in production to avoid dependency drift.
- Review logs from the hosting provider when deployment fails.

---

## Summary

- Best option: deploy to Vercel for first-class Next.js support.
- Alternative: use Docker or a Node.js host like Render, Railway, or Fly.io.
- Avoid pure static-only hosts unless you fully convert the app to static export.
- Always configure environment variables in production.
