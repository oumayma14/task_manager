import expressAsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/auth/UserModel.js";

export const protect = expressAsyncHandler(async (req, res, next) => {
    try{
        //check if user is logged in
        const token=req.cookies.token;
        if(!token){
            //401 unauthorized
            res.status(401).json({message:"Not authorized, no token"});}
        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        //get user details from token without password
        const user = await User.findById(decoded.id).select("-password");
        //check if user exists
        if(!user){
            res.status(401).json({message:"User not found!"});}
        //set user details in the request object
        req.user=user;
        next();
    }   catch(error){
        res.status(401).json({message:"Not authorized, token failed"});
    }
});