import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid video id')
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, 'Video not found')
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id
    });

    if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id });

        return res.status(200).json(
            new ApiResponse(
                200,
                {},
                'Like removed'
            )
        )
    } else {
        const like = await Like.create({ video: videoId, likedBy: req.user?._id });

        await like.save()

        return res.status(200).json(
            new ApiResponse(
                200,
                like,
                'Like added'
            )
        )
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, 'Invalid comment id')
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id
    })

    if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id });

        return res.status(200).json(
            new ApiResponse(
                200,
                {},
                'Like removed'
            )
        )
    } else {
        const like = await Like.create({
            comment: commentId,
            likedBy: req.user?._id
        })

        await like.save()

        return res.status(200).json(
            new ApiResponse(
                200,
                like,
                'Like added'
            )
        )
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, 'Invalid tweet id')
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id
    })

    if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id });

        return res.status(200).json(
            new ApiResponse(
                200,
                {},
                'Like removed'
            )
        )
    } else {
        const like = await Like.create({
            tweet: tweetId,
            likedBy: req.user?._id
        })

        await like.save()

        return res.status(200).json(
            new ApiResponse(
                200,
                like,
                'Like added'
            )
        )
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const likes = await Like.find({ likedBy: req.user?._id }).populate("video");

    const likedVideos = likes.map(like => like.video)

    return res.status(200).json(
        new ApiResponse(
            200,
            { likedVideos },
            'Liked videos fetched'
        )
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}