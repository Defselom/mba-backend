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
}
