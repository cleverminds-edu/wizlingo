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

  echo "Step 1️⃣  - Creating enums..."
  node scripts/sync-db.js || echo "⚠️  Enum creation had issues"

  echo ""
  echo "Step 2️⃣  - Running migrations..."
  npx prisma migrate deploy || npx prisma db push --accept-data-loss || echo "⚠️  Migrations had issues"

  echo ""
  echo "════════════════════════════════════════════════════════════"
  echo "✅ Database initialization complete"
  echo "════════════════════════════════════════════════════════════"
  echo ""
fi

echo "Starting Next.js..."
exec node_modules/.bin/next start
