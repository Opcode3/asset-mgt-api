import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Get,
  Req,
  Query,
  Param,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import {
  CreateAssignmentDto,
  ReturnAssignmentDto,
} from './dto/create-assignment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { storage } from '../../common/helpers/cloudinary.helper';
import type { Request } from 'express';
import { ResponseDto } from 'src/common/dto/response.dto';
import { AssignmentDocument } from './schemas/assignment.schema';

@Controller('assets')
export class PublicAssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  //  How to make this an unauthenticated route?
  @Get(':id')
  async getAssetById(@Param('id') id: string) {
    return await this.assetsService.getAssetById(id);
  }

  @Get('sign-agreement')
  async signedAgreement(
    @Query('id') id: string,
  ): Promise<ResponseDto<AssignmentDocument>> {
    const assignment = await this.assetsService.signedAssignmentAsset(id);
    return new ResponseDto(
      true,
      'The Agreement is signed successfully',
      assignment,
    );
  }
}
