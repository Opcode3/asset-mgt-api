// src/common/config/cloudinary.config.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'duypbmkjo',
  api_key: process.env.CLOUDINARY_API_KEY || '123974877176551',
  api_secret:
    process.env.CLOUDINARY_API_SECRET || '2Qz7XkB3h4M5jaVMY5KmK7Pkbio',
});

console.log('🔧 Cloudinary Config:', {
  cloud_name: cloudinary.config().cloud_name,
  api_key: cloudinary.config().api_key ? '✅ present' : '❌ missing',
  api_secret: cloudinary.config().api_secret ? '✅ present' : '❌ missing',
});

export default cloudinary;
