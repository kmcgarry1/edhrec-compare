#!/bin/bash

# Create high priority issues
for file in docs/issues/high-priority/*.md; do
  title=$(head -1 "$file" | sed 's/# //')
  # Extract labels from file (second line)
  labels=$(sed -n '2p' "$file" | sed 's/**Labels:** //' | sed 's/`//g')
  
  gh issue create \
    --title "$title" \
    --body-file "$file" \
    --label "$labels"
done

# Create medium priority issues
for file in docs/issues/medium-priority/*.md; do
  title=$(head -1 "$file" | sed 's/# //')
  labels=$(sed -n '2p' "$file" | sed 's/**Labels:** //' | sed 's/`//g')
  
  gh issue create \
    --title "$title" \
    --body-file "$file" \
    --label "$labels"
done

# Create low priority issues
for file in docs/issues/low-priority/*.md; do
  title=$(head -1 "$file" | sed 's/# //')
  labels=$(sed -n '2p' "$file" | sed 's/**Labels:** //' | sed 's/`//g')
  
  gh issue create \
    --title "$title" \
    --body-file "$file" \
    --label "$labels"
done

echo "All issues created!"

