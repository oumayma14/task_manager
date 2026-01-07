import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },

    email:{
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, "Please fill a valid email address"]
    },

    password:{
        type: String,
        required: [true, "Password is required"]
    },

    photo:{
        type: String,
        default: "https://i.ibb.co/4pDNDk1/avatar.png"
    },

    bio: {
        type: String,
        default: "I'm  a new user"
    },

    role:{
        type: String,
        enum: ["admin", "user", "creator"],
        default: "user"
    },

    isVerified:{
        type: Boolean,
        default: false
    },
}, { timestamps: true , minimize: true});

const User = mongoose.model("User", userSchema);

export default User;