import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  const { token } = req.headers;
  
  if (!token) {
    return res.status(401).json({ success: false, message: "Not Authorized" });
  }
  
  try {
    console.log("Verifying token:", token);
    const token_decode = jwt.verify(token, process.env.JWT_SECRET || 'e803d93522316f74c56fc8728d47842d');
    console.log("Token decoded:", token_decode);
    
    // Check token expiration
    const now = Date.now().valueOf() / 1000;
    if (token_decode.exp && token_decode.exp < now) {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    
    req.body.userId = token_decode.id;
    console.log("Set userId:", req.body.userId);
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export default authMiddleware;
