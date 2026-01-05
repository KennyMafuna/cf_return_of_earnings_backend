#!/bin/bash

# get_all_organisations.sh

BASE_URL="http://localhost:5000/api"

echo "📋 Fetching all organisations..."
echo "=========================================="

curl -s -X GET "$BASE_URL/organisations/admin/all" \
  -H "Content-Type: application/json" | python -m json.tool