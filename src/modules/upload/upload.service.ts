import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class UploadService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get('cloudinary.cloud_name'),
      api_key: this.configService.get('cloudinary.api_key'),
      api_secret: this.configService.get('cloudinary.api_secret'),
    });
  }

  private async uploadSingle(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: this.getTransformationOptions(),
        },
        (error, result: UploadApiResponse) => {
          if (error) {
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            reject(error);
          }
          resolve(result.secure_url);
        },
      );

      upload.end(file.buffer);
    });
  }

  private getTransformationOptions() {
    return [
      {
        width: 800,
        crop: 'scale',
        quality: 'auto',
        fetch_format: 'auto',
      },
    ];
  }

  async uploadImages(
    files: Express.Multer.File[],
    folder = 'blog-folder',
  ): Promise<string[]> {
    try {
      const uploadPromises = files.map((file) =>
        this.uploadSingle(file, folder),
      );
      return await Promise.all(uploadPromises);
    } catch (error) {
      throw new BadRequestException(
        `Failed to upload images: ${error.message}`,
      );
    }
  }
}
