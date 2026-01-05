#!/bin/bash

# reject_org.sh

BASE_URL="http://localhost:5000/api"

if [ $# -eq 0 ]; then
    echo "Usage: $0 <organisation_id> <rejection_reason> [notes]"
    echo "Example: $0 68e8b1ac24667b979607f55c \"Missing documents\" \"Please upload CIPC certificate\""
    exit 1
fi

ORG_ID=$1
REJECTION_REASON=$2
NOTES=${3:-"Rejected via admin script"}

echo "❌ Rejecting organisation: $ORG_ID"
echo "Reason: $REJECTION_REASON"
echo "Notes: $NOTES"
echo "=========================================="

curl -s -X PATCH "$BASE_URL/organisations/admin/$ORG_ID/reject" \
  -H "Content-Type: application/json" \
  -d "{
    \"rejectionReason\": \"$REJECTION_REASON\",
    \"notes\": \"$NOTES\"
  }" | python -m json.tool