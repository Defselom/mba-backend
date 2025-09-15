// src/upload/upload.controller.ts
import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { UploadFileDto } from './dto/upload-file.dto';
import { UploadService } from './upload.service';
import { JwtGuard } from '@/auth/guard';
import type { MulterFile } from '@/upload/strategies/minio.strategy';
import { getUploadFolder } from '@/upload/utils';

@ApiTags('upload')
@Controller('upload')
@UseGuards(JwtGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File to upload',
    type: UploadFileDto,
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    schema: {
      example: {
        message: 'File uploaded successfully!',
        url: 'https://minio.example.com/bucketname/path/to/file.jpg',
        key: 'path/to/file.jpg',
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: MulterFile) {
    if (!file) {
      throw new Error('File is required');
    }

    const folder = getUploadFolder(file);

    const uploaded = await this.uploadService.uploadFile(file, folder);

    return {
      message: 'File uploaded successfully!',
      ...uploaded,
    };
  }
}
