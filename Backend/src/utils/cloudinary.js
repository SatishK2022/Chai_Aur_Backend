import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        console.log("Error while uploading file on cloudinary ", error)
        return null;
    }
}

const deleteFromCloudinary = async (filePath) => {
    try {
        const result = await cloudinary.uploader.destroy(filePath);
        console.log('Image deleted from Cloudinary:', result);
    } catch (error) {
        console.log("Error while deleting the file: ", error.message);
    }
}

export { 
    uploadOnCloudinary, 
    deleteFromCloudinary 
}