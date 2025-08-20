# 🔧 Render Environment Variables Setup

## 🚀 **Your Deployed URLs:**
- **Backend API**: https://oud-restaurant-api.onrender.com ✅
- **Frontend**: https://oud-restaurant-4nt0.onrender.com
- **Admin Panel**: https://oud-restaurant-admin-yl6p.onrender.com

## ⚙️ **Environment Variables to Set in Render:**

### **For Backend (oud-restaurant-api):**
Go to your backend service in Render → Environment → Add these variables:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://sarkodieemil:Hildaszn69@cluster0.wxfarmq.mongodb.net/build-8?retryWrites=true&w=majority
JWT_SECRET=oud_restaurant_super_secure_jwt_secret_2024_heavyhitter69
CORS_ORIGIN=https://oud-restaurant-4nt0.onrender.com
```

### **For Frontend (oud-restaurant-4nt0):**
Go to your frontend service in Render → Environment → Add:

```
VITE_API_URL=https://oud-restaurant-api.onrender.com
```

### **For Admin (oud-restaurant-admin-yl6p):**
Go to your admin service in Render → Environment → Add:

```
VITE_API_URL=https://oud-restaurant-api.onrender.com
```

## 🔄 **After Setting Environment Variables:**
1. **Redeploy** each service
2. **Test** the connections
3. **Check** the logs for any errors

## 🧪 **Test Your Deployment:**
1. **Frontend**: https://oud-restaurant-4nt0.onrender.com
2. **Admin**: https://oud-restaurant-admin-yl6p.onrender.com
3. **API Health**: https://oud-restaurant-api.onrender.com/health
