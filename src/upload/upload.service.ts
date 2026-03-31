import { Injectable } from '@nestjs/common';

import { MulterFile, S3Strategy } from './strategies/s3.strategy';

@Injectable()
export class UploadService {
  private s3: S3Strategy;

  constructor() {
    this.s3 = new S3Strategy();
  }

  async uploadFile(file: MulterFile, folder = 'uploads') {
    return this.s3.upload(file, folder);
  }

  async getFileUrl(key: string, options?: { presigned?: boolean; expiresIn?: number }) {
    return this.s3.getUrl(key, options);
  }

  getRawFileUrl(url: string) {
    return this.s3.getUrl(url);
  }

  async getPresignedUrlFromPublicUrl(publicUrl: string): Promise<string> {
    return this.s3.getPresignedUrlFromPublicUrl(publicUrl);
  }
}
