import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_API_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const cloudinaryUpload = async (filepath) => {
    if (!filepath) return null;
    try {
        const result = await cloudinary.uploader.upload(filepath, {
            resource_type: "auto"
        });
        console.log("File Uploaded Successfully", result);
        fs.unlinkSync(filepath)
        return result;
    } catch (error) {
        console.error("Error in Upload Function:", error);
       
            fs.unlinkSync(filepath);
        
        throw new Error("File upload failed");
    }
};

export default cloudinaryUpload;