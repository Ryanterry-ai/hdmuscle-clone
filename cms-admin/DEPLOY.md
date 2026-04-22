# Deploy to Vercel - Step by Step

## Step 1: Create Free PostgreSQL Database on Neon

1. Go to https://neon.tech
2. Sign up with GitHub (free)
3. Click **New Project**
4. Fill in:
   - Project name: `universal-cms`
   - Database name: `universal_cms`
   - Region: Choose closest to you
5. Click **Create Project**
6. On the dashboard, go to **Connection Details**
7. Copy the **Connection string** (it looks like):
   ```
   postgresql://user:password@ep-xxx-123456.us-east-2.aws.neon.tech/neondb
   ```

## Step 2: Deploy to Vercel

1. Go to https://vercel.com/ryanterry-ais-projects/
2. Click **Add New** → **Project**
3. Click **Import Third-Party Git Repository** or drag the `cms-admin` folder
4. In **Environment Variables**, add:
   - **Key**: `DATABASE_URL`
   - **Value**: Your Neon connection string (from Step 1)
5. Click **Deploy**

## Step 3: Wait for Deployment

Deployment takes 1-2 minutes. You'll see a success message with your URL:
```
https://your-project.vercel.app
```

## Step 4: Run Database Migration

After deployment, go to your project in Vercel and:

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **View Build Logs**
4. Click **Open Terminal** in top right corner
5. Run these commands:

```bash
# Install dependencies
npm install

# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Create admin user
npm exec -- ts-node --esm prisma/create-admin.ts
```

## Step 5: Create Admin User

Create a file `prisma/create-admin.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.create({
    data: {
      email: 'admin@hdmuscle.in',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  })
  console.log('Admin user created!')
  console.log('Email: admin@hdmuscle.in')
  console.log('Password: admin123')
}

main()
```

Run it:
```bash
npx tsx prisma/create-admin.ts
```

## Step 6: Login and Test

1. Go to `https://your-project.vercel.app/login`
2. Login with:
   - **Email**: admin@hdmuscle.in
   - **Password**: admin123

## API Endpoints

After deployment, these are available:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Admin login |
| `/api/products` | GET, POST | Products CRUD |
| `/api/collections` | GET, POST | Collections CRUD |
| `/api/settings` | GET, POST | Settings |
| `/api/content/sections` | GET, POST | Homepage sections |
| `/api/storefront/sections` | GET | Public sections |

## Test API

Open in browser:
```
https://your-project.vercel.app/api/products
https://your-project.vercel.app/api/collections
https://your-project.vercel.app/api/storefront/sections
```

## Troubleshooting

**Database connection error?**
- Check your Neon connection string is correct
- Make sure Neon project is not paused

**Build failed?**
- Check Vercel build logs
- Make sure DATABASE_URL is set in environment variables

**Can't login?**
- Run the admin creation script again
- Check browser console for errors
