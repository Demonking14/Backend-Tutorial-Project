import mongoose, { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true,
        index: true
    },
    fullName: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String,
        required: true,
        public_id:String,
    },
    coverImage: {
        type: String,
        public_id:String,
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true });

/* This pre method will work as soon as user saves anything in our website 
pre method is used taki save hone se phle hum ye cheez krna cahate h 
niceh wale function me hum user ke password ko encrypt kr rhe h taki database leak ho to direct password na leak ho jaye, or iske liye humne use kiya h bcrypt middleware */
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

/* below method check if the password is correct or not 
isme bcrypt isiliye hue kiya h taki check kr ske ki encrypted password whi h ki nhi jo user ne dala h */
UserSchema.methods.isPasswordCorrect = async function (password) {
    console.log("Plain password:", password);
    console.log("Hashed password:", this.password);
    const isMatch = await bcrypt.compare(password, this.password);
    console.log("Password match:", isMatch);
    return isMatch;
};

/* below we used JWT jis se hum refresh token and access token bana rhe h 
access token ka duration km hota h refresh token se and refresh token me info bhi km di jati h */
UserSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

UserSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

export const User = model("User", UserSchema);