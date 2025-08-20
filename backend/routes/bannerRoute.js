import express from 'express';
const router = express.Router();
import multer from 'multer';
import path from 'path';
import {
  createBanner,
  getAllBanners,
  getActiveBanners,
  deleteBanner,
  toggleBannerStatus,
  updateBanner
} from '../controllers/bannerController.js';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'banner_' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Admin routes
router.post('/create', upload.single('image'), createBanner);
router.get('/list', getAllBanners);
router.get('/active', getActiveBanners);
router.delete('/delete/:id', deleteBanner);
router.patch('/toggle/:id', toggleBannerStatus);
router.put('/update/:id', upload.single('image'), updateBanner);

// Public route for frontend
router.get('/public', getActiveBanners);

export default router;
