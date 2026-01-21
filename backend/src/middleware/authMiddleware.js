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
            res.status(401).json({message:"User not found!!!"});}
        //set user details in the request object
        req.user=user;
        next();
    }   catch(error){
        res.status(401).json({message:"Not authorized, token failed"});
    }
});

//admin middleware
export const adminMiddleware= expressAsyncHandler(async(req,res,next)=>{
    if (req.user && req.user.role ==="admin"){
        //if user is admin , move to the next middleware
        next();
        return;
    }
    //if not admin , send 403 forbidden 
    res.status(403).json({message:"Only admin can do this function"});
});

//this middleware checks the user's role
export const creatorMiddleware= expressAsyncHandler(async(req,res,next)=>{
    if ((req.user && req.user.role ==="creator") || (req.user && req.user.role ==="admin")){
        //if user is creator , move to the next middleware
        next();
        return;
    }
    //if not creator , send 403 forbidden
    res.status(403).json({message:"Only creator can do this function"});
});

//verified user middleware
export const verifiedMiddleware= expressAsyncHandler(async(req,res,next)=>{
    if(req.user && req.user.isVerified){
        //if user is verified , move to the next middleware
        next();
        return;
    }
    //if not verified , send 403 forbidden
    res.status(403).json({message:"Only verified users can do this function"});
});