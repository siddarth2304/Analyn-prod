#!/usr/bin/env bash
set -e

echo "=== ANALYN Linux Setup ==="

# Check deps
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Install from https://nodejs.org/"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required."
  exit 1
fi

# Install deps
echo "Installing dependencies..."
npm install

# Create .env.local if missing
if [ ! -f ".env.local" ]; then
  echo "Creating .env.local ..."
  JWT=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  cat > .env.local <<EOF
# Required
DATABASE_URL=
JWT_SECRET=$JWT

# Optional (enable real Stripe)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
EOF
  echo "Created .env.local. Please paste your DATABASE_URL (Neon) into it."
else
  echo ".env.local already exists."
fi

echo "If you haven't yet, create a free Neon Postgres and copy its connection string to DATABASE_URL."
echo "Docs: https://neon.tech"
echo
echo "Testing DB connectivity..."

node - <<'NODE'
import { neon } from "@neondatabase/serverless"
import fs from "fs"
const env = fs.readFileSync(".env.local", "utf8")
const dbUrl = (env.match(/DATABASE_URL=(.*)/) || [])[1]?.trim()
if (!dbUrl) {
  console.error("DATABASE_URL is not set in .env.local")
  process.exit(1)
}
const sql = neon(dbUrl)
async function run() {
  try {
    await sql`SELECT 1`
    console.log("✓ Database connection OK")
  } catch (e) {
    console.error("DB connection failed:", e.message || e)
    process.exit(1)
  }
}
run()
NODE

echo
echo "Setup complete."
echo "Start dev server: npm run dev"
