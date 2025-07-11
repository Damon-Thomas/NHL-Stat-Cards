# API Security Implementation

## Security Features Implemented

### 1. **Rate Limiting**

- **GET endpoints**: 60 requests per minute per IP
- **POST endpoints**: 30 requests per minute per IP
- **Database operations** (increment): 10 requests per minute per IP
- Rate limit information returned in headers (`X-RateLimit-*`)

### 2. **CORS Protection**

- Configurable allowed origins
- Automatic detection of Vercel deployment URLs
- Support for local development environments
- Proper preflight handling

### 3. **Input Validation**

- Team ID format validation (3 uppercase letters)
- URL whitelist for image proxy (only NHL assets)
- Request method validation
- Parameter type checking

### 4. **Security Headers**

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- Proper cache control headers

### 5. **Error Handling**

- No sensitive information disclosure
- Detailed logging for debugging (server-side only)
- Consistent error response format
- Timestamp tracking for incidents

### 6. **Origin Validation**

- Required for database operations
- Optional for read-only operations
- Supports both `Origin` and `Referer` headers
- Allows server-to-server requests

## Configuration

### Environment Variables

```bash
# Required
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Optional (for production CORS)
PRODUCTION_URL=https://your-domain.com
```

### Rate Limit Configuration

You can modify rate limits in `/api/utils/security.ts`:

```typescript
const RATE_LIMITS = {
  GET: { requests: 60, window: 60 }, // 60/minute
  POST: { requests: 30, window: 60 }, // 30/minute
  INCREMENT: { requests: 10, window: 60 }, // 10/minute
};
```

### CORS Configuration

Update allowed origins in `/api/utils/security.ts`:

```typescript
const ALLOWED_ORIGINS = [
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  process.env.PRODUCTION_URL || null,
  "http://localhost:3000",
  "http://localhost:5173",
  // Add your domains here
].filter(Boolean) as string[];
```

## API Endpoint Security

### Public Endpoints (No origin check required)

- `/api/image-proxy` - Image proxy for NHL assets

### Protected Endpoints (Origin check required)

- `/api/get-teams` - Fetch NHL teams
- `/api/get-roster` - Fetch team rosters
- `/api/get-count` - Get card count
- `/api/increment` - Increment card count

## Response Headers

All API responses include:

- Rate limiting headers
- CORS headers
- Security headers
- Cache control headers

## Error Responses

Standard error format:

```json
{
  "error": "Error message",
  "timestamp": "2025-07-10T12:00:00.000Z"
}
```

Rate limit exceeded:

```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

## Monitoring

### Rate Limiting

Rate limits are stored in Redis with automatic expiration. Monitor your Redis usage to track API abuse.

### Logging

All errors are logged server-side with full context while client responses contain minimal information.

## Security Best Practices

1. **Monitor rate limit usage** in your Redis dashboard
2. **Review CORS origins** regularly
3. **Check error logs** for suspicious activity
4. **Update allowed domains** when deploying to new environments
5. **Consider API keys** for additional security if needed

## Testing Security

Test rate limiting:

```bash
# This should eventually return 429 after 60 requests
for i in {1..70}; do curl -I your-domain.com/api/get-teams; done
```

Test CORS:

```bash
# Should be rejected if origin not allowed
curl -H "Origin: https://malicious-site.com" your-domain.com/api/get-teams
```
