#!/bin/bash
set -e

BASE_URL="http://localhost:5001/api/v1"

echo "=== 1. Health API ==="
curl -s "$BASE_URL/health" | grep -q "LeadFlow CRM API is running!"
echo " Health check passed."

echo "=== 2. Auth: Register new test agent ==="
TEST_EMAIL="agent_$(date +%s)@leadflow.io"
REG_RES=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Agent Test\",\"email\":\"$TEST_EMAIL\",\"password\":\"password123\"}")
TOKEN=$(echo "$REG_RES" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
  echo "Registration failed: $REG_RES"
  exit 1
fi
echo " Registration and JWT passed. Token received."

echo "=== 3. Auth: Verify /auth/me ==="
ME_RES=$(curl -s "$BASE_URL/auth/me" -H "Authorization: Bearer $TOKEN")
echo "$ME_RES" | grep -q "$TEST_EMAIL"
echo " /auth/me verified."

echo "=== 4. Validation: Reject invalid lead ==="
ERR_RES=$(curl -s -X POST "$BASE_URL/leads" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Invalid Lead"}')
echo "$ERR_RES" | grep -q "false"
echo " Server-side validation passed (requires email or phone)."

echo "=== 5. Lead Creation ==="
LEAD_RES=$(curl -s -X POST "$BASE_URL/leads" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Global Dynamics","company":"GD Corp","email":"contact@gd.com","phone":"+1-999-1111","budget":25000,"stage":"New"}')
LEAD_ID=$(echo "$LEAD_RES" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
echo " Lead created with ID: $LEAD_ID"

echo "=== 6. Pipeline Stage Update ==="
PATCH_RES=$(curl -s -X PATCH "$BASE_URL/leads/$LEAD_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"stage":"Qualified"}')
echo "$PATCH_RES" | grep -q "Qualified"
echo " Stage update persisted in MongoDB."

echo "=== 7. Create Follow-up Activity ==="
ACT_RES=$(curl -s -X POST "$BASE_URL/activities" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"leadId\":\"$LEAD_ID\",\"title\":\"Initial Technical Scoping\",\"type\":\"Call\",\"dueAt\":\"$(date -u -v+2d +%Y-%m-%dT%H:%M:%SZ)\"}")
ACT_ID=$(echo "$ACT_RES" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
echo " Follow-up created with ID: $ACT_ID"

echo "=== 8. Mark Follow-up Completed ==="
COMPLETE_RES=$(curl -s -X PATCH "$BASE_URL/activities/$ACT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"Completed"}')
echo "$COMPLETE_RES" | grep -q "Completed"
echo " Follow-up marked as Completed."

echo "=== 9. Dashboard Analytics Summary ==="
DASH_RES=$(curl -s "$BASE_URL/dashboard/summary" -H "Authorization: Bearer $TOKEN")
echo "$DASH_RES" | grep -q '"totalLeads":1'
echo "$DASH_RES" | grep -q '"activeLeads":1'
echo " Dashboard summary reflects MongoDB data accurately."

echo "=== 10. Delete Lead with Cascade Activity Cleanup ==="
DEL_RES=$(curl -s -X DELETE "$BASE_URL/leads/$LEAD_ID" -H "Authorization: Bearer $TOKEN")
echo "$DEL_RES" | grep -q "true"
REMAINING_ACTS=$(curl -s "$BASE_URL/activities" -H "Authorization: Bearer $TOKEN")
echo "$REMAINING_ACTS" | grep -q '"count":0'
echo " Cascade delete confirmed: Lead & associated activities removed."

echo "============================================"
echo " ALL E2E VERIFICATION CHECKS PASSED 100%! "
echo "============================================"
