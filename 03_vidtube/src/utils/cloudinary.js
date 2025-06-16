import { v2 as cloudinary } from "cloudinary"; // Import the Cloudinary library for uploading images 
import fs from "fs"; // Import the fs module for file system operations
import dotenv from "dotenv";

dotenv.config();
 // Configuration
 const uploadOnCloudinary = async (localFilePath) => {
    try {
        
    // cloudinary.config({ 
    //     cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    //     api_key: process.env.CLOUDINARY_API_KEY, 
    //     api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    // });
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" })
    console.log("File uploaded on cloudinary. File src" + response.url);
    //once the file is uploaded on cloudinary, delete the local file from the server
    fs.unlinkSync(localFilePath);
    return response
    } catch (error) {
        console.log("Error uploading file on cloudinary", error);
        fs.unlinkSync(localFilePath);
        return null
    }
}
const deleteFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId)
        console.log("File deleted on cloudinary")
    } catch (error) {
        console.log("Error deleting file on cloudinary", error);
    }
}

    export {uploadOnCloudinary, deleteFromCloudinary}

    // uploadOnCloudinary is a function that is used to upload a file on cloudinary 