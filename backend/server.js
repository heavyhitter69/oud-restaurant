import dotenv from 'dotenv'
dotenv.config()
import express  from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import path from "path"
import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"
import promoRouter from "./routes/promoRoute.js"
import bannerRouter from "./routes/bannerRoute.js"

// app config
const app = express()
const port = process.env.PORT || 4000

// Check for required environment variables
const requiredEnvVars = ['JWT_SECRET', 'PAYSTACK_SECRET_KEY', 'MONGODB_URI'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  console.error('Please set these environment variables before starting the server.');
  process.exit(1);
}

console.log('✅ All required environment variables are set');

            // Security middleware - Completely disable for image loading
            app.use(helmet({
              contentSecurityPolicy: false,
              crossOriginEmbedderPolicy: false,
              crossOriginResourcePolicy: false,
              crossOriginOpenerPolicy: false,
              frameguard: false,
            }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(limiter)

// CORS configuration - Allow all origins for now
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token', 'X-Requested-With', 'Origin', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar', 'Authorization']
}));

// Additional CORS headers for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, token');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`)
  next()
})

//connect db
connectDB().catch(console.error);

            // Static files with security headers
            app.use("/images", express.static('uploads', {
              setHeaders: (res, path) => {
                res.set('X-Content-Type-Options', 'nosniff')
                res.set('Cache-Control', 'public, max-age=31536000')
                res.set('Access-Control-Allow-Origin', '*')
                res.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
                res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
                res.set('Cross-Origin-Resource-Policy', 'cross-origin')
                res.set('Cross-Origin-Embedder-Policy', 'unsafe-none')
                res.set('Cross-Origin-Opener-Policy', 'unsafe-none')
              }
            }))
            app.use("/uploads", express.static('uploads', {
              setHeaders: (res, path) => {
                res.set('X-Content-Type-Options', 'nosniff')
                res.set('Cache-Control', 'public, max-age=31536000')
                res.set('Access-Control-Allow-Origin', '*')
                res.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
                res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
                res.set('Cross-Origin-Resource-Policy', 'cross-origin')
                res.set('Cross-Origin-Embedder-Policy', 'unsafe-none')
                res.set('Cross-Origin-Opener-Policy', 'unsafe-none')
              }
            }))

            // Special route for problematic images with explicit CORS
            app.get("/images/:filename", (req, res) => {
              const filename = req.params.filename
              const filePath = path.join(__dirname, 'uploads', filename)
              
              // Set CORS headers explicitly - more aggressive approach
              res.set('Access-Control-Allow-Origin', '*')
              res.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
              res.set('Access-Control-Allow-Headers', '*')
              res.set('Cross-Origin-Resource-Policy', 'cross-origin')
              res.set('Cross-Origin-Embedder-Policy', 'unsafe-none')
              res.set('Cross-Origin-Opener-Policy', 'unsafe-none')
              res.set('X-Frame-Options', 'SAMEORIGIN')
              
              // Handle preflight requests
              if (req.method === 'OPTIONS') {
                res.status(200).end()
                return
              }
              
              res.sendFile(filePath, (err) => {
                if (err) {
                  console.log(`Image not found: ${filename}`)
                  res.status(404).send('Image not found')
                } else {
                  console.log(`Image served successfully: ${filename}`)
                }
              })
            })

            // Alternative route for the specific problematic image
            app.get("/api/image/:filename", (req, res) => {
              const filename = req.params.filename
              const filePath = path.join(__dirname, 'uploads', filename)
              
              // Minimal headers for maximum compatibility
              res.set('Access-Control-Allow-Origin', '*')
              res.set('Content-Type', 'image/png')
              
              res.sendFile(filePath, (err) => {
                if (err) {
                  console.log(`API Image not found: ${filename}`)
                  res.status(404).send('Image not found')
                } else {
                  console.log(`API Image served successfully: ${filename}`)
                }
              })
            })

//api endpoints
app.use("/api/food", foodRouter)
app.use("/api/user", userRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)
app.use("/api/promo", promoRouter)
app.use("/api/banner", bannerRouter)

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// Test verify endpoint
app.get("/test-verify", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Verify endpoint is accessible",
    timestamp: new Date().toISOString()
  })
})

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Oud Restaurant API is running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || 'development'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err)
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON payload"
    })
  }
  
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: "Payload too large"
    })
  }
  
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? "Internal server error" 
      : err.message
  })
})

app.listen(port, () => {
  console.log(`🚀 Server Started on port ${port}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔒 Security: Helmet, Rate Limiting, CORS enabled`)
})