// import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from 'src/config/cloudinary.config';

// import multer from 'multer';

// export const storage = new CloudinaryStorage({
//   cloudinary,
//   params: async (req, file) => ({
//     folder: 'assets', // ✅ valid here
//     format: 'webp', // or 'png', 'webp', etc.
//     public_id: `${Date.now()}-${file.originalname}`,
//   }),
// });

// // export const uploadToCloudinary = multer({ storage });

export const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    console.log('📤 Uploading to Cloudinary:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
    });

    try {
      return {
        folder: 'assets',
        format: 'webp', // can also remove this if you want Cloudinary to auto-detect
        public_id: `${Date.now()}-${file.originalname}`,
      };
    } catch (err) {
      console.error('❌ Cloudinary storage params error:', err);
      throw err;
    }
  },
});
