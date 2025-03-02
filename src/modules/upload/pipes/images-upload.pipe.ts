import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ImagesUploadValidationPipe implements PipeTransform {
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly maxFileCount = 2;

  transform(value: Express.Multer.File[]) {
    if (!value || value.length === 0) {
      throw new BadRequestException('No files provided');
    }

    if (value.length > this.maxFileCount) {
      throw new BadRequestException(
        `Maximum ${this.maxFileCount} files are allowed`,
      );
    }

    value.forEach((file) => {
      if (!this.allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(`Invalid file type: ${file.mimetype}`);
      }

      if (file.size > this.maxFileSize) {
        throw new BadRequestException(`File size exceeds the limit of 10MB`);
      }
    });

    return value;
  }
}
