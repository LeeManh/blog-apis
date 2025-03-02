import {
  IsString,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  IsUrl,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({ message: 'Categories must not be empty if provided' })
  @IsString({ each: true, message: 'Each category must be a string' })
  categories?: string[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({ message: 'Tags must not be empty if provided' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];

  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Thumbnail must be a valid URL' })
  thumbnail?: string;
}
