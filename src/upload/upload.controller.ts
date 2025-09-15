// src/upload/upload.controller.ts
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags, ApiBody } from '@nestjs/swagger';

import { UploadFileDto } from './dto/upload-file.dto';
import { UploadService } from './upload.service';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Fichier à uploader',
    type: UploadFileDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const uploaded = await this.uploadService.uploadFile(file, 'uploads');

    return {
      message: 'Fichier uploadé !',
      ...uploaded,
    };
  }
}
