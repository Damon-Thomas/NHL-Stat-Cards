# Security Configuration

## Environment Variables Required

### Production Environment Variables

```bash
# Upstash Redis (Required)
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Domain Configuration (Optional but recommended)
PRODUCTION_URL=https://your-domain.com
```

### Vercel Deployment

The following environment variables are automatically set by Vercel:

- `VERCEL_URL` - Automatically set to deployment URL
- `NODE_ENV` - Set to 'production' in production builds

## Security Features

### ✅ Implemented Security Measures

1. **Rate Limiting** (Redis-based)

   - GET requests: 60/minute per IP
   - POST requests: 30/minute per IP
   - Database operations: 10/minute per IP

2. **CORS Protection**

   - Environment-based origin allowlist
   - Development/production origin separation
   - Proper preflight handling

3. **Input Validation**

   - Team ID format validation (3 uppercase letters)
   - URL whitelist for image proxy (NHL assets only)
   - Content-type validation for images
   - URL hostname validation

4. **Security Headers**

   - X-Content-Type-Options: nosniff
   - X-Frame-Options: DENY
   - X-XSS-Protection: 1; mode=block
   - Referrer-Policy: strict-origin-when-cross-origin

5. **SSRF Protection**

   - Image proxy restricted to NHL assets domain
   - URL hostname validation
   - Content-type validation

6. **Error Handling**
   - No sensitive information disclosure
   - Consistent error response format
   - Detailed server-side logging

### ⚠️ Additional Recommendations

1. **Add Content Security Policy (CSP)**
2. **Implement API key authentication for sensitive operations**
3. **Add request logging for audit trails**
4. **Consider IP-based blocking for repeat offenders**
5. **Add health check endpoint**

## Monitoring

Monitor the following for security issues:

- Rate limit violations (429 responses)
- CORS violations (403 responses)
- Invalid input attempts (400 responses)
- Failed Redis operations
- Unusual traffic patterns
