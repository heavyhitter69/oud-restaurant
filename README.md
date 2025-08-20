# 🍽️ Oud Restaurant - Premium Dining Experience

A modern, responsive restaurant management system with online ordering, admin dashboard, and comprehensive features.

## 🌟 Features

### Customer Features
- 🍕 **Online Food Ordering** - Browse menu, add to cart, and place orders
- 👤 **User Authentication** - Secure login/register with JWT tokens
- 🛒 **Shopping Cart** - Persistent cart with local storage sync
- 🎨 **Dark/Light Theme** - Toggle between themes
- 📱 **Responsive Design** - Works perfectly on all devices
- 🎫 **Promo Codes** - Apply discount codes
- 📦 **Order Tracking** - Real-time order status updates
- 💳 **Payment Integration** - Stripe and Paystack support

### Admin Features
- 📊 **Dashboard** - Real-time order management
- 🍽️ **Menu Management** - Add, edit, delete food items
- 📈 **Order Analytics** - Track sales and performance
- 🎯 **Marketing Tools** - Promo codes and banners
- 🔔 **Notifications** - Real-time order alerts
- 📱 **Mobile Responsive** - Manage from any device

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/oud-restaurant.git
cd oud-restaurant
```

2. **Install dependencies**
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install

# Admin
cd ../admin && npm install
```

3. **Environment Setup**
```bash
# Create .env file in backend directory
cd ../backend
cp .env.example .env
```

4. **Start services**
```bash
# Start backend (Terminal 1)
cd backend && npm run server

# Start frontend (Terminal 2)
cd frontend && npm run dev

# Start admin (Terminal 3)
cd admin && npm run dev
```

## 🔧 Configuration

### Environment Variables

Create `.env` file in the backend directory:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT
JWT_SECRET=your_super_secure_jwt_secret_here

# Payment (Optional)
STRIPE_SECRET_KEY=sk_test_...
PAYSTACK_SECRET_KEY=sk_test_...

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🐳 Docker Deployment

### Production Deployment

1. **Build and run with Docker Compose**
```bash
docker-compose up -d
```

2. **Access the applications**
- Frontend: http://localhost:5173
- Admin: http://localhost:3000
- API: http://localhost:4000

### Individual Services

```bash
# Backend only
docker build -t oud-backend ./backend
docker run -p 4000:4000 oud-backend

# Frontend only
docker build -t oud-frontend ./frontend
docker run -p 5173:80 oud-frontend

# Admin only
docker build -t oud-admin ./admin
docker run -p 3000:80 oud-admin
```

## 🔒 Security Features

### Backend Security
- ✅ **Helmet.js** - Security headers
- ✅ **Rate Limiting** - Prevent abuse
- ✅ **CORS Protection** - Cross-origin security
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Input Validation** - Prevent injection attacks
- ✅ **Password Hashing** - bcrypt encryption
- ✅ **File Upload Security** - Multer with validation

### Frontend Security
- ✅ **Content Security Policy** - XSS protection
- ✅ **HTTPS Enforcement** - Secure connections
- ✅ **Input Sanitization** - Prevent XSS
- ✅ **Secure Storage** - Local storage encryption
- ✅ **CORS Headers** - Proper origin validation

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 576px
- **Tablet**: 576px - 991px
- **Desktop**: > 992px

### Features
- ✅ **Mobile-First** approach
- ✅ **Touch-Friendly** interfaces
- ✅ **Flexible Grid** layouts
- ✅ **Optimized Images** for all devices
- ✅ **Accessibility** compliant

## 🔍 SEO Optimization

### Meta Tags
- ✅ **Title & Description** - Optimized for search
- ✅ **Open Graph** - Social media sharing
- ✅ **Twitter Cards** - Twitter sharing
- ✅ **Structured Data** - Rich snippets
- ✅ **Canonical URLs** - Prevent duplicate content

### Performance
- ✅ **Service Worker** - Offline functionality
- ✅ **Image Optimization** - WebP format support
- ✅ **Code Splitting** - Faster loading
- ✅ **Lazy Loading** - Optimized resources
- ✅ **Caching** - Browser and CDN caching

## 📊 Performance Metrics

### Lighthouse Scores (Target)
- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 95+

### Core Web Vitals
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1

## 🛠️ Development

### Code Quality
- ✅ **ESLint** - Code linting
- ✅ **Prettier** - Code formatting
- ✅ **TypeScript** - Type safety (optional)
- ✅ **Git Hooks** - Pre-commit checks

### Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e
```

## 📈 Monitoring & Analytics

### Health Checks
- ✅ **API Health** - `/health` endpoint
- ✅ **Database** - Connection monitoring
- ✅ **Uptime** - Service availability
- ✅ **Performance** - Response time tracking

### Logging
- ✅ **Request Logging** - All API calls
- ✅ **Error Logging** - Detailed error tracking
- ✅ **Performance Logging** - Slow query detection

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates installed
- [ ] Domain DNS configured
- [ ] CDN setup (optional)
- [ ] Monitoring tools configured

### Post-Deployment
- [ ] Health checks passing
- [ ] SSL certificate valid
- [ ] Performance metrics good
- [ ] Error monitoring active
- [ ] Backup system working
- [ ] Security scan completed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@oud-restaurant.com or create an issue in the repository.

## 🔄 Updates

Stay updated with the latest features and security patches by regularly pulling from the main branch.

---

**Built with ❤️ for the restaurant industry**
