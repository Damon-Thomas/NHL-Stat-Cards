#!/bin/bash
# Security testing script for NHL Stat Cards API

BASE_URL="${1:-http://localhost:3000}"
echo "Testing API security for: $BASE_URL"

echo "🔍 Testing Rate Limiting..."
echo "Sending 65 requests to test rate limiting (should fail after 60)..."
for i in {1..65}; do
  response=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/api/get-teams")
  if [ "$response" = "429" ]; then
    echo "✅ Rate limiting working - got 429 after $i requests"
    break
  fi
  if [ $i -eq 65 ]; then
    echo "❌ Rate limiting failed - no 429 response after 65 requests"
  fi
done

echo ""
echo "🔍 Testing CORS..."
response=$(curl -s -w "%{http_code}" -H "Origin: https://malicious-site.com" -o /dev/null "$BASE_URL/api/get-teams")
echo "Response from malicious origin: $response"

echo ""
echo "🔍 Testing Input Validation..."
response=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/api/get-roster?teamId=INVALID")
echo "Invalid teamId response: $response (should be 400)"

response=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/api/get-roster?teamId=<script>")
echo "XSS attempt response: $response (should be 400)"

echo ""
echo "🔍 Testing Image Proxy Security..."
response=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/api/image-proxy?url=https://malicious-site.com/image.jpg")
echo "Malicious URL proxy attempt: $response (should be 403)"

response=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/api/image-proxy?url=file:///etc/passwd")
echo "Local file access attempt: $response (should be 403)"

echo ""
echo "🔍 Testing HTTP Methods..."
response=$(curl -s -w "%{http_code}" -X DELETE -o /dev/null "$BASE_URL/api/get-teams")
echo "DELETE method response: $response (should be 405)"

response=$(curl -s -w "%{http_code}" -X PUT -o /dev/null "$BASE_URL/api/get-teams")
echo "PUT method response: $response (should be 405)"

echo ""
echo "✅ Security testing complete!"
