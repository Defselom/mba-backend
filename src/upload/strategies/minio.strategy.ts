import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import type { UploadConfig } from '@/upload/upload.config';
import uploadConfig from '@/upload/upload.config';

// Define the proper Multer file interface
export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export class MinioStrategy {
  private s3: S3Client;
  private bucket: string;
  private endpoint: string;
  private config: UploadConfig;

  constructor() {
    this.config = uploadConfig();

    this.bucket = this.config.bucket;
    this.endpoint = this.config.endpoint.replace(/\/$/, '');
    this.s3 = new S3Client({
      region: this.config.region,
      endpoint: this.config.endpoint,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  async upload(
    file: MulterFile,
    folder?: string,
    getsignedUrl: boolean = true,
  ): Promise<{ key: string; url: string }> {
    const key = folder ? `${folder}/${file.originalname}` : file.originalname;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,

      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3.send(command);

    if (getsignedUrl) {
      const presigned = await getSignedUrl(
        this.s3,
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
        { expiresIn: this.config.defaultExpiration }, // 24h
      );

      return { key, url: presigned };
    }

    // Return simple URL if getsignedUrl is false
    const url: string = `${this.endpoint}/${this.bucket}/${key}`;

    return { key, url };
  }

  /**
   * Returns a URL to access the file.
   * @param key the key in the bucket
   * @param options presigned: true for a temporary URL, false for the public/raw URL
   */
  async getUrl(
    key: string,
    options?: { presigned?: boolean; expiresIn?: number },
  ): Promise<string> {
    const { presigned = true, expiresIn = this.config.defaultExpiration } = options || {};

    if (presigned) {
      // Generate a presigned URL
      return getSignedUrl(this.s3, new GetObjectCommand({ Bucket: this.bucket, Key: key }), {
        expiresIn,
      });
    } else {
      // Return the public URL
      return `${this.endpoint}/${this.bucket}/${key}`;
    }
  }

  /**
   * Detects if a URL is presigned (simple heuristic)
   */
  isPresignedUrl(url: string): boolean {
    if (!url.includes('?')) return false;
    const qs = url.split('?')[1] ?? '';

    // Check S3 signature params
    return (
      qs.includes('X-Amz-Signature=') ||
      qs.includes('X-Amz-Algorithm=') ||
      qs.includes('X-Amz-Credential=')
    );
  }

  /**
   * If the URL is presigned, returns the raw URL without query params. Otherwise returns the URL as is.
   */
  getRawUrl(url: string): string {
    if (!this.isPresignedUrl(url)) return url;

    return url.split('?')[0];
  }
}
