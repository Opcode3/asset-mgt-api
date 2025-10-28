import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Get,
  Req,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { storage } from '../../common/helpers/cloudinary.helper';
import type { Request } from 'express';

@Controller('assets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  @Roles('admin', 'assignee') // ✅ Allow both roles
  @UseInterceptors(FilesInterceptor('images', 5, { storage }))
  async createAsset(
    @UploadedFiles() images: Express.Multer.File[],
    @Body() dto: CreateAssetDto,
    @Req() req: Request,
  ) {
    // console.log('Images:', images);
    // console.log('DTO:', dto);

    const creatorId = (req.user as any).sub;
    const imageUrls = images?.map((file) => file.path) || []; // Cloudinary returns file.path as the image URL
    return await this.assetsService.createAsset(
      { ...dto, imageUrls },
      creatorId,
    );
  }

  @Post('assign')
  @Roles('admin', 'assignee')
  async assignAsset(@Body() dto: CreateAssignmentDto, @Req() req: Request) {
    const creatorId = (req.user as any).sub;
    return await this.assetsService.assignAsset(dto, creatorId);
  }

  // ✅ Get all assets (admin & assignee)
  @Get()
  @Roles('admin', 'assignee')
  async getAllAssets() {
    return await this.assetsService.getAllAssets();
  }

  // ✅ Get all assignments (admin only)
  @Get('assigned')
  @Roles('admin', 'assignee')
  async getAllAssignments() {
    return await this.assetsService.getAllAssignments();
  }

  // ✅ Get assigned assets for logged-in user
  @Get('assigned')
  @Roles('admin', 'assignee')
  async getAssignedAssets(@Req() req) {
    const userId = req.user?.id; // comes from JWT payload
    return await this.assetsService.getAssignedAssets(userId);
  }
}
