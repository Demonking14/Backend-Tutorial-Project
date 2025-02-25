import { User } from '../models/user.model.js';
import ApiError from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import cloudinaryUpload from "../utils/cloudnary.js";
import ApiResponse from '../utils/apiResponse.js';
import bcrypt from 'bcrypt';

const generatingAccessAndRefreshToken = async (userId) => {
    const user = await User.findById(userId);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
};

const userController = asyncHandler(async (req, res) => {
    // Take input from the user from frontend
    const { fullName, email, password, username } = req.body;
    console.log("Information about req.body is here\n", req.body);

    // Validate the input
    if ([fullName, email, password, username].some(field => field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if user already exists or not
    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    }).lean().select('_id'); // Use lean() and select only _id

    if (existedUser) {
        throw new ApiError(300, "User Already Exist");
    }

    // Check for the files
    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log("avatarLocalPath information is here\n", avatarLocalPath);

    let coverImageLocalPath = null;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    console.log("coverImageLocalPath information is here\n", coverImageLocalPath);

    // Upload the files in cloudinary
    const avatar = await cloudinaryUpload(avatarLocalPath);
    const coverImage = await cloudinaryUpload(coverImageLocalPath);

    // Check if files are uploaded or not
    if (!avatar) {
        throw new ApiError(200, "Avatar not found");
    }
    console.log("Information about avatar after uploading into cloudinary\n", avatar);
    console.log("\nInformation about coverImage after uploading into cloudinary\n", coverImage);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a user in database
    const user = await User.create({
        username: username.toLowerCase(),
        fullName,
        password: hashedPassword,
        email,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (createdUser) {
        return res.status(200).json(
            new ApiResponse(201, "User has been created successfully", createdUser)
        );
    } else {
        return res.status(400).json(
            new ApiError(401, "User not found")
        );
    }
});

const LoginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!email || !username) {
        throw new ApiError(400, "Email or Username is required");
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (!user) {
        throw new ApiError(400, "User not found");
    }

    const passwordValidate = await user.isPasswordCorrect(password);

    if (!passwordValidate) {
        throw new ApiError(400, "Password is not correct");
    }

    const option = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' // Set secure cookies only in production
    };

    const { accessToken, refreshToken } = await generatingAccessAndRefreshToken(user._id);

    const loggedinUser = await User.findById(user._id).select("-password -refreshToken");

    return res.status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(
            new ApiResponse(200,
                {
                    user: loggedinUser, refreshToken, accessToken
                },
                "User has logged in successfully"
            )
        );
});

const LogoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        refreshToken: undefined
    }, {
        new: true
    });

    const option = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' // Set secure cookies only in production
    };

    res.status(200)
        .clearCookie("accessToken", option)
        .clearCookie("refreshToken", option)
        .json(new ApiResponse(200, {}, "User has been logged out successfully"));
});

export { userController, LoginUser, LogoutUser };