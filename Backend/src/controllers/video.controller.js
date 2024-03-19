import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body

    if (!title || !description) {
        throw new ApiError(400, "All Fields are required")
    }

    const videoLocalPath = req?.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req?.files?.thumbnail[0]?.path;

    if (!videoLocalPath) {
        throw new ApiError(400, "Video File is Required")
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is Required")
    }

    const video = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    console.log(video)

    if (!video) {
        throw new ApiError(400, "Video File is Required")
    }

    if (!thumbnail) {
        throw new ApiError(400, "Thumbnail is Required")
    }

    const videoObj = {
        videoFile: video.url,
        thumbnail: thumbnail?.url,
        title,
        description,
        duration: video?.duration,
        views: 0,
        isPublished: false,
        owner: req.user._id,
    }

    const videoFile = await Video.create(videoObj)

    return res.status(201).json(
        new ApiResponse(201, videoFile, "Video Created Successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video Id");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video Not Found");
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Video Found Successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "All Fields are required")
    }

    const thumbnailLocalPath = req?.file?.path;

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is Required")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video Id");
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                thumbnail: thumbnail?.url,
            }
        },
        { new: true }
    )

    return res.status(200).json(
        new ApiResponse(200, video, "Video Updated Successfully")
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video Id");
    }

    const video = await Video.findByIdAndDelete(videoId, { new: true });

    if (!video) {
        throw new ApiError(404, "Video Not Found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Video Deleted Successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "Invalid Video Id");
    }

    let video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video Not Found");
    }

    video.isPublished = !video.isPublished;
    video = await video.save({validateBeforeSave: true});

    return res.status(200).json(
        new ApiResponse(200, video, "Video Updated Successfully")
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}