import { API_PATHS } from "./apiPaths";
import axiosInstance from "./axiosInstance";

const uploadImage = async (imageFile) => {
    const formData = new FormData();
    //append image to form data
    formData.append('image', imageFile);

    try{
        const response = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE, formData, {
            headers: {
                'content-type': 'multipart/form-data',// set header for file upload
            },
        });
        return response.data;
    }
    catch(error) {
        console.log("Error Uploading file", error)
        throw error;
    }
};

export default uploadImage;