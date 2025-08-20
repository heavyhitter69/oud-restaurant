import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        // Try MongoDB Atlas connection
        const mongoURI = 'mongodb+srv://sarkodieemil:Hildaszn69@cluster0.wxfarmq.mongodb.net/build-8?retryWrites=true&w=majority';
        await mongoose.connect(mongoURI);
        console.log("✅ MongoDB Atlas Connected Successfully");
    } catch (error) {
        console.error("❌ MongoDB Atlas Connection Error:", error.message);
        console.log("🔄 Trying local MongoDB...");
        
        try {
            // Fallback to local MongoDB
            await mongoose.connect('mongodb://127.0.0.1:27017/oud-restaurant');
            console.log("✅ Connected to Local MongoDB");
        } catch (localError) {
            console.error("❌ Local MongoDB also failed:", localError.message);
            console.log("💡 Starting server without database for development...");
            console.log("📝 You can add food items through the admin panel once database is connected");
        }
    }
};