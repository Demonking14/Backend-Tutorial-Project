import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_API_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const Upload = async (filepath) => {
    if (!filepath) return null;
   try {
    const result = await cloudinary.uploader.upload(filepath, {
        resource_type : "auto"
    })
    
    console.log("File Uploaded Successfully") ;
    return result
    
   } catch (error) {
    fs.unlinkSync(filepath);
         console.log("Error in Upload Function is " , error)
    
   }
};

export default Upload;