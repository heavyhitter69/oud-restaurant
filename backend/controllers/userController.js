import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import validator from "validator"

// login User
const loginUser = async (req,res) => {
    const {email,password} = req.body;
    try {
        const user = await userModel.findOne({email});
        if (!user) {
            return res.json({success:false, message:"User doesn't exist"})
        }

        const isMatch = await bcrypt.compare(password,user.password);

        if (!isMatch) {
            return res.json({success:false, message:"Invalid credentials"})
        }

        const token = createToken(user._id);
        res.json({success:true,token,avatar:user.avatar,name:user.name,email:user.email})
    } catch (error) {
        console.log("Login error:", error);
        res.json({success:false, message:"Error", details: error.message})
    }
}

const createToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET || 'e803d93522316f74c56fc8728d47842d', { expiresIn: '7d' })
}

// register User 
const registerUser =  async (req,res) => {
    const {name,password,email} = req.body;
    try {
        // checking if user already exists
        const exists = await userModel.findOne({email})

        if (exists) {
            return res.json({success:false, message:"User already exists"})
        }
        //validating email format and strong password
        if (!validator.isEmail(email)) {
            return res.json({success:false, message:"Please enter a valid email"})
        }
        if (password.length < 8) {
            return res.json({success:false, message: "Please enter a strong password"})
        }
        //hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        // Generate random avatar
        const avatars = [
            "🦁", "🐯", "🐻", "🐨", "🐼", "🐸", "🐙", "🦊", "🐰", "🐭", 
            "🐹", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🦆", "🦅",
            "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌"
        ];
        const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

        const newUser = new userModel({
            name:name,
            email:email,
            password:hashedPassword,
            avatar: randomAvatar
        })

        const user = await newUser.save()
        const token = createToken(user._id)
        res.json({success:true,token,avatar:user.avatar,name:user.name,email:user.email})
    } catch (error) {
        console.log("Registration error:", error);
        res.json({success:false, message:"Error", details: error.message})
    }
}

// Get user profile data
const getUserProfile = async (req, res) => {
  try {
    console.log("getUserProfile called with userId:", req.body.userId);
    const user = await userModel.findById(req.body.userId).select('-password');
    console.log("Found user:", user);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.log("Error in getUserProfile:", error);
    res.json({ success: false, message: "Error fetching user profile" });
  }
};

export {loginUser,registerUser,getUserProfile};