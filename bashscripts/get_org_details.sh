#!/bin/bash

# get_org_details.sh

BASE_URL="http://localhost:5000/api"

if [ $# -eq 0 ]; then
    echo "Usage: $0 <organisation_id>"
    echo "Example: $0 68e8b1ac24667b979607f55c"
    exit 1
fi

ORG_ID=$1

echo "🔍 Getting details for organisation: $ORG_ID"
echo "=========================================="

curl -s -X GET "$BASE_URL/organisations/admin/$ORG_ID" \
  -H "Content-Type: application/json" | python -m json.tool