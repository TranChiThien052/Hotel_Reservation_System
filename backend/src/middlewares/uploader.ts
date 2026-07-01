import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';
import multer from 'multer';

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (_req, _file) => {
        return {
            folder: 'hotel',
            allowed_formats: ['jpg', 'jpeg', 'png'],
            transformation: [{ width: 800, height: 800, crop: 'limit' }],
        };
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadImage = (files) => {
    return files as Express.Multer.File & { path: string; filename: string }[];
}

export { upload, uploadImage };