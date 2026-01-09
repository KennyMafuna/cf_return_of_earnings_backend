#!/bin/bash

# admin_console.sh

BASE_URL="https://roeonline.chickenkiller.com/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏢 Organisation Admin Console (No Auth Required)${NC}"
echo "=================================================="

while true; do
    echo -e "\n${YELLOW}Choose an option:${NC}"
    echo "1) List all organisations"
    echo "2) Get organisation details"
    echo "3) Approve organisation"
    echo "4) Reject organisation"
    echo "5) Exit"
    read -p "Enter choice (1-5): " choice

    case $choice in
        1)
            echo -e "\n${BLUE}📋 All Organisations:${NC}"
            curl -s -X GET "$BASE_URL/organisations/admin/all" \
              -H "Content-Type: application/json" | python -m json.tool
            ;;
        2)
            read -p "Enter organisation ID: " org_id
            echo -e "\n${BLUE}🔍 Organisation Details:${NC}"
            curl -s -X GET "$BASE_URL/organisations/admin/$org_id" \
              -H "Content-Type: application/json" | python -m json.tool
            ;;
        3)
            read -p "Enter organisation ID to approve: " org_id
            read -p "Enter approval notes: " notes
            notes=${notes:-"Approved via admin console"}
            
            echo -e "\n${GREEN}✅ Approving organisation...${NC}"
            curl -s -X PATCH "$BASE_URL/organisations/admin/$org_id/approve" \
              -H "Content-Type: application/json" \
              -d "{\"approvalNotes\": \"$notes\"}" | python -m json.tool
            ;;
        4)
            read -p "Enter organisation ID to reject: " org_id
            read -p "Enter rejection reason: " reason
            read -p "Enter additional notes: " notes
            
            echo -e "\n${RED}❌ Rejecting organisation...${NC}"
            curl -s -X PATCH "$BASE_URL/organisations/admin/$org_id/reject" \
              -H "Content-Type: application/json" \
              -d "{\"rejectionReason\": \"$reason\", \"notes\": \"$notes\"}" | python -m json.tool
            ;;
        5)
            echo -e "${GREEN}Goodbye! 👋${NC}"
            break
            ;;
        *)
            echo -e "${RED}Invalid choice!${NC}"
            ;;
    esac
done
