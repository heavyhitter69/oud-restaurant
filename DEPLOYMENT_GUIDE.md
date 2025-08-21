# 🚀 PRODUCTION DEPLOYMENT GUIDE

## ⚠️ CRITICAL: SET ENVIRONMENT VARIABLES

### Backend (oud-restaurant-api):
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/build-8
JWT_SECRET=your-32-character-secret-key
PAYSTACK_SECRET_KEY=sk_test_your_key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=production
```

### Frontend (oud-restaurant-4nt0):
```
VITE_API_URL=https://oud-restaurant-api.onrender.com
```

### Admin (oud-restaurant-admin-yl6p):
```
VITE_API_URL=https://oud-restaurant-api.onrender.com
```

## 🔧 DEPLOYMENT STEPS:

1. **Set environment variables in Render dashboard**
2. **Redeploy all services**
3. **Test payment flow with small amount**
4. **Verify mobile responsiveness**
5. **Check admin panel functionality**

## 🚨 CRITICAL CHECKS:
- [ ] Payment processing works
- [ ] Cart clears after payment
- [ ] Orders sort correctly
- [ ] Images load properly
- [ ] Mobile search works
- [ ] Admin can manage orders

## ⚡ URGENT: Test everything before client demo!
