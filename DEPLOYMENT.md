# Deployment Guide

This guide covers different ways to deploy your Academic Paper Manager application.

## Local Development

1. **Clone and install:**
   ```bash
   git clone <your-repo-url>
   cd academic-paper-manager
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```
   The app will run on `http://localhost:5000`

## Local Production Build

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   ```

## Docker Deployment (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t academic-paper-manager .
docker run -p 5000:5000 academic-paper-manager
```

## Cloud Deployment Options

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel` in your project directory
3. Follow the prompts

### Netlify
1. Install Netlify CLI: `npm i -g netlify-cli`
2. Run: `netlify deploy` 
3. For production: `netlify deploy --prod`

### Railway
1. Connect your GitHub repository to Railway
2. Railway will automatically detect and deploy your app

### DigitalOcean App Platform
1. Connect your GitHub repository
2. Configure build settings:
   - Build command: `npm run build`
   - Run command: `npm start`

## Environment Variables

For production deployments, set these environment variables:

```env
NODE_ENV=production
PORT=5000
```

If using a database:
```env
DATABASE_URL=your_database_connection_string
```

## Database Setup (Optional)

To use PostgreSQL instead of in-memory storage:

1. **Install PostgreSQL driver:**
   ```bash
   npm install pg @types/pg
   ```

2. **Update storage implementation** in `server/storage.ts`

3. **Set DATABASE_URL** environment variable

## Performance Optimizations

For production deployments:

1. **Enable gzip compression** (most platforms do this automatically)
2. **Use a CDN** for static assets
3. **Configure caching headers** for static files
4. **Set up monitoring** and error tracking

## Security Considerations

1. **Use HTTPS** in production (most platforms provide this)
2. **Set secure headers** in your Express app
3. **Validate environment variables**
4. **Keep dependencies updated**

## Monitoring

Consider adding:
- Error tracking (e.g., Sentry)
- Performance monitoring
- Uptime monitoring
- Log aggregation