# ANALYN Platform - Linux Setup Guide

## Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git** for version control
- **PostgreSQL database** (we recommend [Neon](https://neon.tech))

## Quick Setup

### 1. Extract and Navigate
\`\`\`bash
# Extract the downloaded zip file
unzip analyn-platform-v6.zip
cd analyn-platform

# Make setup script executable and run it
chmod +x setup-linux.sh
./setup-linux.sh
\`\`\`

### 2. Database Setup

#### Option A: Using Neon (Recommended)
1. Go to [neon.tech](https://neon.tech) and create account
2. Create new project
3. Copy connection string
4. Update `.env.local`:
\`\`\`bash
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
\`\`\`

#### Option B: Local PostgreSQL
\`\`\`bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb analyn_db

# Update .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/analyn_db"
\`\`\`

### 3. Run Database Migrations
\`\`\`bash
# Connect to your database and run these files in order:
# 1. scripts/001-initial-schema.sql
# 2. scripts/002-seed-data.sql  
# 3. scripts/003-add-tracking-and-status.sql

# For Neon, use their SQL Editor in the dashboard
# For local PostgreSQL:
psql -d analyn_db -f scripts/001-initial-schema.sql
psql -d analyn_db -f scripts/002-seed-data.sql
psql -d analyn_db -f scripts/003-add-tracking-and-status.sql
\`\`\`

### 4. Start Development Server
\`\`\`bash
npm run dev
\`\`\`

Visit: http://localhost:3000

## Testing Authentication

### Register New Account
1. Go to: http://localhost:3000/auth/register
2. Fill form (choose Client or Therapist)
3. Submit → Auto-login → Role-based redirect

### Login
1. Go to: http://localhost:3000/auth/login  
2. Use registered credentials
3. Redirects to appropriate dashboard

### Browse Therapists
1. Go to: http://localhost:3000/therapists
2. Search, filter, view profiles
3. Test booking flow

## Key Features Working

✅ **Complete Authentication System**
- Secure registration/login
- JWT tokens with 7-day expiry
- Role-based access (Client/Therapist/Admin)
- Password hashing with bcrypt

✅ **Therapists Directory**
- Search and filter functionality
- Detailed therapist profiles
- Rating and review system
- Booking integration

✅ **Booking System**
- 4-step booking process
- Service selection
- Therapist selection  
- Date/time scheduling
- Payment integration ready

✅ **Responsive Design**
- Mobile-friendly interface
- Modern UI with Tailwind CSS
- Smooth animations and transitions

## Production Deployment

### Deploy to Vercel
\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Add environment variables in Vercel dashboard:
# - DATABASE_URL
# - JWT_SECRET
\`\`\`

### Environment Variables for Production
\`\`\`bash
# Required
DATABASE_URL="your_neon_connection_string"
JWT_SECRET="your_secure_32_char_secret"

# Optional (for full functionality)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
TWILIO_ACCOUNT_SID="your_twilio_sid"
TWILIO_AUTH_TOKEN="your_twilio_token"
SENDGRID_API_KEY="your_sendgrid_key"
\`\`\`

## Troubleshooting

### Common Issues

**Node.js Version Error**
\`\`\`bash
# Check version
node -v

# Install Node 18+ using NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
\`\`\`

**Database Connection Error**
\`\`\`bash
# Check .env.local file exists and has correct DATABASE_URL
cat .env.local

# Test connection (if using local PostgreSQL)
psql -d analyn_db -c "SELECT version();"
\`\`\`

**Permission Denied on setup-linux.sh**
\`\`\`bash
chmod +x setup-linux.sh
./setup-linux.sh
\`\`\`

**Missing Dependencies**
\`\`\`bash
# Clean install
rm -rf node_modules package-lock.json
npm install
\`\`\`

## Development Workflow

\`\`\`bash
# Start development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
\`\`\`

## Next Steps

1. **Add Stripe Integration** for payments
2. **Implement Google Maps** for location services  
3. **Add Real-time Notifications** with Twilio/SendGrid
4. **Set up File Upload** for therapist documents
5. **Add Search Functionality** with advanced filters

## Support

For issues or questions:
- Check the troubleshooting section above
- Review the code comments in the files
- Ensure all environment variables are set correctly
- Verify database migrations ran successfully

The platform is now ready for development and testing! 🚀
