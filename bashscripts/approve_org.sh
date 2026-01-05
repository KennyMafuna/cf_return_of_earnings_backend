#!/bin/bash

# approve_org.sh

BASE_URL="http://localhost:5000/api"

if [ $# -eq 0 ]; then
    echo "Usage: $0 <organisation_id> [approval_notes]"
    echo "Example: $0 68e8b1ac24667b979607f55c \"All documents verified\""
    exit 1
fi

ORG_ID=$1
APPROVAL_NOTES=${2:-"Approved via admin script"}

echo "✅ Approving organisation: $ORG_ID"
echo "Notes: $APPROVAL_NOTES"
echo "=========================================="

curl -s -X PATCH "$BASE_URL/organisations/admin/$ORG_ID/approve" \
  -H "Content-Type: application/json" \
  -d "{
    \"approvalNotes\": \"$APPROVAL_NOTES\"
  }" | python -m json.tool