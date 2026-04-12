#!/usr/bin/env bash
set -euo pipefail

echo "Generating types from supabase..."
npx supabase gen types typescript
echo "Done."
