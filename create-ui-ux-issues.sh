#!/bin/bash

# Script to create GitHub issues from UI/UX design review
# Run this after authenticating with: gh auth login

set -e

echo "🎨 Creating UI/UX Design Review Issues..."
echo ""

# Function to create issue from markdown file
create_issue() {
  local file="$1"
  local priority="$2"
  
  # Extract title (first line, remove # )
  local title=$(head -1 "$file" | sed 's/^# //')
  
  # Create label string
  local labels="ui-ux,design,${priority}"
  
  echo "Creating issue: $title"
  
  # Create the issue
  gh issue create \
    --title "$title" \
    --body-file "$file" \
    --label "$labels" \
    --repo kmcgarry1/edhrec-compare
  
  echo "  ✓ Created"
  echo ""
}

# High priority issues
echo "📍 High Priority Issues"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
for file in docs/issues/high-priority/{10,11,12}-*.md; do
  if [ -f "$file" ]; then
    create_issue "$file" "high-priority"
  fi
done

# Medium priority issues
echo "📍 Medium Priority Issues"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
for file in docs/issues/medium-priority/{10,11,12}-*.md; do
  if [ -f "$file" ]; then
    create_issue "$file" "medium-priority"
  fi
done

# Low priority issues
echo "📍 Low Priority Issues"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
for file in docs/issues/low-priority/09-*.md; do
  if [ -f "$file" ]; then
    create_issue "$file" "low-priority"
  fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All UI/UX issues created successfully!"
echo ""
echo "View issues at: https://github.com/kmcgarry1/edhrec-compare/issues"
echo "Filter by label: ui-ux"
