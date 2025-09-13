# 🆓 Free Database Setup Guide for ANALYN Platform

## Quick Start Options

### Option 1: SQLite (Fastest - No Internet Required) ⚡

**Perfect for development and testing**

\`\`\`bash
# 1. Run the setup script
chmod +x setup-linux-free-db.sh
./setup-linux-free-db.sh

# 2. Setup SQLite database
npm run setup-sqlite

# 3. Start the application
npm run dev
\`\`\`

**✅ Ready in 2 minutes!**
- No account creation needed
- Works offline
- Perfect for development
- Database file: `./data/analyn.db`

---

### Option 2: Neon (Recommended for Production) 🟢

**Free PostgreSQL with 512MB storage**

#### Step 1: Create Neon Account
1. Go to [neon.tech](https://neon.tech)
2. Click "Sign Up" (no credit card required)
3. Sign up with GitHub/Google or email

#### Step 2: Create Database
1. Click "Create Project"
2. Choose region closest to you
3. Project name: `analyn-platform`
4. Database name: `analyn_db`
5. Click "Create Project"

#### Step 3: Get Connection String
1. In your project dashboard, click "Connection Details"
2. Copy the connection string (looks like):
   \`\`\`
   postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/analyn_db?sslmode=require
   \`\`\`

#### Step 4: Configure Environment
\`\`\`bash
# Edit .env.local
nano .env.local

# Replace the DATABASE_URL line with your Neon connection string:
DATABASE_URL="postgresql://your-username:your-password@ep-xxx.us-east-1.aws.neon.tech/analyn_db?sslmode=require"
\`\`\`

#### Step 5: Setup Database
\`\`\`bash
# Run database setup
npm run setup-db

# Start application
npm run dev
\`\`\`

**Neon Free Tier Limits:**
- ✅ 512MB storage
- ✅ 1 database
- ✅ No time limit
- ✅ No credit card required

---

### Option 3: Supabase (PostgreSQL + Extra Features) 🟡

**Free PostgreSQL with auth, storage, and real-time features**

#### Step 1: Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub/Google or email

#### Step 2: Create Project
1. Click "New Project"
2. Organization: Create new or use existing
3. Project name: `analyn-platform`
4. Database password: Create strong password
5. Region: Choose closest to you
6. Click "Create new project"

#### Step 3: Get Connection String
1. Go to Settings → Database
2. Scroll to "Connection string"
3. Copy the URI (replace [YOUR-PASSWORD]):
   \`\`\`
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   \`\`\`

#### Step 4: Configure Environment
\`\`\`bash
# Edit .env.local
nano .env.local

# Replace DATABASE_URL with your Supabase connection string:
DATABASE_URL="postgresql://postgres:your-password@db.xxx.supabase.co:5432/postgres"
\`\`\`

#### Step 5: Setup Database
\`\`\`bash
# Run database setup
npm run setup-db

# Start application
npm run dev
\`\`\`

**Supabase Free Tier Limits:**
- ✅ 500MB database storage
- ✅ 1GB file storage
- ✅ 50MB file uploads
- ✅ No credit card required
- ✅ Additional features: Auth, Storage, Edge Functions

---

## Database Comparison

| Feature | SQLite | Neon | Supabase |
|---------|--------|------|----------|
| **Setup Time** | 2 minutes | 5 minutes | 5 minutes |
| **Internet Required** | No | Yes | Yes |
| **Storage** | Unlimited* | 512MB | 500MB |
| **Concurrent Users** | Limited | High | High |
| **Backup** | Manual | Automatic | Automatic |
| **Production Ready** | No | Yes | Yes |
| **Extra Features** | None | None | Auth, Storage, Real-time |
| **Best For** | Development | Production | Full-stack apps |

*Limited by disk space

---

## Testing Your Setup

### 1. Verify Database Connection
\`\`\`bash
# Check if database is working
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "role": "client"
  }'
\`\`\`

### 2. Test Login
\`\`\`bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
\`\`\`

### 3. Browse Therapists
Open: http://localhost:3000/therapists

---

## Pre-created Test Accounts

**For SQLite setup, these accounts are automatically created:**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@analyn.com | password123 |
| Therapist | maria.santos@analyn.com | password123 |
| Therapist | john.dela.cruz@analyn.com | password123 |
| Therapist | anna.reyes@analyn.com | password123 |

---

## Troubleshooting

### SQLite Issues
\`\`\`bash
# Check if database file exists
ls -la data/analyn.db

# Recreate database
rm data/analyn.db
npm run setup-sqlite
\`\`\`

### Neon Connection Issues
\`\`\`bash
# Test connection string
node -e "
const { neon } = require('@neondatabase/serverless');
const sql = neon('YOUR_CONNECTION_STRING');
sql\`SELECT version()\`.then(console.log).catch(console.error);
"
\`\`\`

### Supabase Connection Issues
\`\`\`bash
# Verify connection string format
echo $DATABASE_URL

# Should start with: postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
\`\`\`

### General Database Issues
\`\`\`bash
# Check environment variables
cat .env.local

# Restart development server
npm run dev
\`\`\`

---

## Migration Between Databases

### From SQLite to Neon/Supabase
\`\`\`bash
# 1. Export SQLite data
sqlite3 data/analyn.db .dump > backup.sql

# 2. Update .env.local with new DATABASE_URL
# 3. Run setup for new database
npm run setup-db

# 4. Import data (manual process - contact support if needed)
\`\`\`

---

## Production Deployment

### For Neon
\`\`\`bash
# Set environment variable in production
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/analyn_db?sslmode=require"
\`\`\`

### For Supabase
\`\`\`bash
# Set environment variable in production
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
\`\`\`

### For SQLite (Not Recommended for Production)
\`\`\`bash
# Copy database file to production server
scp data/analyn.db user@server:/path/to/app/data/
\`\`\`

---

## 🎉 You're All Set!

Choose the option that works best for you:

- **🚀 Quick Development**: Use SQLite
- **🌐 Production Ready**: Use Neon
- **🔧 Full Features**: Use Supabase

All options are completely free and will get your ANALYN platform running immediately!
