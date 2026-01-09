#!/bin/bash

curl -s -X PATCH "https://roeonline.chickenkiller.com//organisations/admin/695d07397919e951f1cef6d9/approve" \
  -H "Content-Type: application/json" \
  -d "{
    \"approvalNotes\": \"Whats wrong with you\"
  }" | python -m json.tool

