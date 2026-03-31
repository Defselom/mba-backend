export interface UploadConfig {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
  defaultExpiration?: number;
}

const uploadConfig = (): UploadConfig => ({
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
  accessKeyId: process.env.S3_ACCES_KEY || 'demo-user',
  secretAccessKey: process.env.S3_SECRET_KEY || 'demo-password',
  region: process.env.S3_REGION || 'us-east-1',
  bucket: process.env.S3_BUCKET_NAME || 'mba',
  defaultExpiration: parseInt(process.env.S3_DEFAULT_EXPIRATION || String(24 * 60 * 60), 10), // 24 hours
});

export default uploadConfig;
