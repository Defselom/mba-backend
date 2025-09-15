export interface UploadConfig {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
}

const uploadConfig = (): UploadConfig => ({
  endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
  accessKeyId: process.env.MINIO_ACCESS_KEY || 'demo-user',
  secretAccessKey: process.env.MINIO_SECRET_KEY || 'demo-password',
  region: process.env.MINIO_REGION || 'us-east-1',
  bucket: process.env.MINIO_BUCKET || 'mba',
});

export default uploadConfig;
