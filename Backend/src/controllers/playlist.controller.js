import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    if (!name || !description) {
        throw new ApiError("Please provide name and description", 400)
    }

    const playlist = await Playlist.create(
        {
            name,
            description,
            owner: req.user._id
        }
    )

    if (!playlist) {
        throw new ApiError("Playlist not created", 400)
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            playlist,
            "Playlist created successfully"
        )
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!isValidObjectId(userId)) {
        throw new ApiError("Invalid user id", 400)
    }

    const playlists = await Playlist.find({ owner: userId }).populate({
        path: "owner",
        select: "fullName username avatar"
    })

    if (!playlists) {
        throw new ApiError("No playlists found", 404)
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { playlists: playlists },
            "Playlists fetched successfully"
        )
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError("Invalid playlist id", 400)
    }

    const playlist = await Playlist.findById(playlistId).populate({
        path: "owner",
        select: "fullName username avatar"
    })

    if (!playlist) {
        throw new ApiError("Playlist not found", 404)
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "Playlist fetched successfully"
        )
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError("Invalid playlist or video id", 400)
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError("Playlist not found", 404);
    }

    playlist.videos.push(videoId);

    await playlist.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "Video added to playlist successfully"
        )
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError("Invalid playlist or video id", 400)
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError("Playlist not found", 404);
    }

    playlist.videos = playlist.videos.filter(video => video.toString() !== videoId);

    await playlist.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Video removed from playlist successfully"
        )
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError("Invalid playlist id", 400)
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId);

    if (!playlist) {
        throw new ApiError("Playlist not found", 404);
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Playlist deleted successfully"
        )
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body

    if (!isValidObjectId(playlistId)) {
        throw new ApiError("Invalid playlist id", 400)
    }

    if (!name || !description) {
        throw new ApiError("Please provide name and description", 400)
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name,
                description
            }
        }, { new: true }
    )

    if (!playlist) {
        throw new ApiError("Playlist not found", 404);
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "Playlist updated successfully"
        )
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
