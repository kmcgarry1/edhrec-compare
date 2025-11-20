# 📄 Document CSV format requirements and add validation

**Labels:** `documentation`, `medium-priority`, `feature`

## Problem
CSV upload accepts any CSV but:
- Format requirements unclear
- No validation of structure
- Users may upload wrong format
- Errors not descriptive

## Current State
- Code looks for 'name' column (case-insensitive)
- Falls back to first column if 'name' not found
- No validation of data format
- No user guidance

## Impact
- User confusion
- Silent failures
- Import errors
- Support burden

## Proposed Solution

### 1. Document CSV Format
Add to README and app UI:

**Required Columns:**
- `Name` (or `Card Name`) - Card name (required)

**Optional Columns:**
- `Quantity` - Number of copies
- `Foil` - Yes/No
- `Set` - Set code
- Any other columns (ignored)

**Example CSV:**
```csv
Name,Quantity,Foil,Set
Sol Ring,1,No,C21
Lightning Greaves,1,Yes,M19
```

### 2. Add CSV Validation
```typescript
// utils/csvValidator.ts
export interface CsvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateCsv(
  headers: string[],
  rows: string[][]
): CsvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for name column
  const hasNameColumn = headers.some(h => 
    h.toLowerCase().includes('name')
  );
  
  if (!hasNameColumn) {
    warnings.push('No "Name" column found. Using first column.');
  }
  
  // Check for empty rows
  const emptyRows = rows.filter(row => 
    row.every(cell => !cell.trim())
  );
  
  if (emptyRows.length > 0) {
    warnings.push(`Found ${emptyRows.length} empty rows`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
```

### 3. Add UI Feedback
Show validation results in upload modal:
- ✅ Valid: "Found 523 cards"
- ⚠️ Warning: "No Name column - using first column"
- ❌ Error: "Invalid CSV format"

### 4. Add CSV Template Download
Provide sample CSV users can download

## Success Criteria
- Clear CSV format documentation
- Validation provides helpful feedback
- Sample CSV available
- Edge cases handled gracefully
