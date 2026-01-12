import asyncHandler from 'express-async-handler';
import User from '../../models/auth/UserModel.js';
import generateToken from '../../helpers/generateToken.js';
import bcrypt from 'bcrypt';

// regiter user controller
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    //validation
    if (!name || !email || !password) {
        //400 bad request
        res.status(400).json({ message: "All fields are required!" });
    }
    //password length check
    if (password.length < 6) {
        res.status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    //check user existence
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
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
        res.status(400).json({ message: "Invalid user data" });
    }
});

// login user controller
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
        res.status(400).json({ message: "All fields are required" });
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
