const { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const crypto = require('crypto');
const logger = require('./logger');

class S3Service {
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1'
    });

    this.bucketName = process.env.AWS_S3_BUCKET_NAME;
    this.cloudFrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN;

    if (!this.bucketName) {
      logger.error('AWS_S3_BUCKET_NAME is not configured');
      throw new Error('AWS_S3_BUCKET_NAME is required for S3 service');
    }

    logger.info('S3 service initialized', {
      bucket: this.bucketName,
      region: process.env.AWS_REGION || 'us-east-1'
    });
  }

  // Generate unique filename
  generateUniqueFileName(originalName, folder = 'uploads') {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName);
    const fileName = path.basename(originalName, extension);
    
    return `${folder}/${timestamp}-${randomString}-${fileName}${extension}`;
  }

  // Sanitize metadata to prevent invalid characters in HTTP headers
  sanitizeMetadata(value) {
    if (typeof value !== 'string') return value.toString();
    // Remove or replace invalid characters for HTTP headers
    return value
      .replace(/[^\w\s\-\.]/g, '') // Remove special characters except alphanumeric, spaces, hyphens, dots
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .substring(0, 100); // Limit length to prevent header size issues
  }

  // Upload file to S3
  async uploadFile(file, folder = 'uploads') {
    try {
      const fileName = this.generateUniqueFileName(file.originalname, folder);
      
      const uploadParams = {
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: this.sanitizeMetadata(file.originalname),
          uploadedAt: new Date().toISOString(),
          fileSize: file.size.toString()
        }
      };

      const command = new PutObjectCommand(uploadParams);
      const result = await this.s3Client.send(command);
      
      const imageUrl = this.getImageUrl(fileName);
      
      logger.info('File uploaded successfully to S3', {
        fileName: fileName,
        originalName: file.originalname,
        size: file.size,
        url: imageUrl
      });

      return {
        success: true,
        fileName: fileName,
        originalName: file.originalname,
        url: imageUrl,
        size: file.size,
        mimeType: file.mimetype,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error uploading file to S3:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  // Upload multiple files to S3
  async uploadMultipleFiles(files, folder = 'uploads') {
    try {
      const uploadPromises = files.map(file => this.uploadFile(file, folder));
      const results = await Promise.all(uploadPromises);
      
      logger.info(`Uploaded ${results.length} files successfully`);
      
      return {
        success: true,
        files: results,
        totalFiles: results.length
      };
    } catch (error) {
      logger.error('Error uploading multiple files to S3:', error);
      throw new Error(`Failed to upload files: ${error.message}`);
    }
  }

  // Delete file from S3
  async deleteFile(fileName) {
    try {
      const deleteParams = {
        Bucket: this.bucketName,
        Key: fileName
      };

      const command = new DeleteObjectCommand(deleteParams);
      const result = await this.s3Client.send(command);
      
      logger.info('File deleted successfully from S3', {
        fileName: fileName,
        result: result
      });

      return {
        success: true,
        fileName: fileName,
        deletedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error deleting file from S3:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  // Delete multiple files from S3
  async deleteMultipleFiles(fileNames) {
    try {
      const deletePromises = fileNames.map(fileName => this.deleteFile(fileName));
      const results = await Promise.all(deletePromises);
      
      logger.info(`Deleted ${results.length} files successfully`);
      
      return {
        success: true,
        files: results,
        totalFiles: results.length
      };
    } catch (error) {
      logger.error('Error deleting multiple files from S3:', error);
      throw new Error(`Failed to delete files: ${error.message}`);
    }
  }

  // Get file URL
  getImageUrl(fileName) {
    if (this.cloudFrontDomain) {
      // Use CloudFront URL if configured
      return `https://${this.cloudFrontDomain}/${fileName}`;
    } else {
      // Use S3 direct URL
      return `https://${this.bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileName}`;
    }
  }

  // Check if file exists in S3
  async fileExists(fileName) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: fileName
      };

      const command = new HeadObjectCommand(params);
      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  // Get file metadata
  async getFileMetadata(fileName) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: fileName
      };

      const command = new HeadObjectCommand(params);
      const result = await this.s3Client.send(command);
      
      return {
        success: true,
        fileName: fileName,
        size: result.ContentLength,
        mimeType: result.ContentType,
        lastModified: result.LastModified,
        metadata: result.Metadata
      };
    } catch (error) {
      logger.error('Error getting file metadata from S3:', error);
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
  }

  // List files in a folder
  async listFiles(folder = 'uploads', maxKeys = 100) {
    try {
      const params = {
        Bucket: this.bucketName,
        Prefix: folder + '/',
        MaxKeys: maxKeys
      };

      const command = new ListObjectsV2Command(params);
      const result = await this.s3Client.send(command);
      
      const files = result.Contents.map(item => ({
        fileName: item.Key,
        size: item.Size,
        lastModified: item.LastModified,
        url: this.getImageUrl(item.Key)
      }));

      return {
        success: true,
        files: files,
        totalFiles: files.length,
        isTruncated: result.IsTruncated
      };
    } catch (error) {
      logger.error('Error listing files from S3:', error);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  // Test S3 connection
  async testConnection() {
    try {
      const params = {
        Bucket: this.bucketName,
        MaxKeys: 1
      };

      const command = new ListObjectsV2Command(params);
      await this.s3Client.send(command);
      logger.info('S3 connection test successful');
      return true;
    } catch (error) {
      logger.error('S3 connection test failed:', error);
      return false;
    }
  }

  // Configure multer for S3 upload (original method for backward compatibility)
  configureMulter(folder = 'uploads') {
    return multer({
      storage: multerS3({
        s3: this.s3Client,
        bucket: this.bucketName,
        key: (req, file, cb) => {
          const fileName = this.generateUniqueFileName(file.originalname, folder);
          cb(null, fileName);
        },
        metadata: (req, file, cb) => {
          cb(null, {
            originalName: this.sanitizeMetadata(file.originalname),
            uploadedAt: new Date().toISOString(),
            fileSize: (file.size || 0).toString()
          });
        }
      }),
      limits: {
        files: 10 // Maximum 10 files (removed fileSize limit)
      },
      fileFilter: (req, file, cb) => {
        // Allow only image files
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      }
    });
  }

  // Unified multer configuration that uses 'images' field name for payloads
  configureUnifiedMulter(folder = 'uploads', maxFiles = 10) {
    const storage = multerS3({
      s3: this.s3Client,
      bucket: this.bucketName,
      key: (req, file, cb) => {
        const fileName = this.generateUniqueFileName(file.originalname, folder);
        cb(null, fileName);
      },
      metadata: (req, file, cb) => {
        cb(null, {
          originalName: this.sanitizeMetadata(file.originalname),
          uploadedAt: new Date().toISOString(),
          fileSize: (file.size || 0).toString()
        });
      }
    });

    const fileFilter = (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'), false);
      }
    };

    // Create multer instance for array (multiple files)
    const multerArray = multer({
      storage: storage,
      fileFilter: fileFilter,
      limits: {
        files: maxFiles
      }
    });

    // Create multer instance for single file
    const multerSingle = multer({
      storage: storage,
      fileFilter: fileFilter,
      limits: {
        files: 1
      }
    });

    // Return middleware that handles both single and multiple files
    return (req, res, next) => {
      // Always use array configuration - it can handle both single and multiple files
      return multerArray.array('images', maxFiles)(req, res, next);
    };
  }
}

module.exports = new S3Service(); 