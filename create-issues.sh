#!/bin/bash

# Script to create GitHub issues from markdown files in docs/issues/
# Requires: GitHub CLI (gh) installed and authenticated

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}Error: Not authenticated with GitHub CLI${NC}"
    echo "Run: gh auth login"
    exit 1
fi

echo -e "${GREEN}Creating GitHub issues from markdown files...${NC}\n"

# Function to extract title from markdown file
get_title() {
    local file=$1
    # Get first # heading
    grep -m 1 "^# " "$file" | sed 's/^# //'
}

# Function to create issue from markdown file
create_issue() {
    local file=$1
    local priority=$2
    
    local title=$(get_title "$file")
    local filename=$(basename "$file")
    
    echo -e "${YELLOW}Processing: $filename${NC}"
    echo "Title: $title"
    
    # Create labels based on priority
    local labels="ui-ux,design"
    case $priority in
        high)
            labels="$labels,high-priority"
            ;;
        medium)
            labels="$labels,medium-priority"
            ;;
        low)
            labels="$labels,low-priority"
            ;;
    esac
    
    # Create the issue
    if gh issue create \
        --title "$title" \
        --body-file "$file" \
        --label "$labels"; then
        echo -e "${GREEN}✓ Created issue: $title${NC}\n"
    else
        echo -e "${RED}✗ Failed to create issue: $title${NC}\n"
    fi
}

# Process high-priority issues
echo -e "${GREEN}=== High Priority Issues ===${NC}"
for file in docs/issues/high-priority/*.md; do
    if [ -f "$file" ]; then
        create_issue "$file" "high"
    fi
done

# Process medium-priority issues
echo -e "${GREEN}=== Medium Priority Issues ===${NC}"
for file in docs/issues/medium-priority/*.md; do
    if [ -f "$file" ]; then
        create_issue "$file" "medium"
    fi
done

# Process low-priority issues
echo -e "${GREEN}=== Low Priority Issues ===${NC}"
for file in docs/issues/low-priority/*.md; do
    if [ -f "$file" ]; then
        create_issue "$file" "low"
    fi
done

echo -e "${GREEN}Done! All issues created.${NC}"
echo -e "View issues at: $(gh repo view --json url -q .url)/issues"
