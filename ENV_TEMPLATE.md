# .env.local Template

## Copy this file and update with YOUR credentials

### Option 1: MongoDB Atlas (Cloud)
```env
# NextAuth Configuration
NEXTAUTH_SECRET=e4d8f2a9c1b3e5f7a9c2b4d6e8f1a3c5d7e9f1b3c5d7e9f1a3c5d7e9f1b3c5
NEXTAUTH_URL=http://localhost:3000

# MongoDB Atlas Connection (REPLACE WITH YOUR CREDENTIALS)
# Format: mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
# Steps to get your connection string:
# 1. Go to https://cloud.mongodb.com
# 2. Click Database → Connect → Drivers
# 3. Copy the Node.js connection string
# 4. Replace <username> and <password> with your actual credentials
# 5. Change <database> to "giftwebsite"

DATABASE_URL=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/giftwebsite?retryWrites=true&w=majority

# Razorpay Configuration (Optional)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_here
RAZORPAY_SECRET=your_razorpay_secret_here
```

### Option 2: Local MongoDB
```env
# NextAuth Configuration
NEXTAUTH_SECRET=e4d8f2a9c1b3e5f7a9c2b4d6e8f1a3c5d7e9f1b3c5d7e9f1a3c5d7e9f1b3c5
NEXTAUTH_URL=http://localhost:3000

# Local MongoDB (Make sure mongod is running!)
DATABASE_URL=mongodb://localhost:27017/giftwebsite

# Razorpay Configuration (Optional)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_here
RAZORPAY_SECRET=your_razorpay_secret_here
```

### Option 3: MongoDB Atlas with Authentication
```env
# NextAuth Configuration
NEXTAUTH_SECRET=e4d8f2a9c1b3e5f7a9c2b4d6e8f1a3c5d7e9f1b3c5d7e9f1a3c5d7e9f1b3c5
NEXTAUTH_URL=http://localhost:3000

# MongoDB Atlas with explicit authentication
DATABASE_URL=mongodb+srv://username:password@cluster0.mongodb.net/giftwebsite?retryWrites=true&w=majority&authSource=admin

# Razorpay Configuration (Optional)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_here
RAZORPAY_SECRET=your_razorpay_secret_here
```

## ⚠️ Important Notes

### Special Characters in Password
If your MongoDB password contains special characters, you MUST URL-encode them:
- `@` becomes `%40`
- `#` becomes `%23`
- `:` becomes `%3A`
- `/` becomes `%2F`
- `?` becomes `%3F`
- `%` becomes `%25`

Example: If password is `pass@word123`, use `pass%40word123`

### Getting Your MongoDB Atlas Connection String

1. Go to https://cloud.mongodb.com
2. Login to your account
3. Click on "Database" in the left sidebar
4. Click "Connect" button on your cluster
5. Select "Drivers" tab
6. Choose "Node.js" version
7. Copy the connection string
8. It will look like: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
9. Replace:
   - `<username>` with your database user username
   - `<password>` with your database user password
   - `<cluster>` with your cluster name
   - `myFirstDatabase` with `giftwebsite`

### Testing Your Connection

After updating `.env.local`, run:
```bash
node diagnose-mongodb.js
```

You should see:
```
✅ Connected successfully!
   MongoDB Version: 5.x.x
```

### Starting Local MongoDB

If using local MongoDB, make sure to start it first:

**Windows:**
```powershell
mongod
```

Or if installed as service:
```powershell
net start MongoDB
```

**Mac/Linux:**
```bash
mongod
```

### Restarting the Dev Server

After updating `.env.local`:
```powershell
# Stop current server (Ctrl+C)
npm run dev
```

---

## ✅ Complete Environment Variables Checklist

- [ ] NEXTAUTH_SECRET - Secure JWT secret (provided)
- [ ] NEXTAUTH_URL - Set to http://localhost:3000 for local development
- [ ] DATABASE_URL - MongoDB connection string with valid credentials
- [ ] NEXT_PUBLIC_RAZORPAY_KEY_ID - Optional, only if using Razorpay
- [ ] RAZORPAY_SECRET - Optional, only if using Razorpay

---

## 🚀 After Setup

1. Update `.env.local` with your credentials
2. Restart dev server: `npm run dev`
3. Test login: http://localhost:3000/login
4. Everything should work! ✅

---

## 📚 Resources

- MongoDB Atlas: https://cloud.mongodb.com
- MongoDB Community: https://www.mongodb.com/try/download/community
- Prisma Docs: https://www.prisma.io/docs/
- NextAuth.js: https://next-auth.js.org/
