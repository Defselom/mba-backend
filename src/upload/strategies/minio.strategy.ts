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

  async getUrl(
    key: string,
    options?: { presigned?: boolean; expiresIn?: number },
  ): Promise<string> {
    const { presigned = true, expiresIn = this.config.defaultExpiration } = options || {};

    if (presigned) {
      return getSignedUrl(this.s3, new GetObjectCommand({ Bucket: this.bucket, Key: key }), {
        expiresIn,
      });
    }

    return `${this.endpoint}/${this.bucket}/${key}`;
  }

  async getPresignedUrlFromPublicUrl(publicUrl: string): Promise<string> {
    // Remove endpoint (assume publicUrl starts with this.endpoint+"/")
    let urlNoEndpoint = publicUrl;

    if (publicUrl.startsWith(this.endpoint + '/')) {
      urlNoEndpoint = publicUrl.substring((this.endpoint + '/').length);
    } else if (publicUrl.startsWith(this.endpoint)) {
      urlNoEndpoint = publicUrl.substring(this.endpoint.length);
      if (urlNoEndpoint.startsWith('/')) urlNoEndpoint = urlNoEndpoint.substring(1);
    }

    const [bucket, ...keyParts] = urlNoEndpoint.split('/');
    const key = keyParts.join('/');

    // if the bucket from the URL does not match the configured bucket, return the original URL
    if (this.bucket && bucket !== this.bucket) {
      // Mauvais bucket, retourne l’URL brute
      return publicUrl;
    }

    return this.getUrl(key, { presigned: true });
  }
}
