#!/usr/bin/env bash
set -euo pipefail

echo "Pushing migrations to Supabase..."
npx supabase db push
echo "Done."
