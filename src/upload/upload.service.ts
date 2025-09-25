import { Injectable } from '@nestjs/common';

import { MinioStrategy, MulterFile } from './strategies/minio.strategy';

@Injectable()
export class UploadService {
  private minio: MinioStrategy;

  constructor() {
    this.minio = new MinioStrategy();
  }

  async uploadFile(file: MulterFile, folder = 'uploads') {
    return this.minio.upload(file, folder);
  }

  async getFileUrl(key: string, options?: { presigned?: boolean; expiresIn?: number }) {
    return this.minio.getUrl(key, options);
  }

  getRawFileUrl(url: string) {
    return this.minio.getUrl(url);
  }

  async getPresignedUrlFromPublicUrl(publicUrl: string): Promise<string> {
    return this.minio.getPresignedUrlFromPublicUrl(publicUrl);
  }
}
