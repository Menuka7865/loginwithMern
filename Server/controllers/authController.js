import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import transporter from "../config/nodemailer.js";

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "Missing Details" });
    }

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        //sending welcome 
        const mailOption = {
             from: process.env.SENDER_EMAIL,
             to:email,
             subject: 'Welcome to MS DevHub',
             text:`Welcome to MS devHub website.Your account has been created with email id:${email}`
        }

        await transporter.sendMail(mailOption);
        console.log("Email sent:", result);


        return res.status(201).json({ success: true, message: "User registered successfully" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and Password are required" });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid Email" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid Password" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({ success: true, message: "Login successful" });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        });

        return res.status(200).json({ success: true, message: "Logged Out" });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// send verfication otp to the user's Email
export const sendVerfyOtp = async (req, res) =>{
    try{
        const{userId} = req.body;

        const user = await userModel.findById(userId);

        if(user.isAccountVerified){
            return res.json({ success:false,message:"Account already verified"})
        }

        const otp = String(Math.floor(100000 +Math.random() * 900000));

        user.verfyOtp = otp;
        user.verfyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to:user.email,
            subject: 'Welcome to MS DevHub',
            text:`Your OTP is ${otp}.Verify your account using this OTP.`
        }

        await transporter.sendMail(mailOption);
        res.json({ success:true,message: 'Verification OTP sent on Email'});

    }catch (error){
        res.json({ success: false, message: error.message});
    }

}
export const verifyEmail = async (req,res)=>{
    const {userId,otp} = req.body;
}
