# 🚀 Deployment Guide - Oud Restaurant

This guide will help you deploy your Oud Restaurant application to **Vercel** (frontend/admin) and **Render** (backend) for free!

## 📋 Prerequisites

1. **GitHub Account** - For code repository
2. **Vercel Account** - [vercel.com](https://vercel.com) (Free)
3. **Render Account** - [render.com](https://render.com) (Free)
4. **MongoDB Atlas Account** - [mongodb.com](https://mongodb.com) (Free tier)

## 🗄️ Step 1: Set Up MongoDB Atlas (Database)

### 1.1 Create MongoDB Atlas Account
1. Go to [mongodb.com](https://mongodb.com)
2. Sign up for a free account
3. Create a new project

### 1.2 Create Database Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select your preferred cloud provider and region
4. Click "Create"

### 1.3 Set Up Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Create a username and password (save these!)
4. Select "Read and write to any database"
5. Click "Add User"

### 1.4 Set Up Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

### 1.5 Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `oud-restaurant`

**Example:**
```
mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/oud-restaurant?retryWrites=true&w=majority
```

## 🔧 Step 2: Deploy Backend to Render

### 2.1 Prepare Backend for Deployment
1. Make sure your backend code is in a GitHub repository
2. Ensure `package.json` has the correct scripts:
   ```json
   {
     "scripts": {
       "start": "node server.js",
       "dev": "nodemon server.js"
     }
   }
   ```

### 2.2 Deploy to Render
1. Go to [render.com](https://render.com)
2. Sign up/Login with your GitHub account
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure the service:
   - **Name**: `oud-restaurant-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

### 2.3 Set Environment Variables
In Render dashboard, go to "Environment" tab and add:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/oud-restaurant?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_jwt_secret_here
CORS_ORIGIN=https://oud-restaurant.vercel.app
```

### 2.4 Deploy
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Copy your service URL (e.g., `https://oud-restaurant-api.onrender.com`)

## 🌐 Step 3: Deploy Frontend to Vercel

### 3.1 Prepare Frontend for Deployment
1. Make sure your frontend code is in a GitHub repository
2. The `vercel.json` file should already be configured

### 3.2 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with your GitHub account
3. Click "New Project"
4. Import your frontend repository
5. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (or leave empty)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.3 Set Environment Variables
In Vercel dashboard, go to "Settings" → "Environment Variables" and add:

```
VITE_API_URL=https://oud-restaurant-api.onrender.com
```

### 3.4 Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Your frontend will be available at `https://your-project-name.vercel.app`

## 🛠️ Step 4: Deploy Admin Panel to Vercel

### 4.1 Prepare Admin for Deployment
1. Create a separate GitHub repository for the admin panel
2. Copy the admin folder contents to the new repository
3. Ensure `vercel.json` is configured

### 4.2 Deploy Admin to Vercel
1. In Vercel dashboard, click "New Project"
2. Import your admin repository
3. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 4.3 Set Environment Variables
Add the same environment variable:

```
VITE_API_URL=https://oud-restaurant-api.onrender.com
```

### 4.4 Deploy
1. Click "Deploy"
2. Your admin panel will be available at `https://your-admin-project-name.vercel.app`

## 🔗 Step 5: Update CORS Settings

### 5.1 Update Backend CORS
In your backend `server.js`, update the CORS configuration:

```javascript
const corsOptions = {
  origin: [
    'https://your-frontend-domain.vercel.app',
    'https://your-admin-domain.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token', 'X-Requested-With'],
}
```

### 5.2 Redeploy Backend
1. Push changes to GitHub
2. Render will automatically redeploy

## 🧪 Step 6: Test Your Deployment

### 6.1 Test Frontend
1. Visit your frontend URL
2. Try to register/login
3. Browse the menu
4. Add items to cart
5. Test the checkout process

### 6.2 Test Admin Panel
1. Visit your admin panel URL
2. Add some food items
3. Check if orders appear
4. Test order management

### 6.3 Test API
1. Visit `https://your-api-url.onrender.com/health`
2. Should return: `{"success":true,"message":"Server is healthy"}`

## 🔒 Step 7: Security Checklist

- [ ] Change default JWT secret
- [ ] Set up HTTPS (automatic with Vercel/Render)
- [ ] Configure proper CORS origins
- [ ] Set up environment variables
- [ ] Test all functionality
- [ ] Monitor error logs

## 📊 Step 8: Monitoring

### 8.1 Render Monitoring
- Go to your Render service dashboard
- Check "Logs" tab for errors
- Monitor "Metrics" for performance

### 8.2 Vercel Monitoring
- Go to your Vercel project dashboard
- Check "Functions" tab for API calls
- Monitor "Analytics" for performance

## 🚨 Troubleshooting

### Common Issues

**1. CORS Errors**
- Check CORS configuration in backend
- Ensure frontend URLs are in allowed origins

**2. Database Connection Issues**
- Verify MongoDB Atlas connection string
- Check network access settings
- Ensure database user has correct permissions

**3. Build Failures**
- Check package.json scripts
- Verify all dependencies are installed
- Check for syntax errors

**4. Environment Variables**
- Ensure all required variables are set
- Check variable names match code
- Redeploy after adding variables

## 🎉 Success!

Your Oud Restaurant application is now deployed and accessible worldwide!

### Your URLs:
- **Frontend**: `https://your-frontend-domain.vercel.app`
- **Admin Panel**: `https://your-admin-domain.vercel.app`
- **API**: `https://your-api-domain.onrender.com`

### Next Steps:
1. Set up a custom domain (optional)
2. Configure analytics (Google Analytics)
3. Set up monitoring and alerts
4. Create backup strategies
5. Plan for scaling

---

**Need help?** Check the troubleshooting section or create an issue in your repository!
