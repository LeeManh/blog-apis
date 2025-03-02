import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ImagesUploadValidationPipe } from './pipes/images-upload.pipe';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('images')
  @UseInterceptors(FilesInterceptor('files'))
  @UsePipes(new ImagesUploadValidationPipe())
  uploadFile(@UploadedFiles() files: Array<Express.Multer.File>) {
    return this.uploadService.uploadImages(files);
  }
}
