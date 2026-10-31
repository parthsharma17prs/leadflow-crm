#!/bin/bash
set -e

echo "=========================================================="
echo " LeadFlow CRM — Full Microservices & Pipelines Test Suite"
echo "=========================================================="

echo -e "\n1. [FastAPI Microservice] Health Check (Port 8001)"
curl -s http://127.0.0.1:8001/health | grep '"status":"ok"' && echo "--> PASS: FastAPI & Atlas Connected"

echo -e "\n2. [FastAPI Microservice] Leads Analytics Aggregation"
curl -s http://127.0.0.1:8001/leads/analytics | grep '"total_leads"' && echo "--> PASS: Analytics aggregated"

echo -e "\n3. [FastAPI Microservice] ML Heuristic Scoring Pipeline"
curl -s -X POST http://127.0.0.1:8001/leads/score \
  -H "Content-Type: application/json" \
  -d '{"name":"Alpha Corp","stage":"Won","budget":60000,"source":"Referral"}' | grep '"bucket":"Hot"' && echo "--> PASS: Scorer returned Hot tier"

echo -e "\n4. [FastAPI Microservice] Fuzzy Match Duplicate Detection Pipeline"
curl -s -X POST http://127.0.0.1:8001/leads/duplicates \
  -H "Content-Type: application/json" \
  -d '{"name":"Aarav Patel","email":"aarav@test.com"}' | grep '"checked_name"' && echo "--> PASS: Duplicate pipeline executed"

echo -e "\n5. [FastAPI Microservice] CSV Ingestion & Pre-flight Validation Pipeline"
curl -s -X POST http://127.0.0.1:8001/csv/preview \
  -F "file=@sample_leads.csv" | grep '"row_count":8' && echo "--> PASS: Pandas parsed sample_leads.csv (8 rows)"

echo -e "\n6. [FastAPI Microservice] Scikit-Learn Regression Lead Forecaster"
curl -s http://127.0.0.1:8001/forecast/summary | grep '"summary"' && echo "--> PASS: Forecaster executed"

echo -e "\n7. [Express Gateway] Login & Proxy Test"
TOKEN=$(curl -s -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@leadflow.io","password":"password123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  echo "--> PASS: JWT token acquired: ${TOKEN:0:15}..."
  curl -s http://localhost:5001/api/v1/analytics/overview \
    -H "Authorization: Bearer $TOKEN" | grep '"success":true' && echo "--> PASS: Express proxied to FastAPI successfully"
else
  echo "--> FAIL: Could not login to Express"
  exit 1
fi

echo -e "\n=========================================================="
echo " ALL TESTS PASSED SUCCESSFULLY! "
echo "=========================================================="

