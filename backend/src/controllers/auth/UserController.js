import asyncHandler from 'express-async-handler';
import User from '../../models/auth/UserModel.js';
import generateToken from '../../helpers/generateToken.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import expressAsyncHandler from 'express-async-handler';
import Token from '../../models/auth/Token.js';
import crypto from 'node:crypto';
import hashToken from '../../helpers/hashToken.js';

// regiter user controller
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    //validation
    if (!name || !email || !password) {
        //400 bad request
        res.status(400).json({ message: "All fields are required!!!" });
    }
    //password length check
    if (password.length < 6) {
        res.status(400)
        .json({ message: "Password must be at least 6 characters long..." });
    }

    //check user existence
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: "User already exists..." });
    }

    //create user
    const user = await User.create({
        name,
        email,
        password
    });

    //generate token with user id
    const token= generateToken(user._id);
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, 
        sameSite: true,
        secure: true,
    });

    if (user) {
        const { _id, name, email, role, photo, isVerified, bio } = user;
        res.status(201).json({
            _id,
            name,
            email,
            role,
            photo,
            isVerified,
            bio,
            token,
        });
    } else {
        res.status(400).json({ message: "Invalid user data..." });
    }
});

// login user controller
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
        res.status(400).json({ message: "All fields are required..." });
    }
    //check user existence
    const userExists = await User.findOne({ email });

    if (!userExists) {
        return res.status(400).json({ message: "User does not exist, sign up" });
    }
    //check password
    const isMatch = await bcrypt.compare(password, userExists.password);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    //generate token with user id
    const token= generateToken(userExists._id);
    if (userExists && isMatch) {
        const { _id, name, email, role, photo, isVerified, bio } = userExists;
        res.cookie("token", token, {
            path: "/",
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000, 
            sameSite: true,
            secure: true,
        });
        res.status(201).json({
            _id,
            name,
            email,
            role,
            photo,
            isVerified,
            bio,
            token,
        });
    }else {
        res.status(400).json({ message: "Invalid email or password" });
    }
});

//logout user controller
export const logoutUser = asyncHandler(async (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: "Logged out successfully..." });
});


//get user
export const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
        res.status(200).json(user);
    } else {
        res.status(404).json({ message: "User not found" });
    }
});

//update user
export const updateUser = asyncHandler(async (req, res) => {
    //get user details from token
    const user= await User.findById(req.user._id);
    if (user) {
        const { name,photo, bio } = req.body;
        user.name = req.body.name || user.name;
        user.photo = req.body.photo || user.photo;
        user.bio = req.body.bio || user.bio;
        const updated = await user.save();
        res.status(200).json({
            _id: updated._id,
            name: updated.name,
            email: updated.email,
            photo: updated.photo,
            bio: updated.bio,
            isVerified: updated.isVerified,
            role: updated.role
        });
    } else {
        res.status(404).json({ message: "User not found" });
    }
});

//login status

export const userLoginStatus = asyncHandler(async(req,res)=>{
    const token=req.cookies.token;
    if(!token){
        return res.status(401).json({message:"Not authorized, please login!!!!"});
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if(decoded){
        return res.status(200).json(true);
    } else {
        return res.status(401).json(false);
    }
});

//email verification
export const verifyEmail =expressAsyncHandler(async(req,res)=>{
    const user = await User.findById(req.user._id);
    //if user is not  found
    if(!user){
        res.status(404).json({message:"user not found!!!!"});
    }

    //check if user is already verified or no
    if(user.isVerified){
        res.status(400).json({message: "user is already verified"})}
    
    let token = await Token.findOne({userId: user._id});
    //if token exists --> update the token 
    if(token){
        await token.deleteOne();
    }

    //create a verficiation token using the user id --> using crypto
    const verificationToken=crypto.randomBytes(64).toString("hex");  user._id;

    //hash the verificationtoken 
    const hashedToken = await hashToken(verificationToken);

    await new Token({
        userId: user._id,
        verificationToken: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 24*60*60*1000, //24 hours
    }).save();

    //verification url
    const verificationUrl= `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    //send email
    const subject = "Email verification - AuthKit";
    const send_to = user.email;
    const reply_to = "noreply@gmail.com";
    const template = "emailVerification";
    const send_from=process.env.USER_EMAIL;
    const name = user.name;
    const url= link;
});