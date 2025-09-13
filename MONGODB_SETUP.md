# 🍃 MongoDB Atlas Setup (5 minutes)

## Quick Setup Steps:

### 1. Create MongoDB Atlas Account
- Go to https://cloud.mongodb.com
- Sign up with Google/GitHub (fastest)
- Choose "Build a database" → **Free tier (M0)**

### 2. Create Cluster
- **Cloud Provider**: AWS (default)
- **Region**: Choose closest to your location
- **Cluster Name**: `memory-gallery-cluster`
- Click "Create Cluster" (takes 2-3 minutes)

### 3. Setup Database Access
- Go to "Database Access" in left sidebar
- Click "Add New Database User"
- **Username**: `hackathon-user`
- **Password**: Generate secure password (save it!)
- **Database User Privileges**: "Read and write to any database"
- Click "Add User"

### 4. Setup Network Access
- Go to "Network Access" in left sidebar
- Click "Add IP Address"
- Click "Allow Access From Anywhere" (for hackathon - normally you'd restrict this)
- Click "Confirm"

### 5. Get Connection String
- Go back to "Databases"
- Click "Connect" on your cluster
- Choose "Drivers" → "Node.js" → "5.5 or later"
- Copy the connection string (looks like):
  ```
  mongodb+srv://hackathon-user:<password>@memory-gallery-cluster.xxxxx.mongodb.net/
  ```

### 6. Update Your .env File
```bash
cd /Users/Ani/dev/HTN2025/web-app/backend
```

Edit `.env` and replace:
```
MONGODB_URI=mongodb+srv://hackathon-user:YOUR_PASSWORD@memory-gallery-cluster.xxxxx.mongodb.net/memory-gallery
```

### 7. Test Connection
```bash
npm run dev
```

Visit http://localhost:8787/api/ping - should show:
```json
{
  "ok": true,
  "mongodb": {
    "total": 0,
    "thisWeek": 0,
    "database": "MongoDB Atlas",
    "status": "connected"
  }
}
```

## 🧪 Test Your Setup

1. **Create a memory** using your frontend
2. **Check MongoDB Atlas**:
   - Go to "Browse Collections"
   - Should see `memory-gallery` database
   - Should see `memories` collection with your data

3. **Test Spectacles API**:
   - Visit http://localhost:8787/api/memories
   - Should return your saved memories

## Prize Requirements Met ✅

- ✅ **MongoDB Atlas** integrated
- ✅ **Persistent storage** for memories
- ✅ **Cloud database** (not local)
- ✅ **Spectacles sync** endpoints ready
- ✅ **Scalable architecture**

## Troubleshooting

**Connection failed?**
- Check username/password in connection string
- Ensure IP address is whitelisted (0.0.0.0/0 for "anywhere")
- Wait 2-3 minutes after creating user/cluster

**"Authentication failed"?**
- Double-check password in .env file
- Make sure user has "readWrite" permissions

**Slow connection?**
- Choose a region closer to your location
- Free tier has some latency limits

## Next Steps

Once MongoDB is working:
1. Create several test memories via your web app
2. Test `/api/memories` endpoint
3. Test Spectacles integration
4. Show off your persistent, cloud-synced memory gallery! 🏆