#!/bin/bash

echo "🚀 Oud Restaurant Deployment Script"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

# Check if node is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

print_info "Checking prerequisites..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

print_status "Node.js version $(node -v) is compatible"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ] || [ ! -d "admin" ]; then
    print_error "Please run this script from the root directory of the Oud Restaurant project"
    exit 1
fi

print_status "Project structure verified"

echo ""
print_info "Starting deployment preparation..."

# Install dependencies
print_info "Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install backend dependencies"
    exit 1
fi
cd ..

print_info "Installing frontend dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install frontend dependencies"
    exit 1
fi
cd ..

print_info "Installing admin dependencies..."
cd admin
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install admin dependencies"
    exit 1
fi
cd ..

print_status "All dependencies installed successfully"

echo ""
print_info "Build test..."

# Test builds
print_info "Testing frontend build..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
    print_error "Frontend build failed"
    exit 1
fi
cd ..

print_info "Testing admin build..."
cd admin
npm run build
if [ $? -ne 0 ]; then
    print_error "Admin build failed"
    exit 1
fi
cd ..

print_status "All builds successful"

echo ""
print_warning "IMPORTANT: Before deploying, please ensure you have:"
echo "1. Created a GitHub repository and pushed your code"
echo "2. Set up MongoDB Atlas database"
echo "3. Created accounts on Vercel and Render"
echo ""

read -p "Have you completed the prerequisites? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Please complete the prerequisites first. Check DEPLOYMENT.md for detailed instructions."
    exit 0
fi

echo ""
print_info "Deployment Checklist:"
echo "======================"
echo ""
echo "📋 Backend (Render):"
echo "   □ Create Render account"
echo "   □ Connect GitHub repository"
echo "   □ Set environment variables:"
echo "     - NODE_ENV=production"
echo "     - PORT=10000"
echo "     - MONGODB_URI=your_mongodb_connection_string"
echo "     - JWT_SECRET=your_secure_jwt_secret"
echo "     - CORS_ORIGIN=https://your-frontend-domain.vercel.app"
echo ""
echo "🌐 Frontend (Vercel):"
echo "   □ Create Vercel account"
echo "   □ Connect GitHub repository"
echo "   □ Set environment variable:"
echo "     - VITE_API_URL=https://your-backend-domain.onrender.com"
echo ""
echo "🛠️  Admin Panel (Vercel):"
echo "   □ Create separate Vercel project"
echo "   □ Connect admin repository"
echo "   □ Set environment variable:"
echo "     - VITE_API_URL=https://your-backend-domain.onrender.com"
echo ""

print_info "Follow the detailed instructions in DEPLOYMENT.md"
print_info "Your application will be live at:"
echo "   Frontend: https://your-project-name.vercel.app"
echo "   Admin: https://your-admin-project-name.vercel.app"
echo "   API: https://your-api-name.onrender.com"

echo ""
print_status "Deployment script completed successfully!"
print_info "Happy coding! 🍽️"
