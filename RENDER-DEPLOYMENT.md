# 🚀 Render Deployment Guide - Oud Restaurant

## 📋 Prerequisites

1. **GitHub Account** - For code repository
2. **Render Account** - [render.com](https://render.com) (Free)
3. **MongoDB Atlas Account** - [mongodb.com](https://mongodb.com) (Free tier)

## 🗄️ Step 1: Set Up MongoDB Atlas

1. Go to [mongodb.com](https://mongodb.com) and create a free account
2. Create a new project
3. Build a database (FREE tier M0)
4. Set up database access (create username/password)
5. Set up network access (Allow access from anywhere)
6. Get your connection string

**Example connection string:**
```
mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/oud-restaurant?retryWrites=true&w=majority
```

## 🚀 Step 2: Deploy to Render

### 2.1 Push to GitHub
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - Oud Restaurant"
git branch -M main
git remote add origin https://github.com/yourusername/oud-restaurant.git
git push -u origin main
```

### 2.2 Deploy on Render
1. Go to [render.com](https://render.com)
2. Sign up/Login with your GitHub account
3. Click "New +" → "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect the `render.yaml` file
6. Click "Apply"

### 2.3 Set Environment Variables
After deployment, go to each service and set environment variables:

**For Backend (oud-restaurant-api):**
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/oud-restaurant?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_jwt_secret_here
CORS_ORIGIN=https://oud-restaurant.onrender.com
```

## 🎉 Step 3: Your URLs

After deployment, your services will be available at:
- **Frontend**: `https://oud-restaurant.onrender.com`
- **Admin Panel**: `https://oud-restaurant-admin.onrender.com`
- **API**: `https://oud-restaurant-api.onrender.com`

## 🧪 Step 4: Test Your Deployment

1. Visit your frontend URL
2. Try to register/login
3. Browse the menu
4. Add items to cart
5. Test the checkout process
6. Visit admin panel and add food items

## 🔒 Security Checklist

- [ ] Change default JWT secret
- [ ] Set up HTTPS (automatic with Render)
- [ ] Configure proper CORS origins
- [ ] Set up environment variables
- [ ] Test all functionality

## 🚨 Troubleshooting

**CORS Errors:**
- Check that your frontend/admin URLs are in the CORS configuration

**Database Connection:**
- Verify MongoDB Atlas connection string
- Check network access settings

**Build Failures:**
- Check Render logs for specific errors
- Ensure all dependencies are in package.json

---

**That's it! Your restaurant app is now live on Render! 🍽️**
