import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid video id')
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video Not Found")
    }

    const comments = await Comment.find({ video: videoId })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({
            path: "owner",
            select: "fullName username avatar"
        })

    if (!comments) {
        throw new ApiError(404, "Comments Not Found")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {comments},
            "Video Comments Fetched Successfully"
        )
    )
})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid video id')
    }

    if (!content) {
        throw new ApiError(400, 'Content is required')
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id,
    })

    if (!comment) {
        throw new ApiError(400, "Comment Not Created")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            comment,
            "Comment Created Successfully"
        )
    )
})

const updateComment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, 'Invalid comment id')
    }

    if (!content) {
        throw new ApiError(400, 'Content is required')
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content
            }
        },
        { new: true }
    )

    if (!comment) {
        throw new ApiError(400, "Comment Not Updated")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            comment,
            "Comment Updated Successfully"
        )
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, 'Invalid comment id')
    }

    const comment = await Comment.findByIdAndDelete(commentId);

    if (!comment) {
        throw new ApiError(400, "Comment Not Deleted")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Comment Deleted Successfully"
        )
    )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
