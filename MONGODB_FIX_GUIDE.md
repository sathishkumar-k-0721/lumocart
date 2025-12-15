# 🔐 MongoDB Authentication Error - Solutions

## 🔴 Problem Identified

**Error**: `Invalid 'prisma.user.findUnique()' invocation: SCRAM failure: bad auth : authentication failed`

**Root Cause**: MongoDB credentials in `.env.local` are **INVALID**

```
Username: plsathish0721_db_user
Password: zFIBbJV1IjeOI3xj
Cluster: cluster0.yjovwvc.mongodb.net
Database: giftwebsite
```

---

## ✅ Solutions (Choose One)

### **SOLUTION 1: MongoDB Atlas (Recommended for Production)**

If you have a MongoDB Atlas account and valid credentials:

#### Step 1: Get Connection String
1. Go to https://cloud.mongodb.com
2. Login to your MongoDB Atlas account
3. Click **Database** → **Connect**
4. Select **Drivers** → **Node.js**
5. Copy the connection string

#### Step 2: Extract Credentials
The URL looks like:
```
mongodb+srv://username:password@cluster-name.mongodb.net/database?retryWrites=true&w=majority
```

#### Step 3: Update `.env.local`
Edit `c:\Projects\lumocart\.env.local`:

```env
DATABASE_URL=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/giftwebsite?retryWrites=true&w=majority
```

⚠️ **Important**: If your password has special characters like `@` or `#`, you MUST URL-encode them:
- `@` → `%40`
- `#` → `%23`
- `:` → `%3A`

#### Step 4: Restart Server
```powershell
# Kill existing server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

---

### **SOLUTION 2: Use Local MongoDB (Quick Testing)**

If you want to test locally without MongoDB Atlas:

#### Step 1: Install MongoDB
Download from: https://www.mongodb.com/try/download/community

Or install via Chocolatey:
```powershell
choco install mongodb-community
```

#### Step 2: Start MongoDB Service
```powershell
# Windows - Start MongoDB service
net start MongoDB

# Or run directly:
mongod
```

#### Step 3: Update `.env.local`
```env
DATABASE_URL=mongodb://localhost:27017/giftwebsite
```

#### Step 4: Restart Server
```powershell
npm run dev
```

---

### **SOLUTION 3: MongoDB Atlas - Create New Free Cluster**

If you don't have an account or your cluster is unreachable:

#### Step 1: Create Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Create account with email

#### Step 2: Create Cluster
1. Click "Create" → "Build a Cluster"
2. Select **Shared Cluster** (Free)
3. Choose region closest to you
4. Click "Create Cluster"
5. Wait 5-10 minutes for creation

#### Step 3: Create Database User
1. Go to **Database Access**
2. Click "Add New Database User"
3. Choose "Password" auth
4. Create username and strong password
5. Select "Read and write to any database"
6. Click "Add User"

#### Step 4: Get Connection String
1. Click "Databases" 
2. Click "Connect" on your cluster
3. Select "Drivers"
4. Copy the Node.js connection string
5. Replace `<username>:<password>` with your credentials
6. Add `/giftwebsite` after domain

Example:
```
mongodb+srv://myusername:mypassword@cluster0.xxxxx.mongodb.net/giftwebsite?retryWrites=true&w=majority
```

#### Step 5: Update `.env.local`
```env
DATABASE_URL=mongodb+srv://myusername:mypassword@cluster0.xxxxx.mongodb.net/giftwebsite?retryWrites=true&w=majority
```

#### Step 6: Restart Server
```powershell
npm run dev
```

---

## 🔍 Verify Connection

Run the diagnostic tool to verify your connection:

```powershell
node diagnose-mongodb.js
```

You should see:
```
✅ Connected successfully!
   MongoDB Version: 5.x.x
```

---

## 🧪 Test Login After Fix

1. Restart the dev server: `npm run dev`
2. Go to: http://localhost:3000/login
3. Register a new account or login with existing credentials
4. **Success**: Login works without "bad auth" errors

---

## 🆘 Still Getting Errors?

### Error: `ECONNREFUSED` (Connection refused)
- MongoDB service is not running
- For local: Run `mongod` in PowerShell
- For Atlas: Check internet connection and cluster status

### Error: `ETIMEDOUT` (Connection timeout)
- MongoDB Atlas network issue
- Check your IP is whitelisted in Atlas security settings
- Go to: Security → Network Access → Add Current IP

### Error: `bad auth` (Authentication failed)
- Username/password are wrong
- Database name is wrong
- User doesn't have access to that database

### Error: `Database giftwebsite not found`
- This is OK! Prisma will create it automatically
- Just ignore this warning

---

## 📊 Connection String Format Reference

### MongoDB Atlas Format:
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### Local MongoDB Format:
```
mongodb://localhost:27017/database
```

### With Authentication:
```
mongodb://username:password@localhost:27017/database?authSource=admin
```

---

## ✅ Checklist

- [ ] I have valid MongoDB credentials or local MongoDB running
- [ ] I updated `.env.local` with correct `DATABASE_URL`
- [ ] Special characters in password are URL-encoded (if applicable)
- [ ] I restarted the dev server (`npm run dev`)
- [ ] Diagnostic tool shows ✅ Connected successfully
- [ ] Login page works without errors

---

## 📚 Resources

- **MongoDB Atlas**: https://cloud.mongodb.com
- **MongoDB Community**: https://www.mongodb.com/try/download/community
- **Prisma MongoDB Guide**: https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/mongodb
- **NextAuth.js**: https://next-auth.js.org/

---

**Once this is fixed, your authentication system will work perfectly!** 🚀
