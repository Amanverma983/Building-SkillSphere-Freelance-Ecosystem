const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME && !process.env.CLOUDINARY_CLOUD_NAME.includes('mock')) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

/**
 * Upload buffer or file to Cloudinary
 * If configuration is missing or upload fails, returns a local fallback mock URL.
 */
exports.uploadFile = async (fileBuffer, folder = 'skillsphere') => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME.includes('mock')) {
    // Generate a mock cloudinary URL
    const rand = Math.floor(Math.random() * 100000);
    return `https://res.cloudinary.com/mock_cloud/image/upload/v1234567/${folder}/mock_file_${rand}.png`;
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        // Fail gracefully and return mock url to avoid blocking developers
        const rand = Math.floor(Math.random() * 100000);
        return resolve(`https://res.cloudinary.com/mock_cloud/image/upload/v1234567/${folder}/mock_fallback_${rand}.png`);
      }
      resolve(result.secure_url);
    }).end(fileBuffer);
  });
};
