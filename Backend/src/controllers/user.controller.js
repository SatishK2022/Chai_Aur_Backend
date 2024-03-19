import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body

    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All Fields are required")
    }

    if (!email.includes('@')) {
        throw new ApiError(400, "Enter a valid Email")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with username or email already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar File is Required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar File is Required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body

    if (!(username || email)) {
        throw new ApiError(400, "Username or Email is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User Does Not Exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid Credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser,
                accessToken,
                refreshToken
            }, "User Logged In Successfully")
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;

    await User.findByIdAndUpdate(
        _id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User Logged Out Successfully")
        )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized!! Refresh Token is Required")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (decodedToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        const options = {
            httpOnly: true,
            secure: true,
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "access token refreshed successfully"
                )
            )
    } catch (error) {
        throw new ApiError(401, error.message || "Invalid refresh token")
    }

})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid Old Password")
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, {}, "Password Changed Successfully")
    )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;

    const user = await User.findById(_id).select("-password -refreshToken")

    return res.status(200).json(
        new ApiResponse(200, user, "User fetched successfully")
    )
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, "All Fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullName,
                email,
            }
        },
        { new: true }
    ).select("-password")

    return res.status(200).json(
        new ApiResponse(200, user, "Account details updated successfully")
    )
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar File is Required");
    }

    const fileToBeDeleted = await User.findById(req.user._id);
    if (fileToBeDeleted?.avatar) {
        await deleteFromCloudinary(fileToBeDeleted?.avatar);
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar?.url
            }
        },
        { new: true }
    ).select("-password")

    return res.status(200).json(
        new ApiResponse(200, user, "User avatar updated successfully")
    )
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image File is Required");
    }

    const fileToBeDeleted = await User.findById(req.user._id);
    if (fileToBeDeleted?.avatar) {
        await deleteFromCloudinary(fileToBeDeleted?.avatar);
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage?.url
            }
        },
        { new: true }
    )

    return res.status(200).json(
        new ApiResponse(200, user, "User cover image updated successfully")
    )
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username) {
        throw new ApiError(400, "Username is required");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                subscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$subscribers.subscriber"]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                subscribersCount: 1,
                subscribedToCount: 1,
                isSubscribed: 1
            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "Channel not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, channel[0], "Channel fetched successfully")
        )
})

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(200, user[0].watchHistory, "Watch History Fetched Successfully")
        )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}