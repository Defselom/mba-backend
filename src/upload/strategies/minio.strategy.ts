import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import type { Request } from 'express';

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

  constructor() {
    const config: UploadConfig = uploadConfig();

    this.bucket = config.bucket;
    this.endpoint = config.endpoint.replace(/\/$/, '');
    this.s3 = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
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
        { expiresIn: 24 * 60 * 60 }, // 24h
      );

      return { key, url: presigned };
    }

    // Return simple URL if getsignedUrl is false
    const url: string = `${this.endpoint}/${this.bucket}/${key}`;

    return { key, url };
  }
}
