# Railway Deployment Guide for AI Execution Dashboard

This document provides step-by-step instructions for deploying the AI Execution Dashboard to Railway with proper static asset handling and reliability guarantees.

## Prerequisites

Before deploying to Railway, ensure you have:

- A Railway account (sign up at https://railway.app)
- The Railway CLI installed (`npm install -g @railway/cli`) or GitHub integration enabled
- A project cloned from https://github.com/ascespade/ai-execution-dashboard-pro
- Your platform API URL and x-api-key (see Configuration section)

## Quick Deploy (GitHub Integration)

The fastest way to deploy is using Railway's GitHub integration:

1. **Connect Repository**
   - Log in to Railway (https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `ascespade/ai-execution-dashboard-pro`

2. **Configure Environment Variables**
   In the Railway dashboard, go to your project's "Variables" tab and add:

   ```env
   # Required: Platform API Configuration
   NEXT_PUBLIC_API_URL=https://your-platform-api.railway.app

   # Optional: Asset CDN (if using external CDN)
   NEXT_PUBLIC_ASSET_PREFIX=https://your-cdn.com

   # Optional: Build ID for cache busting
   NEXT_PUBLIC_BUILD_ID=production-$(date +%Y%m%d)
   ```

3. **Deploy**
   - Railway will auto-detect the Dockerfile and begin building
   - Monitor the deployment logs for any errors
   - Once deployed, Railway will provide a URL (e.g., `https://your-project.up.railway.app`)

## Quick Deploy (CLI)

Alternatively, deploy using the Railway CLI:

```bash
# Login to Railway
railway login

# Initialize project (if not already linked)
railway init

# Deploy
railway up

# Open in browser
railway open
```

## Configuration

### Required Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Base URL of your AI Execution Platform API | `http://localhost:8000` | Yes |
| `NEXT_PUBLIC_ASSET_PREFIX` | CDN prefix for static assets | Empty | No |
| `NEXT_PUBLIC_BUILD_ID` | Unique build identifier for cache busting | Auto-generated | No |

### Platform API Authentication

The dashboard uses `x-api-key` authentication for the platform API. Configure this through the dashboard's Settings page after deployment, or set it via browser localStorage:

```javascript
// In browser console
localStorage.setItem('platform_api_key', 'your-api-key-here');
localStorage.setItem('platform_api_url', 'https://your-platform-api.railway.app');
```

### Railway-Specific Settings

**Port**: Railway automatically sets the `PORT` environment variable. The Dockerfile is configured to use this port.

**Health Check**: The Dockerfile includes a health check that hits the `/api/health` endpoint. Railway uses this to determine if the service is healthy.

**Start Command**: The Dockerfile uses `node server.js` to start the standalone Next.js server.

## Deployment Verification

After deployment, verify the following:

### 1. Health Check
```bash
curl https://your-app.up.railway.app/api/health
```
Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-27T09:00:00.000Z",
  "uptime": 123.45,
  "environment": "production"
}
```

### 2. Static Assets
```bash
curl -I https://your-app.up.railway.app/_next/static/css/app/layout.css
```
Expected: HTTP 200 with `Cache-Control: public, max-age=31536000, immutable`

### 3. Asset Check Endpoint
```bash
curl https://your-app.up.railway.app/api/asset-check
```
Expected: HTTP 200 with `{"status":"healthy",...}`

### 4. Dashboard UI
Open your Railway URL in a browser. You should see:
- The dashboard layout with sidebar and header
- Global status indicators (API connectivity, auth status)
- Dashboard cards with metrics
- Configuration drawer for API settings

## Troubleshooting

### Static Assets 404

If you see 404 errors for `/next/static/*` or `/_next/css/*`:

1. Verify the Dockerfile copied `.next/static` correctly:
   ```bash
   railway run ls -la .next/static/
   ```

2. Check that the build completed successfully in Railway logs

3. Verify `output: 'standalone'` is set in `next.config.js`

4. Ensure the `COPY --from=builder` commands in the Dockerfile reference the correct paths

### API Connectivity Issues

If the dashboard cannot connect to your platform API:

1. Verify `NEXT_PUBLIC_API_URL` is set correctly in Railway variables

2. Check CORS configuration on your platform API

3. Test API connectivity from within Railway:
   ```bash
   railway run curl -v https://your-platform-api.com/health
   ```

4. Verify x-api-key is configured in the dashboard Settings

### Build Failures

If the build fails:

1. Check Railway build logs for specific error messages

2. Verify Node.js version compatibility (this project requires Node 18+)

3. Ensure all dependencies are in `package.json` (no symlinks or local packages)

4. Check that TypeScript compilation passes locally:
   ```bash
   npm run type-check
   ```

### Memory Issues

If the build or runtime runs out of memory:

1. Increase Railway plan (higher plans have more memory)

2. Optimize Next.js config:
   ```javascript
   // next.config.js
   module.exports = {
     // ... other config
     experimental: {
       serverMinification: true,
     },
   }
   ```

## Production Checklist

Before going to production, verify:

- [ ] Health check endpoint returns HTTP 200
- [ ] Static assets load without 404s
- [ ] Platform API URL is configured correctly
- [ ] x-api-key authentication works
- [ ] Dashboard displays real data (not mock data)
- [ ] No console errors in browser DevTools
- [ ] Mobile layout works correctly
- [ ] Dark mode toggle works
- [ ] Offline detection shows proper message
- [ ] Error boundaries display diagnostic information

## Rollback Procedure

If a deployment causes issues:

1. **Via Railway Dashboard**
   - Go to your project in Railway
   - Click on the deployment you want to rollback from
   - Click "Redeploy" on the previous working deployment

2. **Via Railway CLI**
   ```bash
   # List deployments
   railway deployments

   # Rollback to specific deployment
   railway rollback <deployment-id>
   ```

## Monitoring

Railway provides built-in metrics including:

- CPU usage
- Memory usage
- Request count
- Response time
- Error rate

Access these from the Railway dashboard under your service's "Metrics" tab.

For custom monitoring, the `/api/health` endpoint exposes:
- Service uptime
- Memory usage
- Timestamp for freshness checks

## Support

For deployment issues:
1. Check Railway status page (https://status.railway.app)
2. Review Railway documentation (https://docs.railway.app)
3. Open a GitHub issue for dashboard-specific problems

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-27 | Initial deployment configuration |

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-12-27  
**Maintained By:** AI Execution Platform Team
