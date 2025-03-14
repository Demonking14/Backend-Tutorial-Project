import { User } from '../models/user.model.js';
import ApiError from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import cloudinaryUpload from "../utils/cloudnary.js";
import ApiResponse from '../utils/apiResponse.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

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
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Create a user in database
    const user = await User.create({
        username: username.toLowerCase(),
        fullName,
        password,
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
    console.log(password)

    if (!(email || username)) {
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

const newRefreshAndAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(404, "Invalid refresh Token")
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken._id)
    if (!user) {
        throw new ApiError(403, "User trying to enter with invalid Token")
    }

    const { accessToken, newrefreshToken } = await generatingAccessAndRefreshToken(user._id)

    return res.status(200).cookie("accessToken", accessToken).cookie("refreshToken", newrefreshToken).json(new ApiResponse(200, { accessToken, newrefreshToken }, "New Access Token and Refresh Token has been generated successfully"))



})

const UpdatePassword = asyncHandler(async (req, res) => {
    const { newPassword, confirmPassword, oldPassword } = req.body;

    if (newPassword !== confirmPassword) {
        throw new ApiError(400, "Password and Confirm Password does not match")
    }


    const user = await User.findById(req.user._id)

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    if (user.isPasswordCorrect(oldPassword)) {
        user.password = newPassword

    await user.save({ validateBeforeSave: false })

    }

    

    return res.status(200).json(
        new ApiResponse(200, {}, "Password has been updated successfully")
    )


})


const UpdateUserInformation = asyncHandler(async (req, res) => {
    const { fullName, username } = req.body;

    if (!(fullName || username)) {
        throw new ApiError(400, "Full name and Username is required for updating the information")
    }

    await User.findByIdAndUpdate(req.user._id, {
        fullName,
        username
    },
        { new: true }
    ).select("-password -refreshToken")

    return res.status(200).json(
        new ApiResponse(200, {}, "username and Fullname are updated successfully")
    )

})


const UpdateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required for updating the avatar");
    }

    const avatar = await cloudinaryUpload(avatarLocalPath);

    await User.findByIdAndUpdate(req.user._id, {
        avatar: avatar.url
    }, { new: true }).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, {}, "Avatar has been updated successfully")
    );
});

const UpdateCoverImage = asyncHandler(async (req, res) => {
    const coverImagePath = req.file?.path;

    if (!coverImagePath) {
        throw new ApiError(400, "Cover Image is required for updating the Cover Image");
    }

    const coverImage = await cloudinaryUpload(coverImagePath);

    await User.findByIdAndUpdate(req.user._id, {
        coverImage: coverImage.url
    }, { new: true }).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, {}, "CoverImage has been updated successfully")
    );
});

const ChannelInformations = asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!username?.trim()) {
        throw new ApiError(400, "Username not found");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase(),
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                foreignField: "channel",
                localField: "_id",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                foreignField: "subscribed",
                localField: "_id",
                as: "subscribed"
            }
        },
        {
            $addFields: {
                SubscriberCount: {
                    $size: "$subscribers"
                },
                SubscribedCount: {
                    $size: "$subscribed"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user._id, "$subscribed.subscribed"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                email: 1,
                username: 1,
                avatar: 1,
                coverImage: 1,
                SubscribedCount: 1,
                SubscriberCount: 1,
                isSubscribed: 1
            }
        }
    ]);

    if (!channel?.length) {
        throw new ApiError(400, "Channel is not found");
    }

    return res.status(200).json(
        new ApiResponse(200, channel[0], "Channel info fetched successfully")
    );
});

const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match :{
                _id: new mongoose.Types.ObjectId(req.user._id)
            },
        },
        {
            $lookup:{
                from : "video",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline: [
                    {
                        $lookup:{
                            from:"user",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            $first : "$owner"
                        }
                    }   
                ]

            }
        },
        {
            $addFields:{
                $first:"$watchHistory"
            }
        }
    ])

    console.log(user)
    return res.status(200).json(
        new ApiResponse(200 , {user} , "User's watch history information")
    )
})

export { userController, LoginUser, LogoutUser, newRefreshAndAccessToken, UpdatePassword, UpdateUserInformation, UpdateAvatar, UpdateCoverImage, ChannelInformations,getWatchHistory}