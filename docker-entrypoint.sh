#!/bin/sh
set -e

echo ""
echo "════════════════════════════════════════════════════════════"
echo "🚀 WizLingo Production Initialization"
echo "════════════════════════════════════════════════════════════"
echo ""

if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL not set, skipping migrations"
else
  echo "📍 Database: $(echo $DATABASE_URL | sed 's/:.*@/:***@/')"
  echo ""

  # Enums + `prisma migrate deploy`. If migrations fail, stop here: the app must not start on a
  # half-migrated database, and nothing may fall back to `prisma db push --accept-data-loss`
  # (it would drop production data). With `set -e` a failure exits this script, so the new
  # deployment fails and the previous one keeps serving.
  echo "Step 1️⃣  - Creating enums and running migrations..."
  node scripts/sync-db.js

  echo ""
  echo "════════════════════════════════════════════════════════════"
  echo "✅ Database initialization complete"
  echo "════════════════════════════════════════════════════════════"
  echo ""
fi

echo "Starting Next.js..."
exec node_modules/.bin/next start
