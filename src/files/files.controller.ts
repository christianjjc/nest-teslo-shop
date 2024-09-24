import { Response } from 'express';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Get, Param, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FilesService } from './files.service';
import { fileFilter, fileNamer } from './helpers';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Get('product/:imageName')
  findProductImage(@Res() res: Response, @Param('imageName') imageName: string) {
    const path = this.filesService.getStaticProductImage(imageName);

    // res.status(403).json({
    //   ok: false,
    //   path: path,
    // });

    res.sendFile(path);

    //return path;
  }

  @Post('product')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      // limits:{fileSize:1000}
      storage: diskStorage({
        // destination: './static/uploads',
        destination: './static/products',
        filename: fileNamer,
      }),
    }),
  )
  uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Make sure that the file is an Image');
    }

    // const secureUrl = `${file.filename}`;
    // const secureUrl = 'http://localhost:3000/api/files/product/2023da87-28e8-45bf-a902-140718d517d1.jpeg';
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;

    return {
      secureUrl,
    };

    // return {
    //   'Original Name': file.originalname,
    //   'New Name': file.filename,
    // };
  }
}
