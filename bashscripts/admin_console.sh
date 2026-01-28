#!/bin/bash

# admin_console.sh

BASE_URL="http://localhost:5000/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏢 Organisation & ROE Admin Console (No Auth Required)${NC}"
echo "=================================================="

while true; do
    echo -e "\n${YELLOW}Choose an option:${NC}"
    echo "1) List all organisations"
    echo "2) Get organisation details"
    echo "3) Approve organisation"
    echo "4) Reject organisation"
    echo "5) Flag ROE for audit"
    echo "6) Accept ROE submission"
    echo "7) Exit"
    read -p "Enter choice (1-7): " choice

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
            read -p "Enter ROE ID to flag for audit: " roe_id
            echo -e "\n${YELLOW}🚩 Flagging ROE for audit...${NC}"
            curl -s -X PATCH "$BASE_URL/roe/admin/$roe_id/flag-for-audit" \
              -H "Content-Type: application/json" | python -m json.tool
            ;;
        6)
            read -p "Enter ROE ID to accept submission: " roe_id
            echo -e "\n${GREEN}✅ Accepting ROE submission...${NC}"
            curl -s -X PATCH "$BASE_URL/roe/admin/$roe_id/accept-submission" \
              -H "Content-Type: application/json" | python -m json.tool
            ;;
        7)
            echo -e "${GREEN}Goodbye! 👋${NC}"
            break
            ;;
        *)
            echo -e "${RED}Invalid choice! Please enter 1-7.${NC}"
            ;;
    esac
done
