# FTracker v1.8.28 — Dynamic Index audit fixes

## Completed
- Custom body calculations use only records inside the selected evaluation window.
- Future training and nutrition records are excluded.
- `fScoreClamp()` rejects non-finite values and normalizes invalid bounds.
- Training frequency is scaled to the actual evaluation window rather than a fixed 13–17-session range.
- Removed the unused repetition-score calculation from the Dynamic Index aggregation.
- Added `audit-tests.js` with range and non-finite-value invariants.
- Synchronized version identifiers in the application release metadata, manifest and service worker to 1.8.28.

## Data rules
- Missing data remains unavailable and is not replaced with records outside the selected period.
- Nutrition days are aggregated by date; only recorded intake is scored, and no unrecorded meals are fabricated.

## Verification
- Run `node audit-tests.js` for scoring invariants.
- iOS PWA Safe Area, scrolling, modal layering and import/restore require device-level runtime testing.
